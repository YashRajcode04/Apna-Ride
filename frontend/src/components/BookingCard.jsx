import './BookingCard.css';
import { format } from 'date-fns';

const BookingCard = ({ booking, onCancel }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  return (
    <div className="booking-card">
      <div className="booking-car-info">
        <img
          src={
            booking.car?.images && booking.car.images[0]
              ? encodeURI(typeof booking.car.images[0] === 'string' ? booking.car.images[0] : booking.car.images[0].url)
              : '/placeholder-car.svg'
          }
          alt={booking.car.name}
          className="booking-car-image"
        />
        <div>
          <h3>{booking.car.name}</h3>
          <p>{booking.car.type} • {booking.car.year}</p>
        </div>
      </div>

      <div className="booking-details">
        <div className="booking-info-row">
          <span className="label">Pick-up Date:</span>
          <span>{format(new Date(booking.pickupDate), 'MMM dd, yyyy')}</span>
        </div>
        <div className="booking-info-row">
          <span className="label">Return Date:</span>
          <span>{format(new Date(booking.returnDate), 'MMM dd, yyyy')}</span>
        </div>
        <div className="booking-info-row">
          <span className="label">Total Days:</span>
          <span>{booking.totalDays} days</span>
        </div>
        <div className="booking-info-row">
          <span className="label">Total Price:</span>
          <span className="price">₹{booking.totalPrice}</span>
        </div>
        <div className="booking-info-row">
          <span className="label">Status:</span>
          <span className={`status ${getStatusClass(booking.status)}`}>
            {booking.status}
          </span>
        </div>
      </div>

      {booking.status === 'pending' && (
        <button
          className="cancel-booking-btn"
          onClick={() => onCancel(booking._id)}
        >
          Cancel Booking
        </button>
      )}
    </div>
  );
};

export default BookingCard;
