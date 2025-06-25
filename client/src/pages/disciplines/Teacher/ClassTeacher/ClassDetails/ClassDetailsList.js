import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import { Class, AccessTime, ArrowBack } from "@mui/icons-material";

const ClassDetailsList = ({ setAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  // Verificar se classItem existe
  const classItem = state?.classItem;

  const handleBackClick = () => {
    navigate(-1);
  };

  if (!classItem) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Nenhuma turma selecionada.
        </Typography>
        <IconButton
          onClick={handleBackClick}
          sx={{ mt: 2, color: "#087619" }}
        >
          <ArrowBack />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          mb: 2,
        }}
      >
        <IconButton
          onClick={handleBackClick}
          sx={{
            position: "absolute",
            left: 0,
            color: "#087619",
            "&:hover": {
              backgroundColor: "rgba(8, 118, 25, 0.08)",
            },
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#087619", m: 0 }}
        >
          Detalhes da Turma
        </Typography>
      </Box>

      <Card
        sx={{
          backgroundColor: "#FFFFFF",
          boxShadow:
            "0 6px 12px rgba(8, 118, 25, 0.1), 0 3px 6px rgba(8, 118, 25, 0.05)",
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          p: 2,
        }}
      >
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              pb: 1,
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <Class sx={{ fontSize: 30, color: "#087619", mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#087619" }}>
              {classItem.name}
            </Typography>
          </Box>
          <Typography sx={{ mb: 1 }}>
            <strong>Curso:</strong> {classItem.course || "N/A"}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Calendário Letivo:</strong> {classItem.calendar || "N/A"}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Disciplina:</strong> {classItem.discipline || "N/A"}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Turno:</strong> {classItem.shift || "N/A"}
          </Typography>
        </CardContent>
      </Card>

      <Card
        sx={{
          backgroundColor: "#FFFFFF",
          boxShadow:
            "0 6px 12px rgba(8, 118, 25, 0.1), 0 3px 6px rgba(8, 118, 25, 0.05)",
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          p: 2,
        }}
      >
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              pb: 1,
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <AccessTime sx={{ fontSize: 30, color: "#087619", mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#087619" }}>
              Horário
            </Typography>
          </Box>

          <TableContainer component={Paper} elevation={0}>
            <Table size="small" aria-label="horário da turma">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", pl: 0 }}>
                    Dia da Semana
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Horário de Início
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Horário de Fim
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classItem.schedule && classItem.schedule.length > 0 ? (
                  classItem.schedule.map((slot, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ pl: 0 }}>{slot.day || "N/A"}</TableCell>
                      <TableCell align="center">{slot.startTime || "N/A"}</TableCell>
                      <TableCell align="center">{slot.endTime || "N/A"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Nenhum horário disponível
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClassDetailsList;