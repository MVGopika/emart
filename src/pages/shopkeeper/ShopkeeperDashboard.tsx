import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Shop, Product, Order } from '../../types/database';

export function ShopkeeperDashboard() {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showShopForm, setShowShopForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchShopData();
    }
  }, [user]);

  const fetchShopData = async () => {
    try {
      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('shopkeeper_id', user?.id)
        .maybeSingle();

      setShop(shopData);

      if (shopData) {
        const [productsRes, ordersRes] = await Promise.all([
          supabase.from('products').select('*').eq('shop_id', shopData.id),
          supabase.from('orders').select('*').eq('shop_id', shopData.id).order('created_at', { ascending: false }),
        ]);

        setProducts(productsRes.data || []);
        setOrders(ordersRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="dashboard">
        <div className="container">
          <h1>Setup Your Shop</h1>
          <p>You need to create a shop profile first.</p>
          <button className="btn btn-primary" onClick={() => setShowShopForm(true)}>
            Create Shop
          </button>
          {showShopForm && <ShopForm onSuccess={fetchShopData} />}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>{shop.shop_name}</h1>
          <button className="btn btn-primary" onClick={() => setShowProductForm(true)}>
            Add Product
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Products</h3>
            <div className="stat-value">{products.length}</div>
          </div>
          <div className="stat-card">
            <h3>Total Orders</h3>
            <div className="stat-value">{orders.length}</div>
          </div>
          <div className="stat-card">
            <h3>Rating</h3>
            <div className="stat-value">{shop.rating.toFixed(1)} ⭐</div>
          </div>
        </div>

        {showProductForm && (
          <ProductForm shopId={shop.id} onSuccess={() => {
            setShowProductForm(false);
            fetchShopData();
          }} />
        )}

        <div className="section">
          <h2>Products</h2>
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} />
                )}
                <h3>{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <div className="product-price">
                  ₹{product.final_price}
                  {product.discount_percentage > 0 && (
                    <span className="discount">-{product.discount_percentage}%</span>
                  )}
                </div>
                <p className="product-stock">Stock: {product.quantity} {product.unit}</p>
                <div className={`status-badge ${product.is_available ? 'available' : 'unavailable'}`}>
                  {product.is_available ? 'Available' : 'Out of Stock'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h2>Recent Orders</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id.slice(0, 8)}</td>
                    <td>{order.order_type}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>₹{order.total_amount}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShopForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    shop_name: '',
    shop_type: 'retail',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    opening_hours: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await supabase.from('shops').insert([
        {
          ...formData,
          shopkeeper_id: user?.id,
        },
      ]);
      onSuccess();
    } catch (error) {
      console.error('Error creating shop:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-modal">
      <form onSubmit={handleSubmit} className="form-card">
        <h3>Create Your Shop</h3>
        <div className="form-group">
          <label>Shop Name</label>
          <input
            type="text"
            value={formData.shop_name}
            onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Shop Type</label>
          <select
            value={formData.shop_type}
            onChange={(e) => setFormData({ ...formData, shop_type: e.target.value })}
            required
          >
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
            <option value="service">Service</option>
            <option value="restaurant">Restaurant</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Pincode</label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Opening Hours</label>
          <input
            type="text"
            value={formData.opening_hours}
            onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
            placeholder="Mon-Sat: 9AM-8PM"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Shop'}
        </button>
      </form>
    </div>
  );
}

function ProductForm({ shopId, onSuccess }: { shopId: string; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discount_percentage: '0',
    quantity: '',
    unit: 'piece',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await supabase.from('products').insert([
        {
          ...formData,
          shop_id: shopId,
          price: parseFloat(formData.price),
          discount_percentage: parseFloat(formData.discount_percentage),
          quantity: parseInt(formData.quantity),
        },
      ]);
      onSuccess();
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-modal">
      <form onSubmit={handleSubmit} className="form-card">
        <h3>Add New Product</h3>
        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Price (₹)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Discount (%)</label>
            <input
              type="number"
              step="0.01"
              value={formData.discount_percentage}
              onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Unit</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Image URL</label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}
