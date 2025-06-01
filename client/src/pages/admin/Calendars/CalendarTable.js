import React from "react";
import { Stack, Typography } from "@mui/material";
import DataTable from "../../../components/homeScreen/DataTable";

const CalendarTable = ({ calendars, search }) => {
  const headers = [
    { key: "year", label: "Ano" },
    { key: "type", label: "Tipo" },
    { key: "period", label: "Período" },
    { key: "startDate", label: "Data de início" },
    { key: "endDate", label: "Data de fim" },
  ];

  const renderMobileRow = (calendarItem) => (
    <Stack spacing={0.5}>
      <Typography>
        <strong>Ano:</strong> {calendarItem.year}
      </Typography>
      <Typography>
        <strong>Tipo:</strong> {calendarItem.type}
      </Typography>
      <Typography>
        <strong>Período:</strong> {calendarItem.period}
      </Typography>
      <Typography>
        <strong>Data de início:</strong> {calendarItem.startDate}
      </Typography>
      <Typography>
        <strong>Data de fim:</strong> {calendarItem.endDate}
      </Typography>
    </Stack>
  );

  return (
    <DataTable
      data={calendars}
      headers={headers}
      search={search}
      renderMobileRow={renderMobileRow}
    />
  );
};

export default CalendarTable;