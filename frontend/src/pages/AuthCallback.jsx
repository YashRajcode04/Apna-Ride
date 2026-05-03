import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API from '../utils/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { socialLogin } = useContext(AuthContext);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');

        if (error) {
          toast.error('Social login failed. Please try again.');
          navigate('/login');
          return;
        }

        if (accessToken && refreshToken) {
          const response = await API.get('/auth/profile', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          socialLogin(accessToken, refreshToken, response?.data?.data);
          toast.success('Login successful. Welcome.');
          navigate('/');
        } else {
          throw new Error('Missing tokens');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, socialLogin]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #000',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ fontSize: '18px', color: '#666' }}>Completing authentication...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;
