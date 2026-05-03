import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../utils/api';
import './MyBookings.css';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmBookingId, setConfirmBookingId] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/bookings/my-bookings');
      setBookings(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmCancelBooking = async (bookingId) => {
    try {
      await API.delete(`/bookings/${bookingId}`);
      toast.success('Booking cancelled successfully');
      setBookings((prev) => prev.filter((item) => item._id !== bookingId));
      setConfirmBookingId('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const formatStatus = (status = '') =>
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  if (loading) return <div className="loading">Loading bookings...</div>;

  return (
    <div className="my-bookings-page">
      <div className="container">
        <div className="bookings-header">
          <h1>My Bookings</h1>
          <p>View and manage all your car rental bookings</p>
        </div>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>You haven't made any bookings yet.</p>
            <button className="browse-btn" onClick={() => navigate('/cars')}>
              Browse Cars
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-left">
                  <img
                      src={booking.car?.images?.[0]?.url || '/placeholder-car.svg'}
                    alt={booking.car?.name}
                    className="booking-car-image"
                  />
                </div>

                <div className="booking-details">
                  <h3>{booking.car?.name}</h3>

                  <div className="booking-info-grid">
                    <div className="info-item">
                      <span className="info-label">Pick-up Date</span>
                      <span className="info-value">
                        {new Date(booking.pickupDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Drop-off Date</span>
                      <span className="info-value">
                        {new Date(booking.returnDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Total Days</span>
                      <span className="info-value">{booking.totalDays || 0}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Notes</span>
                      <span className="info-value">{booking.notes || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="booking-right">
                  <span className={`status-badge status-${booking.status?.toLowerCase()}`}>
                    {formatStatus(booking.status)}
                  </span>
                  <div className="booking-price">
                    <span className="price-label">Total</span>
                    <span className="price-value">₹{booking.totalPrice || 0}</span>
                  </div>
                  {booking.status === 'pending' && (
                    <button className="cancel-btn" onClick={() => setConfirmBookingId(booking._id)}>
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {confirmBookingId && (
          <div className="confirm-modal-overlay" role="dialog" aria-modal="true">
            <div className="confirm-modal">
              <h3>Cancel this booking?</h3>
              <p>This action cannot be undone.</p>
              <div className="confirm-actions">
                <button type="button" className="keep-btn" onClick={() => setConfirmBookingId('')}>
                  Keep Booking
                </button>
                <button
                  type="button"
                  className="confirm-cancel-btn"
                  onClick={() => confirmCancelBooking(confirmBookingId)}
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
