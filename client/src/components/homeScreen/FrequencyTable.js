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
import { CloudUpload } from '@mui/icons-material';
import Paginate from '../paginate/Paginate';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const FrequencyTable = ({
  data,
  headers,
  search,
  renderMobileRow,
  setAlert,
  isFiltered,
}) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(7);
  const navigate = useNavigate();

  const safeData = Array.isArray(data) ? data : [];
  console.log("SafeData in FrequencyTable:", safeData);

  const visibleData = useMemo(() => {
    if (search && search.trim().length >= 2) {
      return safeData.slice(0, 6);
    }
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const slicedData = safeData.slice(startIndex, endIndex);
    console.log("VisibleData:", slicedData, "startIndex:", startIndex, "endIndex:", endIndex);
    return slicedData;
  }, [safeData, page, rowsPerPage, search]);

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

  const showNoItemsFound = safeData.length === 0 || (visibleData.length === 0 && (search || isFiltered));

  const handleUpload = (item) => {
    if (item.status === 'Falta') {
      navigate('/preposition', { state: { frequencyItem: item } });
    } else {
      setAlert({ message: 'Upload only available for "Falta" status.', type: 'warning' });
    }
  };

  if (isMobile) {
    return (
      <Stack spacing={1} sx={{ width: '100%' }}>
        {showNoItemsFound ? (
          <Paper sx={{ p: 1 }}>
            <Typography align="center">Nenhum item encontrado!</Typography>
          </Paper>
        ) : (
          visibleData.map((item) =>
            renderMobileRow ? (
              <Paper key={item?.id || Math.random()} sx={{ p: 1 }}>
                {renderMobileRow(item)}
                <Stack direction="row" spacing={1} justifyContent="center">
                  <IconButton
                    onClick={() => handleUpload(item)}
                    disabled={item.status !== 'Falta'}
                    sx={{
                      color: item.status !== 'Falta' ? 'rgba(0, 0, 0, 0.26)' : '#087619',
                      '&:hover': {
                        color: item.status !== 'Falta' ? 'rgba(0, 0, 0, 0.26)' : '#065412',
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    <CloudUpload />
                  </IconButton>
                </Stack>
              </Paper>
            ) : (
              <Paper key={item?.id || Math.random()} sx={{ p: 1 }}>
                <Stack spacing={0.5}>
                  {headers.map((header) => (
                    <Typography
                      key={header.key}
                      sx={{
                        color: (header.key === 'status' && item[header.key] === 'Falta') ? 'red' : 'inherit',
                        fontWeight: (header.key === 'status' && item[header.key] === 'Falta') ? 'bold' : 'normal',
                      }}
                    >
                      <strong>{header.label}:</strong> {item[header.key]}
                    </Typography>
                  ))}
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton
                      onClick={() => handleUpload(item)}
                      disabled={item.status !== 'Falta'}
                      sx={{
                        color: item.status !== 'Falta' ? 'rgba(0, 0, 0, 0.26)' : '#087619',
                        '&:hover': {
                          color: item.status !== 'Falta' ? 'rgba(0, 0, 0, 0.26)' : '#065412',
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      <CloudUpload />
                    </IconButton>
                  </Stack>
                </Stack>
              </Paper>
            )
          )
        )}
        {(!search || search.trim().length < 2) && safeData.length > rowsPerPage && (
          <Paginate
            count={Math.ceil(safeData.length / rowsPerPage)}
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
              <TableCell align="center" sx={tableHeadStyle}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {showNoItemsFound ? (
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
                <TableRow key={item?.id || Math.random()}>
                  {headers.map((header) => (
                    <TableCell
                      key={header.key}
                      align="center"
                      sx={{
                        ...tableBodyCellStyle,
                        color: (header.key === 'status' && item[header.key] === 'Falta') ? 'red' : 'inherit',
                        fontWeight: (header.key === 'status' && item[header.key] === 'Falta') ? 'semi bold' : 'normal',
                      }}
                    >
                      {item[header.key]}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={tableBodyCellStyle}>
                    <IconButton
                      onClick={() => handleUpload(item)}
                      disabled={item.status !== 'Falta'}
                      sx={{
                        color: item.status !== 'Falta' ? 'rgba(0, 0, 0, 0.26)' : '#087619',
                        '&:hover': {
                          color: item.status !== 'Falta' ? 'rgba(0, 0, 0, 0.26)' : '#065412',
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      <CloudUpload />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {(!search || search.trim().length < 2) && safeData.length > rowsPerPage && (
        <Paginate
          count={Math.ceil(safeData.length / rowsPerPage)}
          page={page}
          onChange={(event, newPage) => handleChangePage(newPage)}
        />
      )}
    </>
  );
};

FrequencyTable.propTypes = {
  data: PropTypes.array.isRequired,
  headers: PropTypes.array.isRequired,
  search: PropTypes.string,
  renderMobileRow: PropTypes.func,
  setAlert: PropTypes.func,
  isFiltered: PropTypes.bool,
};

export default FrequencyTable;