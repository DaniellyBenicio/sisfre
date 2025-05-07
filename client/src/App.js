import React from 'react';
import { BrowserRouter as Router} from 'react-router-dom';
import './App.css';
import AppRoutes from "./routes/Routes";

function App() {

    return (
      <Router>
        <div className="App">
            <AppRoutes />
        </div>
      </Router>
    );
}

export default App;