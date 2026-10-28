import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle2,
  Trash2,
  Package
} from 'lucide-react';
import api from '../../lib/apiClient';
import { useCart } from './CartContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';

export const MarketplacePage = () => {
  const { t } = useTranslation();
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Cart & Checkout Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Product submission modal for farmers/sellers
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'seeds',
    price: '',
    unit: 'kg',
    stock: '',
    images: ''
  });

  const [shippingForm, setShippingForm] = useState({
    name: '',
    street: '',
    villageOrCity: '',
    district: '',
    state: '',
    pinCode: '',
    phone: ''
  });

  const fetchCatalog = () => {
    setLoading(true);
    let query = '';
    const params = [];
    if (selectedCategory !== 'all') params.push(`category=${selectedCategory}`);
    if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
    if (params.length > 0) query = `?${params.join('&')}`;

    Promise.all([
      api.get(`/products${query}`),
      api.get('/products/categories')
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedCategory, searchTerm]);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setSubmittingOrder(true);
    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingAddress: shippingForm
      };

      const res = await api.post('/orders', payload);
      setOrderSuccess(res.data);
      clearCart();
      setIsCheckoutOpen(false);
      fetchCatalog(); // Refresh stock
    } catch (err) {
      alert(err.message || 'Failed to place order');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        images: productForm.images ? [productForm.images] : []
      });
      alert('Product submitted! Awaiting administrator approval before public listing.');
      setIsSubmitModalOpen(false);
      fetchCatalog();
    } catch (err) {
      alert(err.message || 'Failed to list product');
    }
  };

  return (
    <div>
      {/* Header with Cart Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
            {t('marketplace.title')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            {t('marketplace.subtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline" onClick={() => setIsSubmitModalOpen(true)}>
            List Agricultural Supply
          </Button>
          <Button variant="primary" icon={ShoppingCart} onClick={() => setIsCartOpen(true)}>
            {t('marketplace.cart')} ({itemCount})
          </Button>
        </div>
      </div>

      {orderSuccess && (
        <div style={{ backgroundColor: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={24} color="var(--color-success)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-success)' }}>
                Order #{orderSuccess.orderNumber} Created Successfully!
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-main)' }}>
                Total: ₹{orderSuccess.totalAmount.toLocaleString('en-IN')} • Status: {orderSuccess.orderStatus} (Development Checkout)
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setOrderSuccess(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Search and Category Filter Bar */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '18px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder={t('marketplace.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Categories Chips */}
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
                color: selectedCategory === cat.id ? '#FFFFFF' : 'var(--color-text-main)',
                transition: 'var(--transition)'
              }}
            >
              {cat.name} {cat.count !== undefined && `(${cat.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Products Found"
          description="Try broadening your search term or select another agricultural category."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
          {products.map((prod) => (
            <Card key={prod._id} style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
              <div style={{ height: '180px', backgroundColor: 'var(--color-sage-light)', position: 'relative', overflow: 'hidden' }}>
                {prod.images?.[0] ? (
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                    <ShoppingBag size={48} />
                  </div>
                )}
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <Badge variant="neutral">{prod.category.replace('_', ' ')}</Badge>
                </div>
              </div>

              <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '6px' }}>
                  {prod.name}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5, flex: 1, marginBottom: '14px' }}>
                  {prod.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                      ₹{prod.price.toLocaleString('en-IN')}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      per {prod.unit} • {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={prod.stock <= 0}
                    onClick={() => addToCart(prod, 1)}
                  >
                    {prod.stock > 0 ? t('marketplace.addToCart') : 'Out of Stock'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Cart Drawer Modal */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Your Shopping Cart"
        maxWidth="500px"
      >
        {cartItems.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px 0' }}>
            Your cart is currently empty.
          </p>
        ) : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.productName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      ₹{item.unitPrice} per {item.unit}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      style={{ padding: '4px', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: '14px', width: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      style={{ padding: '4px', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
                    >
                      <Plus size={14} />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: '14px', width: '70px', textAlign: 'right' }}>
                      ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      style={{ border: 'none', background: 'transparent', color: 'var(--color-danger)', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '2px solid var(--color-border)', paddingTop: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 600 }}>Total Order Value:</span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <Button
              variant="primary"
              style={{ width: '100%' }}
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
            >
              {t('marketplace.checkout')}
            </Button>
          </div>
        )}
      </Modal>

      {/* Development Checkout Modal */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Delivery Address & Checkout"
        maxWidth="540px"
      >
        <div style={{ backgroundColor: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '12px', color: '#795548', marginBottom: '16px' }}>
          <strong>Development Mode:</strong> Prices and stock will be verified on server. This order will be registered with a verified unpaid/pending status.
        </div>

        <form onSubmit={handleCheckoutSubmit}>
          <Input
            label="Recipient Full Name"
            value={shippingForm.name}
            onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
            placeholder="e.g. Rajesh Patel"
            required
          />

          <Input
            label="Farm Address / Street"
            value={shippingForm.street}
            onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
            placeholder="e.g. Farm Plot #14, Boriavi Road"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Village / City"
              value={shippingForm.villageOrCity}
              onChange={(e) => setShippingForm({ ...shippingForm, villageOrCity: e.target.value })}
              placeholder="e.g. Boriavi"
              required
            />
            <Input
              label="District"
              value={shippingForm.district}
              onChange={(e) => setShippingForm({ ...shippingForm, district: e.target.value })}
              placeholder="e.g. Anand"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="State"
              value={shippingForm.state}
              onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
              placeholder="e.g. Gujarat"
              required
            />
            <Input
              label="PIN Code"
              value={shippingForm.pinCode}
              onChange={(e) => setShippingForm({ ...shippingForm, pinCode: e.target.value })}
              placeholder="e.g. 388310"
              required
            />
          </div>

          <Input
            label="Contact Phone"
            value={shippingForm.phone}
            onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
            placeholder="+91 98765 43210"
            required
          />

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Amount Payable:</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                ₹{totalAmount.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button type="button" variant="outline" onClick={() => setIsCheckoutOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="primary" loading={submittingOrder}>
                Confirm Order
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* List Product Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Product for Marketplace Listing"
      >
        <form onSubmit={handleCreateProduct}>
          <Input
            label="Product Name"
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            placeholder="e.g. Certified Wheat Seeds"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Category"
              value={productForm.category}
              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              options={[
                { value: 'seeds', label: 'Certified Seeds' },
                { value: 'fertilizers', label: 'Bio & Chemical Fertilizers' },
                { value: 'soil_amendments', label: 'Soil Conditioners' },
                { value: 'irrigation_equipment', label: 'Irrigation Tools' },
                { value: 'tools', label: 'Farm Implements' },
                { value: 'crop_protection', label: 'Crop Protection' }
              ]}
            />
            <Input
              label="Unit of Sale"
              value={productForm.unit}
              onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
              placeholder="e.g. bag (40kg), litre"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Unit Price (₹ INR)"
              type="number"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              placeholder="1850"
              required
            />
            <Input
              label="Available Stock Quantity"
              type="number"
              value={productForm.stock}
              onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
              placeholder="50"
              required
            />
          </div>

          <Input
            label="Product Description"
            value={productForm.description}
            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
            placeholder="Specify technical parameters, brand, certification or dosage"
            required
          />

          <Input
            label="Image URL (Optional)"
            value={productForm.images}
            onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
            placeholder="https://..."
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
            <Button type="button" variant="outline" onClick={() => setIsSubmitModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary">
              Submit for Approval
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
