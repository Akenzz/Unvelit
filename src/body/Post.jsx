import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Image, Video } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import '../CSSF/post.css';

function CreatePost() {
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [postMedia, setPostMedia] = useState(null);
    const [previewMedia, setPreviewMedia] = useState('');
    const [mediaType, setMediaType] = useState('');
    const [postTag, setPostTag] = useState('advice');
    const fileInputRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();
    const { username } = useParams();


    const processVideo = async (file) => {
        try {


            const video = document.createElement('video');

            return new Promise((resolve, reject) => {
                video.onloadedmetadata = () => {
                    const { duration } = video;
                    const fileSizeMB = file.size / (1024 * 1024);


                    if (duration > 600 || fileSizeMB > 50) {
                        console.warn('Video may be too large or long. Consider server-side processing.');
                        alert('Video is quite large. It may take longer to upload. Consider using a shorter/smaller video for faster upload.');
                    }

                    resolve(file);
                };

                video.onerror = () => {
                    reject(new Error('Failed to load video'));
                };

                video.src = URL.createObjectURL(file);
            });
        } catch (error) {
            console.error('Video processing error:', error);
            return file;
        }
    };

    const handleMediaChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsProcessing(true);

        try {
            if (file.type.startsWith('image/')) {

                const originalKB = file.size / 1024;

                if (originalKB <= 200) {
                    setPreviewMedia(URL.createObjectURL(file));
                    setPostMedia(file);
                    setMediaType('image');
                } else {
                    const options = {
                        maxSizeMB: 0.25,
                        maxWidthOrHeight: 1024,
                        useWebWorker: true,
                    };

                    const compressedFile = await imageCompression(file, options);
                    setPreviewMedia(URL.createObjectURL(compressedFile));
                    setPostMedia(compressedFile);
                    setMediaType('image');
                }
            } else if (file.type.startsWith('video/')) {

                try {
                    const processedVideo = await processVideo(file);
                    setPreviewMedia(URL.createObjectURL(processedVideo));
                    setPostMedia(processedVideo);
                    setMediaType('video');
                } catch (error) {
                    console.error('Video processing error:', error);

                    setPreviewMedia(URL.createObjectURL(file));
                    setPostMedia(file);
                    setMediaType('video');
                }
            }
        } catch (error) {
            console.error('Media processing error:', error);
            alert('Error processing media file. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const removeMedia = () => {
        setPostMedia(null);
        setPreviewMedia('');
        setMediaType('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (postTitle.trim() && postContent.trim()) {
            setIsSubmitting(true);

            const encodedContent = encodeURIComponent(postContent);
            const formData = new FormData();
            formData.append('username', username);
            formData.append('title', postTitle);
            formData.append('tag', postTag);
            if (postMedia) {
                formData.append('image', postMedia);
            }

            try {
                const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/data/create/post?content=${encodedContent}`;

                // console.log('Uploading media:', postMedia ? postMedia.type : 'no media');
                // console.log('Media size:', postMedia ? (postMedia.size / 1024 / 1024).toFixed(2) + 'MB' : 'N/A');

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                // console.log('API Response:', result);

                if (result === false) {
                    localStorage.removeItem("username");
                    navigate('/');
                    return;
                }

                if (result.value) {
                    alert("Your post was successful!")
                    navigate(`/user/${username}`, { replace: true });
                } else {
                    throw new Error('Upload failed - server returned false');
                }

            } catch (error) {
                console.error('Submit error:', error);
                alert(`Error: Post creation failed. ${error.message || 'Please try again later.'}`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleGoBack = () => {
        navigate(`/user/${username}`, { replace: true });
    };

    return (
        <div className="create-post-container">
            <div className="goback">
                <button className="unique-back-button" onClick={handleGoBack}>
                    <ArrowLeft size={18} /> <span>Back</span>
                </button>
            </div>

            <div className="create-post-card">
                <h2 className="create-post-heading">Create New Post</h2>

                <form className="create-post-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="post-title">Title</label>
                        <input
                            type="text"
                            id="post-title"
                            placeholder="Enter post title"
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                            required
                            className="post-title-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="post-tag">Tag</label>
                        <select
                            id="post-tag"
                            value={postTag}
                            onChange={(e) => setPostTag(e.target.value)}
                            className="post-tag-select"
                        >
                            <option value="advice">Advice</option>
                            <option value="doubts">Doubts</option>
                            <option value="insight">Insight</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="post-content">Content</label>
                        <textarea
                            id="post-content"
                            placeholder="What's on your mind?"
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            required
                            className="post-content-input"
                            rows="6"
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <div className="image-upload-section">
                            <button
                                type="button"
                                className="image-upload-btn"
                                onClick={triggerFileInput}
                                disabled={isProcessing}
                            >
                                <Image size={16} style={{ marginRight: '4px' }} />
                                <Video size={16} style={{ marginRight: '8px' }} />
                                {isProcessing ? 'Processing...' : 'Add Image/Video'}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleMediaChange}
                                accept="image/*,video/*"
                                className="file-input"
                            />
                        </div>

                        {isProcessing && (
                            <div className="processing-indicator" style={{
                                padding: '10px',
                                textAlign: 'center',
                                color: '#666',
                                fontStyle: 'italic'
                            }}>
                                Processing media file...
                            </div>
                        )}

                        {previewMedia && !isProcessing && (
                            <div className="image-preview-container">
                                {mediaType === 'image' ? (
                                    <img
                                        src={previewMedia}
                                        alt="Preview"
                                        className="image-preview"
                                    />
                                ) : (
                                    <video
                                        src={previewMedia}
                                        controls
                                        className="image-preview"
                                        style={{ maxWidth: '100%', height: 'auto' }}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                                <button
                                    type="button"
                                    className="remove-image-btn"
                                    onClick={removeMedia}
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-post-btn"
                            disabled={isSubmitting || isProcessing || !postTitle.trim() || !postContent.trim()}
                        >
                            {isSubmitting ? 'Publishing...' : 'Publish Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreatePost;