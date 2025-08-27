import React, { useState } from "react";
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Modal,
  Box,
} from "@mui/material";
import { Note, Close } from "@mui/icons-material";
import PropTypes from "prop-types";

const TeacherAbsencesDetailsTable = ({ frequencies, search, isFiltered, setAlert }) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedJustification, setSelectedJustification] = useState("");

  const handleJustifyClick = (item) => {
    if (
      item.justification &&
      item.justification.trim() &&
      item.justification !== "N/A" &&
      (item.status?.toLowerCase() === "falta" || item.status?.toLowerCase() === "abonada")
    ) {
      setSelectedJustification(item.justification);
      setOpenModal(true);
    } else {
      setAlert({
        message: 'Justificativa disponível apenas para status "Falta" ou "Abonada" com justificativa válida.',
        type: "warning",
      });
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedJustification("");
  };

  const headers = [
    { key: "displayDate", label: "Data" },
    { key: "class", label: "Curso/Turma" },
    { key: "turno", label: "Turno" },
    { key: "status", label: "Status" },
    { key: "justification", label: "Justificativa" },
  ];

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
    padding: { xs: "4px", sm: "8px" },
    height: "30px",
    lineHeight: "30px",
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "90%", sm: 400 },
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    position: "relative",
  };

  const safeData = Array.isArray(frequencies) ? frequencies : [];
  const showNoItemsFound = safeData.length === 0 || (isFiltered && safeData.length === 0);

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
                  <Typography
                    sx={{
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    {header.label}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {showNoItemsFound ? (
              <TableRow>
                <TableCell
                  colSpan={headers.length}
                  align="center"
                  sx={tableBodyCellStyle}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    Nenhum item encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              safeData.map((item) => (
                <TableRow key={item?.id || Math.random()}>
                  {headers.map((header) => (
                    <TableCell
                      key={header.key}
                      align="center"
                      sx={tableBodyCellStyle}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                          color:
                            header.key === "status"
                              ? item[header.key]?.toLowerCase() === "falta"
                                ? "#FF0000"
                                : item[header.key]?.toLowerCase() === "abonada"
                                ? "#FFA500"
                                : "inherit"
                              : "inherit",
                          fontWeight:
                            header.key === "status" &&
                            ["falta", "abonada"].includes(item[header.key]?.toLowerCase())
                              ? "bold"
                              : "normal",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        {header.key === "justification" ? (
                          item.justification &&
                          item.justification.trim() &&
                          item.justification !== "N/A" ? (
                            <IconButton
                              onClick={() => handleJustifyClick(item)}
                              sx={{
                                color: "#087619",
                                "&:hover": {
                                  color: "#065412",
                                  backgroundColor: "transparent",
                                },
                                padding: { xs: 0.5, sm: 1 },
                              }}
                            >
                              <Note fontSize="small" />
                            </IconButton>
                          ) : (
                            "N/A"
                          )
                        ) : (
                          item[header.key] || "N/A"
                        )}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="justification-modal-title"
        aria-describedby="justification-modal-description"
      >
         <Box sx={modalStyle}>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#808080",
              "&:hover": {
                color: "#606060",
                backgroundColor: "transparent",
              },
              padding: { xs: 0.5, sm: 1 },
            }}
          >
            <Close sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }} />
          </IconButton>
          <Typography
            id="justification-modal-title"
            variant="h6"
            component="h2"
            sx={{
              textAlign: "center",
              fontSize: { xs: "1rem", sm: "1.25rem" },
              color: "#087619",
            }}
          >
            Justificativa
          </Typography>
          <Typography
            id="justification-modal-description"
            sx={{
              mt: 2,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {selectedJustification}
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

TeacherAbsencesDetailsTable.propTypes = {
  frequencies: PropTypes.array.isRequired,
  search: PropTypes.string,
  isFiltered: PropTypes.bool,
  setAlert: PropTypes.func,
};

export default TeacherAbsencesDetailsTable;