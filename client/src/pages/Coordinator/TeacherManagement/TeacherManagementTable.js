import { Stack, Typography, IconButton, Tooltip } from "@mui/material";
import { Description, AccessTime, Error as ErrorIcon } from '@mui/icons-material';
import Tables from "../../../components/homeScreen/Tables";
import { useNavigate } from "react-router-dom";

const TeacherManagementTable = ({ 
  teachers, 
  onView, 
  onUpdate, 
  onViewAbsences,
  search, 
  showActions, 
  loading 
}) => {
  const navigate = useNavigate();

  const headers = [
    { key: "acronym", label: "Sigla" },
    { key: "name", label: "Nome" },
    { key: "email", label: "E-mail" },
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
    </Stack>
  );

  const renderActions = (teacher) => (
    <>
      <Tooltip title="Ver Faltas por Disciplina">
        <IconButton
          onClick={() => onViewAbsences(teacher.id)}
          sx={{ color: "#d32f2f", "&:hover": { color: "#b71c1c" } }}
        >
          <ErrorIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Ver Horários">
        <IconButton
          onClick={() => onView(teacher.id)}
          sx={{ color: "#087619", "&:hover": { color: "#065412" } }}
        >
          <AccessTime />
        </IconButton>
      </Tooltip>

      <Tooltip title="Ver Anteposições/Reposições">
        <IconButton
          onClick={() => navigate("/class-reschedules")}
          sx={{ color: "#666666", "&:hover": { color: "#535252" } }}
        >
          <Description />
        </IconButton>
      </Tooltip>
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