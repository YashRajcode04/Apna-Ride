import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = ({ scrollProgress = 0 }) => {
  // Determine if footer should use light text
  const isDark = scrollProgress > 0.3;
  const footerClass = `footer ${isDark ? 'footer-inverted' : ''}`;

  return (
    <footer className={footerClass}>
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">APNA RIDE</div>
            <p>India's premium car rental service offering luxury and budget vehicles across major cities. Travel in style and comfort.</p>
          </div>

          <div className="footer-section">
            <h3>QUICK LINKS</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/cars">Browse Cars</Link></li>
              <li><Link to="/list-car">List Your Car</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>RESOURCES</h3>
            <ul>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/insurance">Insurance</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>CONTACT</h3>
            <ul>
              <li>MG Road, Connaught Place</li>
              <li>New Delhi, DL 110001</li>
              <li>+91 98765 43210</li>
              <li>support@apnaride.com</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Apna Ride. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy</Link>
            <span>|</span>
            <Link to="/terms">Terms</Link>
            <span>|</span>
            <Link to="/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
