import React from 'react';
import { Box } from '@mui/material';
import SideBar from '../components/SideBar.js'

export const MainScreen = () => {
  return (
    <Box>
      <SideBar />

      <div className="App">
      <h1>Hello World React</h1>
      </div>

    </Box>
  );
};

export default MainScreen; 