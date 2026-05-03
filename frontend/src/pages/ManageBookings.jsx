import { useContext, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './ManageBookings.css';

const ManageBookings = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const isOwner = user?.role === 'owner';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [isAdmin, isOwner]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // For owners, the same endpoint /api/bookings/my-bookings now returns both their own bookings 
      // and bookings for their cars due to our backend update
      const endpoint = isAdmin ? '/admin/bookings?limit=100' : '/bookings/my-bookings';
      const { data } = await API.get(endpoint);
      setBookings(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      // Owners use the regular booking update endpoint
      if (isAdmin) {
        await API.put(`/admin/bookings/${bookingId}/status`, {
          status: newStatus.toLowerCase(),
        });
      } else {
        await API.put(`/bookings/${bookingId}`, {
          status: newStatus.toLowerCase(),
        });
      }

      toast.success(`Booking ${newStatus.toLowerCase()} successfully`);
      fetchBookings(); // Refresh to get updated car availability
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update booking');
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
      setBookings((prev) => prev.filter((item) => item._id !== bookingId));
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${actionText} booking`);
    }
  };

  const formatStatus = (status = '') =>
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="manage-bookings-content">
        <div className="page-header">
          <h1>{isAdmin ? 'Global Bookings' : (isOwner ? 'Fleet Management' : 'My Bookings')}</h1>
          <p>
            {isAdmin
              ? 'Comprehensive view of all platform transactions'
              : (isOwner ? 'Manage bookings for your cars and your own rentals' : 'Track and manage your rental requests')}
          </p>
        </div>

        {loading ? (
          <div className="loading-state">Syncing booking data...</div>
        ) : (
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>{isAdmin || isOwner ? 'Client / Details' : 'Owner / Location'}</th>
                  <th>Rental Period</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const isBookingForMyCar = isOwner && booking.car?.owner?.toString() === user?._id;
                  const isMyOwnBooking = booking.user?._id === user?._id || booking.user === user?._id;

                  return (
                    <tr key={booking._id}>
                      <td>
                        <div className="booking-car-info">
                          <img
                            src={booking.car?.images?.[0]?.url || '/placeholder-car.svg'}
                            alt={booking.car?.name}
                          />
                          <div>
                            <span>{booking.car?.name || 'Car'}</span>
                            {isOwner && (
                               <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                 {isBookingForMyCar ? 'Your Car' : 'Your Rental'}
                               </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="user-info-cell">
                          <strong>
                            {isAdmin || isBookingForMyCar
                              ? booking.user?.name || 'Customer'
                              : booking.car?.brand || 'Car Owner'}
                          </strong>
                          {(isAdmin || isBookingForMyCar) && booking.user?.phone && (
                            <div className="user-contact">{booking.user.phone}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="date-range">
                          <span>{new Date(booking.pickupDate).toLocaleDateString()}</span>
                          <span> - </span>
                          <span>{new Date(booking.returnDate).toLocaleDateString()}</span>
                        </div>
                        <div className="days-badge">{booking.totalDays} Days</div>
                      </td>
                      <td>
                        <strong className="price-text">₹{booking.totalPrice?.toLocaleString('en-IN')}</strong>
                      </td>
                      <td>
                        <span
                          className={`status-badge status-${
                            booking.paymentStatus?.toLowerCase() === 'paid' ? 'confirmed' : 'pending'
                          }`}
                        >
                          {formatStatus(booking.paymentStatus || 'pending')}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${booking.status?.toLowerCase()}`}>
                          {formatStatus(booking.status)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {(isAdmin || isBookingForMyCar) && booking.status === 'pending' && (
                            <button
                              className="btn-approve"
                              onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                              title="Confirm Booking"
                            >
                              Confirm
                            </button>
                          )}
                          {(isAdmin || isBookingForMyCar) && booking.status === 'confirmed' && (
                            <button
                              className="btn-approve"
                              onClick={() => updateBookingStatus(booking._id, 'completed')}
                              title="Mark as Completed"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(booking._id)}
                            title={isAdmin ? 'Delete Record' : 'Cancel Booking'}
                          >
                            {isAdmin ? 'Delete' : 'Cancel'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="7" className="loading-state">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;
