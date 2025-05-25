import { Stack, Typography } from "@mui/material";
import DataTable from "../../../components/homeScreen/DataTable";

const CoursesTable = ({ courses, onDelete, onUpdate, search }) => {
  const capitalizeOnlyFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const formattedCourses = courses.map((course) => ({
    ...course,
    type: capitalizeOnlyFirst(course.type),
  }));

  const headers = [
    { key: "acronym", label: "Sigla" },
    { key: "name", label: "Nome" },
    { key: "type", label: "Tipo" },
    { key: "coordinatorName", label: "Coordenador" },
  ];

  const renderMobileRow = (course) => (
    <Stack spacing={0.5}>
      <Typography>
        <strong>Sigla:</strong> {course.acronym}
      </Typography>
      <Typography>
        <strong>Nome:</strong> {course.name}
      </Typography>
      <Typography>
        <strong>Tipo:</strong> {capitalizeOnlyFirst(course.type)}
      </Typography>
      <Typography>
        <strong>Coordenador:</strong> {course.coordinatorName}
      </Typography>
    </Stack>
  );

  return (
    <DataTable
      data={formattedCourses}
      headers={headers}
      onDelete={onDelete}
      onUpdate={onUpdate}
      search={search}
      renderMobileRow={renderMobileRow}
    />
  );
};

export default CoursesTable;