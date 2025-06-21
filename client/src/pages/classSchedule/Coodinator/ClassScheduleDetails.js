import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CssBaseline,
  IconButton,
} from "@mui/material";
import { ArrowBack, Assignment } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/SideBar";

const ClassScheduleDetails = ({ setAuthenticated }) => {
  const { disciplineId } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulação
  const mockClassesSchedule = [
    {
      disciplineId: 1,
      calendar: "2025/1",
      teacher: "João Silva",
      class: "Turma A",
      discipline: "Matemática",
      turn: "Manhã",
    },
    {
      disciplineId: 2,
      calendar: "2025/1",
      teacher: "Maria Oliveira",
      class: "Turma B",
      discipline: "Física",
      turn: "Tarde",
    },
    {
      disciplineId: 3,
      calendar: "2025/2",
      teacher: "Carlos Souza",
      class: "Turma C",
      discipline: "Química",
      turn: "Noite",
    },
    {
      disciplineId: 4,
      calendar: "2025/2",
      teacher: "Ana Pereira",
      class: "Turma A",
      discipline: "Biologia",
      turn: "Manhã",
    },
  ];

  useEffect(() => {
    setLoading(true);
    const foundSchedule = mockClassesSchedule.find(
      (item) => item.disciplineId === parseInt(disciplineId)
    );
    console.log("Found schedule:", foundSchedule);
    setSchedule(foundSchedule || null);
    setLoading(false);
  }, [disciplineId]);

  return (
    <Box display="flex">
      <CssBaseline />
      <Sidebar setAuthenticated={setAuthenticated} />

      <Box sx={{ flexGrow: 1, p: 4, mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 1,
            mb: 3,
          }}
        >
          <IconButton onClick={() => navigate("/class-schedule")}>
            <ArrowBack sx={{ color: "green", fontSize: "2.2rem" }} />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Detalhes de Grade de Turma
          </Typography>
        </Box>

        {/* Seção Aula */}
        <Box component={Paper} elevation={3} sx={{ p: 5, m: 4, borderRadius: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              marginLeft: "5px",
              mb: 2,
            }}
          >
            <Assignment sx={{ fontSize: "31px", color: "green" }} />
            <Typography variant="h5" color="green">
              Aula
            </Typography>
          </Box>
          {loading ? (
            <Typography variant="body1" sx={{ marginLeft: "5px" }}>
              Carregando...
            </Typography>
          ) : schedule ? (
            <Box sx={{ marginLeft: "5px" }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Professor:</strong> {schedule.teacher}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Disciplina:</strong> {schedule.discipline}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Turma:</strong> {schedule.class}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Turno:</strong> {schedule.turn}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Calendário:</strong> {schedule.calendar}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body1" color="error" sx={{ marginLeft: "5px" }}>
              Grade não encontrada para o ID {disciplineId}.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ClassScheduleDetails;