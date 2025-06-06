import React from "react";
import { Stack, Typography, IconButton } from "@mui/material";
import DataTable from "../../../components/homeScreen/DataTable";
import { Edit } from "@mui/icons-material";

const ClassesTable = ({ classes, search, onEdit }) => {
  const headers = [
    { key: "course", label: "Curso" },
    { key: "year", label: "Ano" },
    { key: "period", label: "Período" },
    { key: "shift", label: "Turno" }, // Added shift (turno)
    { key: "semester", label: "Semestre" },
    { key: "type", label: "Tipo" },
  ];

  const renderMobileRow = (classItem) => (
    <Stack spacing={0.5}>
      <Typography>
        <strong>Curso:</strong> {classItem.course}
      </Typography>
      <Typography>
        <strong>Ano:</strong> {classItem.year}
      </Typography>
      <Typography>
        <strong>Período:</strong> {classItem.period}
      </Typography>
      <Typography>
        <strong>Turno:</strong> {classItem.shift} {/* Added shift display */}
      </Typography>
      <Typography>
        <strong>Semestre:</strong> {classItem.semester}
      </Typography>
      <Typography>
        <strong>Tipo:</strong> {classItem.type}
      </Typography>
      {onEdit && (
        <IconButton
          onClick={() => onEdit(classItem)}
          sx={{ color: "#087619", "&:hover": { color: "#065412" } }}
        >
          <Edit />
        </IconButton>
      )}
    </Stack>
  );

  return (
    <DataTable
      data={classes}
      headers={headers}
      search={search}
      renderMobileRow={renderMobileRow}
      onUpdate={onEdit}
    />
  );
};

export default ClassesTable;