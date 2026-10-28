import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Users,
  MapPin,
  Package,
  ShoppingBag,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Search,
  Activity
} from 'lucide-react';
import api from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // overview, users, experts, products, reports, logs
  const [overviewData, setOverviewData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [pendingExperts, setPendingExperts] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOverview = () => {
    setLoading(true);
    api.get('/admin/overview')
      .then((res) => {
        setOverviewData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchTabContent = () => {
    if (activeTab === 'users') {
      const query = userSearch ? `?search=${encodeURIComponent(userSearch)}` : '';
      api.get(`/admin/users${query}`).then((res) => setUsersList(res.data || []));
    } else if (activeTab === 'experts') {
      api.get('/admin/experts/pending').then((res) => setPendingExperts(res.data || []));
    } else if (activeTab === 'products') {
      api.get('/admin/products/pending').then((res) => setPendingProducts(res.data || []));
    } else if (activeTab === 'reports') {
      api.get('/admin/reports').then((res) => setReportedPosts(res.data || []));
    } else if (activeTab === 'logs') {
      api.get('/admin/audit-logs').then((res) => setAuditLogs(res.data || []));
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchTabContent();
  }, [activeTab, userSearch]);

  const handleToggleUserStatus = async (targetUser) => {
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to change ${targetUser.name}'s status to ${nextStatus}?`)) return;

    try {
      await api.patch(`/admin/users/${targetUser._id}/status`, { status: nextStatus });
      fetchTabContent();
      fetchOverview();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleExpertVerification = async (expertId, status) => {
    try {
      await api.patch(`/admin/experts/${expertId}/verification`, { status });
      fetchTabContent();
      fetchOverview();
    } catch (err) {
      alert(err.message || 'Failed to update expert verification');
    }
  };

  const handleProductApproval = async (productId, approvalStatus) => {
    try {
      await api.patch(`/admin/products/${productId}/approval`, { approvalStatus });
      fetchTabContent();
      fetchOverview();
    } catch (err) {
      alert(err.message || 'Failed to update product approval');
    }
  };

  const handleModeratePost = async (postId, action) => {
    try {
      await api.patch(`/admin/reports/${postId}/action`, { action });
      fetchTabContent();
      fetchOverview();
    } catch (err) {
      alert(err.message || 'Failed to moderate post');
    }
  };

  if (!isAdmin) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Access Denied"
        description="Administrative credentials are required to view the platform control center."
      />
    );
  }

  const { metrics = {}, recentLogs = [] } = overviewData || {};

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
          {t('admin.title')}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          {t('admin.subtitle')}
        </p>
      </div>

      {/* Admin Navigation Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--color-border)', marginBottom: '24px' }}>
        {[
          { id: 'overview', label: 'Telemetry Overview' },
          { id: 'users', label: `${t('admin.users')} (${metrics.totalUsers || 0})` },
          { id: 'experts', label: `Pending Experts (${metrics.pendingExperts || 0})` },
          { id: 'products', label: `Pending Products (${metrics.pendingProducts || 0})` },
          { id: 'reports', label: `Flagged Posts (${metrics.reportedPosts || 0})` },
          { id: 'logs', label: t('admin.auditLogs') }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeTab === tab.id ? 'var(--color-primary-dark)' : 'var(--color-text-muted)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <Card>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Registered</span>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary-dark)', margin: '4px 0' }}>
                {metrics.totalUsers}
              </div>
              <Badge variant="neutral">{metrics.totalFarmers} Active Farmers</Badge>
            </Card>

            <Card>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Registered Farms</span>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary-dark)', margin: '4px 0' }}>
                {metrics.totalFarms}
              </div>
              <Badge variant="success">Active Plots</Badge>
            </Card>

            <Card>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Marketplace Orders</span>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary-dark)', margin: '4px 0' }}>
                {metrics.totalOrders}
              </div>
              <Badge variant="neutral">Verified Snapshots</Badge>
            </Card>

            <Card>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Pending Approvals</span>
              <div style={{ fontSize: '32px', fontWeight: 800, color: (metrics.pendingExperts + metrics.pendingProducts > 0) ? '#E65100' : 'var(--color-primary-dark)', margin: '4px 0' }}>
                {(metrics.pendingExperts || 0) + (metrics.pendingProducts || 0)}
              </div>
              <Badge variant={metrics.pendingExperts > 0 ? 'warning' : 'neutral'}>
                {metrics.pendingExperts} Experts • {metrics.pendingProducts} Products
              </Badge>
            </Card>
          </div>

          <Card title="Recent Platform Audit Events">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentLogs.map((log) => (
                <div
                  key={log._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: 'var(--color-bg-ivory)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={16} color="var(--color-primary)" />
                    <div>
                      <strong>{log.action}</strong> on <strong>{log.resourceType}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        Actor: {log.actorId?.name || 'System / Guest'} ({log.actorId?.email || 'N/A'})
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Badge variant={log.outcome === 'success' ? 'success' : 'danger'}>
                      {log.outcome}
                    </Badge>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <Card title="Platform User Management">
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '13px' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Name</th>
                  <th style={{ padding: '10px 12px' }}>Email</th>
                  <th style={{ padding: '10px 12px' }}>Role</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px' }}>Language</th>
                  <th style={{ padding: '10px 12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '10px 12px' }}>{u.email}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge variant={u.role === 'admin' ? 'neutral' : u.role === 'expert' ? 'success' : 'warning'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge variant={u.status === 'active' ? 'success' : 'danger'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 12px', textTransform: 'uppercase' }}>{u.preferredLanguage}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {u.role !== 'admin' && (
                        <Button
                          variant={u.status === 'active' ? 'danger' : 'secondary'}
                          size="sm"
                          onClick={() => handleToggleUserStatus(u)}
                        >
                          {u.status === 'active' ? t('admin.suspend') : t('admin.activate')}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab: Expert Verifications */}
      {activeTab === 'experts' && (
        <Card title="Pending Expert Verifications">
          {pendingExperts.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', padding: '16px 0' }}>
              No pending expert verifications.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pendingExperts.map((exp) => (
                <div
                  key={exp._id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-ivory)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      {exp.name}
                    </h4>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '2px 0' }}>
                      {exp.email} • {exp.phone}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-main)' }}>
                      Specialization: <strong>{exp.expertProfile?.specialization?.join(', ') || 'N/A'}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-main)' }}>
                      Qualifications: <strong>{exp.expertProfile?.qualifications?.join(', ') || 'N/A'}</strong> ({exp.expertProfile?.yearsExperience} years experience)
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button variant="primary" size="sm" onClick={() => handleExpertVerification(exp._id, 'verified')}>
                      {t('admin.approve')}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleExpertVerification(exp._id, 'rejected')}>
                      {t('admin.reject')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab: Product Approvals */}
      {activeTab === 'products' && (
        <Card title="Marketplace Product Approvals">
          {pendingProducts.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', padding: '16px 0' }}>
              No products awaiting approval.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pendingProducts.map((prod) => (
                <div
                  key={prod._id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-ivory)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      {prod.name}
                    </h4>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '2px 0' }}>
                      Category: {prod.category} • Price: ₹{prod.price} per {prod.unit} • Stock: {prod.stock}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-main)', marginTop: '4px' }}>
                      {prod.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button variant="primary" size="sm" onClick={() => handleProductApproval(prod._id, 'approved')}>
                      {t('admin.approve')}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleProductApproval(prod._id, 'rejected')}>
                      {t('admin.reject')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab: Flagged Content Moderation */}
      {activeTab === 'reports' && (
        <Card title="Flagged Community Discussions">
          {reportedPosts.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', padding: '16px 0' }}>
              No discussions currently flagged for moderation review.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reportedPosts.map((post) => (
                <div
                  key={post._id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-danger)',
                    backgroundColor: '#FFF8E1'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      {post.title}
                    </h4>
                    <Badge variant="danger">Reports: {post.reports?.length || 1}</Badge>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--color-text-main)', marginBottom: '10px' }}>
                    {post.body}
                  </p>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--color-danger)', marginBottom: '12px' }}>
                    <strong>Reported reason:</strong> {post.reports?.[0]?.reason || 'Flagged by user'}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button variant="danger" size="sm" onClick={() => handleModeratePost(post._id, 'remove')}>
                      Remove Post
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleModeratePost(post._id, 'dismiss')}>
                      Dismiss Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'logs' && (
        <Card title="Platform Security & Operational Audit Trail">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '10px' }}>Timestamp</th>
                  <th style={{ padding: '10px' }}>Action</th>
                  <th style={{ padding: '10px' }}>Resource</th>
                  <th style={{ padding: '10px' }}>Outcome</th>
                  <th style={{ padding: '10px' }}>Actor</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '10px' }}>{new Date(log.createdAt).toLocaleString()}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{log.action}</td>
                    <td style={{ padding: '10px' }}>{log.resourceType}</td>
                    <td style={{ padding: '10px' }}>
                      <Badge variant={log.outcome === 'success' ? 'success' : 'danger'}>{log.outcome}</Badge>
                    </td>
                    <td style={{ padding: '10px' }}>{log.actorId?.name || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
