import { useContext, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './ManageBookings.css';

const ManageBookings = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [isAdmin]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
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
      setBookings((prev) =>
        prev.map((item) =>
          item._id === bookingId ? { ...item, status: newStatus.toLowerCase() } : item
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update booking');
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      if (isAdmin) {
        await API.delete(`/admin/bookings/${bookingId}`);
      } else {
        await API.delete(`/bookings/${bookingId}`);
      }
      toast.success(isAdmin ? 'Booking deleted successfully' : 'Booking cancelled successfully');
      setBookings((prev) => prev.filter((item) => item._id !== bookingId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete booking');
    }
  };

  const formatStatus = (status = '') =>
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="manage-bookings-content">
        <div className="page-header">
          <h1>{isAdmin ? 'Manage Bookings' : 'My Bookings'}</h1>
          <p>
            {isAdmin
              ? 'View and manage all customer bookings'
              : 'Track and manage your booking requests'}
          </p>
        </div>

        {loading ? (
          <div className="loading-state">Loading bookings...</div>
        ) : (
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Car</th>
                  <th>{isAdmin ? 'Customer' : 'Owner'}</th>
                  <th>Date Range</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <div className="booking-car-info">
                        <img
                          src={booking.car?.images?.[0]?.url || '/placeholder-car.svg'}
                          alt={booking.car?.name}
                        />
                        <span>{booking.car?.name || 'Car'}</span>
                      </div>
                    </td>
                    <td>
                      <strong>
                        {isAdmin
                          ? booking.user?.name || 'N/A'
                          : booking.car?.owner?.name || 'Car Owner'}
                      </strong>
                    </td>
                    <td>
                      <div className="date-range">
                        <span>{new Date(booking.pickupDate).toLocaleDateString()}</span>
                        <span> - </span>
                        <span>{new Date(booking.returnDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <strong>₹{booking.totalPrice || 0}</strong>
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
                        {isAdmin && booking.status === 'pending' && (
                          <button
                            className="btn-approve"
                            onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                            title="Approve"
                          >
                            Confirm
                          </button>
                        )}
                        {isAdmin && booking.status === 'confirmed' && (
                          <button
                            className="btn-approve"
                            onClick={() => updateBookingStatus(booking._id, 'completed')}
                            title="Mark Completed"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(booking._id)}
                          title={isAdmin ? 'Delete' : 'Cancel'}
                        >
                          {isAdmin ? 'Delete' : 'Cancel'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
