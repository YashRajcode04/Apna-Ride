import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import CarCard from '../components/CarCard';
import './Home.css';
import { useEffect, useState } from 'react';
import API from '../utils/api';
import { initAllScrollAnimations } from '../utils/scrollAnimations';

const STATS = [
  { value: '10,000+', label: 'Happy Customers' },
  { value: '500+',    label: 'Premium Cars' },
  { value: '25+',     label: 'Cities Covered' },
  { value: '4.9★',   label: 'Average Rating' },
];

const Home = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);

  // Track scroll for parallax + back-to-top
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrolled = window.scrollY;
      const progress = Math.min(scrolled / (windowHeight * 1.5), 1);
      setScrollProgress(progress);
      setParallaxOffset(scrolled * 0.5);
      setShowTop(scrolled > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch featured cars
  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const { data } = await API.get('/cars?limit=6');
        setFeaturedCars(Array.isArray(data?.data) ? data.data.slice(0, 6) : []);
      } catch (error) {
        console.error('Error fetching featured cars:', error);
        setFeaturedCars([]);
      }
    };
    fetchFeaturedCars();
  }, []);

  // Initialize scroll animations
  useEffect(() => {
    const timer = setTimeout(() => {
      const cleanup = initAllScrollAnimations();
      return () => { if (cleanup && typeof cleanup === 'function') cleanup(); };
    }, 100);
    return () => clearTimeout(timer);
  }, [featuredCars]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterDone(true);
    setNewsletterEmail('');
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-video-container">
          <div
            className="hero-background-image"
            style={{
              backgroundImage: 'url(/poster.png)',
              transform: `translateY(${parallaxOffset}px)`,
            }}
          />
          <div className="hero-overlay" />
        </div>

        <div
          className="hero-content"
          style={{
            transform: `translateY(${scrollProgress * 50}px)`,
            opacity: 1 - scrollProgress * 0.8
          }}
        >
          <div className="hero-text-wrapper">
            <span className="hero-badge">Apna Ride - India's Premier</span>
            <h1 className="hero-title">Drive Your Dreams</h1>
            <p className="hero-description">
              Experience luxury on wheels across India.
            </p>
          </div>
          <SearchBar />
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="stats-bar scroll-reveal">
        <div className="container">
          <div className="stats-grid">
            {STATS.map((stat) => (
              <div key={stat.label} className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header scroll-reveal">
            <h2>Featured Vehicles</h2>
            <p>Discover our handpicked collection of premium vehicles across major Indian cities.</p>
          </div>

          <div className="cars-grid">
            {featuredCars.length > 0
              ? featuredCars.map((car, index) => (
                  <div key={car._id} className="scroll-reveal" style={{ transitionDelay: `${index * 0.07}s` }}>
                    <CarCard car={car} />
                  </div>
                ))
              : [...Array(6)].map((_, i) => (
                  <div key={i} className="car-card-skeleton" />
                ))
            }
          </div>

          <div className="view-all-container scroll-reveal">
            <Link to="/cars" className="view-all-btn">
              Explore all cars
              <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* List Your Car Banner */}
      <section className="list-car-banner scroll-reveal">
        <div className="container banner-content">
          <div className="banner-text">
            <h2>Own a Premium Car?</h2>
            <p>Turn your vehicle into a revenue stream by listing it on India's trusted car rental platform.</p>
            <p>We handle insurance, driver verification, and secure payments — earn effortlessly while your car works for you.</p>
            <Link to="/list-car" className="banner-btn">
              List your car
            </Link>
          </div>
          <div
            className="banner-image"
            style={{
              transform: `translateY(${scrollProgress * -30}px) scale(${1 + scrollProgress * 0.05})`,
            }}
          >
            <img src="/lambo.png" alt="Premium Car" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <div className="scroll-reveal">
            <h2>What Our Customers Say</h2>
          </div>

          <div className="testimonials-grid">
            {[
              {
                img: '/images.jpg',
                name: 'Priya Sharma',
                location: 'Mumbai, Maharashtra',
                rating: 5,
                comment: '"Booked a BMW for my Delhi trip. Seamless experience, great car condition, and doorstep delivery. Highly recommended!"',
              },
              {
                img: '/images4.jpg',
                name: 'Sneha Patel',
                location: 'Bangalore, Karnataka',
                rating: 5,
                comment: '"Perfect for my Goa road trip. The car was in excellent condition and customer support was responsive throughout."',
              },
              {
                img: '/testimonial_image_1-CoRIPhVu.png',
                name: 'Anjali Mehta',
                location: 'Pune, Maharashtra',
                rating: 5,
                comment: '"Best car rental service in India! The rates are competitive and the fleet includes both luxury and budget options."',
              },
            ].map((t, i) => (
              <div
                key={t.name}
                className={`testimonial-card scroll-reveal scroll-stagger-${i + 1}`}
                style={{ transform: `translateY(${scrollProgress * -10}px)` }}
              >
                <img src={t.img} alt={t.name} />
                <h4>{t.name}</h4>
                <p className="location">{t.location}</p>
                <div className="testimonial-stars">
                  {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                </div>
                <p className="comment">{t.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="container newsletter-wrapper scroll-reveal">
          <div className="newsletter-content">
            <h2>Never Miss a Deal!</h2>
            <p>Subscribe to receive exclusive offers, festival discounts, and new vehicle arrivals</p>
            {newsletterDone ? (
              <div className="newsletter-success">
                <span className="success-icon">✓</span>
                <span>You're subscribed! Deals coming your way.</span>
              </div>
            ) : (
              <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button type="submit">Subscribe</button>
              </form>
            )}
          </div>
          <div className="newsletter-image">
            <img src="/banner_car_image.png" alt="Premium Car" />
          </div>
        </div>
      </section>

      {/* Back to Top */}
      <button
        className={`back-to-top ${showTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to top"
      >
        ↑
      </button>
    </div>
  );
};

export default Home;
