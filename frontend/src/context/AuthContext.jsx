import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Use same-origin API paths so auth always goes through the Vite proxy.
axios.defaults.baseURL = '';

// Axios interceptor for auto token refresh
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';

    // Never run refresh logic for auth endpoints themselves.
    const isAuthEndpoint = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/otp/request',
      '/api/auth/otp/verify',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/refresh-token',
    ].some((path) => requestUrl.includes(path));

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for token refresh
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axios(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = sessionStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh-token', {
            refreshToken,
          });
          
          const newAccessToken = data.data.accessToken;
          const newRefreshToken = data.data.refreshToken;
          
          sessionStorage.setItem('accessToken', newAccessToken);
          sessionStorage.setItem('refreshToken', newRefreshToken);
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          isRefreshing = false;
          onRefreshed(newAccessToken);
          
          return axios(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          // Refresh failed, clear tokens and let caller handle navigation.
          sessionStorage.clear();
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const initAuth = () => {
      const accessToken = sessionStorage.getItem('accessToken');
      const userInfo = sessionStorage.getItem('userInfo');
      
      if (accessToken && userInfo) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        setUser(JSON.parse(userInfo));
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // ===== TRADITIONAL EMAIL/PASSWORD LOGIN =====
  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    
    setUser(data.data.user);
    sessionStorage.setItem('userInfo', JSON.stringify(data.data.user));
    sessionStorage.setItem('accessToken', data.data.accessToken);
    sessionStorage.setItem('refreshToken', data.data.refreshToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.data.accessToken}`;
    
    return data;
  };

  // ===== TRADITIONAL EMAIL/PASSWORD REGISTER =====
  const register = async (name, email, password, phone) => {
    const { data } = await axios.post('/api/auth/register', {
      name,
      email,
      password,
      phone,
    });
    
    setUser(data.data.user);
    sessionStorage.setItem('userInfo', JSON.stringify(data.data.user));
    sessionStorage.setItem('accessToken', data.data.accessToken);
    sessionStorage.setItem('refreshToken', data.data.refreshToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.data.accessToken}`;
    
    return data;
  };

  // ===== OTP REQUEST =====
  const requestOTP = async (phone, method = 'sms') => {
    const { data } = await axios.post('/api/auth/otp/request', { phone, method });
    return data;
  };

  // ===== OTP VERIFY =====
  const verifyOTP = async (phone, otp) => {
    const { data } = await axios.post('/api/auth/otp/verify', { phone, otp });
    
    setUser(data.data.user);
    sessionStorage.setItem('userInfo', JSON.stringify(data.data.user));
    sessionStorage.setItem('accessToken', data.data.accessToken);
    sessionStorage.setItem('refreshToken', data.data.refreshToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.data.accessToken}`;
    
    return data;
  };

  // ===== SOCIAL LOGIN (Handle OAuth callback) =====
  const socialLogin = (accessToken, refreshToken, userInfo) => {
    setUser(userInfo);
    sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  };

  // ===== FORGOT PASSWORD =====
  const forgotPassword = async (email) => {
    const { data } = await axios.post('/api/auth/forgot-password', { email });
    return data;
  };

  // ===== RESET PASSWORD =====
  const resetPassword = async (token, password) => {
    const { data } = await axios.put(`/api/auth/reset-password/${token}`, { password });
    return data;
  };

  // ===== CHANGE PASSWORD =====
  const changePassword = async (currentPassword, newPassword) => {
    const { data } = await axios.put('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  };

  // ===== UPDATE PROFILE =====
  const updateProfile = async (profileData) => {
    const { data } = await axios.put('/api/auth/profile', profileData);
    setUser(data.data);
    sessionStorage.setItem('userInfo', JSON.stringify(data.data));
    return data;
  };

  // ===== LOGOUT =====
  const logout = async () => {
    try {
      const refreshToken = sessionStorage.getItem('refreshToken');
      await axios.post('/api/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    sessionStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
  };

  // ===== LOGOUT ALL DEVICES =====
  const logoutAllDevices = async () => {
    await axios.post('/api/auth/logout-all');
    setUser(null);
    sessionStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
  };

  // ===== GET ACTIVE SESSIONS =====
  const getActiveSessions = async () => {
    const { data } = await axios.get('/api/auth/sessions');
    return data;
  };

  // ===== RESEND VERIFICATION EMAIL =====
  const resendVerification = async (email) => {
    const { data } = await axios.post('/api/auth/resend-verification', { email });
    return data;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    logoutAllDevices,
    requestOTP,
    verifyOTP,
    socialLogin,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    getActiveSessions,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
