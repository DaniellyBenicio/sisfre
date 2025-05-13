import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router} from 'react-router-dom';
import './App.css';
import AppRoutes from './routes/Routes';
import { jwtDecode } from 'jwt-decode';

const App = () => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp > currentTime) {
          setAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          setAuthenticated(false);
        }

      } catch (err) {
        localStorage.removeItem('token');
        setAuthenticated(false);
      }
    }
  }, []);

  return (
    <Router>
      <AppRoutes
        isAuthenticated={isAuthenticated}
        setAuthenticated={setAuthenticated}
      />
    </Router>
  );
};

export default App;