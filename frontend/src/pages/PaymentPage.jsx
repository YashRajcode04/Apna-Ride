import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Payment from '../components/Payment';
import API from '../utils/api';
import './Payment.css';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await API.get(`/bookings/${bookingId}`);
        setBooking(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handlePaymentSuccess = (updatedBooking) => {
    // Payment successful, redirect to booking confirmation
    setTimeout(() => {
      navigate(`/my-bookings?status=success&bookingId=${bookingId}`);
    }, 2000);
  };

  const handleCancel = () => {
    navigate(-1); // Go back
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <div className="spinner"></div>
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="payment-error">
        <h2>Booking Not Found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <Payment
      bookingId={bookingId}
      totalPrice={booking.totalPrice}
      onSuccess={handlePaymentSuccess}
      onCancel={handleCancel}
    />
  );
};

export default PaymentPage;
