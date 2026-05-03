import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../utils/api';
import CarCard from '../components/CarCard';
import { getMergedCars } from '../utils/showcaseCars';
import './Cars.css';

const luxeBrands = new Set([
  'lamborghini',
  'porsche',
  'ferrari',
  'rolls-royce',
  'bentley',
  'maserati',
  'aston martin',
  'mclaren',
  'land rover',
  'mercedes-benz',
  'bmw',
]);

const sortOptions = {
  featured: (a, b) => (b.rating || 0) - (a.rating || 0) || a.pricePerDay - b.pricePerDay,
  priceAsc: (a, b) => a.pricePerDay - b.pricePerDay,
  priceDesc: (a, b) => b.pricePerDay - a.pricePerDay,
  rating: (a, b) => (b.rating || 0) - (a.rating || 0),
  newest: (a, b) => (b.year || 0) - (a.year || 0),
};

const isLuxeCar = (car) => {
  const category = (car.category || '').toLowerCase();
  const brand = (car.brand || '').toLowerCase();

  return (
    category === 'luxury' ||
    category === 'premium' ||
    (car.pricePerDay || 0) >= 12000 ||
    luxeBrands.has(brand)
  );
};

const Cars = () => {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('location') || '');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedFuel, setSelectedFuel] = useState('All');
  const [selectedTransmission, setSelectedTransmission] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [minSeats, setMinSeats] = useState(2);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [priceCap, setPriceCap] = useState(50000);

  useEffect(() => {
    setSearchQuery(searchParams.get('location') || '');
    fetchCars();
  }, [searchParams.toString()]);

  useEffect(() => {
    if (!isFilterOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsFilterOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFilterOpen]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isFilterOpen]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = {};
      const location = searchParams.get('location');
      if (location) params.location = location;

      const { data } = await API.get('/cars', { params });
      setCars(getMergedCars(data?.data || [], { categoryGroup: 'eco' }));
    } catch (error) {
      console.error('Error fetching cars:', error);
      setCars(getMergedCars([], { categoryGroup: 'eco' }));
    } finally {
      setLoading(false);
    }
  };

  const maxPriceInData = useMemo(() => {
    if (!cars.length) return 50000;
    return Math.max(...cars.map((car) => car.pricePerDay || 0));
  }, [cars]);

  const rangeMax = useMemo(() => Math.max(5000, maxPriceInData), [maxPriceInData]);

  useEffect(() => {
    setPriceCap(rangeMax);
  }, [rangeMax]);

  const fuelOptions = useMemo(
    () => ['All', ...Array.from(new Set(cars.map((car) => car.fuelType).filter(Boolean)))],
    [cars]
  );

  const transmissionOptions = useMemo(
    () => ['All', ...Array.from(new Set(cars.map((car) => car.transmission).filter(Boolean)))],
    [cars]
  );

  const typeOptions = useMemo(
    () => ['All', ...Array.from(new Set(cars.map((car) => car.type).filter(Boolean)))],
    [cars]
  );

  const brandOptions = useMemo(
    () => ['All', ...Array.from(new Set(cars.map((car) => car.brand).filter(Boolean)))],
    [cars]
  );

  const cityOptions = useMemo(
    () => ['All', ...Array.from(new Set(cars.map((car) => car.location).filter(Boolean)))],
    [cars]
  );

  const filteredCars = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const searched = cars.filter((car) => {
      if (!query) return true;
      return (
        car.name?.toLowerCase().includes(query) ||
        car.brand?.toLowerCase().includes(query) ||
        car.model?.toLowerCase().includes(query) ||
        car.location?.toLowerCase().includes(query)
      );
    });

    const advanced = searched.filter((car) => {
      const fuelMatched = selectedFuel === 'All' ? true : car.fuelType === selectedFuel;
      const transmissionMatched =
        selectedTransmission === 'All' ? true : car.transmission === selectedTransmission;
      const typeMatched = selectedType === 'All' ? true : car.type === selectedType;
      const brandMatched = selectedBrand === 'All' ? true : car.brand === selectedBrand;
      const cityMatched = selectedCity === 'All' ? true : car.location === selectedCity;
      const seatsMatched = (car.seats || 0) >= minSeats;
      const availabilityMatched = onlyAvailable ? car.isAvailable : true;
      const priceMatched = (car.pricePerDay || 0) <= priceCap;

      return (
        fuelMatched &&
        transmissionMatched &&
        typeMatched &&
        brandMatched &&
        cityMatched &&
        seatsMatched &&
        availabilityMatched &&
        priceMatched
      );
    });

    return advanced.sort(sortOptions[sortBy]);
  }, [
    cars,
    searchQuery,
    selectedFuel,
    selectedTransmission,
    selectedType,
    selectedBrand,
    selectedCity,
    minSeats,
    onlyAvailable,
    priceCap,
    sortBy,
  ]);

  const budgetRides = useMemo(() => filteredCars.filter((car) => !isLuxeCar(car)), [filteredCars]);
  const luxeWheels = useMemo(() => filteredCars.filter((car) => isLuxeCar(car)), [filteredCars]);

  const sectionStats = useMemo(() => {
    const statsFor = (list) => {
      if (!list.length) return { count: 0, avg: 0, min: 0 };
      const prices = list.map((car) => car.pricePerDay || 0).filter((value) => Number.isFinite(value));
      const total = prices.reduce((sum, value) => sum + value, 0);
      return {
        count: list.length,
        avg: prices.length ? Math.round(total / prices.length) : 0,
        min: prices.length ? Math.min(...prices) : 0,
      };
    };

    return {
      budget: statsFor(budgetRides),
      luxe: statsFor(luxeWheels),
    };
  }, [budgetRides, luxeWheels]);

  const budgetStats = useMemo(() => {
    if (!filteredCars.length) {
      return { cheapest: 0, avgPrice: 0, highest: 0 };
    }

    const prices = filteredCars.map((car) => car.pricePerDay || 0);
    const total = prices.reduce((sum, value) => sum + value, 0);

    return {
      cheapest: Math.min(...prices),
      avgPrice: Math.round(total / prices.length),
      highest: Math.max(...prices),
    };
  }, [filteredCars]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedFuel !== 'All') count += 1;
    if (selectedTransmission !== 'All') count += 1;
    if (selectedType !== 'All') count += 1;
    if (selectedBrand !== 'All') count += 1;
    if (selectedCity !== 'All') count += 1;
    if (minSeats > 2) count += 1;
    if (onlyAvailable) count += 1;
    if (priceCap < rangeMax) count += 1;
    if (searchQuery.trim()) count += 1;
    return count;
  }, [
    selectedFuel,
    selectedTransmission,
    selectedType,
    selectedBrand,
    selectedCity,
    minSeats,
    onlyAvailable,
    priceCap,
    rangeMax,
    searchQuery,
  ]);

  const resetFilters = () => {
    setSelectedFuel('All');
    setSelectedTransmission('All');
    setSelectedType('All');
    setSelectedBrand('All');
    setSelectedCity('All');
    setMinSeats(2);
    setOnlyAvailable(false);
    setPriceCap(rangeMax);
    setSortBy('featured');
    setSearchQuery('');
  };

  const renderSectionGrid = (list, sectionName) => {
    if (!list.length) {
      return (
        <div className="section-empty">
          <p>No cars found in {sectionName} for the selected filters.</p>
        </div>
      );
    }

    return (
      <div className="cars-grid">
        {list.map((car, index) => (
          <div
            key={`${sectionName}-${car._id}`}
            className="cars-grid-item"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CarCard car={car} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="cars-page">
      <div className="cars-header">
        <div className="container">
          <h1>Eco Mobility Fleet</h1>
          <p>Efficient, city-smart cars designed for everyday travel.</p>
        </div>
      </div>

      <div className="container">
        <div className="cars-content">
          <div className="cars-toolbar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search model, brand, or city"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <button type="button" className="search-btn">
                Find Cars
              </button>
            </div>

            <div className="toolbar-actions">
              {activeFilterCount > 0 && (
                <button type="button" className="toolbar-reset-btn" onClick={resetFilters}>
                  Reset Filters
                </button>
              )}

              <button
                type="button"
                className="filter-toggle"
                onClick={() => setIsFilterOpen(true)}
                aria-label="Open filters"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 6H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M7 12H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M10 18H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span>Filters</span>
                {activeFilterCount > 0 && <em>{activeFilterCount}</em>}
              </button>

              <div className="sort-wrap">
                <label htmlFor="sort-cars">Sort</label>
                <select id="sort-cars" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="rating">Best Rated</option>
                  <option value="newest">Newest Model</option>
                </select>
              </div>
            </div>
          </div>

          <div className="results-summary">
            <h3>{filteredCars.length} Eco Cars Available</h3>
            <p>
              From ₹{budgetStats.cheapest}/day | Average ₹{budgetStats.avgPrice}/day | Up to ₹{budgetStats.highest}/day
            </p>
          </div>

          {loading ? (
            <div className="cars-grid">
              {[...Array(6)].map((_, index) => (
                <div key={`skeleton-${index}`} className="car-card-skeleton" />
              ))}
            </div>
          ) : (
            <section className="cars-section">
              <div className="section-head">
                <div className="section-title">
                  <h2>Recommended Eco Picks</h2>
                  <p>Practical, fuel-efficient options for daily commutes and city routes.</p>
                </div>
                <div className="section-badges" aria-label="Eco cars summary">
                  <span className="section-badge">{filteredCars.length} cars</span>
                  <span className="section-badge">Avg ₹{budgetStats.avgPrice}/day</span>
                  <span className="section-badge">From ₹{budgetStats.cheapest}</span>
                </div>
              </div>
              {renderSectionGrid(filteredCars, 'Eco Cars')}
            </section>
          )}
        </div>
      </div>

      {isFilterOpen && (
        <button
          type="button"
          className="filter-overlay"
          onClick={() => setIsFilterOpen(false)}
          aria-label="Close filters"
        />
      )}

      <aside className={`filter-drawer ${isFilterOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>Refine Results</h3>
          <button type="button" onClick={() => setIsFilterOpen(false)}>
            Done
          </button>
        </div>

        <div className="drawer-body">
          <div className="filter-group wide-group">
            <label htmlFor="price-cap">Max Daily Budget</label>
            <input
              id="price-cap"
              type="range"
              min="1000"
              max={rangeMax}
              step="500"
              value={priceCap}
              onChange={(event) => setPriceCap(Number(event.target.value))}
            />
            <div className="range-meta">
              <span>₹1000</span>
              <strong>₹{priceCap}</strong>
              <span>₹{rangeMax}</span>
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="fuel-filter">Fuel Type</label>
            <select id="fuel-filter" value={selectedFuel} onChange={(event) => setSelectedFuel(event.target.value)}>
              {fuelOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="transmission-filter">Transmission</label>
            <select
              id="transmission-filter"
              value={selectedTransmission}
              onChange={(event) => setSelectedTransmission(event.target.value)}
            >
              {transmissionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="type-filter">Type</label>
            <select id="type-filter" value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="brand-filter">Brand</label>
            <select id="brand-filter" value={selectedBrand} onChange={(event) => setSelectedBrand(event.target.value)}>
              {brandOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="city-filter">City</label>
            <select id="city-filter" value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>
              {cityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="seat-filter">Minimum Seats</label>
            <select id="seat-filter" value={minSeats} onChange={(event) => setMinSeats(Number(event.target.value))}>
              {[2, 4, 5, 6, 7].map((seat) => (
                <option key={seat} value={seat}>
                  {seat}+
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Availability</label>
            <button
              type="button"
              className={`toggle-btn ${onlyAvailable ? 'active' : ''}`}
              onClick={() => setOnlyAvailable((prev) => !prev)}
            >
              {onlyAvailable ? 'Only Available' : 'All Cars'}
            </button>
          </div>
        </div>

        <div className="drawer-footer">
          <span>{activeFilterCount} active filters</span>
          <button type="button" className="clear-filters-btn" onClick={resetFilters}>
            Clear All
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Cars;
