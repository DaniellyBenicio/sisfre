import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CssBaseline,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Button
} from "@mui/material";
import { ArrowBack, Assignment, Schedule, Edit } from "@mui/icons-material";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Sidebar from "../../../components/SideBar";
import api from "../../../service/api";

const ClassScheduleDetails = ({ setAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { classScheduleId } = useParams(); 
  console.log("ID recebido na URL:", classScheduleId);
  const { schedule: initialSchedule } = location.state || {};
  const [schedule, setSchedule] = useState(initialSchedule);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialSchedule && classScheduleId) {
      const fetchSchedule = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Usuário não autenticado.");
          }

          const response = await api.get(`class-schedules/${classScheduleId}/details`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSchedule(response.data.schedule);
          setError(null);
        } catch (error) {
          console.error("Erro ao buscar horário:", error);
          setError(error.response?.data?.message || "Erro ao carregar os detalhes do horário.");
        }
      };
      fetchSchedule();
    }
  }, [initialSchedule, classScheduleId]);

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Assignment sx={{ fontSize: "31px", color: "green" }} />
            <Typography variant="h5" color="green">
              Aula
            </Typography>
          </Box>

          <Divider sx={{ backgroundColor: "#C7C7C7", my: 2 }} />

          {error ? (
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          ) : schedule ? (
            <Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Professor:</strong>{" "}
                {schedule.details[0]?.professor?.username || "N/A"}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Disciplina:</strong>{" "}
                {schedule.details[0]?.discipline?.name || "N/A"}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Turma:</strong> {schedule.class?.semester || "N/A"}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Turno:</strong>{" "}
                {schedule.turn === "MATUTINO"
                  ? "Manhã"
                  : schedule.turn === "VESPERTINO"
                  ? "Tarde"
                  : "Noite"}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Calendário:</strong>{" "}
                  {schedule.calendar?.startDate
                  ? `${new Date(schedule.calendar.startDate).getFullYear()}.${new Date(schedule.calendar.startDate).getMonth() < 6 ? '1' : '2'}`
                  : "N/A"}              
              </Typography>
            </Box>
          ) : (
            <Typography variant="body1" color="error">
              Nenhum dado disponível para est a grade de turma.
            </Typography>
          )}
        </Box>

        {/* Horários */}
        {schedule && schedule.details && schedule.details.length > 0 ? (
          <Box component={Paper} elevation={3} sx={{ p: 5, m: 4, borderRadius: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Schedule sx={{ fontSize: "31px", color: "green" }} />
              <Typography variant="h5" color="green" >
                Horários
              </Typography>
            </Box>

            <Divider sx={{ backgroundColor: "#C7C7C7", my: 2 }} />

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Dia da Semana</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Início</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Fim</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule.details.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>{detail.dayOfWeek || "N/A"}</TableCell>
                    <TableCell>{detail.hour?.hourStart || "N/A"}</TableCell>
                    <TableCell>{detail.hour?.hourEnd || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Box component={Paper} elevation={3} sx={{ p: 5, m: 4, borderRadius: 3 }}>
            <Typography variant="body1" color="error">
              Nenhum horário disponível para esta grade de turma.
            </Typography>
          </Box>
        )}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, mr: 4 }}>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate(`/class-schedule/${classScheduleId}/edit`)}
          sx={{
            width: "fit-content",
            minWidth: 100,
            padding: { xs: "8px 20px", sm: "8px 28px" },
            backgroundColor: "#087619",
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#fff",
            "&:hover": { backgroundColor: "#066915" },
          }}
        >
          Editar
        </Button>
      </Box>
      </Box>
    </Box>
  );
};

export default ClassScheduleDetails;