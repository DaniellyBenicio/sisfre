
import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import SearchAndCreateBar from "../../../components/homeScreen/SearchAndCreateBar";
import api from "../../../service/api";
import SaturdaySchoolTable from "./SaturdaySchoolTable";
import SaturdaySchoolFormDialog from "../../../components/SaturdaySchoolForm/SaturdaySchoolFormDialog";

// Função para formatar o tipo de calendário
const formatCalendarType = (type) => {
  if (!type) return "Desconhecido";
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

const SaturdaySchoolList = () => {
  const [saturdaySchools, setSaturdaySchools] = useState([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [saturdaySchoolToEdit, setSaturdaySchoolToEdit] = useState(null);

  useEffect(() => {
    fetchSaturdaySchools();
  }, []);

  const fetchSaturdaySchools = async () => {
    try {
      const response = await api.get("/school-saturdays/all");
      console.log("SaturdaySchoolList - API Response:", response.data);
      if (!response.data || !Array.isArray(response.data.schoolSaturdays)) {
        throw new Error("Error fetching Saturday schools: Invalid data");
      }
      // Normaliza os dados para incluir o campo calendar
      const normalizedSaturdaySchools = response.data.schoolSaturdays.map((item) => ({
        ...item,
        calendar: item.calendarSaturdays?.[0]
          ? {
              id: item.calendarSaturdays[0].id,
              name: `${item.calendarSaturdays[0].year}.${item.calendarSaturdays[0].period} - ${formatCalendarType(item.calendarSaturdays[0].type)}`,
            }
          : { id: item.calendarId, name: "Desconhecido" },
      }));
      setSaturdaySchools(normalizedSaturdaySchools);
    } catch (error) {
      console.error("Error fetching Saturday schools:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Error data:", error.response.data);
      }
      setSaturdaySchools([]);
    }
  };

  const handleRegisterOrUpdateSuccess = (updatedSaturdaySchool, isEditMode) => {
    if (isEditMode) {
      setSaturdaySchools((prev) =>
        prev.map((s) => (s.id === updatedSaturdaySchool.id ? updatedSaturdaySchool : s))
      );
    } else {
      setSaturdaySchools((prev) => [...prev, updatedSaturdaySchool]);
    }
    setOpenDialog(false);
    setSaturdaySchoolToEdit(null);
  };

  const handleEdit = (saturdaySchool) => {
    setSaturdaySchoolToEdit(saturdaySchool);
    setOpenDialog(true);
  };

  const filteredSaturdaySchools = Array.isArray(saturdaySchools)
    ? saturdaySchools.filter((saturdaySchool) => {
        const normalizedSearch = search
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const normalizedDayOfWeek =
          saturdaySchool.dayOfWeek
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") || "";

        const normalizedDate =
          saturdaySchool.date
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") || "";

        const normalizedCalendar =
          saturdaySchool.calendar?.name
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") || "";

        return (
          normalizedDayOfWeek.includes(normalizedSearch) ||
          normalizedDate.includes(normalizedSearch) ||
          normalizedCalendar.includes(normalizedSearch)
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
          setSaturdaySchoolToEdit(null);
          setOpenDialog(true);
        }}
      />
      <SaturdaySchoolTable
        saturdaySchools={filteredSaturdaySchools}
        search={search}
        onEdit={handleEdit}
      />
      <SaturdaySchoolFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSaturdaySchoolToEdit(null);
        }}
        saturdaySchoolToEdit={saturdaySchoolToEdit}
        onSubmitSuccess={handleRegisterOrUpdateSuccess}
        isEditMode={!!saturdaySchoolToEdit}
      />
    </Box>
  );
};

export default SaturdaySchoolList;