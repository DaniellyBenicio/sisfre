import React from "react";
import { Stack, Typography } from "@mui/material";
import DataTable from "../../../components/homeScreen/DataTable";

const ClassesTable = ({ classes, search }) => {
  const headers = [
    { key: "year", label: "Ano" },
    { key: "course", label: "Curso" },
    { key: "type", label: "Tipo" },
    { key: "semester", label: "Semestre" },
  ];

  const renderMobileRow = (classItem) => (
    <Stack spacing={0.5}>
      <Typography>
        <strong>Ano:</strong> {classItem.year}
      </Typography>
      <Typography>
        <strong>Curso:</strong> {classItem.course}
      </Typography>
      <Typography>
        <strong>Tipo:</strong> {classItem.type}
      </Typography>
      <Typography>
        <strong>Semestre:</strong> {classItem.semester}
      </Typography>
    </Stack>
  );

  return (
    <DataTable
      data={classes}
      headers={headers}
      search={search}
      renderMobileRow={renderMobileRow}
    />
  );
};

export default ClassesTable;