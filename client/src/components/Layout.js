import React from "react";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "./SideBar";

const Layout = ({ children, setAuthenticated, useRole }) => {
  return (
    <Box sx={{ display: "flex", width: "100%", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar setAuthenticated={setAuthenticated} useRole={useRole} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { xs: 0, sm: "240px" },
          mt: { xs: "64px", sm: 0 },
          width: "100%", // Garante que o main ocupe a largura disponível
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;