import { useContext, useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCars: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeCars: 0,
    pendingCars: 0,
    pendingBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
    }
  }, [user?._id, user?.role]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [{ data: statsRes }, { data: bookingsRes }] = await Promise.all([
          API.get('/admin/stats'),
          API.get('/admin/bookings?limit=5'),
        ]);

        const payload = statsRes?.data || {};
        setStats({
          totalUsers: payload.totalUsers || 0,
          totalCars: payload.totalCars || 0,
          totalBookings: payload.totalBookings || 0,
          totalRevenue: payload.totalRevenue || 0,
          activeCars: payload.totalCars || 0,
          pendingCars: payload.pendingCars || 0,
          pendingBookings: payload.pendingBookings || 0,
        });

        setRecentBookings(Array.isArray(bookingsRes?.data) ? bookingsRes.data : []);
      } else {
        const [{ data: carsRes }, { data: bookingsRes }] = await Promise.all([
          API.get('/cars/my-cars'),
          API.get('/bookings/my-bookings'),
        ]);

        const myCars = Array.isArray(carsRes?.data) ? carsRes.data : [];
        const myBookings = Array.isArray(bookingsRes?.data) ? bookingsRes.data : [];
        const completedRevenue = myBookings
          .filter((item) => item.status === 'completed')
          .reduce((sum, item) => sum + (item.totalPrice || 0), 0);

        setStats({
          totalUsers: 0,
          totalCars: myCars.length,
          totalBookings: myBookings.length,
          totalRevenue: completedRevenue,
          activeCars: myCars.filter((item) => item.isAvailable).length,
          pendingCars: myCars.filter((item) => !item.isApproved).length,
          pendingBookings: myBookings.filter((item) => item.status === 'pending').length,
        });

        setRecentBookings(myBookings.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setRecentBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId) => {
    const actionText = isAdmin ? 'delete' : 'cancel';
    if (!window.confirm(`Are you sure you want to ${actionText} this booking?`)) return;

    try {
      if (isAdmin) {
        await API.delete(`/admin/bookings/${bookingId}`);
      } else {
        await API.delete(`/bookings/${bookingId}`);
      }
      toast.success(`Booking ${actionText}led successfully`);
      fetchDashboardData(); // Refresh stats and list
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${actionText} booking`);
    }
  };

  const statCards = useMemo(
    () =>
      isAdmin
        ? [
            { icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>, label: 'Total Users', value: stats.totalUsers },
            { icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>, label: 'Approved Fleet', value: stats.totalCars },
            { icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>, label: 'Total Bookings', value: stats.totalBookings },
            { icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>, label: 'Revenue Generated', value: `₹${(stats.totalRevenue / 1000).toFixed(0)}k` },
            { icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>, label: 'Pending Approval', value: stats.pendingCars },
            { icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.88 1.17l-3.26 3.26c-.39.39-1.02.39-1.41 0l-1.41-1.41c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l.71.71 2.56-2.56c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41z"/></svg>, label: 'Pending Bookings', value: stats.pendingBookings },
          ]
        : [
            { icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>, label: 'My Fleet', value: stats.totalCars },
            { icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>, label: 'Total Bookings', value: stats.totalBookings },
            { icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>, label: 'Completed Revenue', value: `₹${(stats.totalRevenue / 1000).toFixed(0)}k` },
            { icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>, label: 'Active Cars', value: stats.activeCars },
            { icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>, label: 'Pending Approval', value: stats.pendingCars },
          ],
    [isAdmin, stats]
  );

  const formatStatus = (status = '') =>
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>{isAdmin ? 'Admin Dashboard' : 'Owner Dashboard'}</h1>
            <p>
              {isAdmin
                ? "Welcome back! Here's what's happening across the platform."
                : "Welcome back! Here's your booking and listing summary."}
            </p>
          </div>
        </div>

        <div className="dashboard-stats">
          {statCards.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">
                {stat.icon}
              </div>
              <div className="stat-details">
                <span className="stat-label">{stat.label}</span>
                <h3 className="stat-value">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-section">
          <h2>Recent Activity</h2>
          
          {loading ? (
            <div className="loading-state">Loading recent bookings...</div>
          ) : recentBookings.length === 0 ? (
            <div className="empty-state">
              <p>No recent bookings found</p>
            </div>
          ) : (
            <div className="activity-list">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="activity-item">
                  <div className="activity-icon">
                    <img 
                      src={booking.car?.images?.[0]?.url || '/placeholder-car.svg'} 
                      alt={booking.car?.name || 'Car'}
                    />
                  </div>
                  <div className="activity-details">
                    <h4>{booking.car?.name || 'Car Booking'}</h4>
                    <p>
                      {new Date(booking.pickupDate).toLocaleDateString()} -{' '}
                      {new Date(booking.returnDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="activity-meta">
                    <span className={`booking-status status-${booking.status?.toLowerCase() || 'pending'}`}>
                      {formatStatus(booking.status || 'pending')}
                    </span>
                    <span className="booking-price">₹{booking.totalPrice || 0}</span>
                    <div className="activity-actions">
                      <button 
                        className="btn-icon-only delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(booking._id);
                        }}
                        title={isAdmin ? "Delete Record" : "Cancel Booking"}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
