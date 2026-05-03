import { useState } from 'react';
import API from '../utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './ListCar.css';

const ListCar = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: '',
    type: 'Sedan',
    category: 'Indian',
    seats: '',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    pricePerDay: '',
    location: '',
    description: '',
    features: '',
    imageUrl: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const carData = {
        ...formData,
        year: Number(formData.year),
        seats: Number(formData.seats),
        pricePerDay: Number(formData.pricePerDay),
        features: formData.features.split(',').map((f) => f.trim()).filter(Boolean),
        images: formData.imageUrl ? [{ url: formData.imageUrl }] : [],
      };

      const { data } = await API.post('/cars/list-your-car', carData);
      toast.success(data.message || 'Car listed successfully!');
      navigate('/cars');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to list car');
    }
  };

  return (
    <div className="list-car-page">
      <div className="container">
        <h1>List Your Car</h1>
        <p className="subtitle">Fill in the details to list your car for rent</p>

        <form onSubmit={handleSubmit} className="list-car-form">
          <div className="form-row">
            <div className="form-group">
              <label>Car Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Toyota Corolla 2021"
              />
            </div>

            <div className="form-group">
              <label>Brand *</label>
              <input
                type="text"
                name="brand"
                required
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Toyota"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Model *</label>
              <input
                type="text"
                name="model"
                required
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., Corolla"
              />
            </div>

            <div className="form-group">
              <label>Year *</label>
              <input
                type="number"
                name="year"
                required
                min="1990"
                max="2026"
                value={formData.year}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Convertible">Convertible</option>
                <option value="Coupe">Coupe</option>
                <option value="Wagon">Wagon</option>
                <option value="Van">Van</option>
                <option value="MUV">MUV</option>
                <option value="Pickup">Pickup</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="Indian">Indian</option>
                <option value="Luxury">Luxury</option>
                <option value="Economy">Economy</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div className="form-group">
              <label>Seats *</label>
              <input
                type="number"
                name="seats"
                required
                min="2"
                max="15"
                value={formData.seats}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fuel Type *</label>
              <select name="fuelType" value={formData.fuelType} onChange={handleChange}>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="form-group">
              <label>Transmission *</label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
              >
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
                <option value="Semi-Automatic">Semi-Automatic</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price Per Day (INR) *</label>
              <input
                type="number"
                name="pricePerDay"
                required
                min="0"
                value={formData.pricePerDay}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Mumbai"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/car-image.jpg"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your car..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Features (comma-separated)</label>
            <input
              type="text"
              name="features"
              value={formData.features}
              onChange={handleChange}
              placeholder="e.g., GPS, Bluetooth, Air Conditioning"
            />
          </div>

          <button type="submit" className="submit-btn">
            List Car
          </button>
        </form>
      </div>
    </div>
  );
};

export default ListCar;
