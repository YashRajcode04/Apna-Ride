import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import CarCard from '../components/CarCard';
import { getMergedCars } from '../utils/showcaseCars';
import './LuxuryCars.css';

const sortOptions = {
  featured: (a, b) => (b.rating || 0) - (a.rating || 0) || a.pricePerDay - b.pricePerDay,
  priceAsc: (a, b) => a.pricePerDay - b.pricePerDay,
  priceDesc: (a, b) => b.pricePerDay - a.pricePerDay,
  newest: (a, b) => (b.year || 0) - (a.year || 0),
};

const signatureThreshold = 20000;

const isSignatureTier = (car) => {
  const price = car?.pricePerDay || 0;
  const category = (car?.category || '').toLowerCase();
  return price >= signatureThreshold || category === 'luxury';
};

const LuxuryCars = () => {
  const [cars, setCars] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedTransmission, setSelectedTransmission] = useState('All');
  const [selectedFuel, setSelectedFuel] = useState('All');
  const [priceCap, setPriceCap] = useState(50000);
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLuxuryCars();
  }, []);

  const fetchLuxuryCars = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/cars');
      setCars(getMergedCars(data?.data || [], { categoryGroup: 'luxury' }));
    } catch (error) {
      console.error('Error fetching luxury cars:', error);
      setCars(getMergedCars([], { categoryGroup: 'luxury' }));
    } finally {
      setLoading(false);
    }
  };

  const maxPriceInData = useMemo(() => {
    if (!cars.length) return 50000;
    return Math.max(...cars.map((car) => car.pricePerDay || 0));
  }, [cars]);

  useEffect(() => {
    setPriceCap(maxPriceInData);
  }, [maxPriceInData]);

  const brands = useMemo(() => {
    const uniqueBrands = Array.from(new Set(cars.map((item) => item.brand).filter(Boolean)));
    return ['All', ...uniqueBrands];
  }, [cars]);

  const transmissionOptions = useMemo(() => {
    const values = Array.from(new Set(cars.map((item) => item.transmission).filter(Boolean)));
    return ['All', ...values];
  }, [cars]);

  const fuelOptions = useMemo(() => {
    const values = Array.from(new Set(cars.map((item) => item.fuelType).filter(Boolean)));
    return ['All', ...values];
  }, [cars]);

  const filteredCars = useMemo(() => {
    const searched = cars.filter((car) => {
      const query = searchQuery.toLowerCase();
      return (
        car.name?.toLowerCase().includes(query) ||
        car.brand?.toLowerCase().includes(query) ||
        car.location?.toLowerCase().includes(query)
      );
    });

    const filtered = searched.filter((car) => {
      const brandMatch = selectedBrand === 'All' ? true : car.brand === selectedBrand;
      const transmissionMatch = selectedTransmission === 'All' ? true : car.transmission === selectedTransmission;
      const fuelMatch = selectedFuel === 'All' ? true : car.fuelType === selectedFuel;
      const priceMatch = (car.pricePerDay || 0) <= priceCap;

      return brandMatch && transmissionMatch && fuelMatch && priceMatch;
    });

    return filtered.sort(sortOptions[sortBy]);
  }, [cars, searchQuery, selectedBrand, selectedTransmission, selectedFuel, priceCap, sortBy]);

  const signatureCars = useMemo(
    () => filteredCars.filter((car) => isSignatureTier(car)),
    [filteredCars]
  );

  const executiveCars = useMemo(
    () => filteredCars.filter((car) => !isSignatureTier(car)),
    [filteredCars]
  );

  const avgPrice = useMemo(() => {
    if (!filteredCars.length) return 0;
    return Math.round(
      filteredCars.reduce((sum, car) => sum + (car.pricePerDay || 0), 0) / filteredCars.length
    );
  }, [filteredCars]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedBrand('All');
    setSelectedTransmission('All');
    setSelectedFuel('All');
    setSortBy('featured');
    setPriceCap(maxPriceInData);
  };

  return (
    <div className="luxury-cars-page">
      <div className="luxury-hero">
        <div className="container">
          <h1>Luxury Collection</h1>
          <p>Executive and flagship vehicles for exceptional arrivals.</p>

          <div className="hero-meta">
            <span>{filteredCars.length} Vehicles</span>
            <span>Average ₹{avgPrice}/day</span>
            <span>Premium Picks</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="luxury-filters">
          <div className="luxury-filter-grid">
            <div className="luxury-filter-group luxury-filter-wide">
              <label htmlFor="luxury-search">Search</label>
              <input
                id="luxury-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search model, brand, or city"
              />
            </div>

            <div className="luxury-filter-group">
              <label htmlFor="luxury-brand">Brand</label>
              <select id="luxury-brand" value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="luxury-filter-group">
              <label htmlFor="luxury-transmission">Transmission</label>
              <select
                id="luxury-transmission"
                value={selectedTransmission}
                onChange={(e) => setSelectedTransmission(e.target.value)}
              >
                {transmissionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="luxury-filter-group">
              <label htmlFor="luxury-fuel">Fuel Type</label>
              <select id="luxury-fuel" value={selectedFuel} onChange={(e) => setSelectedFuel(e.target.value)}>
                {fuelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="luxury-filter-group">
              <label htmlFor="luxury-price">Max Price</label>
              <input
                id="luxury-price"
                type="range"
                min="5000"
                max={maxPriceInData}
                step="500"
                value={priceCap}
                onChange={(e) => setPriceCap(Number(e.target.value))}
              />
              <span className="range-caption">Up to ₹{priceCap}</span>
            </div>

            <div className="luxury-filter-group">
              <label htmlFor="luxury-sort">Sort</label>
              <select id="luxury-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="newest">Newest Model</option>
              </select>
            </div>
          </div>

          <div className="luxury-filter-actions">
            <span>Filters update instantly</span>
            <button type="button" className="reset-luxury-btn" onClick={resetFilters}>
              Reset
            </button>
          </div>
        </div>

        <div className="luxury-content">
          <div className="results-header">
            <h2>Luxury Cars</h2>
            <p>Handpicked premium vehicles with comfort-first interiors and refined performance.</p>
          </div>

          {loading ? (
            <div className="loading">Loading luxury fleet...</div>
          ) : filteredCars.length === 0 ? (
            <div className="no-cars">
              <p>No luxury cars match your current filters.</p>
            </div>
          ) : (
            <section className="luxury-tier">
              <div className="tier-head">
                <div className="tier-title">
                  <h3>Curated Premium Fleet</h3>
                  <p>Designed for business travel, events, and memorable drives.</p>
                </div>
                <div className="tier-badges" aria-label="Luxury cars summary">
                  <span className="tier-badge">{filteredCars.length} vehicles</span>
                  <span className="tier-badge">Avg ₹{avgPrice}/day</span>
                  <span className="tier-badge">From ₹{signatureThreshold}+</span>
                </div>
              </div>

              <div className="cars-grid">
                {filteredCars.map((car, index) => (
                  <div key={car._id} className="luxury-grid-item" style={{ animationDelay: `${index * 0.06}s` }}>
                    <CarCard car={car} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="luxury-cta">
          <div className="cta-content">
            <h2>List Your Premium Car</h2>
            <p>Join Apna Ride and connect with verified renters across major Indian cities.</p>
            <Link className="cta-btn" to="/list-car">
              Start Listing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuxuryCars;
