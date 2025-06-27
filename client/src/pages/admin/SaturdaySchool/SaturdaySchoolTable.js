import React from "react";
import { Stack, Typography, Box, CircularProgress } from "@mui/material";
import DataTable from "../../../components/homeScreen/DataTable";
import PropTypes from "prop-types";
import { format, parseISO } from "date-fns"; 
import { ptBR } from "date-fns/locale"; 

const SaturdaySchoolTable = ({ saturdaySchools, search, onUpdate, onDelete, setAlert, loading }) => {
  const normalizeString = (str) => str || "N/A";

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const dateObj = parseISO(dateString);
      return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar data para exibição:", dateString, error);
      return "Data Inválida"; 
    }
  };

  const formattedSaturdaySchools = saturdaySchools.map((saturdaySchool) => ({
    id: saturdaySchool.id,
    date: formatDateForDisplay(saturdaySchool.date), 
    dayOfWeek: normalizeString(saturdaySchool.dayOfWeek),
    calendar: normalizeString(saturdaySchool.calendar?.name),
  }));

  const headers = [
    { key: "date", label: "Data" },
    { key: "dayOfWeek", label: "Dia da Semana" },
    { key: "calendar", label: "Calendário" },
  ];

  const renderMobileRow = (saturdaySchool) => (
    <Stack spacing={0.5}>
      <Typography>
        {/* A data aqui já estará formatada por `formattedSaturdaySchools` */}
        <strong>Data:</strong> {saturdaySchool.date}
      </Typography>
      <Typography>
        <strong>Dia da Semana:</strong> {normalizeString(saturdaySchool.dayOfWeek)}
      </Typography>
      <Typography>
        <strong>Calendário:</strong> {normalizeString(saturdaySchool.calendar)}
      </Typography>
    </Stack>
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DataTable
      data={formattedSaturdaySchools}
      headers={headers}
      search={search}
      onUpdate={onUpdate}
      onDelete={onDelete}
      setAlert={setAlert}
      renderMobileRow={renderMobileRow}
    />
  );
};

SaturdaySchoolTable.propTypes = {
  saturdaySchools: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired, 
      dayOfWeek: PropTypes.string.isRequired,
      calendar: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      }),
    })
  ).isRequired,
  search: PropTypes.string,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  setAlert: PropTypes.func,
  loading: PropTypes.bool.isRequired,
};

export default SaturdaySchoolTable;