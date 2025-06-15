
import React from "react";
import { Stack, Typography, IconButton } from "@mui/material";
import DataTable from "../../../components/homeScreen/DataTable";
import { Edit } from "@mui/icons-material";

const SaturdaySchoolTable = ({ saturdaySchools, search, onEdit }) => {
  const normalizeString = (str) => {
    if (!str) return "N/A";
    return str;
  };

  const formattedSaturdaySchools = saturdaySchools.map((saturdaySchool) => ({
    ...saturdaySchool,
    date: normalizeString(saturdaySchool.date),
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
        <strong>Data:</strong> {normalizeString(saturdaySchool.date)}
      </Typography>
      <Typography>
        <strong>Dia da Semana:</strong> {normalizeString(saturdaySchool.dayOfWeek)}
      </Typography>
      <Typography>
        <strong>Calendário:</strong> {normalizeString(saturdaySchool.calendar)}
      </Typography>
      {onEdit && (
        <IconButton
          onClick={() => onEdit(saturdaySchool)}
          sx={{ color: "#087619", "&:hover": { color: "#065412" } }}
        >
          <Edit />
        </IconButton>
      )}
    </Stack>
  );

  return (
    <DataTable
      data={formattedSaturdaySchools}
      headers={headers}
      search={search}
      renderMobileRow={renderMobileRow}
      onUpdate={onEdit}
    />
  );
};

export default SaturdaySchoolTable;