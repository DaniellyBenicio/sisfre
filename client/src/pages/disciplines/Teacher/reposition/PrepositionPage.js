import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import SideBar from "../../../../components/SideBar";
import ClassReplacementList from './ClassReplacementList';

const ReplacementPage = ({ setAuthenticated }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <SideBar setAuthenticated={setAuthenticated} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <ClassReplacementList />
      </Box>
    </Box>
  );
};

export default ReplacementPage;