import React, { useState } from "react";
import { IconButton, Stack, Typography, Modal, Box, Button } from "@mui/material";
import { Note } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Tables from "../../../components/homeScreen/Tables";

const TeacherAbsencesDetailsTable = ({ frequencies, search, isFiltered, setAlert }) => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedJustification, setSelectedJustification] = useState("");

  const handleJustifyClick = (item) => {
    if (item.justification?.trim() && (item.status?.toLowerCase() === "falta" || item.status?.toLowerCase() === "abonada")) {
      setSelectedJustification(item.justification);
      setOpenModal(true);
    } else {
      setAlert({
        message: 'Justificativa disponível apenas para status "Falta".',
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
  };

  return (
    <>
      <Tables
        data={Array.isArray(frequencies) ? frequencies : []}
        headers={headers}
        search={search}
        isFiltered={isFiltered}
        showActions={false}
        renderRowCell={(item, header) => (
          <Typography
            sx={{
              color:
                header.key === "status" && item[header.key]?.toLowerCase() === "falta"
                  ? "red !important"
                  : header.key === "status" && item[header.key]?.toLowerCase() === "abonada"
                  ? "#FFA500 !important"
                  : "inherit",
              fontWeight:
                header.key === "status" && item[header.key]?.toLowerCase() === "falta"
                  ? "bold"
                  : "normal",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              fontSize: { xs: "0.875rem", sm: "1rem" }, // Responsivo para tamanhos de tela
              padding: { xs: "4px 0", sm: "8px" }, // Ajuste de padding para mobile
            }}
          >
            {header.key === "justification" ? (
              item.justification?.trim() ? (
                <IconButton
                  onClick={() => handleJustifyClick(item)}
                  sx={{
                    color:
                      item.status?.toLowerCase() === "falta"
                        ? "#087619"
                        : item.status?.toLowerCase() === "abonada"
                        ? "gray"
                        : "rgba(0, 0, 0, 0.26)",
                    "&:hover": {
                      color:
                        item.status?.toLowerCase() === "falta"
                          ? "#065412"
                          : item.status?.toLowerCase() === "abonada"
                          ? "gray"
                          : "rgba(0, 0, 0, 0.26)",
                      backgroundColor: "transparent",
                    },
                    padding: { xs: 0.5, sm: 1 }, // Menor padding em mobile
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
        )}
      />
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="justification-modal-title"
        aria-describedby="justification-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="justification-modal-title" variant="h6" component="h2">
            Justificativa
          </Typography>
          <Typography id="justification-modal-description" sx={{ mt: 2 }}>
            {selectedJustification}
          </Typography>
          <Button onClick={handleCloseModal} sx={{ mt: 2 }} variant="contained">
            Fechar
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default TeacherAbsencesDetailsTable;