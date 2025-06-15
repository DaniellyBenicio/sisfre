import React from "react";
import { Box, CssBaseline } from "@mui/material";
import SideBar from "../../../components/SideBar";
import ClassOptionsList from "./ClassOptionsList";

const ClassOptionsPage = ({ setAuthenticated }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <SideBar setAuthenticated={setAuthenticated} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <ClassOptionsList />
      </Box>
    </Box>
  );
};

export default ClassOptionsPage;
