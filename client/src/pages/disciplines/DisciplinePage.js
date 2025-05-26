import React from "react";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "../../components/SideBar";
import DisciplineList from "./DisciplineList";

const DisciplinePage = ({ setAuthenticated }) => {
	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<Sidebar setAuthenticated={setAuthenticated} />
			<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
				<DisciplineList />
			</Box>
		</Box>
	);
};

export default DisciplinePage;
