import { Link } from 'react-router-dom';
import './CarCard.css';

const CarCard = ({ car }) => {
  const ratingValue = Number(car.rating || 0).toFixed(1);
  const detailsPath = `/cars/${car._id}`;

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
          />
        </Link>

        <div className="card-top-badges">
          {car.isAvailable && <span className="availability-badge">Available</span>}
          {car.category && <span className="segment-badge">{car.category}</span>}
        </div>
      </div>

      <div className="car-details">
        <Link to={detailsPath} className="car-name-link">
          <h3 className="car-name">{car.name}</h3>
        </Link>

        <div className="car-meta-row">
          <p className="car-type">{car.type} | {car.year}</p>
          <span className="car-rating">Rating {ratingValue}</span>
        </div>

        <div className="car-specs">
          <span>{car.seats} Seats</span>
          <span>{car.fuelType}</span>
          <span>{car.transmission}</span>
          <span>{car.location}</span>
        </div>

        <div className="car-footer">
          <div className="car-price">
            <span className="price-amount">₹{car.pricePerDay}</span>
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
