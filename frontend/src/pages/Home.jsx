import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import CarCard from '../components/CarCard';
import './Home.css';
import { useEffect, useState } from 'react';
import API from '../utils/api';
import { initAllScrollAnimations } from '../utils/scrollAnimations';

const Home = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  // Track scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrolled = window.scrollY;
      const progress = Math.min(scrolled / (windowHeight * 1.5), 1);
      setScrollProgress(progress);
      
      // Parallax effect - background moves slower than scroll (0.5x speed)
      setParallaxOffset(scrolled * 0.5);
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

  // Initialize scroll animations after component mounts
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      const cleanup = initAllScrollAnimations();
      
      // Cleanup on unmount
      return () => {
        if (cleanup && typeof cleanup === 'function') {
          cleanup();
        }
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [featuredCars]); // Re-run when cars are loaded

  return (
    <div className="home">
      {/* Hero Section with Porsche Image Background */}
      <section className="hero">
        {/* Background Image with Parallax */}
        <div className="hero-video-container">
          <div 
            className="hero-background-image" 
            style={{ 
              backgroundImage: 'url(/poster.png)',
              transform: `translateY(${parallaxOffset}px)`,
            }}
          ></div>
          <div className="hero-overlay"></div>
        </div>

        {/* Hero Content */}
        <div 
          className="hero-content"
          style={{
            transform: `translateY(${scrollProgress * 50}px)`,
            opacity: 1 - scrollProgress * 0.8
          }}
        >
          <div className="hero-text-wrapper">
            <span className="hero-badge">Apna Ride - India's Premier</span>
            <h1 className="hero-title">
              Drive Your Dreams
            </h1>
            <p className="hero-description">
              Experience luxury on wheels across India.
            </p>
          </div>
          <SearchBar />
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
            {featuredCars.map((car, index) => (
              <div key={car._id} className="scroll-reveal">
                <CarCard car={car} />
              </div>
            ))}
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
            <div 
              className="testimonial-card scroll-reveal scroll-stagger-1"
              style={{
                transform: `translateY(${scrollProgress * -10}px)`,
              }}
            >
              <img src="/images.jpg" alt="Priya Sharma" />
              <h4>Priya Sharma</h4>
              <p className="location">Mumbai, Maharashtra</p>
              <div className="rating">Rating 5.0 / 5</div>
              <p className="comment">"Booked a BMW for my Delhi trip. Seamless experience, great car condition, and doorstep delivery. Highly recommended!"</p>
            </div>

            <div 
              className="testimonial-card scroll-reveal scroll-stagger-2"
              style={{
                transform: `translateY(${scrollProgress * -20}px)`,
              }}
            >
              <img src="/images4.jpg" alt="Sneha Patel" />
              <h4>Sneha Patel</h4>
              <p className="location">Bangalore, Karnataka</p>
              <div className="rating">Rating 5.0 / 5</div>
              <p className="comment">"Perfect for my Goa road trip. The car was in excellent condition and customer support was responsive throughout."</p>
            </div>

            <div 
              className="testimonial-card scroll-reveal scroll-stagger-3"
              style={{
                transform: `translateY(${scrollProgress * -10}px)`,
              }}
            >
              <img src="/testimonial_image_1-CoRIPhVu.png" alt="Anjali Mehta" />
              <h4>Anjali Mehta</h4>
              <p className="location">Pune, Maharashtra</p>
              <div className="rating">Rating 5.0 / 5</div>
              <p className="comment">"Best car rental service in India! The rates are competitive and the fleet includes both luxury and budget options."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="container newsletter-wrapper scroll-reveal">
          <div className="newsletter-content">
            <h2>Never Miss a Deal!</h2>
            <p>Subscribe to receive exclusive offers, festival discounts, and new vehicle arrivals</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
          <div className="newsletter-image">
            <img src="/banner_car_image.png" alt="Premium Car" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
