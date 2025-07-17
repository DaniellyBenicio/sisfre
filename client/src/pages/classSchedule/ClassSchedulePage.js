import { Box, CssBaseline, Typography } from "@mui/material";
import Sidebar from "../../components/SideBar";
import ClassScheduleList from "./Coodinator/ClassScheduleList";
import ClassScheduleListAll from "./Admin/ClassScheduleListAll";
import { useNavigate } from "react-router-dom";

const ClassSchedulePage = ({ setAuthenticated }) => {
	const navigate = useNavigate();
	const accessType = localStorage.getItem("accessType") || "";

	if (!["Coordenador", "Admin"].includes(accessType)) {
		navigate("/login");
		return null;
	}

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<Sidebar setAuthenticated={setAuthenticated} />
			<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
				{accessType === "Coordenador" ? (
					<ClassScheduleList />
				) : accessType === "Admin" ? (
					<ClassScheduleListAll setAuthenticated={setAuthenticated} />
				) : (
					<Typography variant="h6" color="error" align="center">
						Acesso negado: Tipo de usuário inválido.
					</Typography>
				)}
			</Box>
		</Box>
	);
};

export default ClassSchedulePage;