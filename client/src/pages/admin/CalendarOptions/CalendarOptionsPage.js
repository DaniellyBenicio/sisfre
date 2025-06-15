import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import SideBar from "../../../components/SideBar";
import CalendarOptionsList from './CalendarOptionsList';

const CalendarOptionsPage = ({ setAuthenticated }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <SideBar setAuthenticated={setAuthenticated} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <CalendarOptionsList />
      </Box>
    </Box>
  );
};

export default CalendarOptionsPage;