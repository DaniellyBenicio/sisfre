import React from "react";
import {
  Box,
  Typography,
  Paper,
  CssBaseline,
  IconButton,
} from "@mui/material";
import { ArrowBack, Assignment } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../../components/SideBar";

const ClassScheduleDetails = ({ setAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { schedule } = location.state || {};

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

          {schedule ? (
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
              Nenhum dado disponível para esta grade de turma.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ClassScheduleDetails;
