import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PackageCheck, Clock, CheckCircle2, XCircle, Truck, Package } from 'lucide-react';
import api from '../../lib/apiClient';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

export const OrdersListPage = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders')
      .then((res) => {
        setOrders(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <Badge variant="success">Confirmed</Badge>;
      case 'shipped': return <Badge variant="neutral">Shipped</Badge>;
      case 'delivered': return <Badge variant="success">Delivered</Badge>;
      case 'cancelled': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="warning">Pending</Badge>;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
          {t('nav.orders')} & Procurement
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Track delivery progress, item snapshots, and development mode invoices.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="No Orders Placed Yet"
          description="Browse agricultural equipment, seeds, and bio-fertilizers in our marketplace."
          actionLabel="Go to Marketplace"
          onAction={() => {
            window.location.href = '/marketplace';
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {orders.map((order) => (
            <Card key={order._id}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      Order #{order.orderNumber}
                    </h3>
                    {getStatusBadge(order.orderStatus)}
                    <Badge variant="neutral">Payment: {order.paymentStatus}</Badge>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {order.items.length} unique item{order.items.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div style={{ backgroundColor: 'var(--color-bg-ivory)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                  Purchased Items
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span>
                        <strong>{item.quantity}x</strong> {item.productName} ({item.unit})
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        ₹{item.subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address and Cancel Action */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Delivery to: <strong>{order.shippingAddress.name}</strong> • {order.shippingAddress.street}, {order.shippingAddress.villageOrCity}, {order.shippingAddress.district}, {order.shippingAddress.state} ({order.shippingAddress.pinCode})
                </div>

                {['pending', 'confirmed'].includes(order.orderStatus) && (
                  <Button variant="outline" size="sm" onClick={() => handleCancelOrder(order._id)}>
                    Cancel Order
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
