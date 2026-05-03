import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import API from '../utils/api';
import { toast } from 'react-toastify';
import './ManageUsers.css';

const USERS_PER_PAGE = 10;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers(search, page);
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers(search, 1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = async (searchValue = '', pageValue = 1) => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/users', {
        params: {
          search: searchValue || undefined,
          page: pageValue,
          limit: USERS_PER_PAGE,
        },
      });
      setUsers(data.data || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
      setUsers([]);
      setPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role });
      toast.success('User role updated successfully');
      setUsers((prev) => prev.map((item) => (item._id === userId ? { ...item, role } : item)));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await API.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      setUsers((prev) => prev.filter((item) => item._id !== userId));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(search, 1);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="manage-users-content">
        <div className="page-header">
          <h1>Manage Users</h1>
          <p>View, search, update roles and remove platform users</p>
        </div>

        <form className="users-search" onSubmit={onSearchSubmit}>
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="users-summary">{total} users found</div>

        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Provider</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name || 'N/A'}</td>
                    <td>{item.email || 'N/A'}</td>
                    <td>{item.authProvider || 'local'}</td>
                    <td>
                      <select
                        value={item.role}
                        onChange={(e) => handleRoleChange(item._id, e.target.value)}
                      >
                        <option value="user">user</option>
                        <option value="owner">owner</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-delete" onClick={() => handleDelete(item._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="6" className="loading-state">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pages > 1 && (
          <div className="pagination">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(pages, prev + 1))}
              disabled={page === pages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
