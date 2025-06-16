import { Box, CssBaseline } from "@mui/material";
import Sidebar from "../../components/SideBar";
import MainScreen from "../../pages/MainScreen";
import ClassScheduleList from "./Coodinator/ClassScheduleList";

const ClassSchedulePage = ({ setAuthenticated }) => {
	const accessType = localStorage.getItem("accessType");

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<Sidebar setAuthenticated={setAuthenticated} />
			<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
				<ClassScheduleList />
			</Box>
		</Box>
	);
};

export default ClassSchedulePage;