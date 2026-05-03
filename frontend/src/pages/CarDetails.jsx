import { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';
import { getShowcaseCarById } from '../utils/showcaseCars';
import { toast } from 'react-toastify';
import './CarDetails.css';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [bookingData, setBookingData] = useState({
    pickupDate: '',
    returnDate: '',
    notes: '',
  });
  const [loadError, setLoadError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const isShowcaseCar = id?.startsWith('showcase-');

  useEffect(() => {
    fetchCarDetails();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [car?._id]);

  const fetchCarDetails = async () => {
    setLoading(true);
    setLoadError('');
    try {
      if (isShowcaseCar) {
        const showcaseCar = getShowcaseCarById(id);
        if (showcaseCar) {
          setCar(showcaseCar);
          return;
        }
      }

      const { data } = await API.get(`/cars/${id}`);
      setCar(data?.data || null);
    } catch (error) {
      console.error('Error fetching car:', error);
      const message = error.response?.data?.message || 'Failed to load car details';
      setLoadError(message);
      toast.error(message);
      setCar(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      if (isShowcaseCar) {
        setReviews([]);
        return;
      }

      const { data } = await API.get(`/reviews/car/${id}`);
      setReviews(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  };

  const carImages = useMemo(() => {
    const source = car?.images;
    if (!source || !Array.isArray(source) || source.length === 0) {
      return [{ url: '/placeholder-car.svg' }];
    }
    return source
      .map((image) => {
        if (!image) return null;
        if (typeof image === 'string') return { url: encodeURI(image) };
        if (typeof image === 'object' && image.url) return { url: encodeURI(image.url) };
        return null;
      })
      .filter(Boolean);
  }, [car]);

  const rentalDays = useMemo(() => {
    if (!bookingData.pickupDate || !bookingData.returnDate) return 0;

    const start = new Date(bookingData.pickupDate);
    const end = new Date(bookingData.returnDate);
    const diffInMs = end - start;
    const days = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;
  }, [bookingData.pickupDate, bookingData.returnDate]);

  const pricingEstimate = useMemo(() => {
    const dailyPrice = car?.pricePerDay || 0;
    const base = rentalDays * dailyPrice;
    const serviceFee = base ? Math.round(base * 0.08) : 0;
    return {
      dailyPrice,
      base,
      serviceFee,
      total: base + serviceFee,
    };
  }, [car, rentalDays]);

  const handleBooking = async (e) => {
    e.preventDefault();

    if (isShowcaseCar) {
      toast.info('This is a showcase listing. Please choose a live listing to book now.');
      navigate('/cars');
      return;
    }

    if (!user) {
      toast.error('Please login to book a car');
      navigate('/login');
      return;
    }

    try {
      setProcessingPayment(true);

      const bookingRes = await API.post('/bookings', {
        car: id,
        ...bookingData,
      });

      const booking = bookingRes?.data?.data;
      const bookingId = booking?._id;

      if (!bookingId) {
        throw new Error('Booking was created but booking id was missing');
      }

      toast.success('Booking created. Proceeding to payment...');
      
      // Navigate to payment page
      navigate(`/payment/${bookingId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Booking failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!car) {
    return (
      <div className="car-details-page">
        <div className="container">
          <div className="error">
            <p>{loadError || 'Car not found'}</p>
            <button type="button" className="book-now-btn" onClick={() => navigate('/cars')}>
                Browse Cars
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ratingValue = Number(car.rating || 0).toFixed(1);
  const goToPreviousImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? carImages.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setActiveImageIndex((prev) => (prev === carImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="car-details-page">
      <div className="container">
        <div className="car-breadcrumb">Cars / {car.brand} / {car.name}</div>

        <div className="car-details-container">
          {/* Car Images */}
          <div className="car-images">
            <img
                src={carImages[activeImageIndex]?.url || '/placeholder-car.svg'}
              alt={car.name}
              className="main-image"
            />

            <div className="image-meta-row">
              <span className="image-count-badge">
                {activeImageIndex + 1} / {carImages.length}
              </span>
              {carImages.length > 1 && (
                <div className="gallery-controls">
                  <button type="button" onClick={goToPreviousImage} aria-label="Previous image">
                    Prev
                  </button>
                  <button type="button" onClick={goToNextImage} aria-label="Next image">
                    Next
                  </button>
                </div>
              )}
            </div>

            {carImages.length > 1 && (
              <div className="thumbnail-strip">
                {carImages.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    className={`thumbnail-btn ${activeImageIndex === index ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img src={image.url} alt={`${car.name} view ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car Information */}
          <div className="car-detail-info">
            <h1>{car.name}</h1>
            <p className="car-subtitle">
              {car.brand} • {car.type} • {car.year}
            </p>

            <div className="car-rating">
              <span className="rating-badge">Rated {ratingValue} / 5</span>
              <span>{car.numReviews || 0} reviews</span>
            </div>

            <div className="car-highlights">
              <span>{car.type}</span>
              <span>{car.fuelType}</span>
              <span>{car.transmission}</span>
              <span>{car.category}</span>
            </div>

            <div className="trust-row">
              <span>Quality Checked</span>
              <span>Verified Listing</span>
              <span>Roadside Support</span>
            </div>

            <div className="car-price-tag">
              <span className="price">₹{car.pricePerDay}</span>
              <span className="period">/ day</span>
            </div>

            <div className="car-status-badge">
              {car.isAvailable ? (
                <>
                  <span className="car-available-dot"></span>
                  Ready to Drive
                </>
              ) : (
                <>
                  <span className="car-unavailable-dot"></span>
                  Currently Unavailable
                </>
              )}
            </div>

            <div className="car-details-sections">
              {/* Specifications Section */}
              <div className="car-detail-section">
                <div className="car-detail-section-header">
                  <h3>Vehicle Specs</h3>
                </div>
                <div className="specs-grid">
                  <div className="spec-item">
                    <span className="spec-label">Seats</span>
                    <span className="spec-value">{car.seats}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Fuel</span>
                    <span className="spec-value">{car.fuelType}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Transmission</span>
                    <span className="spec-value">{car.transmission}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Location</span>
                    <span className="spec-value">{car.location}</span>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              {car.description && (
                <div className="car-detail-section">
                  <div className="car-detail-section-header">
                    <h3>Overview</h3>
                  </div>
                  <p className="description-text">{car.description}</p>
                </div>
              )}

              {/* Features Section */}
              {car.features && car.features.length > 0 && (
                <div className="car-detail-section">
                  <div className="car-detail-section-header">
                    <h3>Highlights</h3>
                  </div>
                  <ul className="features-list">
                    {car.features.map((feature, index) => (
                      <li key={index}>
                        <span className="feature-icon">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="booking-form-card">
            <div className="booking-header">
              <h3>Secure Checkout</h3>
              <p>Book instantly with Razorpay-protected payments</p>
            </div>

            <div className="payment-pill-row" aria-label="Payment trust indicators">
              <span>Secure</span>
              <span>Instant Confirmation</span>
              <span>24/7 Support</span>
            </div>

              <div className="booking-summary">
                <div className="summary-row">
                  <span>Base Fare</span>
                  <strong>₹{pricingEstimate.dailyPrice}</strong>
                </div>
                <div className="summary-row">
                  <span>Rental Duration</span>
                  <strong>{rentalDays || 0} day(s)</strong>
                </div>
                <div className="summary-row total-row">
                  <span>Total Due Today</span>
                  <strong>₹{pricingEstimate.total}</strong>
                </div>
              </div>

              <form onSubmit={handleBooking}>
                <div className="form-group">
                  <label>Pickup Date</label>
                  <input
                    type="date"
                    required
                    value={bookingData.pickupDate}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, pickupDate: e.target.value })
                    }
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>Return Date</label>
                  <input
                    type="date"
                    required
                    value={bookingData.returnDate}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, returnDate: e.target.value })
                    }
                    min={bookingData.pickupDate || new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>Trip Notes</label>
                  <textarea
                    value={bookingData.notes}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, notes: e.target.value })
                    }
                    placeholder="Add pickup or drop notes (optional)"
                  />
                </div>

                {!car.isAvailable && (
                  <div className="unavailable-notice">
                    This car is currently unavailable for instant booking.
                  </div>
                )}

                <button 
                  type="submit" 
                  className="book-now-btn"
                  disabled={!car.isAvailable || processingPayment}
                >
                  {car.isAvailable
                    ? processingPayment
                      ? 'Processing...'
                      : 'Confirm and Pay'
                    : 'Unavailable'}
                </button>
              </form>

              <p className="booking-note">Instant confirmation after payment. Need help? Support is available 24/7.</p>

              <div className="payment-methods" aria-label="Accepted payment methods">
                <span>UPI</span>
                <span>Cards</span>
                <span>NetBanking</span>
                <span>Wallets</span>
              </div>
            </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2>Guest Reviews</h2>
          {reviews.length === 0 ? (
            <p>No reviews yet for this car.</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <strong>{review.user.name}</strong>
                    <span className="review-rating">Rated {review.rating} / 5</span>
                  </div>
                  <p>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
