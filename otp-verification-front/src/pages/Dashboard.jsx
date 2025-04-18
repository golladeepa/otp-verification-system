import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Title = styled.h2`
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  text-align: center;
`;

const WelcomeMessage = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #3498db;
`;

const Text = styled.p`
  color: #34495e;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0.5rem 0;
`;

const StrongText = styled.strong`
  color: #2980b9;
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  background: #fde8e8;
  padding: 1rem;
  border-radius: 6px;
  margin: 1rem 0;
`;

const LogoutButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 200px;

  &:hover {
    background: #c0392b;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/protected', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUser(response.data.user);
      } catch (err) {
        setError(err.response?.data?.message || 'Unauthorized');
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchProtectedData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <DashboardContainer>
      <Title>Dashboard</Title>
      {user && (
        <WelcomeMessage>
          <Text>Welcome, <StrongText>{user.email}</StrongText>!</Text>
          <Text>You have successfully logged in to the system.</Text>
        </WelcomeMessage>
      )}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <LogoutButton onClick={handleLogout}>
        Logout
      </LogoutButton>
    </DashboardContainer>
  );
};

export default Dashboard;