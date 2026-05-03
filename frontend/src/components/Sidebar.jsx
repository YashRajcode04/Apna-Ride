import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const displayUser =
    user || JSON.parse(sessionStorage.getItem('userInfo') || '{"role": "user", "name": "User"}');
  const isAdmin = displayUser.role === 'admin';
  const isOwner = displayUser.role === 'owner';

  const userMenuItems = [
    { path: '/dashboard', icon: 'DB', label: 'Dashboard' },
    { path: '/my-bookings', icon: 'BK', label: 'My Bookings' },
    { path: '/list-car', icon: 'CR', label: 'Add Car' },
  ];

  const adminMenuItems = [
    { path: '/dashboard', icon: 'DB', label: 'Dashboard' },
    { path: '/manage-users', icon: 'US', label: 'Manage Users' },
    { path: '/manage-cars', icon: 'CR', label: 'Manage Cars' },
    { path: '/manage-bookings', icon: 'BK', label: 'Manage Bookings' },
    { path: '/list-car', icon: 'AD', label: 'Add Car' },
  ];

  const ownerMenuItems = [
    { path: '/dashboard', icon: 'DB', label: 'Dashboard' },
    { path: '/manage-cars', icon: 'CR', label: 'Manage Cars' },
    { path: '/manage-bookings', icon: 'BK', label: 'Manage Bookings' },
    { path: '/list-car', icon: 'AD', label: 'Add Car' },
  ];

  const menuItems = isAdmin ? adminMenuItems : (isOwner ? ownerMenuItems : userMenuItems);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="user-profile">
          <div className="user-avatar">
            {displayUser.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <h4>{displayUser.name || 'User'}</h4>
            <span className="user-role">{isAdmin ? 'Administrator' : 'User'}</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
