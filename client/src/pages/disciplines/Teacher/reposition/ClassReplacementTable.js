import { Stack, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton } from '@mui/material';
import Paginate from '../../../../components/paginate/Paginate';
import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import { useMediaQuery } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

const ClassReplacementTable = ({ replacements, setAlert, onView, onDelete, onApprove, onReject, accessType }) => {
  const normalizeString = (str) => {
    if (!str) return 'N/A';
    return str;
  };

  const formattedReplacements = Array.isArray(replacements) ? replacements.map((replacement) => ({
    ...replacement,
    turma: normalizeString(replacement.turma),
    disciplina: normalizeString(replacement.disciplina),
    hour: normalizeString(replacement.hour),
    quantidade: normalizeString(replacement.quantidade),
    data: normalizeString(replacement.data),
    fileName: normalizeString(replacement.fileName),
    observacao: normalizeString(replacement.observacao),
    observationCoordinator: normalizeString(replacement.observationCoordinator),
    status: replacement.status || 'Pendente',
  })) : [];

  const headers = accessType === 'Professor' ? [
    { key: 'turma', label: 'Turma' },
    { key: 'disciplina', label: 'Disciplina' },
    { key: 'hour', label: 'Horário' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'data', label: 'Data' },
    { key: 'fileName', label: 'Arquivo' },
    { key: 'observacao', label: 'Observação' },
    {
      key: 'status',
      label: 'Status',
      render: (replacement) => (
        <Typography
          component="span"
          sx={{
            color:
              replacement.status === 'Aprovado' ? 'green' :
              replacement.status === 'Rejeitado' ? 'red' : 'orange',
            fontWeight: replacement.status === 'Pendente' ? 'bold' : 'normal',
          }}
        >
          {replacement.status}
        </Typography>
      ),
    },
  ] : [
    { key: 'turma', label: 'Turma' },
    { key: 'disciplina', label: 'Disciplina' },
    { key: 'hour', label: 'Horário' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'data', label: 'Data' },
    { key: 'fileName', label: 'Arquivo' },
    { key: 'observacao', label: 'Observação' },
    { key: 'observationCoordinator', label: 'Observação do Coordenador' },
    {
      key: 'status',
      label: 'Status',
      render: (replacement) => (
        <Typography
          component="span"
          sx={{
            color:
              replacement.status === 'Aprovado' ? 'green' :
              replacement.status === 'Rejeitado' ? 'red' : 'orange',
            fontWeight: replacement.status === 'Pendente' ? 'bold' : 'normal',
          }}
        >
          {replacement.status}
        </Typography>
      ),
    },
    {
      key: 'actions',
      label: 'Ação',
      render: (replacement) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <IconButton
            onClick={() => onView(replacement.id)}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            <Visibility />
          </IconButton>
          <IconButton
            onClick={() => onDelete(replacement)}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            <DeleteIcon />
          </IconButton>
          <Button
            onClick={() => onApprove(replacement.id)}
            disabled={replacement.status === 'Aprovado'}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Aprovar
          </Button>
          <Button
            onClick={() => onReject(replacement.id)}
            disabled={replacement.status === 'Rejeitado'}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Rejeitar
          </Button>
        </Stack>
      ),
    },
  ];

  const isMobile = useMediaQuery('(max-width:600px)');
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;

  const visibleData = useMemo(() => {
    if (!Array.isArray(formattedReplacements)) return [];
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return formattedReplacements.slice(startIndex, endIndex);
  }, [formattedReplacements, page]);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

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

  const renderMobileRow = (replacement) => (
    <Stack spacing={0.5}>
      <Typography><strong>Turma:</strong> {normalizeString(replacement.turma)}</Typography>
      <Typography><strong>Disciplina:</strong> {normalizeString(replacement.disciplina)}</Typography>
      <Typography><strong>Horário:</strong> {normalizeString(replacement.hour)}</Typography>
      <Typography><strong>Quantidade:</strong> {normalizeString(replacement.quantidade)}</Typography>
      <Typography><strong>Data:</strong> {normalizeString(replacement.data)}</Typography>
      <Typography><strong>Arquivo:</strong> {normalizeString(replacement.fileName)}</Typography>
      <Typography><strong>Observação:</strong> {normalizeString(replacement.observacao)}</Typography>
      <Typography><strong>Observação do Coordenador:</strong> {normalizeString(replacement.observationCoordinator)}</Typography>
      <Typography>
        <strong>Status:</strong>{" "}
        <Box
          component="span"
          sx={{
            color:
              replacement.status === 'Aprovado' ? 'green' :
              replacement.status === 'Rejeitado' ? 'red' : 'orange',
            fontWeight: replacement.status === 'Pendente' ? 'bold' : 'normal',
          }}
        >
          {replacement.status}
        </Box>
      </Typography>
      {accessType === 'Coordenador' && (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            onClick={() => onView(replacement.id)}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Visualizar
          </Button>
          <Button
            onClick={() => onDelete(replacement)}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Deletar
          </Button>
          <Button
            onClick={() => onApprove(replacement.id)}
            disabled={replacement.status === 'Aprovado'}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Aprovar
          </Button>
          <Button
            onClick={() => onReject(replacement.id)}
            disabled={replacement.status === 'Rejeitado'}
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
        {visibleData.length === 0 ? (
          <Paper sx={{ p: 1 }}>
            <Typography align="center">Nenhum item encontrado!</Typography>
          </Paper>
        ) : (
          visibleData.map((item) => (
            <Paper key={item?.id} sx={{ p: 1 }}>
              {renderMobileRow(item)}
            </Paper>
          ))
        )}
        {formattedReplacements.length > rowsPerPage && (
          <Paginate
            count={Math.ceil((Array.isArray(formattedReplacements) ? formattedReplacements.length : 0) / rowsPerPage)}
            page={page}
            onChange={(event, newPage) => handleChangePage(newPage)}
          />
        )}
      </Stack>
    );
  }

  return (
    <>
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
            {visibleData.length === 0 ? (
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
              visibleData.map((item) => (
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
      {formattedReplacements.length > rowsPerPage && (
        <Paginate
          count={Math.ceil((Array.isArray(formattedReplacements) ? formattedReplacements.length : 0) / rowsPerPage)}
          page={page}
          onChange={(event, newPage) => handleChangePage(newPage)}
        />
      )}
    </>
  );
};

ClassReplacementTable.propTypes = {
  replacements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      turma: PropTypes.string.isRequired,
      disciplina: PropTypes.string.isRequired,
      hour: PropTypes.string.isRequired,
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

export default ClassReplacementTable;