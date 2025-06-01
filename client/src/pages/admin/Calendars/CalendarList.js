import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import SearchAndCreateBar from "../../../components/homeScreen/SearchAndCreateBar";
import api from "../../../service/api";
import CalendarTable from "./CalendarTable";
import CalendarRegistrationPopup from "./CalendarRegistrationPopup";
import CalendarUpdatePopup from "./CalendarUpdatePopup";
import CalendarDelete from "./CalendarDelete";

const CalendarList = () => {
  const [calendars, setCalendars] = useState([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [calendarToEdit, setCalendarToEdit] = useState(null);
  const [calendarToDelete, setCalendarToDelete] = useState(null);

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      const response = await api.get("/calendar");
      console.log("CalendarList - Resposta da API:", response.data);
     
      const calendarData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.calendars)
        ? response.data.calendars
        : [];
      setCalendars(calendarData);
    } catch (error) {
      console.error("Erro ao buscar calendários:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Dados do erro:", error.response.data);
      }
      setCalendars([]);
    }
  };

  const handleCreateClick = () => {
    setOpenDialog(true); 
  };

  const handleDialogClose = () => {
    setOpenDialog(false); 
  };

  const handleEditClick = (calendar) => {
    setCalendarToEdit(calendar);
    setOpenEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setCalendarToEdit(null);
  };

  const handleDeleteClick = (calendar) => {
    setCalendarToDelete(calendar);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setCalendarToDelete(null);
  };

  const handleSubmitSuccess = (newCalendar, isEdit) => {
    if (isEdit) {
      setCalendars(
        calendars.map((c) => (c.id === newCalendar.id ? newCalendar : c))
      );
    } else {
      setCalendars([...calendars, newCalendar]);
    }
    handleDialogClose();
  };

  const handleUpdateSuccess = (updatedCalendar) => {
    setCalendars(
      calendars.map((c) => (c.id === updatedCalendar.id ? updatedCalendar : c))
    );
    handleEditDialogClose();
  };

  const handleDeleteSuccess = (calendarId) => {
    setCalendars(calendars.filter((c) => c.id !== calendarId));
    handleDeleteDialogClose();
  };

  const filteredCalendars = Array.isArray(calendars)
    ? calendars.filter((calendarItem) => {
        const normalizedSearch = search
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const normalizedYear = calendarItem.year
          ?.toString()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") || "";
        const normalizedType = calendarItem.type
          ?.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") || "";

        return (
          normalizedYear.includes(normalizedSearch) ||
          normalizedType.includes(normalizedSearch)
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
        Calendário
      </Typography>
      <SearchAndCreateBar
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        createButtonLabel="Cadastrar Calendário"
        onCreateClick={handleCreateClick}
      />
      <CalendarTable
        calendars={filteredCalendars}
        search={search}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />
      <CalendarRegistrationPopup
        open={openDialog}
        onClose={handleDialogClose}
        onRegister={handleSubmitSuccess}
      />
      <CalendarUpdatePopup
        open={openEditDialog}
        onClose={handleEditDialogClose}
        calendar={calendarToEdit}
        onUpdate={handleUpdateSuccess}
      />
      <CalendarDelete
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
        calendarId={calendarToDelete?.id}
        calendarName={calendarToDelete ? `${calendarToDelete.type} ${calendarToDelete.year}-${calendarToDelete.period}` : ''}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </Box>
  );
};

export default CalendarList;