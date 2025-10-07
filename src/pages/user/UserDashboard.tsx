import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Shop, Product, Order } from '../../types/database';

export function UserDashboard() {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shopsRes, productsRes, ordersRes] = await Promise.all([
        supabase.from('shops').select('*').eq('is_active', true),
        supabase.from('products').select('*').eq('is_available', true),
        supabase.from('orders').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
      ]);

      setShops(shopsRes.data || []);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter((shop) => {
    const matchesSearch = shop.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shop.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = !selectedCity || shop.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cities = Array.from(new Set(shops.map((s) => s.city)));
  const categories = Array.from(new Set(products.map((p) => p.category)));

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Discover Shops & Products</h1>

        <div className="search-filters">
          <input
            type="text"
            placeholder="Search shops or products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="filter-select"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="section">
          <h2>Available Shops</h2>
          <div className="shops-grid">
            {filteredShops.map((shop) => (
              <div key={shop.id} className="shop-card">
                {shop.logo_url && (
                  <img src={shop.logo_url} alt={shop.shop_name} className="shop-logo" />
                )}
                <h3>{shop.shop_name}</h3>
                <p className="shop-type">{shop.shop_type}</p>
                <p className="shop-description">{shop.description}</p>
                <div className="shop-info">
                  <span>📍 {shop.city}, {shop.state}</span>
                  <span>⭐ {shop.rating.toFixed(1)}</span>
                </div>
                {shop.opening_hours && (
                  <p className="opening-hours">🕒 {shop.opening_hours}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h2>Featured Products</h2>
          <div className="products-grid">
            {filteredProducts.slice(0, 12).map((product) => (
              <div key={product.id} className="product-card">
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} />
                )}
                <h3>{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <div className="product-price">
                  ₹{product.final_price}
                  {product.discount_percentage > 0 && (
                    <>
                      <span className="original-price">₹{product.price}</span>
                      <span className="discount">-{product.discount_percentage}%</span>
                    </>
                  )}
                </div>
                <button className="btn btn-primary btn-sm">View Details</button>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h2>My Orders</h2>
          {orders.length === 0 ? (
            <p>You haven't placed any orders yet.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Payment</th>
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
                      <td>
                        <span className={`status-badge status-${order.payment_status}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
