import { Stack, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Paginate from '../../../../components/paginate/Paginate';
import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import { useMediaQuery } from '@mui/material';

const ClassAntepositionTable = ({ antepositions, search, setAlert }) => {
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
    status: anteposition.status || 'Pendente', // Status inicial como Pendente
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
  ];

  const isMobile = useMediaQuery('(max-width:600px)');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(7);

  const visibleData = useMemo(() => {
    if (!Array.isArray(formattedAntepositions)) return [];
    if (search && search.trim().length >= 2) {
      return formattedAntepositions.slice(0, 6);
    }
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return formattedAntepositions.slice(startIndex, endIndex);
  }, [formattedAntepositions, page, rowsPerPage, search]);

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

  const renderMobileRow = (anteposition) => (
    <Stack spacing={0.5}>
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
            color:
              anteposition.status === 'Aprovado' ? 'green' :
              anteposition.status === 'Rejeitado' ? 'red' : 'orange',
            fontWeight: anteposition.status === 'Pendente' ? 'bold' : 'normal',
          }}
        >
          {anteposition.status}
        </Box>
      </Typography>
    </Stack>
  );

  if (isMobile) {
    return (
      <Stack spacing={1} sx={{ width: '100%' }}>
        {visibleData.length === 0 && (search || search.trim().length >= 2) ? (
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
        {(!search || search.trim().length < 2) && formattedAntepositions.length > rowsPerPage && (
          <Paginate
            count={Math.ceil(
              (Array.isArray(formattedAntepositions) ? formattedAntepositions.length : 0) / rowsPerPage
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
            {visibleData.length === 0 && (search || search.trim().length >= 2) ? (
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
      {(!search || search.trim().length < 2) && formattedAntepositions.length > rowsPerPage && (
        <Paginate
          count={Math.ceil(
            (Array.isArray(formattedAntepositions) ? formattedAntepositions.length : 0) / rowsPerPage
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

ClassAntepositionTable.propTypes = {
  antepositions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      turma: PropTypes.string.isRequired,
      disciplina: PropTypes.string.isRequired,
      quantidade: PropTypes.string.isRequired,
      data: PropTypes.string.isRequired,
      fileName: PropTypes.string.isRequired,
      observacao: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['Pendente', 'Aprovado', 'Rejeitado']),
    })
  ).isRequired,
  search: PropTypes.string,
  setAlert: PropTypes.func,
};

export default ClassAntepositionTable;