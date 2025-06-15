import React from "react";
import { Stack, Typography, IconButton } from "@mui/material";
import DataTable from "../../../components/homeScreen/DataTable";
import { Edit } from "@mui/icons-material";
import PropTypes from 'prop-types';

const ClassesTable = ({ classes, search, onEdit }) => {
  const headers = [
    { key: "course", label: "Curso" },
    { key: "semester", label: "Semestre" },
  ];

  // Transforma os dados para o DataTable, "achatanado" course em course.name
  const transformedClasses = classes.map(classItem => ({
    ...classItem,
    course: classItem.course?.name || "N/A", // Usa course.name e adiciona fallback
  }));

  const renderMobileRow = (classItem) => (
    <Stack spacing={0.5}>
      <Typography>
        <strong>Curso:</strong> {classItem.course?.name || "N/A"}
      </Typography>
      <Typography>
        <strong>Semestre:</strong> {classItem.semester}
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
      data={transformedClasses} // Usa os dados transformados
      headers={headers}
      search={search}
      renderMobileRow={renderMobileRow}
      onUpdate={onEdit}
    />
  );
};

// Adiciona PropTypes para validação
ClassesTable.propTypes = {
  classes: PropTypes.arrayOf(
    PropTypes.shape({
      course: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }).isRequired,
      semester: PropTypes.string.isRequired,
    })
  ).isRequired,
  search: PropTypes.string,
  onEdit: PropTypes.func,
};

export default ClassesTable;