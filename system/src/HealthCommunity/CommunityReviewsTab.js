import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import './CommunityReviewsTab.css';

// Helper to map categories to colors for the card headers
const categoryColors = {
    'Skincare': 'bg-orange-400',
    'Haircare': 'bg-green-400',
    'Makeup': 'bg-purple-400',
    'Bodycare': 'bg-pink-400',
    'Sunscreen': 'bg-yellow-400',
    'Fragrance': 'bg-blue-400',
    'Default': 'bg-gray-400'
};

// Reusable Star Rating Component
const StarRating = ({ rating, size = '1.25rem' }) => {
    const filledStars = Math.round(rating);
    const totalStars = 5;
    const stars = [];

    for (let i = 1; i <= totalStars; i++) {
        stars.push(
            <span 
                key={i} 
                className={`star ${i <= filledStars ? 'filled' : 'empty'}`}
                style={{ fontSize: size }}
            >
                &#9733;
            </span>
        );
    }
    return <div className="star-rating">{stars}</div>;
};

const CommunityReviewsTab = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [activeSubTab, setActiveSubTab] = useState('public');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Skincare');
    const [rating, setRating] = useState(5);
    const [photoFile, setPhotoFile] = useState(null);
    const fileInputRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [formError, setFormError] = useState('');

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);

    // Fetch public posts
    const fetchPublicPosts = async () => {
        setLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        setCurrentUserId(userData?.user?.id || null);

        const { data, error } = await supabase
            .from('posts')
            .select(`*, profiles (full_name)`)
            .eq('is_private', false)
            .order('created_at', { ascending: false });

        if (error) console.error("Error fetching public posts:", error);
        else setPosts(data);

        setLoading(false);
    };

    useEffect(() => {
        fetchPublicPosts();
    }, []);

    // Modal functions
    const openModalForNew = () => {
        setEditingPost(null);
        setTitle('');
        setContent('');
        setCategory('Skincare');
        setRating(5);
        setPhotoFile(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (post) => {
        setEditingPost(post);
        setTitle(post.title);
        setContent(post.content);
        setCategory(post.category);
        setRating(post.rating);
        setPhotoFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.size < 10 * 1024 * 1024) setPhotoFile(file);
        else if (file) setFormError("File is too large. Max size is 10MB.");
    };

    // Submit Review
    const handleSubmitReview = async (e) => {
        e.preventDefault();
    if (isSaving) return; // prevent duplicate submits
    setFormError('');

        // Client-side trimming & validation
        const trimmedTitle = (title || '').trim();
        const trimmedContent = (content || '').trim();
        const newValidationErrors = {};
        if (!trimmedTitle) newValidationErrors.title = 'Please enter a product name or title.';
        if (!trimmedContent) newValidationErrors.content = 'Please enter your review details.';
        if (!category) newValidationErrors.category = 'Please select a category.';
        if (!rating || rating < 1 || rating > 5) newValidationErrors.rating = 'Please select a rating between 1 and 5.';

        setValidationErrors(newValidationErrors);
        if (Object.keys(newValidationErrors).length > 0) return;

        setIsSaving(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setFormError("You must be logged in to post a review.");
            setIsSaving(false);
            return;
        }

        try {
            await supabase
                .from('profiles')
                .upsert({ id: user.id, full_name: user.email || 'Community User' }, { onConflict: 'id' });
        } catch (err) {
            console.error("Profile check failed:", err);
            setFormError("A system error occurred during profile setup.");
            setIsSaving(false);
            return;
        }

        let photoUrl = editingPost ? editingPost.photo_url : null;
        if (photoFile) {
            const fileName = `public/${user.id}-${Date.now()}-${photoFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('review-photos')
                .upload(fileName, photoFile);

            if (uploadError) {
                setFormError("Error uploading photo: " + (uploadError.message || 'Upload failed'));
                setIsSaving(false);
                return;
            }
            const { data: urlData } = supabase.storage.from('review-photos').getPublicUrl(uploadData.path);
            photoUrl = urlData.publicUrl;
        }

        const reviewData = { user_id: user.id, title: trimmedTitle, content: trimmedContent, category, rating, photo_url: photoUrl, is_private: false };

        try {
            if (editingPost) {
                const { data, error } = await supabase
                    .from('posts')
                    .update(reviewData)
                    .eq('id', editingPost.id)
                    .select(`*, profiles (full_name)`)
                    .single();
                if (error) throw error;
                setPosts(posts.map(post => post.id === data.id ? data : post));

                // If we replaced an existing photo, remove the old file from storage
                try {
                    const oldUrl = editingPost.photo_url;
                    if (oldUrl && photoUrl && oldUrl !== photoUrl) {
                        const cleaned = oldUrl.split('?')[0];
                        const marker = '/storage/v1/object/public/';
                        const idx = cleaned.indexOf(marker);
                        if (idx !== -1) {
                            const after = cleaned.substring(idx + marker.length);
                            const parts = after.split('/');
                            const bucket = parts.shift();
                            const path = parts.join('/');
                            const { data: removed, error: removeError } = await supabase.storage.from(bucket).remove([path]);
                            console.debug('removed old review photo', { removed, removeError });
                        }
                    }
                } catch (e) { console.error('error removing old review photo', e); }

                // success - no browser alert
            } else {
                const { data: newPost, error } = await supabase
                    .from('posts')
                    .insert(reviewData)
                    .select(`*, profiles (full_name)`)
                    .single();
                if (error) throw error;
                setPosts([newPost, ...posts]);
                // success - no browser alert
            }
            closeModal();
        } catch (err) {
            console.error('Error saving review:', err);
            setFormError('Error saving review: ' + (err.message || 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
    };

    // Delete handlers
    const handleDelete = (postId) => {
        setPostToDelete(postId);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (postToDelete) {
            try {
                const { data, error } = await supabase.from('posts').delete().eq('id', postToDelete).select();
                if (error) {
                    alert("Error deleting post: " + error.message);
                } else {
                    // if the deleted row included a photo_url, remove it from storage
                    const deleted = Array.isArray(data) ? data[0] : data;
                    if (deleted && deleted.photo_url) {
                        const getStorageInfo = (url) => {
                            try {
                                const cleaned = url.split('?')[0];
                                const marker = '/storage/v1/object/public/';
                                const idx = cleaned.indexOf(marker);
                                if (idx === -1) return null;
                                const after = cleaned.substring(idx + marker.length);
                                const parts = after.split('/');
                                const bucket = parts.shift();
                                const path = parts.join('/');
                                return { bucket, path };
                            } catch (e) { return null; }
                        };
                        const info = getStorageInfo(deleted.photo_url);
                        if (info) {
                            try {
                                const { data: removeData, error: removeErr } = await supabase.storage.from(info.bucket).remove([info.path]);
                                console.debug('removed storage item', { removeData, removeErr });
                            } catch (e) {
                                console.error('error removing storage item', e);
                            }
                        }
                    }
                    setPosts(posts.filter(post => post.id !== postToDelete));
                }
            } catch (e) {
                console.error('confirmDelete error', e);
                alert('Error deleting post. See console.');
            } finally {
                setShowDeleteConfirm(false);
                setPostToDelete(null);
            }
        }
    };

    const getFilteredPosts = () => {
        let list = posts.filter(post =>
            (post.title && post.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        if (activeSubTab === 'my_reviews' && currentUserId)
            return list.filter(post => post.user_id === currentUserId);
        return list;
    };

    return (
        <div className="community-reviews-component">
            <div className="community-reviews-container">
                {/* HEADER */}
                <header className="reviews-header">
                    <div className="header-text">
                        <h2 className="text-3xl font-bold text-slate-800">Skincare & Beauty Community</h2>
                        <p className="text-slate-500">Discover honest reviews for your favorite products.</p>
                    </div>
                    <div className="header-actions header-search-container">
                        <input type="text" placeholder="Search for products..." className="search-input"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="header-actions header-add-review-container">
                        <button onClick={openModalForNew} className="add-review-btn">+ Add a Review</button>
                    </div>
                </header>

                {/* SUB TABS */}
                <nav className="sub-tabs-nav">
                    <button className={`sub-tab-btn ${activeSubTab === 'public' ? 'active' : ''}`} onClick={() => setActiveSubTab('public')}>Public Reviews</button>
                    <button className={`sub-tab-btn ${activeSubTab === 'my_reviews' ? 'active' : ''}`} onClick={() => setActiveSubTab('my_reviews')} disabled={!currentUserId}>My Reviews</button>
                </nav>

                {/* REVIEWS GRID */}
                <main className="reviews-grid">
                    {loading ? <p>Loading community posts...</p> : (
                        getFilteredPosts().map(post => {
                            const colorClass = categoryColors[post.category] || categoryColors['Default'];
                            const isOwner = currentUserId === post.user_id;
                            return (
                                <div key={post.id} className="review-card">
                                    <div className={`review-card-category-header ${colorClass}`}>
                                        <h4 className="category-title">{post.category}</h4>
                                        {post.rating !== undefined && <div className="review-card-rating-header"><StarRating rating={post.rating} /></div>}
                                    </div>
                                    {post.photo_url && <img src={post.photo_url} alt={post.title} className="review-card-photo" />}
                                    <div className="review-card-content">
                                        <h3 className="review-card-title">{post.title}</h3>
                                        <p className="review-card-author">Posted by {post.profiles ? post.profiles.full_name : 'Anonymous'}</p>
                                        <p className="review-card-body">{post.content}</p>
                                        <div className="review-card-actions">
                                            {isOwner && (
                                                <div className="flex gap-3">
                                                    <button onClick={() => openModalForEdit(post)} className="action-btn edit-btn">Edit</button>
                                                    <button onClick={() => handleDelete(post.id)} className="action-btn delete-btn">Delete</button>
                                                </div>
                                            )}
                                            {post.rating !== undefined && <div className="review-card-rating-footer"><StarRating rating={post.rating} size="1rem" /></div>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </main>

                {/* MODAL */}
                {isModalOpen && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            
                            <h3 className="modal-title">{editingPost ? 'Edit Your Review' : 'Share Your Experience'}</h3>
                            {formError && <div style={{marginBottom: '0.75rem', color: '#b91c1c', fontSize: '0.95rem'}}>{formError}</div>}
                            <form onSubmit={handleSubmitReview} className="modal-form">
                                <div className="modal-body space-y-5">
                                    <div>
                                        <label htmlFor="review-title" className="block text-sm font-medium text-slate-600 mb-1">Product Name / Title</label>
                                        <input type="text" id="review-title" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" required />
                                        {validationErrors.title && <p className="text-red-600 text-sm mt-1">{validationErrors.title}</p>}
                                    </div>
                                    <div className="form-row-grid">
                                        <div>
                                            <label htmlFor="review-category" className="block text-sm font-medium text-slate-600 mb-1">Category <span className="required-star">*</span></label>
                                            <select id="review-category" value={category} onChange={(e) => setCategory(e.target.value)} className="form-input" required>
                                                <option>Skincare</option>
                                                <option>Haircare</option>
                                                <option>Makeup</option>
                                                <option>Bodycare</option>
                                                <option>Sunscreen</option>
                                                <option>Fragrance</option>
                                            </select>
                                            {validationErrors.category && <p className="text-red-600 text-sm mt-1">{validationErrors.category}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="review-rating" className="block text-sm font-medium text-slate-600 mb-1">Your Rating (1-5) <span className="required-star">*</span></label>
                                            <select id="review-rating" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="form-input" required>
                                                <option value={5}>5 Stars - Excellent</option>
                                                <option value={4}>4 Stars - Very Good</option>
                                                <option value={3}>3 Stars - Good</option>
                                                <option value={2}>2 Stars - Fair</option>
                                                <option value={1}>1 Star - Poor</option>
                                            </select>
                                            {validationErrors.rating && <p className="text-red-600 text-sm mt-1">{validationErrors.rating}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="review-details" className="block text-sm font-medium text-slate-600 mb-1">Your Review <span className="required-star">*</span></label>
                                        <textarea id="review-details" value={content} onChange={(e) => setContent(e.target.value)} rows="6" className="form-input" placeholder="Share what worked for you, how you used it, skin type, sensitivity, and tips" required></textarea>
                                        {validationErrors.content && <p className="text-red-600 text-sm mt-1">{validationErrors.content}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600">Attach an Image</label>
                                        <div className="file-drop-area" onClick={() => fileInputRef.current.click()}>
                                            <p className="font-semibold text-orange-600">{photoFile ? `Selected: ${photoFile.name}` : editingPost?.photo_url ? 'Upload new file to replace existing' : 'Upload a file or drag and drop'}</p>
                                            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="save-btn" disabled={isSaving}>{editingPost ? (isSaving ? 'Saving...' : 'Save Changes') : (isSaving ? 'Submitting...' : 'Submit Review')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                    <div className="modal-overlay">
                        <div className="confirm-dialog">
                            <h3>Delete Review</h3>
                            <p>Are you sure you want to permanently delete this community review? This action cannot be undone.</p>
                            <div className="confirm-actions">
                                <button onClick={() => setShowDeleteConfirm(false)} className="confirm-cancel-btn">Cancel</button>
                                <button onClick={confirmDelete} className="confirm-delete-btn">Delete</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityReviewsTab;

