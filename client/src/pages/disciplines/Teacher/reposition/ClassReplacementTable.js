import { Stack, Typography, Box, Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';
import Paginate from '../../../../components/paginate/Paginate';
import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import { useMediaQuery } from '@mui/material';

const ClassReplacementTable = ({ replacements, setAlert, onArchive, onUpdate, onApprove, onReject, accessType }) => {
  const normalizeString = (str) => {
    if (!str) return 'N/A';
    return str;
  };

  const formattedReplacements = replacements.map((replacement) => ({
    ...replacement,
    turma: normalizeString(replacement.turma),
    disciplina: normalizeString(replacement.disciplina),
    quantidade: normalizeString(replacement.quantidade),
    data: normalizeString(replacement.data),
    fileName: normalizeString(replacement.fileName),
    observacao: normalizeString(replacement.observacao),
    status: replacement.status || 'Pendente',
  }));

  const headers = [
    { key: 'turma', label: 'Turma' },
    { key: 'disciplina', label: 'Disciplina' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'data', label: 'Data' },
    { key: 'fileName', label: 'Arquivo' },
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
    ...(accessType === 'Coordenador' ? [{
      key: 'actions',
      label: 'Ações',
      render: (replacement) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            onClick={() => onUpdate(replacement)}
            disabled={!replacement.isActive}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Editar
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
          <Button
            onClick={() => onArchive(replacement.id)}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            {replacement.isActive ? 'Inativar' : 'Ativar'}
          </Button>
        </Stack>
      ),
    }] : []),
  ];

  const isMobile = useMediaQuery('(max-width:600px)');
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;

  const visibleData = useMemo(() => {
    if (!Array.isArray(formattedReplacements)) return [];
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return formattedReplacements.slice(startIndex, endIndex);
  }, [formattedReplacements, page, rowsPerPage]);

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
      <Typography>
        <strong>Turma:</strong> {normalizeString(replacement.turma)}
      </Typography>
      <Typography>
        <strong>Disciplina:</strong> {normalizeString(replacement.disciplina)}
      </Typography>
      <Typography>
        <strong>Quantidade:</strong> {normalizeString(replacement.quantidade)}
      </Typography>
      <Typography>
        <strong>Data:</strong> {normalizeString(replacement.data)}
      </Typography>
      <Typography>
        <strong>Arquivo:</strong> {normalizeString(replacement.fileName)}
      </Typography>
      <Typography>
        <strong>Observação:</strong> {normalizeString(replacement.observacao)}
      </Typography>
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
            onClick={() => onUpdate(replacement)}
            disabled={!replacement.isActive}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Editar
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
          <Button
            onClick={() => onArchive(replacement.id)}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            {replacement.isActive ? 'Inativar' : 'Ativar'}
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
            count={Math.ceil(
              (Array.isArray(formattedReplacements) ? formattedReplacements.length : 0) / rowsPerPage
            )}
            page={page}
            onChange={(event, newPage) => {
              handleChangePage(newPage);
            }}
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
          count={Math.ceil(
            (Array.isArray(formattedReplacements) ? formattedReplacements.length : 0) / rowsPerPage
          )}
          page={page}
          onChange={(event, newPage) => {
            handleChangePage(newPage);
          }}
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
      quantidade: PropTypes.string.isRequired,
      data: PropTypes.string.isRequired,
      fileName: PropTypes.string.isRequired,
      observacao: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['Pendente', 'Aprovado', 'Rejeitado']),
      isActive: PropTypes.bool.isRequired,
    })
  ).isRequired,
  setAlert: PropTypes.func,
  onArchive: PropTypes.func,
  onUpdate: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  accessType: PropTypes.string,
};

export default ClassReplacementTable;