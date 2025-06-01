import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import SearchAndCreateBar from "../../../components/homeScreen/SearchAndCreateBar";
import api from "../../../service/api";
import CalendarTable from "./CalendarTable";

const CalendarList = () => {
  const [calendars, setCalendars] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate(); // Hook para navegação

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      const response = await api.get("/calendar/all");
      console.log("CalendarList - Resposta da API:", response.data);
      if (!response.data || !Array.isArray(response.data.calendars)) {
        throw new Error("Erro ao buscar calendários: Dados inválidos");
      }
      setCalendars(response.data.calendars);
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
    // Redirecionar para a página de cadastro de calendário
    navigate("/calendar/create");
  };

  const filteredCalendars = Array.isArray(calendars)
    ? calendars.filter((calendarItem) => {
        const normalizedSearch = search
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const normalizedTitle =
          calendarItem.title
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") || "";

        return normalizedTitle.includes(normalizedSearch);
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
        createButtonLabel="Cadastrar Calendário" // Adicionar o rótulo do botão
        onCreateClick={handleCreateClick} // Passar a função de clique
      />
      <CalendarTable calendars={filteredCalendars} search={search} />
    </Box>
  );
};

export default CalendarList;