import { Stack, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import { useMediaQuery } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

const ClassAntepositionTable = ({ antepositions, setAlert, onView, onDelete, onApprove, onReject, accessType }) => {
  const normalizeString = (str) => {
    if (!str) return 'N/A';
    return str;
  };

  const formattedAntepositions = Array.isArray(antepositions) ? antepositions.map((anteposition) => ({
    ...anteposition,
    turma: normalizeString(anteposition.turma),
    disciplina: normalizeString(anteposition.disciplina),
    turn: normalizeString(anteposition.turn),
    quantidade: normalizeString(anteposition.quantidade),
    data: normalizeString(anteposition.data),
    fileName: normalizeString(anteposition.fileName),
    observacao: normalizeString(anteposition.observacao),
    observationCoordinator: normalizeString(anteposition.observationCoordinator),
    status: anteposition.status || 'Pendente',
  })) : [];

  const headers = accessType === 'Professor' ? [
    { key: 'turma', label: 'Turma' },
    { key: 'disciplina', label: 'Disciplina' },
    { key: 'turn', label: 'Turno' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'data', label: 'Data' },
    { key: 'fileName', label: 'Arquivo' },
    { key: 'observacao', label: 'Observação' },
    {
      key: 'status',
      label: 'Status',
      render: (anteposition) => (
        <Typography
          component="span"
          sx={{
            color:
              anteposition.status === 'Aprovado' ? 'green' :
              anteposition.status === 'Rejeitado' ? 'red' : 'orange',
            fontWeight: anteposition.status === 'Pendente' ? 'bold' : 'normal',
          }}
        >
          {anteposition.status}
        </Typography>
      ),
    },
  ] : [
    { key: 'turma', label: 'Turma' },
    { key: 'disciplina', label: 'Disciplina' },
    { key: 'turn', label: 'Turno' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'data', label: 'Data' },
    { key: 'fileName', label: 'Arquivo' },
    { key: 'observacao', label: 'Observação' },
    { key: 'observationCoordinator', label: 'Observação do Coordenador' },
    {
      key: 'status',
      label: 'Status',
      render: (anteposition) => (
        <Typography
          component="span"
          sx={{
            color:
              anteposition.status === 'Aprovado' ? 'green' :
              anteposition.status === 'Rejeitado' ? 'red' : 'orange',
            fontWeight: anteposition.status === 'Pendente' ? 'bold' : 'normal',
          }}
        >
          {anteposition.status}
        </Typography>
      ),
    },
    {
      key: 'actions',
      label: 'Ação',
      render: (anteposition) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <IconButton
            onClick={() => onView(anteposition.id)}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            <Visibility />
          </IconButton>
          <IconButton
            onClick={() => onDelete(anteposition)}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            <DeleteIcon />
          </IconButton>
          <Button
            onClick={() => onApprove(anteposition.id)}
            disabled={anteposition.status === 'Aprovado'}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Aprovar
          </Button>
          <Button
            onClick={() => onReject(anteposition.id)}
            disabled={anteposition.status === 'Rejeitado'}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Rejeitar
          </Button>
        </Stack>
      ),
    },
  ];

  const isMobile = useMediaQuery('(max-width:600px)');

  const tableHeadStyle = {
    fontWeight: 'bold',
    backgroundColor: '#087619',
    color: '#fff',
    borderRight: '1px solid #fff',
    padding: { xs: '4px', sm: '6px' },
    height: '30px',
    lineHeight: '30px',
  };

  const tableBodyCellStyle = {
    borderRight: '1px solid #e0e0e0',
    padding: { xs: '4px', sm: '6px' },
    height: '30px',
    lineHeight: '30px',
  };

  const renderMobileRow = (anteposition) => (
    <Stack spacing={0.5}>
      <Typography><strong>Turma:</strong> {normalizeString(anteposition.turma)}</Typography>
      <Typography><strong>Disciplina:</strong> {normalizeString(anteposition.disciplina)}</Typography>
      <Typography><strong>Turno:</strong> {normalizeString(anteposition.turn)}</Typography>
      <Typography><strong>Quantidade:</strong> {normalizeString(anteposition.quantidade)}</Typography>
      <Typography><strong>Data:</strong> {normalizeString(anteposition.data)}</Typography>
      <Typography><strong>Arquivo:</strong> {normalizeString(anteposition.fileName)}</Typography>
      <Typography><strong>Observação:</strong> {normalizeString(anteposition.observacao)}</Typography>
      <Typography><strong>Observação do Coordenador:</strong> {normalizeString(anteposition.observationCoordinator)}</Typography>
      <Typography>
        <strong>Status:</strong>{" "}
        <Box
          component="span"
          sx={{
            color:
              anteposition.status === 'Aprovado' ? 'green' :
              anteposition.status === 'Rejeitado' ? 'red' : 'orange',
            fontWeight: anteposition.status === 'Pendente' ? 'bold' : 'normal',
          }}
        >
          {anteposition.status}
        </Box>
      </Typography>
      {accessType === 'Coordenador' && (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            onClick={() => onView(anteposition.id)}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Visualizar
          </Button>
          <Button
            onClick={() => onDelete(anteposition)}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Deletar
          </Button>
          <Button
            onClick={() => onApprove(anteposition.id)}
            disabled={anteposition.status === 'Aprovado'}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Aprovar
          </Button>
          <Button
            onClick={() => onReject(anteposition.id)}
            disabled={anteposition.status === 'Rejeitado'}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Rejeitar
          </Button>
        </Stack>
      )}
    </Stack>
  );

  if (isMobile) {
    return (
      <Stack spacing={1} sx={{ width: '100%' }}>
        {formattedAntepositions.length === 0 ? (
          <Paper sx={{ p: 1 }}>
            <Typography align="center">Nenhum item encontrado!</Typography>
          </Paper>
        ) : (
          formattedAntepositions.map((item) => (
            <Paper key={item?.id} sx={{ p: 1 }}>
              {renderMobileRow(item)}
            </Paper>
          ))
        )}
      </Stack>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell key={header.key} align="center" sx={tableHeadStyle}>
                {header.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {formattedAntepositions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={headers.length}
                align="center"
                sx={tableBodyCellStyle}
              >
                Nenhum item encontrado
              </TableCell>
            </TableRow>
          ) : (
            formattedAntepositions.map((item) => (
              <TableRow key={item?.id}>
                {headers.map((header) => (
                  <TableCell
                    key={header.key}
                    align="center"
                    sx={tableBodyCellStyle}
                  >
                    {header.render ? header.render(item) : item[header.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

ClassAntepositionTable.propTypes = {
  antepositions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      turma: PropTypes.string.isRequired,
      disciplina: PropTypes.string.isRequired,
      turn: PropTypes.string.isRequired,
      quantidade: PropTypes.string.isRequired,
      data: PropTypes.string.isRequired,
      fileName: PropTypes.string.isRequired,
      observacao: PropTypes.string.isRequired,
      observationCoordinator: PropTypes.string,
      status: PropTypes.oneOf(['Pendente', 'Aprovado', 'Rejeitado']),
    })
  ).isRequired,
  setAlert: PropTypes.func,
  onView: PropTypes.func,
  onDelete: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  accessType: PropTypes.string,
};

export default ClassAntepositionTable;