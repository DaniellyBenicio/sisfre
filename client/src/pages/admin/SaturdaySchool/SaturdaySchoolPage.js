import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import SideBar from "../../../components/SideBar";
import SaturdaySchoolList from './SaturdaySchoolList';

const SaturdaySchoolPage = ({ setAuthenticated }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <SideBar setAuthenticated={setAuthenticated} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <SaturdaySchoolList />
      </Box>
    </Box>
  );
};

export default SaturdaySchoolPage;