import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import SearchAndCreateBar from "../../../components/homeScreen/SearchAndCreateBar";
import api from "../../../service/api";
import SaturdaySchoolTable from "./SaturdaySchoolTable";

const SaturdaySchoolList = () => {
  const [saturdaySchools, setSaturdaySchools] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSaturdaySchools();
  }, []);

  const fetchSaturdaySchools = async () => {
    try {
      const response = await api.get("/saturday-schools/all"); // Adjust the API endpoint as needed
      console.log("SaturdaySchoolList - API Response:", response.data);
      if (!response.data || !Array.isArray(response.data.saturdaySchools)) {
        throw new Error("Error fetching Saturday schools: Invalid data");
      }
      setSaturdaySchools(response.data.saturdaySchools);
    } catch (error) {
      console.error("Error fetching Saturday schools:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Error data:", error.response.data);
      }
      setSaturdaySchools([]);
    }
  };

  const filteredSaturdaySchools = Array.isArray(saturdaySchools)
    ? saturdaySchools.filter((saturdaySchool) => {
        const normalizedSearch = search
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        // Adjust these fields based on your Saturday school data structure
        const normalizedDescription =
          saturdaySchool.description
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") || "";

        const normalizedDate =
          saturdaySchool.date
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") || "";

        return (
          normalizedDescription.includes(normalizedSearch) ||
          normalizedDate.includes(normalizedSearch)
        );
      })
    : [];

  return (
    <Box
      padding={3}
      sx={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ mt: 2, mb: 2, fontWeight: "bold" }}
      >
        Sábados Letivos
      </Typography>
      <SearchAndCreateBar
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        createButtonLabel="Cadastrar Sábado Letivo"
        onCreateClick={() => {
          // Placeholder for opening a dialog or form in the future
          console.log("Create Saturday School clicked");
        }}
      />
      <SaturdaySchoolTable
        saturdaySchools={filteredSaturdaySchools}
        search={search}
      />
    </Box>
  );
};

export default SaturdaySchoolList;