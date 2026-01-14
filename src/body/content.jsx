import { MessageSquare, Share2, MoreHorizontal, Heart, Share, BookOpen, HelpCircle, Layers, ChevronDown, Zap, ArrowUp, Ghost } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, useNavigationType } from 'react-router-dom';
import { usePostContext } from '../Postcontext';
import '../CSSF/cont.css';

export default function RedditStyleLayout({ searchQuery, triggerSearch, title, settop, top }) {

  const location = useLocation();
  const [activePopupId, setActivePopupId] = useState(null);
  const [mo, setmo] = useState(false);
  const popupRef = useRef(null);
  const username = localStorage.getItem("username");
  const [load, setload] = useState(true);
  const [tag, settag] = useState(() => {
    return localStorage.getItem("selectedTag") || "all";
  });
  const [isVisible, setIsVisible] = useState(false);
  const navigationType = useNavigationType();

  const [reloadCount, setReloadCount] = useState(0);
  const lastLocationRef = useRef(location.pathname);
  const lastTagRef = useRef(tag);
  const prevTriggerSearchRef = useRef(triggerSearch);
  const prevSearchQueryRef = useRef(searchQuery);

  const toggleVisibility = () => {
    if (window.pageYOffset > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const togglePopup = (event, postId) => {
    event.stopPropagation();
    setmo(prevMo => {
      const isPopupVisible = prevMo && activePopupId === postId;
      setActivePopupId(isPopupVisible ? null : postId);
      return !prevMo;
    });
  };

  const handleReport = async (event, postId, posttag) => {
    event.stopPropagation();

    const realtag = (tag === 'all') ? posttag : tag;

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/report/post?uuid=${postId}&tag=${realtag}&username=${username}`);
    const data = await res.json();

    if (data.value) {
      alert(`Reported post ID: ${postId}`);
    }
    else {
      alert("Error reporting the post. Please try again later.");
    }

    setActivePopupId(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActivePopupId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [likedPosts, setLikedPosts] = useState({});

  const handleLikeClick = async (event, postId, posttag) => {
    event.stopPropagation();

    setLikedPosts(prev => {
      const newLikedPosts = { ...prev };
      newLikedPosts[postId] = !newLikedPosts[postId];
      return newLikedPosts;
    });

    const realtag = (tag === 'all') ? posttag : tag;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data/update/like?tag=${realtag}&username=${username}&uuid=${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const space = "";
  const { posts, setPosts, scrollY, setScrollY } = usePostContext();
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentTag, setCurrentTag] = useState(tag);
  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery);

  const throttle = (func, limit) => {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  };

  function formatDate(dateString) {
    const postDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now - postDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
    } else {
      return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
    }
  }

  async function fetchPosts(currentTag, lastDate = null, searchQuery = null) {
    const dateParam = `&date=${lastDate || ''}`;

    const url = searchQuery
      ? title
        ? `${import.meta.env.VITE_API_BASE_URL}/search/posts?text=${searchQuery}&username=${username}${dateParam}`
        : `${import.meta.env.VITE_API_BASE_URL}/search/user?text=${searchQuery}&username=${username}${dateParam}`
      : `${import.meta.env.VITE_API_BASE_URL}/data/read/posts?tag=${currentTag}&username=${username}${dateParam}`;

    const finalurl = (currentTag === 'all' && !searchQuery)
      ? `${import.meta.env.VITE_API_BASE_URL}/search/posts?text=${space}&username=${username}${dateParam}`
      : url;

    try {
      const res = await fetch(finalurl);
      const data = await res.json();

      if (data === false) {
        localStorage.removeItem("username");
        navigate('/');
        return [];
      }

      const combinedPosts = Array.isArray(data?.uuid_list)
        ? data.uuid_list
          .map((uuid, index) => {
            if (uuid == null) return null;

            const post = { id: uuid };

            if (data.user_list?.[index] != null) post.username = data.user_list[index];
            if (data.title_list?.[index] != null) post.title = data.title_list[index];
            if (data.description?.[index] != null) post.content = data.description[index];
            if (data.date_list?.[index] != null) post.timePosted = formatDate(data.date_list[index]);
            if (data.likes_list?.[index] != null) post.like = data.likes_list[index];
            if (data.number_of_comments?.[index] != null) post.comment = data.number_of_comments[index];
            if (data.has_liked?.[index] != null) post.liked = data.has_liked[index];
            if (data.tags?.[index] != null) post.apitag = data.tags[index];
            if (data.user_image?.[index] != null) post.pfp = data.user_image[index];
            post.rawDate = data.date_list?.[index] ?? '';

            return post;
          })
          .filter(Boolean)
        : [];

      return combinedPosts;

    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  const observer = useRef();
  const navigate = useNavigate();

  const lastPostRef = useCallback(
    node => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, tag, currentSearchQuery]
  );

  const loadMorePosts = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    const lastDate = posts.length ? posts[posts.length - 1].rawDate : null;

    try {
      const newPosts = await fetchPosts(tag, lastDate, currentSearchQuery);
      // console.log('load more posts')

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => {
          const existingIds = new Set(prev.map(post => post.id));
          const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id));
          return [...prev, ...uniqueNewPosts];
        });
      }

    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const locationChanged = lastLocationRef.current !== location.pathname;
    const tagChanged = lastTagRef.current !== tag;
    const searchTriggered = prevTriggerSearchRef.current !== triggerSearch;
    const searchQueryChanged = prevSearchQueryRef.current !== searchQuery;

    prevTriggerSearchRef.current = triggerSearch;
    prevSearchQueryRef.current = searchQuery;
    lastLocationRef.current = location.pathname;
    lastTagRef.current = tag;

    setReloadCount(prev => prev + 1);

    const shouldFetch = posts.length === 0 ||
      reloadCount >= 3 ||
      tagChanged ||
      searchTriggered ||
      searchQueryChanged;

    if (!shouldFetch) {
      // console.log('Skipping fetch - using cached posts, restoring scroll:', scrollY);
      setload(false);

      if (navigationType === "POP" && scrollY > 0) {
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY);
          // console.log('Scroll restored to:', scrollY);
        });
      }
      return;
    }


    setPosts([]);
    setHasMore(true);
    setIsLoading(false);
    setload(true);

    if (reloadCount >= 3) {
      setReloadCount(0);
    }

    if (tagChanged) {
      setCurrentTag(tag);
    }

    if (searchQueryChanged || searchTriggered) {
      setCurrentSearchQuery(searchQuery);
    }

    async function load() {
      try {
        const newPosts = await fetchPosts(tag, null, searchQuery);
        // console.log('initial post fetch');
        setPosts(newPosts);
        const newHasMore = newPosts.length > 0;
        setHasMore(newHasMore);
        setload(false);


        if (tagChanged || searchTriggered || searchQueryChanged || navigationType !== "POP") {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (error) {
        console.error('Error in initial load:', error);
        setload(false);
      }
    }

    load();

  }, [triggerSearch, tag]);

  useEffect(() => {
    const saveScroll = () => {
      setScrollY(window.scrollY);
    };

    const saveScrollThrottled = throttle(saveScroll, 100);

    window.addEventListener('scroll', saveScrollThrottled);
    window.addEventListener('pagehide', saveScroll);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') saveScroll();
    });
    window.addEventListener('beforeunload', saveScroll);

    return () => {
      saveScroll();
      window.removeEventListener('scroll', saveScrollThrottled);
      window.removeEventListener('pagehide', saveScroll);
      window.removeEventListener('visibilitychange', saveScroll);
      window.removeEventListener('beforeunload', saveScroll);
    };
  }, []);

  async function handleShare(event, id, apitag) {
    event.stopPropagation();
    const realtag = (tag === 'all') ? apitag : tag;

    const shareData = {
      title: 'Check out this post!',
      text: 'Look at this interesting post I found!',
      url: window.location.href + `/Showpost/${realtag}/${id}`
    };

    try {
      await navigator.share(shareData);
    } catch (err) {
      console.error('Share failed:', err.message);
    }
  }

  function gopost(post) {
    const posttag = post.apitag ? post.apitag : tag;
    navigate(`Showpost/${posttag}/${post.id}`);
  }

  const cfl = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const [activeTag, setActiveTag] = useState(cfl(tag));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleTagClick = (selectedTag) => {
    // console.log('Tag clicked:', selectedTag);
    const newTag = selectedTag.toLowerCase();

    if (newTag === tag) {
      setIsDropdownOpen(!isDropdownOpen);
      return;
    }

    setActiveTag(selectedTag);
    setIsDropdownOpen(!isDropdownOpen);

    localStorage.setItem("selectedTag", newTag);


    setPosts([]);
    setCurrentSearchQuery('');
    setHasMore(true);
    setIsLoading(false);
    setload(true);

    settag(newTag);
    setReloadCount(0);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const cards = [
    {
      tag: "All",
      title: "Complete Collection",
      description: "Access all available posts",
      icon: <Layers style={{ width: "18px", height: "18px", color: "#a78bfa" }} />
    },
    {
      tag: "Insight",
      title: "Deep Dive",
      description: "Insights, decisions, and untold stories",
      icon: <Zap style={{ width: "18px", height: "18px", color: "#f472b6" }} />
    },
    {
      tag: "Advice",
      title: "Helpful Suggestions",
      description: "Helpful tips and guidance",
      icon: <BookOpen style={{ width: "18px", height: "18px", color: "#34d399" }} />
    },
    {
      tag: "Doubts",
      title: "Question Center",
      description: "Find answers to common questions",
      icon: <HelpCircle style={{ width: "18px", height: "18px", color: "#fbbf24" }} />
    },
  ];

  const getTagStyle = (tag) => {
    switch (tag) {
      case "All":
        return {
          backgroundColor: "#4b366b",
          color: "#d8cef6"
        };
      case "Advice":
        return {
          backgroundColor: "#064e3b",
          color: "#a7f3d0"
        };
      case "Doubts":
        return {
          backgroundColor: "#7c3900",
          color: "#fcd34d"
        };
      case "Insight":
        return {
          backgroundColor: "#1e3a8a",
          color: "#bfdbfe"
        };
      default:
        return {
          backgroundColor: "#1a1a1a",
          color: "#e2e2e2"
        };
    }
  };

  const activeCard = cards.find(card => card.tag === activeTag);

  return (
    <div className="main-layout">
      {!load ? (
        <div className="posts-section">
          <div className="select-container">
            <div className="select-button" onClick={toggleDropdown}>
              <div className="select-button-text">
                {activeCard && activeCard.icon}
                <span>{activeTag}</span>
              </div>
              <ChevronDown style={{ width: "16px", height: "16px", color: "#ffffff" }} />
            </div>

            <div className={`select-dropdown ${isDropdownOpen ? 'open' : ''}`}>
              {cards.map((card) => (
                <div
                  key={card.tag}
                  className={`select-option ${activeTag === card.tag ? 'active' : ''}`}
                  onClick={() => handleTagClick(card.tag)}
                >
                  {card.icon}
                  <span className="select-option-text">{card.tag}</span>
                </div>
              ))}
            </div>
          </div>

          {isVisible && (
            <button
              onClick={scrollToTop}
              className="back-to-top-btn"
              aria-label="Back to top"
            >
              <ArrowUp size={16} />
            </button>
          )}

          {posts.map((post, index) => (
            <div className="post" key={post.id} onClick={() => gopost(post)} ref={index === posts.length - 1 ? lastPostRef : null}>
              <div className="post-header">
                <div className="user-info">
                  <div className="user-avatar" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/user/${username}/postsby/${post.username}`);
                  }}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={`${import.meta.env.VITE_CDN_BASE_URL}/read/image/assets/${post.username}`}
                      alt="User Profile"
                      className="avatar-img"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                        e.target.parentNode.textContent = post.username.charAt(0).toUpperCase();
                      }}
                    />
                  </div>

                  <span className="username">Posted by {post.username}</span>
                  <span className="dot">•</span>
                  <span className="time-posted">{post.timePosted}</span>
                </div>

                <div className="more-options-container">
                  <button className="more-options-btn" onClick={(event) => togglePopup(event, post.id)}>
                    <MoreHorizontal size={16} />
                  </button>

                  {activePopupId === post.id && mo && (
                    <div ref={popupRef} className="more-options-popup">
                      <button onClick={(event) => handleReport(event, post.id, post.apitag)} className="report-btn">
                        Report
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h2 className="post-title">{post.title}</h2>
              <div className="post-content">
                {post.content.length > 100 ? (
                  <>
                    {post.content.substring(0, 110)} ...<span className="readmore">Read more</span>
                  </>
                ) : (
                  post.content
                )}
              </div>

              <div className="post-actions">
                <button
                  className={`action-btn like-btn ${likedPosts[post.id]
                    ? (post.liked === "0" ? 'liked' : '')
                    : (post.liked === "1" ? 'liked' : '')}
                `}
                  onClick={(event) => handleLikeClick(event, post.id, post.apitag)}
                >
                  <Heart
                    size={18}
                    fill={
                      likedPosts[post.id]
                        ? (post.liked === "0" ? "#E5097F" : "none")
                        : (post.liked === "1" ? "#E5097F" : "none")
                    }
                  />
                </button>

                <span className="landc">
                  {likedPosts[post.id]
                    ? (post.liked === "0" ? Number(post.like) + 1 : Number(post.like) - 1)
                    : (post.liked === "1" ? post.like : post.like)}
                </span>

                <button className="action-btn comment-btn">
                  <MessageSquare size={18} />
                </button>
                <span className="landc">{post.comment}</span>
                <button className="action-btn share-btn" onClick={(event) => handleShare(event, post.id, post.apitag)}>
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {isLoading && <p style={{ textAlign: 'center' }}>Loading more posts...</p>}

          {posts.length === 0 && !load && (
            <div className="no-posts-message">
              <Ghost className="no-posts-icon" />
              <h2 className="no-posts-title">Nothing’s Here Yet</h2>
              <p className="no-posts-description">
                Couldn’t find anything matching your search. Try checking the spelling or explore other things to discover fresh sparks ✨
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="image-container2">
          <img src="/bouncing-circles.svg" alt="" className="ssloading-img2" />
        </div>
      )}

      {!load ? (
        <div className="right-sidebar">
          <div className="card-container">
            <h2 className="card-title">Quick Access posts</h2>

            <div className="card-grid">
              {cards.map((card) => (
                <div
                  key={card.tag}
                  className={`card ${activeTag === card.tag ? "active" : ""}`}
                  onClick={() => handleTagClick(card.tag)}
                >
                  <div className="card-header">
                    <div className="card-icon">{card.icon}</div>
                    <span
                      className="card-tag"
                      style={getTagStyle(card.tag)}
                    >
                      {card.tag}
                    </span>
                  </div>
                  <div className="card-content">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="footer-links">
            <div className="links-group">
              <a href="/footercont/about.html">About</a>
              <a href="/footercont/terms.html">Terms</a>
              <a href="/footercont/privacypolicy.html">Privacy Policy</a>
            </div>

            <div className="links-group">
              <a href="/footercont/feedback.html">Feedback</a>
              <a href="/footercont/contribute.html">Contribute</a>
            </div>

            <div className="copyright">
              © 2025 Unvelit, Inc. All rights reserved.
            </div>
          </div>

        </div>
      ) : ("")}
    </div>
  );
}