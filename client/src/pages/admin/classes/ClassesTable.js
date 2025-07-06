import { Stack, Typography } from '@mui/material';
import ArchiveDataTable from '../../../components/homeScreen/ArchiveDataTable';
import PropTypes from 'prop-types';

const ClassesTable = ({ classes, onArchive, onUpdate, search, setAlert }) => {
  // Função para normalizar os dados, se necessário
  const normalizeString = (str) => {
    if (!str) return 'N/A';
    return str;
  };

  // Formata os dados para exibição
  const formattedClasses = classes.map((classItem) => ({
    ...classItem,
    course: normalizeString(classItem.course?.name),
    semester: normalizeString(classItem.semester),
    courseClassId: classItem.courseClassId, // Garante que está presente
    status: classItem.isActive ? 'Ativo' : 'Inativo', // Adiciona status com base em isActive
  }));

  // Define as colunas da tabela
  const headers = [
    { key: 'course', label: 'Curso' },
    { key: 'semester', label: 'Semestre' },
    { key: 'status', label: 'Status' },
  ];

  // Renderiza a linha para visualização em dispositivos móveis
  const renderMobileRow = (classItem) => (
    <Stack spacing={0.5}>
      <Typography sx={{ color: classItem.isActive ? 'inherit' : '#FF0000' }}>
        <strong>Curso:</strong> {normalizeString(classItem.course)}
      </Typography>
      <Typography>
        <strong>Semestre:</strong> {normalizeString(classItem.semester)}
      </Typography>
      <Typography>
        <strong>Status:</strong> {classItem.status}
      </Typography>
    </Stack>
  );

  return (
    <ArchiveDataTable
      data={formattedClasses}
      headers={headers}
      onArchive={onArchive}
      onUpdate={(classItem) => classItem.isActive && onUpdate(classItem)}
      search={search}
      renderMobileRow={renderMobileRow}
      setAlert={setAlert}
      getRowId={(row) => row.courseClassId}
      isFiltered={search.trim().length >= 2}
    />
  );
};

// Validação de props com PropTypes
ClassesTable.propTypes = {
  classes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      courseClassId: PropTypes.number.isRequired,
      course: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }).isRequired,
      semester: PropTypes.string.isRequired,
      isActive: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onArchive: PropTypes.func,
  onUpdate: PropTypes.func,
  search: PropTypes.string,
  setAlert: PropTypes.func,
};

export default ClassesTable;