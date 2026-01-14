import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Pencil } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import '../CSSF/profile.css';

function ProfilePage() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const username = localStorage.getItem("username");
  const navigate = useNavigate();
  const navigate2 = useNavigate();

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [showingPosts, setShowingPosts] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [image, setImage] = useState("");
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [deleteposttag, setdeleteposttag] = useState(null);


  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastPostDate, setLastPostDate] = useState("");
  const observerRef = useRef();

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    alert("Feature not available right now :(");
  };

  const confirmDeletePost = (e, postId, posttag) => {
    e.stopPropagation();
    setDeletePostId(postId);
    setdeleteposttag(posttag);
    setShowDeleteConfirmation(true);
  };

  const handleDeletePost = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data/delete/post?uuid=${deletePostId}&tag=${deleteposttag}&username=${username}`, {
        method: 'DELETE',
      });

      if (!response.value) {
        // console.log('Item deleted successfully');
        setPosts(posts.filter(post => post.id !== deletePostId));
        setShowDeleteConfirmation(false);
        setDeletePostId(null);
      } else {
        console.error('Failed to delete the item');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cancelDeletePost = () => {
    setShowDeleteConfirmation(false);
    setDeletePostId(null);
  };

  const handleGoBack = () => {
    navigate(`/user/${username}`, { replace: true });
  };

  const showposts = (id, tag) => {
    navigate2(`/user/${username}/Showpost/${tag}/${id}`, {
      state: {
        checkk: true,
      }
    });
  }

  const [i, seti] = useState(false)

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

  const fetchPosts = useCallback(async (dateParam = "") => {
    if (loading) return [];

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/search/user?text=${username}&username=${username}&date=${dateParam}`);
      const data = await res.json();

      if (data === false) {
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
            if (data.date_list?.[index] != null) {
              post.createdAt = formatDate(data.date_list[index]);
              post.rawDate = data.date_list[index];
            }
            if (data.likes_list?.[index] != null) post.like = data.likes_list[index];
            if (data.number_of_comments?.[index] != null) post.comment = data.number_of_comments[index];
            if (data.has_liked?.[index] != null) post.liked = data.has_liked[index];
            if (data.tags?.[index] != null) post.tag = data.tags[index];

            return post;
          })
          .filter(Boolean)
        : [];


      if (combinedPosts.length < 10) {
        setHasMore(false);
      }


      if (combinedPosts.length > 0) {
        const lastPost = combinedPosts[combinedPosts.length - 1];
        setLastPostDate(lastPost.rawDate || "");
      }

      return combinedPosts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [username, loading, navigate]);


  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loading) return;

    const newPosts = await fetchPosts(lastPostDate);
    if (newPosts.length > 0) {
      setPosts(prevPosts => [...prevPosts, ...newPosts]);
    }
  }, [fetchPosts, hasMore, loading, lastPostDate]);


  const lastPostElementRef = useCallback((node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && showingPosts) {
        loadMorePosts();
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, loadMorePosts, showingPosts]);


  useEffect(() => {
    async function load() {
      const newPosts = await fetchPosts("");
      setPosts(newPosts);
    }

    load();
  }, []);


  useEffect(() => {
    if (showingPosts) {

      setLastPostDate("");
      setHasMore(true);

      const loadInitialPosts = async () => {
        const newPosts = await fetchPosts("");
        setPosts(newPosts);
      };
      loadInitialPosts();
    }
  }, [showingPosts]);

  const [imgwasset, setimgwasset] = useState(false)
  useEffect(() => {
    async function load2() {
      const res2 = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data/read/get-pfp?iusername=${username}&username=${username}`);
      const data2 = await res2.json();

      if (data2.image) {
        setfinalimg(data2.image);
        seti(true)
      }
    }

    load2();
  }, [imgwasset]);

  const [changedimg, setchangedimg] = useState(false)
  const [finalimg, setfinalimg] = useState("/user.png")

  const handleImageChange = async (event) => {
    const imageFile = event.target.files[0];
    if (!imageFile) return;

    const originalKB = imageFile.size / 1024;
    setOriginalSize(originalKB.toFixed(2));

    if (originalKB <= 200) {
      setImage(URL.createObjectURL(imageFile));
      setchangedimg(true)
      return;
    }

    const options = {
      maxSizeMB: 0.25,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(imageFile, options);
      setCompressedSize((compressedFile.size / 1024).toFixed(2));
      setImage(URL.createObjectURL(compressedFile));
      setchangedimg(true)
    } catch (error) {
      console.error('Image compression error:', error);
    }
  };

  useEffect(() => {
    const setprofile = async () => {
      const res = await fetch(image);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append('image', blob, 'profile.jpg');
      formData.append('username', username);

      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/edit/user/pfp`;
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        body: formData,
      });

      const result = await response.json();

      if (!result.valid) {
        setimgwasset(!imgwasset)
      }
      else {
        setimgwasset(!imgwasset)
      }
    }

    if (changedimg && image !== "/user.png") {
      setprofile();
    }
  }, [image]);

  const deleteaccount = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data/delete/account?iusername=${username}&username=${username}`, {
      method: 'DELETE',
    });

    const data = await res.json();

    if (data.value) {
      // console.log('Item deleted successfully');
      localStorage.removeItem("username");
      navigate('/');
    } else {
      console.error('Failed to delete the account');
      alert("Error : Failed to delete your account");
    }
  }

  return (
    <div className="profile-page-wrapper">
      <div className="goback">
        <button className="unique-back-button" onClick={handleGoBack}><ArrowLeft size={18} /> <span>Back</span></button>
      </div>

      <div className="container-prof">
        <div className="profile-card-prof">
          <div className="profile-pic-container-prof">
            <img src={i ? `data:image/png;base64,${finalimg}` : finalimg} alt="Profile" className="profile-pic-prof" />

            <label htmlFor="imageUpload" className="upload-btn">
              <Pencil size={20} />
            </label>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          <h2 className="username-prof">{username}</h2>

          <div className="profile-actions-prof">
            <button
              className="action-button-prof"
              onClick={() => setShowingPosts(!showingPosts)}
            >
              {showingPosts ? 'Hide Posts' : 'Show My Posts'}
            </button>

            {showingPosts && (
              <div className="posts-container-prof">
                <h3>My Posts</h3>
                {posts.length > 0 ? (
                  <>
                    {posts.map((post, index) => (
                      <div
                        key={post.id}
                        className="post-prof"
                        onClick={() => showposts(post.id, post.tag)}
                        ref={index === posts.length - 1 ? lastPostElementRef : null}
                      >
                        <h4>{post.title}</h4>
                        <p>{post.content}...</p>
                        <div className="post-meta">
                          <small>Posted: {post.createdAt}</small>
                        </div>
                        <div className="post-actions-prof">
                          <button
                            className="delete-post-btn-prof"
                            onClick={(e) => confirmDeletePost(e, post.id, post.tag)}
                          >
                            Delete Post
                          </button>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="loading-posts" style={{ textAlign: 'center', padding: '20px' }}>
                        <p>Loading more posts...</p>
                      </div>
                    )}
                    {!hasMore && posts.length > 0 && (
                      <div className="no-more-posts" style={{ textAlign: 'center', padding: '20px' }}>
                        <p>No more posts to load</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="no-posts-prof">You have no posts yet.</p>
                )}
              </div>
            )}

            <button
              className="action-button-prof red"
              onClick={() => setShowDeleteConfirmation(!showDeleteConfirmation)}
            >
              Delete Account
            </button>

            {showDeleteConfirmation && (
              <div className="delask">
                <div>Are you sure you want to delete your account?</div>
                <div className="delbtns">
                  <button onClick={() => { deleteaccount() }}>Yes</button>
                  <button onClick={() => setShowDeleteConfirmation(false)}>No</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="come-centre">
        <div className="full-l">
          <div className="links-group centre">
            <a href="/footercont/about.html">About</a>
            <a href="/footercont/terms.html">Terms</a>
            <a href="/footercont/privacypolicy.html">Privacy Policy</a>
            <a href="/footercont/feedback.html">Feedback</a>
            <a href="/footercont/contribute.html">Contribute</a>
          </div>

          <div className="copyright centre">
            © 2025 WebApp, Inc. All rights reserved.
          </div>
        </div>
      </div>

      {deletePostId && (
        <div className="modal-overlay">
          <div className="delete-confirmation-prof">
            <p>Are you sure you want to delete this post?</p>
            <div className="confirmation-actions-prof">
              <button
                className="confirm-delete-btn-prof"
                onClick={handleDeletePost}
              >
                Yes, Delete
              </button>
              <button
                className="cancel-delete-btn-prof"
                onClick={cancelDeletePost}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;