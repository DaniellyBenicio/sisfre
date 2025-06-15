
import React from "react";
import { Stack, Typography, IconButton } from "@mui/material";
import DataTable from "../../../components/homeScreen/DataTable";
import { Edit, Delete } from "@mui/icons-material";
import PropTypes from "prop-types";

const SaturdaySchoolTable = ({ saturdaySchools, search, onUpdate, onDelete, setAlert }) => {
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
    {
      key: "actions",
      label: "Ações",
      render: (row) => (
        <Stack direction="row" spacing={1}>
          {onUpdate && (
            <IconButton
              onClick={() => onUpdate(row)}
              sx={{ color: "#087619", "&:hover": { color: "#065412" } }}
            >
              <Edit />
            </IconButton>
          )}
          {onDelete && (
            <IconButton
              onClick={() => onDelete(row.id)}
              sx={{ color: "#F01424", "&:hover": { color: "#D4000F" } }}
            >
              <Delete />
            </IconButton>
          )}
        </Stack>
      ),
    },
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
      <Stack direction="row" spacing={1}>
        {onUpdate && (
          <IconButton
            onClick={() => onUpdate(saturdaySchool)}
            sx={{ color: "#087619", "&:hover": { color: "#065412" } }}
          >
            <Edit />
          </IconButton>
        )}
        {onDelete && (
          <IconButton
            onClick={() => onDelete(saturdaySchool.id)}
            sx={{ color: "#F01424", "&:hover": { color: "#D4000F" } }}
          >
            <Delete />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );

  return (
    <DataTable
      data={formattedSaturdaySchools}
      headers={headers}
      search={search}
      renderMobileRow={renderMobileRow}
      onUpdate={onUpdate}
      onDelete={onDelete}
      setAlert={setAlert}
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
};

export default SaturdaySchoolTable;