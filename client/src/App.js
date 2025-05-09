import React, { useState } from 'react';
import { BrowserRouter as Router} from 'react-router-dom';
import './App.css';
import AppRoutes from "./routes/Routes";

const App = () => {
  const [isAuthenticated, setAuthenticated] = useState(!!localStorage.getItem('token'))

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