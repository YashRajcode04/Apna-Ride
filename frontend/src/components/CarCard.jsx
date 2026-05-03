import { Link } from 'react-router-dom';
import './CarCard.css';

// Format price with Indian comma notation
const formatPrice = (price) => {
  if (!price) return '0';
  return Number(price).toLocaleString('en-IN');
};

// Render star rating visually
const StarRating = ({ rating }) => {
  const value = Math.min(5, Math.max(0, Number(rating || 0)));
  const fullStars = Math.floor(value);
  const hasHalf = value - fullStars >= 0.5;
  return (
    <span className="star-rating" aria-label={`Rating ${value.toFixed(1)} out of 5`}>
      {[...Array(5)].map((_, i) => {
        let cls = 'star star-empty';
        if (i < fullStars) cls = 'star star-full';
        else if (i === fullStars && hasHalf) cls = 'star star-half';
        return <span key={i} className={cls}>★</span>;
      })}
      <span className="star-value">{value.toFixed(1)}</span>
    </span>
  );
};

const CarCard = ({ car }) => {
  const detailsPath = `/cars/${car._id}`;
  const currentYear = new Date().getFullYear();
  const isNew = car.year && car.year >= currentYear - 1;

  const rawImage = Array.isArray(car?.images) && car.images.length
    ? car.images[0]
    : null;

  const resolvedImageUrl = (() => {
    if (typeof rawImage === 'string') return rawImage;
    if (rawImage && typeof rawImage === 'object' && rawImage.url) return rawImage.url;
    return null;
  })();

  const imageSrc = resolvedImageUrl ? encodeURI(resolvedImageUrl) : '/placeholder-car.svg';

  return (
    <div className="car-card">
      <div className="car-image">
        <Link
          to={detailsPath}
          className="car-image-link"
          aria-label={`View details for ${car.name}`}
        >
          <img
            src={imageSrc}
            alt={car.name}
            onError={(e) => { e.currentTarget.src = '/placeholder-car.svg'; }}
          />
        </Link>

        <div className="card-top-badges">
          <div className="badge-left">
            {car.isAvailable && <span className="availability-badge">Available</span>}
            {isNew && <span className="new-badge">New</span>}
          </div>
          {car.category && <span className="segment-badge">{car.category}</span>}
        </div>
      </div>

      <div className="car-details">
        <Link to={detailsPath} className="car-name-link">
          <h3 className="car-name">{car.name}</h3>
        </Link>

        <div className="car-meta-row">
          <p className="car-type">{car.type} · {car.year}</p>
          <StarRating rating={car.rating} />
        </div>

        <div className="car-specs">
          <span>
            <svg viewBox="0 0 24 24" className="spec-icon" aria-hidden="true"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
            {car.seats} Seats
          </span>
          <span>
            <svg viewBox="0 0 24 24" className="spec-icon" aria-hidden="true"><path d="M19 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-7 14l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L21 7l-9 9z"/></svg>
            {car.fuelType}
          </span>
          <span>
            <svg viewBox="0 0 24 24" className="spec-icon" aria-hidden="true"><path d="M17 7l-1.4 1.4L17.2 10H9v2h8.2l-1.6 1.6L17 15l4-4-4-4zM7 17V7H5v10c0 1.1.9 2 2 2h10v-2H7z"/></svg>
            {car.transmission}
          </span>
          <span className="location-spec">
            <svg viewBox="0 0 24 24" className="spec-icon" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            {car.location}
          </span>
        </div>

        <div className="car-footer">
          <div className="car-price">
            <span className="price-amount">₹{formatPrice(car.pricePerDay)}</span>
            <span className="price-period">/ day</span>
          </div>
          <Link to={detailsPath} className="view-details-btn">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
