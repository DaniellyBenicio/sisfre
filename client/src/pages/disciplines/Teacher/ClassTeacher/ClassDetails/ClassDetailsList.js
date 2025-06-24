import React from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,        // Importar Table
  TableBody,    // Importar TableBody
  TableCell,    // Importar TableCell
  TableContainer, // Importar TableContainer (opcional, mas recomendado para responsividade)
  TableHead,    // Importar TableHead
  TableRow,     // Importar TableRow
  Paper,        // Importar Paper (para o TableContainer)
} from "@mui/material";
import { Class, AccessTime } from "@mui/icons-material"; // Verifique se Class está correto ou se é GridView como no card

const ClassDetailsList = ({ setAuthenticated }) => {
  const location = useLocation();
  const { state } = location;

  // Dados de exemplo fixos caso não haja state.classItem
  const defaultClassItem = {
    id: 1,
    name: "S4",
    course: "Sistemas de Informação",
    calendar: "Convencional - 2025.1",
    discipline: "Programação Orientada a Objetos",
    shift: "Tarde",
    schedule: [
      { day: "Segunda - Feira", startTime: "15:20", endTime: "17:00" },
      { day: "Quarta - Feira", startTime: "13:00", endTime: "15:00" },
      { day: "Sexta - Feira", startTime: "08:00", endTime: "12:00" },
    ],
  };

  // Usa os dados do state, se existirem, senão usa os dados de exemplo
  const classItem = state?.classItem || defaultClassItem;

  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", mt: 2, mb: 2, color: "#087619" }}
      >
        Minhas Turmas
      </Typography>

      {/* Cartão de Detalhes da Turma - Sem Alterações */}
      <Card
        sx={{
          backgroundColor: "#FFFFFF",
          boxShadow: "0 6px 12px rgba(8, 118, 25, 0.1), 0 3px 6px rgba(8, 118, 25, 0.05)",
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
            <strong>Curso:</strong> {classItem.course}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Calendário Letivo:</strong> {classItem.calendar}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Disciplina:</strong> {classItem.discipline}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            <strong>Turno:</strong> {classItem.shift}
          </Typography>
        </CardContent>
      </Card>

      {/* Cartão de Horário - AGORA COM TABELA */}
      <Card
        sx={{
          backgroundColor: "#FFFFFF",
          boxShadow: "0 6px 12px rgba(8, 118, 25, 0.1), 0 3px 6px rgba(8, 118, 25, 0.05)",
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

          <TableContainer component={Paper} elevation={0}> {/* Paper para o fundo, elevation 0 para remover sombra */}
            <Table size="small" aria-label="horário da turma"> {/* size="small" para tabelas mais compactas */}
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", pl: 0 }}>Dia da Semana</TableCell> {/* pl:0 para alinhar com o protótipo */}
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>Horário de Início</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>Horário de Fim</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classItem.schedule.map((slot, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ pl: 0 }}>{slot.day}</TableCell> {/* pl:0 para alinhar com o protótipo */}
                    <TableCell align="center">{slot.startTime}</TableCell>
                    <TableCell align="center">{slot.endTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClassDetailsList;