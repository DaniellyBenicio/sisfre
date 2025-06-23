import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from "../../../../components/SideBar";
import ClassesTeacher from './ClassesTeacher';

const ClassOptionsPage = ({ setAuthenticated }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar setAuthenticated={setAuthenticated} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <ClassesTeacher />
      </Box>
    </Box>
  );
};

export default ClassOptionsPage;