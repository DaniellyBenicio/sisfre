import { Stack, Typography, Box } from '@mui/material'; 
import ArchiveDataTable from '../../../components/homeScreen/ArchiveDataTable';
import PropTypes from 'prop-types';

const ClassesTable = ({ classes, onArchive, onUpdate, search, setAlert }) => {

  const normalizeString = (str) => {
    if (!str) return 'N/A';
    return str;
  };

  const formattedClasses = classes.map((classItem) => ({
    ...classItem,
    course: normalizeString(classItem.course?.name),
    semester: normalizeString(classItem.semester),
    courseClassId: classItem.courseClassId, 
    status: classItem.isActive ? 'Ativo' : 'Inativo', 
  }));
  const headers = [
    { key: 'course', label: 'Curso' },
    { key: 'semester', label: 'Semestre' },
    {
      key: 'status',
      label: 'Status',
      render: (classItem) => (
        <Typography
          component="span"
          sx={{
            color: classItem.isActive ? 'inherit' : 'red', 
            fontWeight: classItem.isActive ? 'normal' : 'semi bold', 
          }}
        >
          {classItem.isActive ? 'Ativo' : 'Inativo'}
        </Typography>
      ),
    },
  ];

  const renderMobileRow = (classItem) => (
    <Stack spacing={0.5}>
      <Typography>
        <strong>Curso:</strong> {normalizeString(classItem.course)}
      </Typography>
      <Typography>
        <strong>Semestre:</strong> {normalizeString(classItem.semester)}
      </Typography>
      <Typography>
        <strong>Status:</strong>{" "}
        <Box 
          component="span"
          sx={{
            color: classItem.isActive ? 'inherit' : 'red', 
            fontWeight: classItem.isActive ? 'normal' : 'semi bold', 
          }}
        >
          {classItem.status}
        </Box>
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