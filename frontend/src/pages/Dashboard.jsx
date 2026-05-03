import { useContext, useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../utils/api';
import { AuthContext } from '../context/AuthContext';
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

  const statCards = useMemo(
    () =>
      isAdmin
        ? [
            { icon: 'US', label: 'Users', value: stats.totalUsers, color: '#0ea5e9' },
            { icon: 'CR', label: 'Approved Cars', value: stats.totalCars, color: '#4361ee' },
            { icon: 'BK', label: 'Bookings', value: stats.totalBookings, color: '#10b981' },
            {
              icon: 'RV',
              label: 'Revenue',
              value: `₹${(stats.totalRevenue / 1000).toFixed(0)}k`,
              color: '#f59e0b',
            },
            { icon: 'PC', label: 'Pending Cars', value: stats.pendingCars, color: '#f97316' },
            { icon: 'PB', label: 'Pending Bookings', value: stats.pendingBookings, color: '#8b5cf6' },
          ]
        : [
            { icon: 'CR', label: 'My Cars', value: stats.totalCars, color: '#4361ee' },
            { icon: 'BK', label: 'My Bookings', value: stats.totalBookings, color: '#10b981' },
            {
              icon: 'RV',
              label: 'Completed Revenue',
              value: `₹${(stats.totalRevenue / 1000).toFixed(0)}k`,
              color: '#f59e0b',
            },
            { icon: 'AC', label: 'Active Cars', value: stats.activeCars, color: '#8b5cf6' },
            { icon: 'PA', label: 'Pending Approval', value: stats.pendingCars, color: '#f97316' },
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
              <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
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
