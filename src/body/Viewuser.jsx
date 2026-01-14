import { MessageSquare, Share2, MoreHorizontal, Heart, Ghost, ArrowLeft } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../CSSF/viewuser.css';

export default function Viewuser() {
  const { user } = useParams();
  const username = localStorage.getItem('username');
  const [posts, setPosts] = useState([]);
  const [userAvatar, setUserAvatar] = useState(null);
  const [load, setLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [likedPosts, setLikedPosts] = useState({});
  const [activePopupId, setActivePopupId] = useState(null);
  const [mo, setMo] = useState(false);
  const popupRef = useRef(null);
  const observer = useRef();
  const navigate = useNavigate();
  const [lastDate, setLastDate] = useState(null);

  function formatDate(dateString) {
    const postDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now - postDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  }


  const fetchPosts = useCallback(async (lastDateParam = null) => {
    setIsLoading(true);
    const dateParam = `&date=${lastDateParam || ''}`;
    const url = `${import.meta.env.VITE_API_BASE_URL}/search/user?text=${user}&username=${username}${dateParam}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data?.uuid_list)) {

        const userPosts = data.uuid_list.map((uuid, index) => {
          if (!uuid) return null;
          return {
            id: uuid,
            username: data.user_list?.[index] || user,
            title: data.title_list?.[index] || '',
            content: data.description?.[index] || '',
            timePosted: formatDate(data.date_list?.[index] || ''),
            rawDate: data.date_list?.[index] || '',
            like: data.likes_list?.[index] || 0,
            comment: data.number_of_comments?.[index] || 0,
            liked: data.has_liked?.[index] || '0',
            apitag: data.tags?.[index] || '',
            pfp: data.user_image?.[index] || null,
          };
        }).filter(Boolean);

        if (!lastDateParam) {
          setPosts(userPosts);
        } else {
          setPosts(prev => {
            const existingIds = new Set(prev.map(post => post.id));
            const uniqueNewPosts = userPosts.filter(post => !existingIds.has(post.id));
            return [...prev, ...uniqueNewPosts];
          });
        }
        if (userPosts.length > 0) setUserAvatar(userPosts[0].pfp);
        setHasMore(userPosts.length > 0);

        const lastRawDate = userPosts.length > 0 ? userPosts[userPosts.length - 1].rawDate : null;
        if (lastRawDate && lastRawDate !== 'null' && lastRawDate !== 'undefined' && lastRawDate !== '') {
          setLastDate(lastRawDate);
        } else {
          setLastDate(null);
        }
      } else {
        if (!lastDateParam) setPosts([]);
        setHasMore(false);
        setLastDate(null);
      }
    } catch (e) {
      if (!lastDateParam) setPosts([]);
      setHasMore(false);
      setLastDate(null);
    }
    setIsLoading(false);
    setLoad(false);
  }, [user, username]);

  useEffect(() => {
    setPosts([]);
    setLastDate(null);
    setHasMore(true);
    setLoad(true);
    fetchPosts();
  }, [user, username]);

  const lastPostRef = useCallback(
    node => {
      if (isLoading || !hasMore || !lastDate) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore && lastDate) {
          fetchPosts(lastDate);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, lastDate, fetchPosts]
  );

  const handleLikeClick = async (event, postId, posttag) => {
    event.stopPropagation();
    setLikedPosts(prev => {
      const newLikedPosts = { ...prev };
      newLikedPosts[postId] = !newLikedPosts[postId];
      return newLikedPosts;
    });
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/data/update/like?tag=${posttag}&username=${username}&uuid=${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {

    }
  };

  const handleShare = async (event, id, apitag) => {
    event.stopPropagation();
    const shareData = {
      title: 'Check out this post!',
      text: 'Look at this interesting post I found!',
      url: window.location.origin + `/user/${user}/Showpost/${apitag}/${id}`
    };
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.log("Error : ", err);
    }
  };

  const togglePopup = (event, postId) => {
    event.stopPropagation();
    setMo(prevMo => {
      const isPopupVisible = prevMo && activePopupId === postId;
      setActivePopupId(isPopupVisible ? null : postId);
      return !prevMo;
    });
  };

  const handleReport = async (event, postId, posttag) => {
    event.stopPropagation();
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/report/post?uuid=${postId}&tag=${posttag}&username=${username}`);
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


  function gopost(post) {
    navigate(`/user/${username}/Showpost/${post.apitag}/${post.id}`);
  }


  function handleGoBack() {
    navigate(-1);
  }

  return (
    <div className="viewuser-main">
      <div className="viewuser-back-btn-absolute">
        <button className="unique-back-button" onClick={handleGoBack}>
          <ArrowLeft size={22} />
          <span className="viewuser-back-btn-text">Back</span>
        </button>
      </div>
      <div className="viewuser-avatar viewuser-avatar-big">
        <img
          src={`${import.meta.env.VITE_CDN_BASE_URL}/read/image/assets/${user}`}
          alt="User Profile"
          // className="avatar-img"
          onError={e => {
            e.target.onerror = null;
            e.target.style.display = "none";
            e.target.parentNode.textContent = user.charAt(0).toUpperCase();
          }}
        />
      </div>
      <div className="viewuser-title viewuser-title-big">
        You are viewing <span className="viewuser-username viewuser-username-big">{user}</span>'s posts
      </div>
      <div className="viewuser-title-divider"></div>
      {load ? (
        <div className="viewuser-loading">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="viewuser-noposts">No posts found for this user.</div>
      ) : (
        <div className="viewuser-posts">
          {posts.map((post, index) => (
            <div className="post" key={post.id || `${index}-noid`} onClick={() => gopost(post)} ref={index === posts.length - 1 ? lastPostRef : null}>
              <div className="post-header">
                <div className="user-info">
                  <div className="user-avatar">
                    {post.pfp ? (
                      <img src={`data:image/png;base64,${post.pfp}`} alt="User Profile" className="avatar-img" />
                    ) : (
                      post.username.charAt(0).toUpperCase()
                    )}
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
        </div>
      )}
    </div>
  );
}