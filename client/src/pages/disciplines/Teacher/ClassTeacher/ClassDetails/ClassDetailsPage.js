import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from "../../../../../components/SideBar";
import ClassDetails from './ClassDetailsList';

const ClassDetailsPage = ({ setAuthenticated }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar setAuthenticated={setAuthenticated} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <ClassDetails />
      </Box>
    </Box>
  );
};

export default ClassDetailsPage;