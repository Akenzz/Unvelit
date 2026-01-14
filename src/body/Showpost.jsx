import { useState, useEffect } from 'react';
import { Heart, Share2, MoreVertical, ArrowLeft, X, Trash2 } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';
import '../CSSF/showpost.css';

const PostPage = () => {

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { checkk } = location.state || {};
  const [date, setdate] = useState("");
  const [title, settitle] = useState("");
  const [likes, setlikes2] = useState("0");
  const [author, setauthor] = useState(" ");
  const [hasLiked, sethasliked] = useState("0");
  const [ncomments, setncomments] = useState(0);
  const [postcontent, setpostcontent] = useState("");
  const [cn, setcn] = useState(0);
  const { username } = useParams();
  // const username = localStorage.getItem("username");
  const { id } = useParams();
  const { tag } = useParams();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [load, setload] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [finalimg, setfinalimg] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [nopost, setnopost] = useState(false)
  const [hasv, sethasv] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const [subComments, setSubComments] = useState({});
  const [showSubDeleteConfirm, setShowSubDeleteConfirm] = useState(false);
  const [subCommentToDelete, setSubCommentToDelete] = useState(null);
  const [subCommentParent, setSubCommentParent] = useState(null);

  function safeLinkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.split('\n\n').map((paragraph, index) => {
      const linkedParagraph = paragraph.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      });

      return (
        <p
          key={index}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(linkedParagraph, { ADD_ATTR: ['target'] }),
          }}
        ></p>
      );
    });
  }

  function safeLinkify2(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const mentionRegex = /(@\w+)/g;

    return text.split('\n\n').map((paragraph, index) => {

      let processedParagraph = paragraph.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      });

      processedParagraph = processedParagraph.replace(mentionRegex, (mention) => {
        return `<span style="color: #ec2b92; font-weight: 500;">${mention}</span>`;
      });

      return (
        <p
          key={index}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(processedParagraph, {
              ADD_ATTR: ['target', 'style'],
              ADD_TAGS: ['span']
            }),
          }}
        ></p>
      );
    });
  }

  function isDeletedComment(username, content) {
    return username === "dlt" && content === "dlt";
  }

  const post = {
    title: title,
    id: id,
    author: author,
    date: date,
    ncomments: ncomments,
    content: postcontent,
    image: imageUrl,
    pfp: finalimg,
  };

  function formatDate(dateString) {
    if (!dateString) return "";
    const postDate = new Date(dateString);
    if (isNaN(postDate.getTime())) return "";
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

  const fetchSubComments = async (comment) => {
    setSubComments((prev) => ({
      ...prev,
      [comment.id]: { ...(prev[comment.id] || {}), loading: true, open: true }
    }));
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/data/read/subcomments?uuid=${id}&tag=${tag}&comment_uuid=${comment.id}&username=${username}`;
      const res = await fetch(url);
      const data = await res.json();
      const commentList = Array.isArray(data?.comment_list) ? data.comment_list : [];
      const usersList = Array.isArray(data?.user_list) ? data.user_list : [];
      const dateList = Array.isArray(data?.comment_date_list) ? data.comment_date_list : [];
      const uuidList = Array.isArray(data?.uuid_list) ? data.uuid_list : [];
      setSubComments((prev) => ({
        ...prev,
        [comment.id]: {
          ...prev[comment.id],
          loading: false,
          open: true,
          data: commentList.map((content, i) => ({
            content,
            username: usersList[i] || comment.username,
            date: formatDate(dateList[i]),
            id: uuidList[i]
          }))
        }
      }));
    } catch {
      setSubComments((prev) => ({
        ...prev,
        [comment.id]: { ...(prev[comment.id] || {}), loading: false, open: true, data: [] }
      }));
    }
  };

  const handleShowReplies = (comment) => {
    if (!subComments[comment.id]?.open) {
      fetchSubComments(comment);
    } else {
      setSubComments((prev) => ({
        ...prev,
        [comment.id]: { ...(prev[comment.id] || {}), open: false }
      }));
    }
  };

  const handleReplyChange = (commentId, value) => {
    setSubComments((prev) => ({
      ...prev,
      [commentId]: { ...(prev[commentId] || {}), replyText: value }
    }));
  };

  const handleReplySubmit = async (comment) => {
    const replyText = subComments[comment.id]?.replyText?.trim();
    if (!replyText) return;
    setSubComments((prev) => ({
      ...prev,
      [comment.id]: { ...(prev[comment.id] || {}), submitting: true }
    }));
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/data/create/subcomments?content=${encodeURIComponent(replyText)}&username=${username}&post_uuid=${id}&tag=${tag}&comment_uuid=${comment.id}`;
      const res = await fetch(url, { method: "POST" });
      const result = await res.json();
      if (result.value) {
        fetchSubComments(comment);
        setSubComments((prev) => ({
          ...prev,
          [comment.id]: { ...(prev[comment.id] || {}), replyText: "", submitting: false }
        }));
      }
    } catch {
      setSubComments((prev) => ({
        ...prev,
        [comment.id]: { ...(prev[comment.id] || {}), submitting: false }
      }));
    }
  };

  const handleDeleteSubComment = async (parentComment, subComment) => {
    setSubComments((prev) => ({
      ...prev,
      [parentComment.id]: { ...(prev[parentComment.id] || {}), deletingId: subComment.id }
    }));
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/data/delete/sub-comment?tag=${tag}&uuid=${id}&username=${username}&comment_uuid=${parentComment.id}&sub_comment_uuid=${subComment.id}`;
      const res = await fetch(url, { method: "DELETE" });
      const result = await res.json();
      if (result.value) {
        fetchSubComments(parentComment);
      }
    } finally {
      setSubComments((prev) => ({
        ...prev,
        [parentComment.id]: { ...(prev[parentComment.id] || {}), deletingId: null }
      }));
    }
  };

  useEffect(() => {

    const data = async () => {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/data/read/post?tag=${tag}&uuid=${id}&iusername=${username}`)
        .then(res => res.json())
        .then(data => {

          // console.log(data)

          if (data === false) {
            navigate('/');
            return;
          }

          if (data.title === null && data.content === null) {
            setnopost(true);
            return;
          }

          setpostcontent(data.content);
          settitle(data.title);
          setdate(formatDate(data.post_date));
          setlikes2(data.number_of_likes);
          setncomments(data.user_list.filter(user => user !== null).length);
          setauthor(data.username);
          sethasliked(data.has_liked);
          if (data.image !== "") {
            setImageUrl(data.image);
          }
          setfinalimg(data.user_image);
          sethasv(data.hasvideo);


          const formattedComments = Array.isArray(data?.uuid_list)
            ? data.uuid_list
              .map((id, index) => {
                if (id == null) return null;

                const comment = { id };
                if (data.user_list?.[index] != null) comment.username = data.user_list[index];
                if (data.comment_date_list?.[index] != null) comment.date = formatDate(data.comment_date_list[index]);
                if (data.comment_list?.[index] != null) comment.content = data.comment_list[index];
                if (data.number_of_subcomments?.[index] != null) comment.subc = data.number_of_subcomments[index];
                if (data.commenter_image?.[index] != null) comment.cimg = data.commenter_image[index];
                return comment;
              })
              .filter(Boolean)
            : undefined;



          setComments(formattedComments);
        });

      setload(false);
    }

    data();

  }, []);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "") return;



    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/data/create/comment?content=${encodeURIComponent(newComment)}&username=${username}&post_uuid=${id}&tag=${tag}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const result = await response.json();

      if (result.value) {
        const newCommentObj = {
          id: comments.length + 1,
          username: username,
          date: "Just now",
          content: newComment
        };

        setComments([...comments, newCommentObj]);
        setNewComment("");
        setcn(cn + 1);
      }

    } catch (error) {
      console.error('Login error:', error);
    }

  };

  const handleDeleteComment = async (commentId) => {
    setDeletingCommentId(commentId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/data/delete/comment?uuid=${id}&tag=${tag}&username=${username}&comment_id=${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (result.value) {
        setComments(comments.filter(comment => comment.id !== commentId));
        setcn(cn - 1);
        // console.log('Comment deleted successfully:', commentId);
        // alert('Comment deleted successfully');
      } else {
        alert('Failed to delete comment. Please try again.');
      }
    } catch (error) {
      console.error('Delete comment error:', error);
      alert('Error deleting comment. Please try again.');
    } finally {
      setDeletingCommentId(null);
      setShowDeleteConfirm(false);
      setCommentToDelete(null);
    }
  };

  const confirmDeleteComment = (comment) => {
    setCommentToDelete(comment);
    setShowDeleteConfirm(true);
  };

  const handleReportPost = async () => {

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/report/post?uuid=${post.id}&tag=${tag}&username=${username}`);
    const data = await res.json();

    if (data.value) {
      alert(`Post with ID: ${post.id} has been reported`);
    }
    else {
      alert("Error reporting the post. Please try again later.");
    }
    setMenuOpen(false);
  };

  const handleGoBack = () => {
    // navigate(`/user/${username}`);
    navigate(-1);
  };

  const handleSharePost = async () => {
    // alert("Sharing post: " + post.title);
    const shareData = {
      title: 'Check out this post!',
      text: 'Look at this interesting post I found!',
      url: window.location.href
    };

    try {
      await navigator.share(shareData);
      // console.log('Post shared successfully!');
    } catch (err) {
      console.error('Share failed:', err.message);
    }
  };

  const handleLikeClick = async () => {
    setLiked(!liked);
    // setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    // {liked ? (hasliked === "0" ? likesCount + 1 : likesCount - 1) : (hasliked === "1" ? likesCount : likesCount)}

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/data/update/like?tag=${tag}&username=${username}&uuid=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Request failed');

      const data = await response.json();
      // console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      {!load ? (

        <div className="unique-post-page">

          {!nopost ? <div>

            <div className="unique-post-top-actions">
              <button className="unique-back-button" onClick={handleGoBack}>
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
            </div>

            <article className="unique-post">
              <div className="unique-post-header">
                <div className="wrap-sp">
                  <div className="pfpc">
                    <div className="user-avatar2" onClick={() => navigate(`/user/${username}/postsby/${post.author}`)} style={{ cursor: 'pointer' }}>
                      <img
                        src={`${import.meta.env.VITE_CDN_BASE_URL}/read/image/assets/${post.author}`}
                        alt="User Profile"
                        className="avatar-img"
                        onError={e => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                          e.target.parentNode.textContent = post.author.charAt(0).toUpperCase();
                        }}
                      />
                    </div>
                  </div>

                  <div className="unique-post-header-content">
                    <div className="unique-post-header-top">
                      <h1 className="unique-post-title">
                        {post.title}{" "}
                        <span className="ugoup">
                          <div className="what-tag">{tag}</div>
                        </span>
                      </h1>

                      <div className="unique-options-menu">
                        <button
                          className="unique-options-button"
                          onClick={() => setMenuOpen(!menuOpen)}
                          aria-label="More options"
                        >
                          <MoreVertical size={20} />
                        </button>
                        {menuOpen && (
                          <div className="unique-options-dropdown">
                            <button
                              onClick={handleReportPost}
                              className="unique-report-button"
                            >
                              Report Post
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="unique-post-meta">
                      <span className="unique-post-author">By {post.author}</span>
                      <span className="unique-post-date">{post.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {post.image && (
                <div className="upic">
                  <div
                    className="unique-post-image-container"
                    onClick={() => setShowImageModal(true)}
                  >
                    <img
                      // src={`data:image/png;base64,${post.image}`}
                      src={`${import.meta.env.VITE_CDN_BASE_URL}/read/image/${tag}/${id}`}
                      alt="Post featured image"
                      className="unique-post-image"
                    />
                  </div>
                </div>
              )}

              {hasv && (
                <div className="upic">
                  <div
                    className="unique-post-image-container2"
                    onClick={() => setShowImageModal(true)}
                  >

                    <video width="640" height="360" controls autoPlay>
                      <source src={`${import.meta.env.VITE_CDN_BASE_URL}/read/video/${tag}/${id}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                  </div>
                </div>
              )}

              <div className="unique-post-content">
                {safeLinkify(post.content)}
              </div>

              <div className="unique-post-actions">
                <div className="unique-post-social-actions">
                  <button
                    className={`unique-like-button ${liked
                      ? hasLiked === "0"
                        ? "liked"
                        : ""
                      : hasLiked === "1"
                        ? "liked"
                        : ""
                      }`}
                    onClick={handleLikeClick}
                    aria-label="Like post"
                  >
                    <Heart
                      size={18}
                      fill={
                        liked
                          ? hasLiked === "0"
                            ? "#ec2b92"
                            : "none"
                          : hasLiked === "1"
                            ? "#ec2b92"
                            : "none"
                      }
                      color={
                        liked
                          ? hasLiked === "0"
                            ? "#ec2b92"
                            : "#999"
                          : hasLiked === "1"
                            ? "#ec2b92"
                            : "#999"
                      }
                    />

                    <span>
                      {liked
                        ? hasLiked === "0"
                          ? Number(likes) + 1
                          : Number(likes) - 1
                        : hasLiked === "1"
                          ? likes
                          : likes}
                    </span>
                  </button>
                  <button
                    className="unique-share-button"
                    onClick={handleSharePost}
                    aria-label="Share post"
                  >
                    <Share2 size={18} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </article>

            <section className="unique-comments-section">
              <h2 className="unique-comments-title">
                Comments ({Number(post.ncomments) + cn})
              </h2>

              <form
                className="unique-comment-form"
                onSubmit={handleCommentSubmit}
              >
                <textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="unique-comment-input"
                  required
                ></textarea>
                <button type="submit" className="unique-comment-submit">
                  Post Comment
                </button>
              </form>

              <div className="unique-comments-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="unique-comment">

                    <div className="unique-comment-avatar" onClick={(e) => {
                      e.stopPropagation();
                      if (comment.username !== "dlt") {
                        navigate(`/user/${username}/postsby/${comment.username}`);
                      }
                    }} style={{
                      cursor: comment.username !== "dlt" ? 'pointer' : 'default'
                    }}>

                      {isDeletedComment(comment.username, comment.content) ? (
                        <span style={{ fontSize: '2rem' }}>🤕</span>
                      ) : (
                        <img
                          src={`${import.meta.env.VITE_CDN_BASE_URL}/read/image/assets/${comment.username}`}
                          alt="User Profile"
                          className="avatar-img"
                          onError={e => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentNode.textContent = comment.username.charAt(0).toUpperCase();
                          }}
                        />
                      )}
                    </div>
                    <div className="unique-comment-content">
                      <div className="unique-comment-header">
                        <h3 className="unique-comment-username">
                          {isDeletedComment(comment.username, comment.content) ? "[deleted]" : comment.username}
                        </h3>
                        <span className="unique-comment-date">{comment.date}</span>
                        {comment.username === username && !isDeletedComment(comment.username, comment.content) && (
                          <button
                            className="unique-delete-comment-button"
                            onClick={() => confirmDeleteComment(comment)}
                            disabled={deletingCommentId === comment.id}
                            aria-label="Delete comment"
                            title="Delete comment"
                          >
                            {deletingCommentId === comment.id ? (
                              <span className="deleting-spinner">⏳</span>
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="unique-comment-text" style={{ whiteSpace: "pre-line" }}>
                        {isDeletedComment(comment.username, comment.content)
                          ? <em>[This comment was deleted]</em>
                          : safeLinkify2(comment.content)}
                      </div>

                      {/* Subcomments (Replies) */}
                      {!isDeletedComment(comment.username, comment.content) && (
                        <div className="comment-actions">
                          <button
                            className="show-replies-button"
                            onClick={() => handleShowReplies(comment)}
                            disabled={subComments[comment.id]?.loading}
                          >
                            {subComments[comment.id]?.open ? "Hide Replies" : `Show Replies${comment.subc ? ` (${comment.subc})` : ""}`}
                          </button>
                          <button
                            className="reply-button"
                            onClick={() =>
                              setSubComments((prev) => ({
                                ...prev,
                                [comment.id]: { ...(prev[comment.id] || {}), showReply: !prev[comment.id]?.showReply }
                              }))
                            }
                          >
                            Reply
                          </button>
                        </div>
                      )}

                      {/* Reply form */}
                      {subComments[comment.id]?.showReply && (
                        <form
                          className="reply-form"
                          onSubmit={e => {
                            e.preventDefault();
                            handleReplySubmit(comment);
                          }}
                        >
                          <textarea
                            className="reply-input"
                            placeholder="Write a reply..."
                            value={subComments[comment.id]?.replyText || ""}
                            onChange={e => handleReplyChange(comment.id, e.target.value)}
                            required
                          />
                          <div className="reply-form-actions">
                            <button
                              type="button"
                              className="reply-cancel"
                              onClick={() =>
                                setSubComments((prev) => ({
                                  ...prev,
                                  [comment.id]: { ...(prev[comment.id] || {}), showReply: false, replyText: "" }
                                }))
                              }
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="reply-submit"
                              disabled={subComments[comment.id]?.submitting}
                            >
                              {subComments[comment.id]?.submitting ? "Replying..." : "Reply"}
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Subcomments list */}
                      {subComments[comment.id]?.open && (
                        <div className="sub-comments-container">
                          {subComments[comment.id]?.loading ? (
                            <div className="sub-comment-loading">Loading replies...</div>
                          ) : (
                            (subComments[comment.id]?.data || []).length === 0 ? (
                              <div className="sub-comment-empty">No replies yet.</div>
                            ) : (
                              subComments[comment.id].data.map((sub, i) => (
                                <div key={sub.id} className="sub-comment">
                                  <div className="sub-comment-line" />
                                  <div className="sub-comment-content">

                                    <div className="sub-comment-avatar" onClick={(e) => {
                                      e.stopPropagation();
                                      if (sub.username !== "dlt") {
                                        navigate(`/user/${username}/postsby/${sub.username}`);
                                      }
                                    }} style={{
                                      cursor: sub.username !== "dlt" ? 'pointer' : 'default'
                                    }}
                                    >

                                      {1 ? (
                                        <img
                                          src={`${import.meta.env.VITE_CDN_BASE_URL}/read/image/assets/${sub.username}`}
                                          alt="User Profile"
                                          className="avatar-img"
                                        />
                                      ) : (
                                        (sub.username || comment.username || "?").charAt(0).toUpperCase()
                                      )}
                                    </div>
                                    <div className="sub-comment-body">
                                      <div className="sub-comment-header">
                                        <span className="sub-comment-username">
                                          {(sub.username && sub.username !== "dlt") ? sub.username : (comment.username || "")}
                                        </span>
                                        <span className="sub-comment-date">{sub.date}</span>
                                        {sub.username === username && sub.username !== "dlt" && (
                                          <button
                                            className="sub-comment-delete-button"
                                            onClick={() => {
                                              setSubCommentToDelete(sub);
                                              setSubCommentParent(comment);
                                              setShowSubDeleteConfirm(true);
                                            }}
                                            disabled={subComments[comment.id]?.deletingId === sub.id}
                                            title="Delete reply"
                                          >
                                            {subComments[comment.id]?.deletingId === sub.id ? (
                                              <span className="deleting-spinner">⏳</span>
                                            ) : (
                                              <Trash2 size={16} />
                                            )}
                                          </button>
                                        )}
                                      </div>
                                      <div className="sub-comment-text">
                                        {sub.username === "dlt" && sub.content === "dlt"
                                          ? <em>[This reply was deleted]</em>
                                          : safeLinkify2(sub.content)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {showImageModal && post.image && (
              <div
                className="image-modal-overlay"
                onClick={() => setShowImageModal(false)}
              >
                <div
                  className="image-modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="image-modal-close"
                    onClick={() => setShowImageModal(false)}
                    aria-label="Close image"
                  >
                    <X size={20} />
                  </button>
                  <img
                    src={`data:image/png;base64,${post.image}`}
                    alt="Full size post image"
                    className="image-modal-img"
                  />
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && commentToDelete && (
              <div className="delete-confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
                <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                  <h3>Delete Comment</h3>
                  <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
                  <div className="delete-confirm-buttons">
                    <button
                      className="delete-confirm-cancel"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setCommentToDelete(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="delete-confirm-delete"
                      onClick={() => handleDeleteComment(commentToDelete.id)}
                      disabled={deletingCommentId === commentToDelete.id}
                    >
                      {deletingCommentId === commentToDelete.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Subcomment Delete Confirmation Modal */}
            {showSubDeleteConfirm && subCommentToDelete && (
              <div className="delete-confirm-overlay" onClick={() => setShowSubDeleteConfirm(false)}>
                <div className="delete-confirm-modal" onClick={e => e.stopPropagation()}>
                  <h3>Delete Reply</h3>
                  <p>Are you sure you want to delete this reply? This action cannot be undone.</p>
                  <div className="delete-confirm-buttons">
                    <button
                      className="delete-confirm-cancel"
                      onClick={() => {
                        setShowSubDeleteConfirm(false);
                        setSubCommentToDelete(null);
                        setSubCommentParent(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="delete-confirm-delete"
                      onClick={() => {
                        handleDeleteSubComment(subCommentParent, subCommentToDelete);
                        setShowSubDeleteConfirm(false);
                        setSubCommentToDelete(null);
                        setSubCommentParent(null);
                      }}
                      disabled={subComments[subCommentParent?.id]?.deletingId === subCommentToDelete?.id}
                    >
                      {subComments[subCommentParent?.id]?.deletingId === subCommentToDelete?.id ? 'Deleting...' : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div> : <div class="not-found-wrapper">
            <div class="not-found-card">
              <div class="emoji">👾</div>
              <h2>Post not found</h2>
              <p>Well, this post vanished into the void... or was deleted 🕳️</p>
              <button onClick={handleGoBack}>Go Back</button>
            </div>
          </div>
          }

        </div>
      ) : (
        <div className="image-container">
          <img src="/bouncing-circles.svg" alt="" className="ssloading-img" />
        </div>
      )}
    </>
  );

};

export default PostPage;