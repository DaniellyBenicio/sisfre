import { Stack, Typography, Box } from '@mui/material';
import ArchiveDataTable from '../../../../components/homeScreen/ArchiveDataTable';
import PropTypes from 'prop-types';

const ClassAntepositionTable = ({ antepositions, onArchive, onUpdate, search, setAlert }) => {

  const normalizeString = (str) => {
    if (!str) return 'N/A';
    return str;
  };

  const formattedAntepositions = antepositions.map((anteposition) => ({
    ...anteposition,
    professor: normalizeString(anteposition.professor),
    turma: normalizeString(anteposition.turma),
    disciplina: normalizeString(anteposition.disciplina),
    quantidade: normalizeString(anteposition.quantidade),
    data: normalizeString(anteposition.data),
    fileName: normalizeString(anteposition.fileName),
    observacao: normalizeString(anteposition.observacao),
    status: anteposition.isActive ? 'Ativo' : 'Inativo',
  }));

  const headers = [
    { key: 'professor', label: 'Professor' },
    { key: 'turma', label: 'Turma' },
    { key: 'disciplina', label: 'Disciplina' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'data', label: 'Data' },
    { key: 'fileName', label: 'Arquivo' },
    {
      key: 'status',
      label: 'Status',
      render: (anteposition) => (
        <Typography
          component="span"
          sx={{
            color: anteposition.isActive ? 'inherit' : 'red',
            fontWeight: anteposition.isActive ? 'normal' : 'semi bold',
          }}
        >
          {anteposition.isActive ? 'Ativo' : 'Inativo'}
        </Typography>
      ),
    },
  ];

  const renderMobileRow = (anteposition) => (
    <Stack spacing={0.5}>
      <Typography>
        <strong>Professor:</strong> {normalizeString(anteposition.professor)}
      </Typography>
      <Typography>
        <strong>Turma:</strong> {normalizeString(anteposition.turma)}
      </Typography>
      <Typography>
        <strong>Disciplina:</strong> {normalizeString(anteposition.disciplina)}
      </Typography>
      <Typography>
        <strong>Quantidade:</strong> {normalizeString(anteposition.quantidade)}
      </Typography>
      <Typography>
        <strong>Data:</strong> {normalizeString(anteposition.data)}
      </Typography>
      <Typography>
        <strong>Arquivo:</strong> {normalizeString(anteposition.fileName)}
      </Typography>
      <Typography>
        <strong>Observação:</strong> {normalizeString(anteposition.observacao)}
      </Typography>
      <Typography>
        <strong>Status:</strong>{" "}
        <Box
          component="span"
          sx={{
            color: anteposition.isActive ? 'inherit' : 'red',
            fontWeight: anteposition.isActive ? 'normal' : 'semi bold',
          }}
        >
          {anteposition.status}
        </Box>
      </Typography>
    </Stack>
  );

  return (
    <ArchiveDataTable
      data={formattedAntepositions}
      headers={headers}
      onArchive={onArchive}
      onUpdate={(anteposition) => anteposition.isActive && onUpdate(anteposition)}
      search={search}
      renderMobileRow={renderMobileRow}
      setAlert={setAlert}
      getRowId={(row) => row.id}
      isFiltered={search.trim().length >= 2}
    />
  );
};

ClassAntepositionTable.propTypes = {
  antepositions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      professor: PropTypes.string.isRequired,
      turma: PropTypes.string.isRequired,
      disciplina: PropTypes.string.isRequired,
      quantidade: PropTypes.string.isRequired,
      data: PropTypes.string.isRequired,
      fileName: PropTypes.string.isRequired,
      observacao: PropTypes.string.isRequired,
      isActive: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onArchive: PropTypes.func,
  onUpdate: PropTypes.func,
  search: PropTypes.string,
  setAlert: PropTypes.func,
};

export default ClassAntepositionTable;