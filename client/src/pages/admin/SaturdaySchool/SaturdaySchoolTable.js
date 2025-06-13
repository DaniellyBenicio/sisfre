import React from "react";
import { Stack, Typography, IconButton } from "@mui/material";
import DataTable from "../../../components/homeScreen/DataTable";
import { Edit } from "@mui/icons-material";

const SaturdaySchoolTable = ({ saturdaySchools, search, onEdit }) => {
  const headers = [
    { key: "date", label: "Data" },
    { key: "dayOfWeek", label: "Dia da Semana" },
  ];

  const renderMobileRow = (saturdaySchool) => (
    <Stack spacing={0.5}>
      <Typography>
        <strong>Data:</strong> {saturdaySchool.date}
      </Typography>
      <Typography>
        <strong>Dia da Semana:</strong> {saturdaySchool.dayOfWeek}
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
      data={saturdaySchools}
      headers={headers}
      search={search}
      renderMobileRow={renderMobileRow}
      onUpdate={onEdit}
    />
  );
};

export default SaturdaySchoolTable;