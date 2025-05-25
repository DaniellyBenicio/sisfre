import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import SideBar from "../../../components/SideBar";
import ClassesList from './ClassesList';

const ClassesPages = ({ setAuthenticated }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <SideBar setAuthenticated={setAuthenticated} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <ClassesList />
      </Box>
    </Box>
  );
};

export default ClassesPages;