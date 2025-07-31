import { Stack, Typography, IconButton } from "@mui/material";
import { Visibility, AccessTime } from '@mui/icons-material';
import Tables from "../../../components/homeScreen/Tables";

const TeacherManagementTable = ({ teachers, onView, onUpdate, search, showActions, loading }) => {
  const accessType = localStorage.getItem("accessType") || "";

  const headers = [
    { key: "acronym", label: "Sigla" },
    { key: "name", label: "Nome" },
    { key: "email", label: "E-mail" },
    { key: "absences", label: "Faltas" },
  ];

  const renderMobileRow = (teacher) => (
    <Stack spacing={0.5}>
      <Typography>
        <strong>Sigla:</strong> {teacher.acronym}
      </Typography>
      <Typography>
        <strong>Nome:</strong> {teacher.name}
      </Typography>
      <Typography>
        <strong>E-mail:</strong> {teacher.email}
      </Typography>
      <Typography>
        <strong>Faltas:</strong> {teacher.absences}
      </Typography>
    </Stack>
  );

  const renderActions = (teacher) => (
    <>
      <IconButton
        onClick={() => onView(teacher.id)}
        sx={{ color: "#087619", "&:hover": { color: "#065412" } }}
      >
        <AccessTime />
      </IconButton>
    </>
  );

  return (
    <Tables
      data={teachers}
      headers={headers}
      onUpdate={onUpdate}
      search={search}
      renderMobileRow={renderMobileRow}
      renderActions={renderActions}
      showActions={showActions}
      loading={loading}
    />
  );
};

export default TeacherManagementTable;