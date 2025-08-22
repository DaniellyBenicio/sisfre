import React, { useState, useMemo } from "react";
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
} from "@mui/material";
import { Note } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Paginate from "../../../../components/paginate/Paginate";
import PropTypes from "prop-types";

const FrequenciesTable = ({ frequencies, search, isFiltered, setAlert }) => {
  const navigate = useNavigate();

  const formattedFrequencies = frequencies;

  const handleJustify = (item) => {
    if (item.status === "Falta") {
      navigate("/justify", { state: { frequencyItem: item } });
    } else {
      setAlert({
        message: 'Justificativa disponível apenas para status "Falta".',
        type: "warning",
      });
    }
  };

  const headers = [
    { key: "date", label: "Data" },
    { key: "turn", label: "Turno" },
    { key: "status", label: "Status" },
  ];

  const isMobile = useMediaQuery("(max-width:600px)");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(7);

  const safeData = Array.isArray(formattedFrequencies)
    ? formattedFrequencies
    : [];
  console.log("SafeData in FrequenciesTable:", safeData);

  const visibleData = useMemo(() => {
    if (search && search.trim().length >= 2) {
      return safeData.slice(0, 6);
    }
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const slicedData = safeData.slice(startIndex, endIndex);
    console.log(
      "VisibleData:",
      slicedData,
      "startIndex:",
      startIndex,
      "endIndex:",
      endIndex
    );
    return slicedData;
  }, [safeData, page, rowsPerPage, search]);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const tableHeadStyle = {
    fontWeight: "bold",
    backgroundColor: "#087619",
    color: "#fff",
    borderRight: "1px solid #fff",
    padding: { xs: "4px", sm: "6px" },
    height: "30px",
    lineHeight: "30px",
  };

  const tableBodyCellStyle = {
    borderRight: "1px solid #e0e0e0",
    padding: { xs: "4px", sm: "6px" },
    height: "30px",
    lineHeight: "30px",
  };

  const showNoItemsFound =
    safeData.length === 0 ||
    (visibleData.length === 0 && (search || isFiltered));

  if (isMobile) {
    return (
      <Stack spacing={1} sx={{ width: "100%" }}>
        {showNoItemsFound ? (
          <Paper sx={{ p: 1 }}>
            <Typography align="center">Nenhum item encontrado!</Typography>
          </Paper>
        ) : (
          visibleData.map((item) => (
            <Paper key={item?.id || Math.random()} sx={{ p: 1 }}>
              <Stack spacing={0.5}>
                {headers.map((header) => (
                  <Typography
                    key={header.key}
                    sx={{
                      color:
                        header.key === "status"
                          ? item[header.key] === "Falta"
                            ? "red"
                            : item[header.key] === "Presença"
                            ? "green"
                            : item[header.key] === "Abonada"
                            ? "orange"
                            : "inherit"
                          : "inherit",
                      fontWeight:
                        header.key === "status" &&
                        ["Falta", "Presença", "Abonada"].includes(item[header.key])
                          ? "bold"
                          : "normal",
                    }}
                  >
                    <strong>{header.label}:</strong> {item[header.key] || "N/A"}
                  </Typography>
                ))}
                <Stack direction="row" spacing={1} justifyContent="center">
                  <IconButton
                    onClick={() => handleJustify(item)}
                    disabled={item.status !== "Falta"}
                    sx={{
                      color:
                        item.status !== "Falta"
                          ? "rgba(0, 0, 0, 0.26)"
                          : "#087619",
                      "&:hover": {
                        color:
                          item.status !== "Falta"
                            ? "rgba(0, 0, 0, 0.26)"
                            : "#065412",
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <Note />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          ))
        )}
        {(!search || search.trim().length < 2) &&
          safeData.length > rowsPerPage && (
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
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
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
                        color:
                          header.key === "status"
                            ? item[header.key] === "Falta"
                              ? "red"
                              : item[header.key] === "Presença"
                              ? "green"
                              : item[header.key] === "Abonada"
                              ? "orange"
                              : "inherit"
                            : "inherit",
                        fontWeight:
                          header.key === "status" &&
                          ["Falta", "Presença", "Abonada"].includes(item[header.key])
                            ? "bold"
                            : "normal",
                      }}
                    >
                      {item[header.key] || "N/A"}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={tableBodyCellStyle}>
                    <IconButton
                      onClick={() => handleJustify(item)}
                      disabled={item.status !== "Falta"}
                      sx={{
                        color:
                          item.status !== "Falta"
                            ? "rgba(0, 0, 0, 0.26)"
                            : "#087619",
                        "&:hover": {
                          color:
                            item.status !== "Falta"
                              ? "rgba(0, 0, 0, 0.26)"
                              : "#065412",
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <Note />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {(!search || search.trim().length < 2) &&
        safeData.length > rowsPerPage && (
          <Paginate
            count={Math.ceil(safeData.length / rowsPerPage)}
            page={page}
            onChange={(event, newPage) => handleChangePage(newPage)}
          />
        )}
    </>
  );
};

FrequenciesTable.propTypes = {
  frequencies: PropTypes.array.isRequired,
  search: PropTypes.string,
  isFiltered: PropTypes.bool,
  setAlert: PropTypes.func,
};

export default FrequenciesTable;