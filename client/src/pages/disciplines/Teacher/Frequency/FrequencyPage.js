import React from "react";
import { Box, CssBaseline } from "@mui/material";
import SideBar from "../../../../components/SideBar";
import FrequencyList from "./FrequencyList";

const FrequencyPage = ({ setAuthenticated }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <SideBar setAuthenticated={setAuthenticated} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <FrequencyList />
      </Box>
    </Box>
  );
};

export default FrequencyPage;