import React from "react";
import { Stack, Typography } from "@mui/material";
import DataTable from "../../../components/homeScreen/DataTable";

const CalendarTable = ({ calendars, search, onEdit, onDelete }) => {
  const formattedCalendars = calendars.map((calendar) => ({
    ...calendar,
    yearPeriod: `${calendar.year}.${calendar.period}`,
  }));

  const headers = [
    { key: "yearPeriod", label: "Ano/Período" },
    { key: "type", label: "Tipo" },
    { key: "startDate", label: "Data de início" },
    { key: "endDate", label: "Data de fim" },
  ];

  const renderMobileRow = (calendarItem) => (
    <Stack spacing={0.5}>
      <Typography>
        <strong>Ano/Período:</strong> {calendarItem.yearPeriod}
      </Typography>
      <Typography>
        <strong>Tipo:</strong> {calendarItem.type}
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
      data={formattedCalendars}
      headers={headers}
      search={search}
      renderMobileRow={renderMobileRow}
      onUpdate={onEdit} 
      onDelete={onDelete} 
    />
  );
};

export default CalendarTable;