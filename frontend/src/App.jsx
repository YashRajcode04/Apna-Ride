import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
import MyBookings from './pages/MyBookings';
import ListCar from './pages/ListCar';
import Login from './pages/Login';
import Register from './pages/Register';
import OTPLogin from './pages/OTPLogin';
import AuthCallback from './pages/AuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import LuxuryCars from './pages/LuxuryCars';
import ManageCars from './pages/ManageCars';
import ManageBookings from './pages/ManageBookings';
import ManageUsers from './pages/ManageUsers';
import PrivateRoute from './components/PrivateRoute';
import PaymentPage from './pages/PaymentPage';
import PaymentDemo from './pages/PaymentDemo';

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress (0 to 1)
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = Math.min(scrolled / (windowHeight * 1.5), 1); // Transition completes after 1.5 viewports
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate background color based on scroll progress
  const backgroundColor = scrollProgress > 0 
    ? `rgb(${Math.round(255 * (1 - scrollProgress))}, ${Math.round(255 * (1 - scrollProgress))}, ${Math.round(255 * (1 - scrollProgress))})`
    : '#ffffff';

  return (
    <Router>
      <div className="app" style={{ backgroundColor, transition: 'background-color 0.3s ease' }}>
        <Navbar scrollProgress={scrollProgress} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/luxury-cars" element={<LuxuryCars />} />
            <Route path="/cars/:id" element={<CarDetails />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login-otp" element={<OTPLogin />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Payment Routes */}
            <Route path="/payment-demo" element={<PaymentDemo />} />
            <Route
              path="/payment/:bookingId"
              element={
                <PrivateRoute>
                  <PaymentPage />
                </PrivateRoute>
              }
            />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <PrivateRoute>
                  <MyBookings />
                </PrivateRoute>
              }
            />
            <Route
              path="/list-car"
              element={
                <PrivateRoute>
                  <ListCar />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-cars"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <ManageCars />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-bookings"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <ManageBookings />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-users"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <ManageUsers />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
        <Footer scrollProgress={scrollProgress} />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
