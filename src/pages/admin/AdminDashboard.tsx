import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types/database';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    totalShops: 0,
    totalOrders: 0,
  });
  const [pendingProfiles, setPendingProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profilesRes, shopsRes, ordersRes, pendingRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('shops').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('*').eq('status', 'pending'),
      ]);

      setStats({
        totalUsers: profilesRes.count || 0,
        pendingApprovals: pendingRes.data?.length || 0,
        totalShops: shopsRes.count || 0,
        totalOrders: ordersRes.count || 0,
      });

      setPendingProfiles(pendingRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', userId);

      fetchDashboardData();
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('id', userId);

      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

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
        <h1>Admin Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
          <div className="stat-card">
            <h3>Pending Approvals</h3>
            <div className="stat-value">{stats.pendingApprovals}</div>
          </div>
          <div className="stat-card">
            <h3>Total Shops</h3>
            <div className="stat-value">{stats.totalShops}</div>
          </div>
          <div className="stat-card">
            <h3>Total Orders</h3>
            <div className="stat-value">{stats.totalOrders}</div>
          </div>
        </div>

        <div className="section">
          <h2>Pending User Approvals</h2>
          {pendingProfiles.length === 0 ? (
            <p>No pending approvals</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProfiles.map((profile) => (
                    <tr key={profile.id}>
                      <td>{profile.full_name}</td>
                      <td>{profile.email}</td>
                      <td>
                        <span className="role-badge">{profile.role}</span>
                      </td>
                      <td>{new Date(profile.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleApproveUser(profile.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRejectUser(profile.id)}
                        >
                          Reject
                        </button>
                      </td>
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
