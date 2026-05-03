import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  if (!user) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin') {
    toast.error('You do not have permission to access this page');
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;
