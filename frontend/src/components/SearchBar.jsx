import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './SearchBar.css';

const SearchBar = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location: '',
    pickupDate: '',
    returnDate: '',
  });

  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'pickupDate') {
      setFormData((prev) => ({
        ...prev,
        pickupDate: value,
        returnDate: prev.returnDate && prev.returnDate <= value ? '' : prev.returnDate,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.pickupDate && formData.pickupDate < today) {
      toast.warning('Pick-up date cannot be in the past.');
      return;
    }

    if (formData.pickupDate && formData.returnDate && formData.returnDate <= formData.pickupDate) {
      toast.warning('Return date must be after pick-up date.');
      return;
    }

    const query = new URLSearchParams(formData).toString();
    navigate(`/cars?${query}`);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            placeholder="Mumbai, Delhi, Bangalore..."
            value={formData.location}
            onChange={handleChange}
            list="indian-cities"
          />
          <datalist id="indian-cities">
            <option value="Mumbai" />
            <option value="Delhi" />
            <option value="Bangalore" />
            <option value="Hyderabad" />
            <option value="Chennai" />
            <option value="Kolkata" />
            <option value="Pune" />
            <option value="Ahmedabad" />
            <option value="Jaipur" />
            <option value="Goa" />
          </datalist>
        </div>

        <div className="search-input-group">
          <label>Pick-up Date</label>
          <input
            type="date"
            name="pickupDate"
            value={formData.pickupDate}
            onChange={handleChange}
            min={today}
          />
        </div>

        <div className="search-input-group">
          <label>Return Date</label>
          <input
            type="date"
            name="returnDate"
            value={formData.returnDate}
            onChange={handleChange}
            min={formData.pickupDate || today}
          />
        </div>

        <button type="submit" className="search-button">
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
