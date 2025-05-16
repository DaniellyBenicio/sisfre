import React from "react";
import { Box, Typography } from "@mui/material";
import SideBar from "../components/SideBar.js";

export const MainScreen = ({ setAuthenticated }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <SideBar setAuthenticated={setAuthenticated} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Tela Principal
        </Typography>
        <Typography variant="body1">
          Bem-vindo à tela principal da sua aplicação.
        </Typography>
        {/* Adicione aqui qualquer conteúdo que você queira exibir na página principal */}
      </Box>
    </Box>
  );
};

export default MainScreen;
