import React from "react";
import { IconButton, Stack, Typography } from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Tables from "../../../components/homeScreen/Tables";

const TeacherAbsencesTable = ({ frequencies, search, isFiltered }) => {
  const navigate = useNavigate();

  const formattedFrequencies = frequencies;

  const handleView = (item) => {
    console.log("Item selecionado:", item);
    if (!item.professor_id) {
      console.error("professor_id não encontrado no item:", item);
      return;
    }
    navigate(`/teacher-absences/details/${item.professor_id}`);
  };

  const headers = [
    { key: "teacher", label: "Professor(a)" },
    { key: "count", label: "Faltas" },
  ];

  const safeData = Array.isArray(formattedFrequencies) ? formattedFrequencies : [];

  const renderMobileRow = (item) => (
    <Stack spacing={0.5}>
      {headers.map((header) => (
        <Typography key={header.key}>
          <strong>{header.label}:</strong> {item[header.key] || "N/A"}
        </Typography>
      ))}
    </Stack>
  );

  const renderActions = (item) => (
    <IconButton
      onClick={() => handleView(item)}
      sx={{
        color: "#666666",
        "&:hover": {
          color: "#535252",
        },
      }}
    >
      <Visibility />
    </IconButton>
  );

  return (
    <Tables
      data={safeData}
      headers={headers}
      search={search}
      isFiltered={isFiltered}
      renderMobileRow={renderMobileRow}
      renderActions={renderActions}
      showActions={true}
    />
  );
};

TeacherAbsencesTable.propTypes = {
  frequencies: PropTypes.array.isRequired,
  search: PropTypes.string,
  isFiltered: PropTypes.bool,
};

export default TeacherAbsencesTable;