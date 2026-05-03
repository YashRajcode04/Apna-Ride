import { useContext, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './ManageCars.css';

const initialCarForm = {
  name: '',
  brand: '',
  model: '',
  year: '',
  type: 'SUV',
  category: 'Indian',
  seats: 5,
  fuelType: 'Petrol',
  transmission: 'Manual',
  pricePerDay: '',
  location: '',
  description: '',
  features: '',
  imageUrl: '',
};

const ManageCars = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCarId, setEditingCarId] = useState('');
  const [carForm, setCarForm] = useState(initialCarForm);

  useEffect(() => {
    fetchCars();
  }, [isAdmin]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? '/cars/admin/all' : '/cars/my-cars';
      const { data } = await API.get(endpoint);
      setCars(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch cars');
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (carId, isApproved) => {
    try {
      await API.put(`/cars/${carId}/approve`, { isApproved });
      toast.success(isApproved ? 'Car approved successfully' : 'Car rejected successfully');
      await fetchCars();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update approval status');
    }
  };

  const handleDelete = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      await API.delete(`/cars/${carId}`);
      toast.success('Car deleted successfully');
      await fetchCars();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete car');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCarForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateForm = () => {
    setEditingCarId('');
    setCarForm(initialCarForm);
    setShowForm(true);
  };

  const openEditForm = (car) => {
    setEditingCarId(car._id);
    setCarForm({
      name: car.name || '',
      brand: car.brand || '',
      model: car.model || '',
      year: car.year || '',
      type: car.type || 'SUV',
      category: car.category || 'Indian',
      seats: car.seats || 5,
      fuelType: car.fuelType || 'Petrol',
      transmission: car.transmission || 'Manual',
      pricePerDay: car.pricePerDay || '',
      location: car.location || '',
      description: car.description || '',
      features: Array.isArray(car.features) ? car.features.join(', ') : '',
      imageUrl: car.images?.[0]?.url || '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCarId('');
    setCarForm(initialCarForm);
  };

  const handleSaveCar = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: carForm.name,
      brand: carForm.brand,
      model: carForm.model,
      year: Number(carForm.year),
      type: carForm.type,
      category: carForm.category,
      seats: Number(carForm.seats),
      fuelType: carForm.fuelType,
      transmission: carForm.transmission,
      pricePerDay: Number(carForm.pricePerDay),
      location: carForm.location,
      description: carForm.description,
      features: carForm.features
        .split(',')
        .map((feature) => feature.trim())
        .filter(Boolean),
      images: carForm.imageUrl ? [{ url: carForm.imageUrl }] : [],
    };

    try {
      if (editingCarId) {
        await API.put(`/cars/${editingCarId}`, payload);
        toast.success('Car updated successfully');
      } else {
        const { data } = await API.post('/cars', payload);
        toast.success(data.message || 'Car added successfully');
      }
      await fetchCars();
      closeForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save car');
    } finally {
      setSaving(false);
    }
  };

  const getCarStatus = (car) => {
    if (!car.isApproved) return { label: 'Pending Approval', className: 'status-pending' };
    if (!car.isAvailable) return { label: 'Unavailable', className: 'status-unavailable' };
    return { label: 'Available', className: 'status-available' };
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="manage-cars-content">
        <div className="page-header">
          <h1>{isAdmin ? 'Manage Cars' : 'My Car Listings'}</h1>
          <p>
            {isAdmin
              ? 'View, approve and manage all cars listed on the platform'
              : 'Manage your listed cars and check approval status'}
          </p>
          {isAdmin && (
            <button type="button" className="primary-btn" onClick={openCreateForm}>
              Add New Car
            </button>
          )}
        </div>

        {showForm && (
          <div className="admin-car-form-card">
            <h3>{editingCarId ? 'Edit Car' : 'Add New Car'}</h3>
            <form onSubmit={handleSaveCar} className="admin-car-form-grid">
              <input name="name" value={carForm.name} onChange={handleFormChange} required placeholder="Car name" />
              <input name="brand" value={carForm.brand} onChange={handleFormChange} required placeholder="Brand" />
              <input name="model" value={carForm.model} onChange={handleFormChange} required placeholder="Model" />
              <input type="number" min="1990" max="2030" name="year" value={carForm.year} onChange={handleFormChange} required placeholder="Year" />

              <select name="type" value={carForm.type} onChange={handleFormChange}>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Coupe">Coupe</option>
                <option value="MUV">MUV</option>
              </select>

              <select name="category" value={carForm.category} onChange={handleFormChange}>
                <option value="Indian">Indian</option>
                <option value="Luxury">Luxury</option>
                <option value="Premium">Premium</option>
                <option value="Economy">Economy</option>
              </select>

              <input type="number" min="2" max="15" name="seats" value={carForm.seats} onChange={handleFormChange} required placeholder="Seats" />

              <select name="fuelType" value={carForm.fuelType} onChange={handleFormChange}>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>

              <select name="transmission" value={carForm.transmission} onChange={handleFormChange}>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
                <option value="Semi-Automatic">Semi-Automatic</option>
              </select>

              <input type="number" min="1" name="pricePerDay" value={carForm.pricePerDay} onChange={handleFormChange} required placeholder="Price per day" />
              <input name="location" value={carForm.location} onChange={handleFormChange} required placeholder="Location" />
              <input name="imageUrl" value={carForm.imageUrl} onChange={handleFormChange} placeholder="Image URL" />
              <input className="full-width" name="features" value={carForm.features} onChange={handleFormChange} placeholder="Features (comma separated)" />
              <textarea className="full-width" name="description" value={carForm.description} onChange={handleFormChange} rows="3" placeholder="Description" />

              <div className="form-actions full-width">
                <button type="button" className="secondary-btn" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving ? 'Saving...' : editingCarId ? 'Update Car' : 'Create Car'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading-state">Loading cars...</div>
        ) : (
          <div className="cars-table-container">
            <table className="cars-table">
              <thead>
                <tr>
                  <th>Car</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => {
                  const status = getCarStatus(car);
                  return (
                    <tr key={car._id}>
                      <td>
                        <div className="car-info">
                          <img
                            src={car.images?.[0]?.url || '/placeholder-car.svg'}
                            alt={car.name}
                          />
                          <div>
                            <h4>{car.name}</h4>
                            <span>
                              {car.brand} • {car.location}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{car.category || car.type}</span>
                      </td>
                      <td>
                        <strong>₹{car.pricePerDay}/day</strong>
                      </td>
                      <td>
                        <span className={`status-badge ${status.className}`}>{status.label}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {isAdmin && !car.isApproved && (
                            <button
                              className="btn-approve"
                              onClick={() => handleApproval(car._id, true)}
                              title="Approve"
                            >
                              Approve
                            </button>
                          )}
                          {isAdmin && car.isApproved && (
                            <button
                              className="btn-reject"
                              onClick={() => handleApproval(car._id, false)}
                              title="Reject"
                            >
                              Reject
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              className="btn-edit"
                              onClick={() => openEditForm(car)}
                              title="Edit"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(car._id)}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {cars.length === 0 && (
                  <tr>
                    <td colSpan="5" className="loading-state">
                      No cars found.
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

export default ManageCars;
