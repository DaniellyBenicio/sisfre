import { Stack, Typography } from '@mui/material';
import DataTable from '../../../components/homeScreen/DataTable';
import PropTypes from 'prop-types';

const ClassesTable = ({ classes, onDelete, onUpdate, search, setAlert }) => {
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
  }));

  // Define as colunas da tabela
  const headers = [
    { key: 'course', label: 'Curso' },
    { key: 'semester', label: 'Semestre' },
  ];

  // Renderiza a linha para visualização em dispositivos móveis
  const renderMobileRow = (classItem) => (
    <Stack spacing={0.5}>
      <Typography>
        <strong>Curso:</strong> {normalizeString(classItem.course)}
      </Typography>
      <Typography>
        <strong>Semestre:</strong> {normalizeString(classItem.semester)}
      </Typography>
    </Stack>
  );

  return (
    <DataTable
      data={formattedClasses}
      headers={headers}
      onDelete={onDelete}
      onUpdate={onUpdate}
      search={search}
      renderMobileRow={renderMobileRow}
    />
  );
};

// Validação de props com PropTypes
ClassesTable.propTypes = {
  classes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      course: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }).isRequired,
      semester: PropTypes.string.isRequired,
    })
  ).isRequired,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  search: PropTypes.string,
  setAlert: PropTypes.func,
};

export default ClassesTable;