import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  Plus,
  Search,
  MessageCircle,
  Flag,
  Tag,
  User,
  Send,
  Trash2
} from 'lucide-react';
import api from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';

export const CommunityForumPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [postForm, setPostForm] = useState({
    title: '',
    body: '',
    category: 'general',
    tags: ''
  });

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'general', name: 'General Farming' },
    { id: 'crops', name: 'Crop Management' },
    { id: 'soil_health', name: 'Soil & Fertility' },
    { id: 'pest_control', name: 'Pest & Defense' },
    { id: 'equipment', name: 'Machinery & Irrigation' },
    { id: 'market_trends', name: 'Market Rates' }
  ];

  const fetchPosts = () => {
    setLoading(true);
    let query = '';
    const params = [];
    if (selectedCategory !== 'all') params.push(`category=${selectedCategory}`);
    if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
    if (params.length > 0) query = `?${params.join('&')}`;

    api.get(`/posts${query}`)
      .then((res) => {
        const list = res.data || [];
        setPosts(list);
        if (list.length > 0 && !selectedPost) {
          loadPostDetails(list[0]._id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadPostDetails = async (id) => {
    try {
      const res = await api.get(`/posts/${id}`);
      setSelectedPost(res.data.post);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchTerm]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/posts', {
        ...postForm,
        tags: postForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
      });
      fetchPosts();
      setIsPostModalOpen(false);
      setPostForm({ title: '', body: '', category: 'general', tags: '' });
    } catch (err) {
      alert(err.message || 'Failed to submit post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPost) return;

    try {
      await api.post(`/posts/${selectedPost._id}/comments`, { body: newComment });
      setNewComment('');
      loadPostDetails(selectedPost._id);
      fetchPosts();
    } catch (err) {
      alert(err.message || 'Failed to post reply');
    }
  };

  const handleReportPost = async (e) => {
    e.preventDefault();
    if (!reportReason.trim() || !reportPostId) return;

    try {
      await api.post(`/posts/${reportPostId}/report`, { reason: reportReason });
      alert('Post reported to moderation team.');
      setIsReportModalOpen(false);
      setReportReason('');
    } catch (err) {
      alert(err.message || 'Failed to report post');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            {t('community.title')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            {t('community.subtitle')}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsPostModalOpen(true)}>
          {t('community.createPost')}
        </Button>
      </div>

      {/* Filter and Category Selection */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <Search size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search discussions, symptoms, methods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedCategory === cat.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: selectedCategory === cat.id ? 'var(--color-primary)' : 'var(--color-bg-ivory)',
                color: selectedCategory === cat.id ? '#FFFFFF' : 'var(--color-text-main)'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Posts List & Discussion Details */}
      {posts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No Discussions Found"
          description="Be the first to start a conversation in this topic category."
          actionLabel={t('community.createPost')}
          onAction={() => setIsPostModalOpen(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Posts Feed Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {posts.map((post) => {
              const isSelected = selectedPost?._id === post._id;
              return (
                <div
                  key={post._id}
                  onClick={() => loadPostDetails(post._id)}
                  style={{
                    padding: '18px 20px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--color-sage-light)' : '#FFFFFF',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                      {post.category.replace('_', ' ')}
                    </span>
                    <Badge variant="neutral">
                      <MessageCircle size={12} /> {post.commentCount}
                    </Badge>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '8px', lineHeight: 1.3 }}>
                    {post.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
                    {post.body.length > 120 ? `${post.body.slice(0, 120)}...` : post.body}
                  </p>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>By {post.authorId?.name} ({post.authorId?.role})</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Post Thread & Replies */}
          {selectedPost && (
            <Card style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <Badge variant="neutral">{selectedPost.category.replace('_', ' ')}</Badge>
                  <button
                    onClick={() => {
                      setReportPostId(selectedPost._id);
                      setIsReportModalOpen(true);
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-danger)' }}
                  >
                    <Flag size={14} /> Report Post
                  </button>
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '12px', lineHeight: 1.3 }}>
                  {selectedPost.title}
                </h2>

                <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text-main)', marginBottom: '16px', whiteSpace: 'pre-line' }}>
                  {selectedPost.body}
                </div>

                {/* Tags */}
                {selectedPost.tags?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {selectedPost.tags.map((tag, idx) => (
                      <span key={idx} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-ivory)', color: 'var(--color-primary)', border: '1px solid var(--color-border)' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                  Posted by <strong>{selectedPost.authorId?.name}</strong> • {new Date(selectedPost.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Comments Section */}
              <div style={{ padding: '20px 24px', backgroundColor: 'var(--color-bg-ivory)', flex: 1 }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '14px' }}>
                  Replies ({comments.length})
                </h4>

                {comments.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                    No responses yet. Share your experience or advice below.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
                    {comments.map((c) => (
                      <div
                        key={c._id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          padding: '14px 18px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                            {c.authorId?.name} ({c.authorId?.role})
                          </span>
                          <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                          {c.body}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Reply Form */}
                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Write a constructive agronomic reply..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '14px', backgroundColor: '#FFFFFF' }}
                  />
                  <Button type="submit" variant="primary" icon={Send}>
                    Reply
                  </Button>
                </form>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Start Discussion Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title={t('community.createPost')}
      >
        <form onSubmit={handleCreatePost}>
          <Input
            label={t('community.postTitle')}
            value={postForm.title}
            onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
            placeholder="e.g. Best bio-stimulants for wheat lodging prevention"
            required
          />

          <Select
            label={t('community.category')}
            value={postForm.category}
            onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
            options={categories.filter((c) => c.id !== 'all').map((c) => ({ value: c.id, label: c.name }))}
          />

          <Input
            label="Details & Farming Observations"
            value={postForm.body}
            onChange={(e) => setPostForm({ ...postForm, body: e.target.value })}
            placeholder="Share your question or agricultural insight..."
            required
          />

          <Input
            label="Tags (comma-separated)"
            value={postForm.tags}
            onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })}
            placeholder="e.g. wheat, irrigation, biofertilizer"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <Button type="button" variant="outline" onClick={() => setIsPostModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Publish Post
            </Button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Content to Moderators"
        maxWidth="440px"
      >
        <form onSubmit={handleReportPost}>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
            Please identify why this discussion violates agricultural platform standards (e.g. spam, misinformation, unsafe pesticide claims).
          </p>

          <Input
            label="Reason for Report"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="e.g. Harmful dosage recommendation"
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <Button type="button" variant="outline" onClick={() => setIsReportModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="danger">
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
