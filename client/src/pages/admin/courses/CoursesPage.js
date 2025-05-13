import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import SideBar from "../../../components/SideBar";
import CourseList from './CourseList';

const CoursePage = ({ setAuthenticated }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <SideBar setAuthenticated={setAuthenticated} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <CourseList />
      </Box>
    </Box>
  );
};

export default CoursePage;
