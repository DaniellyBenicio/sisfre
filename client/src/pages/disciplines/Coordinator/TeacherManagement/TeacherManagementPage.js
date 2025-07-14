import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import SideBar from "../../../../components/SideBar";
import TeacherManagementList from './TeacherManagementList'; 
const TeacherManagementPage = ({ setAuthenticated }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <SideBar setAuthenticated={setAuthenticated} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* Substitua ClassesList por TeacherList */}
        <TeacherManagementList /> 
      </Box>
    </Box>
  );
};

export default TeacherManagementPage;