import React, { useState, useMemo } from 'react';
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { Edit, Lock, LockOpen } from '@mui/icons-material';
import Paginate from '../paginate/Paginate';
import PropTypes from 'prop-types';

const ArchiveDataTable = ({
  data,
  headers,
  onArchive,
  onUpdate,
  search,
  renderMobileRow,
  setAlert,
  isFiltered,
}) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(7);

  const visibleData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (search && search.trim().length >= 2) {
      return data.slice(0, 6);
    }
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, page, rowsPerPage, search]);

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

  if (isMobile) {
    return (
      <Stack spacing={1} sx={{ width: '100%' }}>
        {visibleData.length === 0 && (search || isFiltered) ? (
          <Paper sx={{ p: 1 }}>
            <Typography align="center">Nenhum item encontrado!</Typography>
          </Paper>
        ) : (
          visibleData.map((item) =>
            renderMobileRow ? (
              <Paper key={item?.id} sx={{ p: 1 }}>
                {renderMobileRow(item)}
                <Stack direction="row" spacing={1} justifyContent="center">
                  <IconButton
                    onClick={() => onUpdate(item)}
                    disabled={!item.isActive}
                    sx={{
                      color: '#087619',
                      '&:hover': { color: '#065412' },
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    sx={{
                      color: '#087619',
                      '&:hover': { color: '#065412' },
                    }}
                    onClick={() => {
                      if (item && item.id) {
                        onArchive(item.id);
                      } else {
                        console.error('Item ou item.id é undefined:', item);
                        if (setAlert) {
                          setAlert({
                            message: 'Erro: ID da disciplina não encontrado.',
                            type: 'error',
                          });
                        }
                      }
                    }}
                  >
                    {item.isActive ? <LockOpen /> : <Lock />}
                  </IconButton>
                </Stack>
              </Paper>
            ) : (
              // Fallback para mobile se renderMobileRow não for fornecido,
              // mas este caso já deveria ter sido tratado pelo UsersTable
              <Paper key={item?.id} sx={{ p: 1 }}>
                <Stack spacing={0.5}>
                  {headers.map((header) => (
                    <Typography key={header.key}>
                      <strong>{header.label}:</strong> {item[header.key]}
                    </Typography>
                  ))}
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton
                      onClick={() => onUpdate(item)}
                      disabled={!item.isActive}
                      sx={{
                        color: '#087619',
                        '&:hover': { color: '#065412' },
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      sx={{
                        color: '#087619',
                        '&:hover': { color: '#065412' },
                      }}
                      onClick={() => {
                        if (item && item.id) {
                          onArchive(item.id);
                        } else {
                          console.error('Item ou item.id é undefined:', item);
                          if (setAlert) {
                            setAlert({
                              message: 'Erro: ID da disciplina não encontrado.',
                              type: 'error',
                            });
                          }
                        }
                      }}
                    >
                      {item.isActive ? <LockOpen /> : <Lock />}
                    </IconButton>
                  </Stack>
                </Stack>
              </Paper>
            )
          )
        )}
        {(!search || search.trim().length < 2) && data.length > rowsPerPage && (
          <Paginate
            count={Math.ceil(
              (Array.isArray(data) ? data.length : 0) / rowsPerPage
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
              <TableCell align="center" sx={tableHeadStyle}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleData.length === 0 && (search || isFiltered) ? (
              <TableRow>
                <TableCell
                  colSpan={headers.length + 1}
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
                      {/* *** AQUI ESTÁ A MUDANÇA PRINCIPAL PARA O DESKTOP *** */}
                      {header.render ? header.render(item) : item[header.key]}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={tableBodyCellStyle}>
                    <IconButton
                      onClick={() => onUpdate(item)}
                      disabled={!item.isActive}
                      sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
                      onClick={() => {
                        if (item && item.id) {
                          onArchive(item.id);
                        } else {
                          console.error('Item ou item.id é undefined:', item);
                          if (setAlert) {
                            setAlert({
                              message: 'Erro: ID da disciplina não encontrado.',
                              type: 'error',
                            });
                          }
                        }
                      }}
                    >
                      {item.isActive ? <LockOpen /> : <Lock />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {(!search || search.trim().length < 2) && data.length > rowsPerPage && (
        <Paginate
          count={Math.ceil(
            (Array.isArray(data) ? data.length : 0) / rowsPerPage
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

ArchiveDataTable.propTypes = {
  data: PropTypes.array.isRequired,
  headers: PropTypes.array.isRequired,
  onArchive: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  search: PropTypes.string,
  renderMobileRow: PropTypes.func,
  setAlert: PropTypes.func,
  isFiltered: PropTypes.bool,
};

export default ArchiveDataTable;