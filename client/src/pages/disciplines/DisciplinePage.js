import React from "react";
import { Box, CssBaseline, Typography } from "@mui/material";
import Sidebar from "../../components/SideBar";
import DisciplineList from "./Admin/DisciplineList";
import DisciplineCoordinator from "./Coordinator/DisciplineCoordinator";
import DisciplinesTeacher from "./Teacher/DisciplinesTeacher";

const DisciplinePage = ({ setAuthenticated }) => {
  const accessType = localStorage.getItem("accessType");

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Sidebar setAuthenticated={setAuthenticated} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {accessType === "Admin" ? (
          <DisciplineList />
        ) : accessType === "Coordenador" ? (
          <DisciplineCoordinator />
        ) : accessType === "Professor" ? (
          <DisciplinesTeacher />
        ) : (
          <Typography variant="h6" color="error" align="center">
            Acesso negado: Tipo de usuário inválido.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default DisciplinePage;