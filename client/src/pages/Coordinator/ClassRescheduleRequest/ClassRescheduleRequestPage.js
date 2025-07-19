import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import SideBar from "../../../components/SideBar";
import ClassRescheduleRequestList from './ClassRescheduleRequestList';

const ClassRescheduleRequestPage = ({ setAuthenticated }) => {
	return (
		<Box sx={{ display: 'flex' }}>
			<CssBaseline />
			<SideBar setAuthenticated={setAuthenticated} />
			<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
				<ClassRescheduleRequestList /> 
			</Box>
		</Box>
	);
};

export default ClassRescheduleRequestPage;