import React, { useEffect, useState } from "react";
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
  Button,
} from "@mui/material";
import {
  ArrowBack,
  Assignment,
  History,
  ChevronLeft,
  ChevronRight,
  Edit,
} from "@mui/icons-material";
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
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);

  const determineTurn = (data) => {
    let turnCounts = data.turnCounts || {
      MATUTINO: 0,
      VESPERTINO: 0,
      NOTURNO: 0,
    };

    if (!data.turnCounts && data.details) {
      turnCounts = data.details.reduce(
        (counts, detail) => {
          if (detail.turn) {
            counts[detail.turn] = (counts[detail.turn] || 0) + 1;
          }
          return counts;
        },
        { MATUTINO: 0, VESPERTINO: 0, NOTURNO: 0 }
      );
    }

    const { MATUTINO, VESPERTINO, NOTURNO } = turnCounts;
    const totalLessons = MATUTINO + VESPERTINO + NOTURNO;

    if (totalLessons === 0) {
      return "N/A";
    }

    const maxLessons = Math.max(MATUTINO, VESPERTINO, NOTURNO);

    const maxShifts = [
      { shift: "Manhã", count: MATUTINO },
      { shift: "Tarde", count: VESPERTINO },
      { shift: "Noite", count: NOTURNO },
    ].filter((s) => s.count === maxLessons);

    if (maxShifts.length > 1) {
      return "Integral";
    }

    if (maxLessons === MATUTINO) return "Manhã";
    if (maxLessons === VESPERTINO) return "Tarde";
    if (maxLessons === NOTURNO) return "Noite";

    return "N/A";
  };

  useEffect(() => {
    if (!initialSchedule && classScheduleId) {
      const fetchSchedule = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Usuário não autenticado.");
          }

          const response = await api.get(`/class-schedules/${classScheduleId}/details`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("API Response:", response.data);
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

  const handlePreviousDetail = () => {
    setCurrentDetailIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextDetail = () => {
    setCurrentDetailIndex((prev) =>
      Math.min(prev + 1, (schedule?.details?.length || 1) - 1)
    );
  };

  const currentDetail = schedule?.details?.[currentDetailIndex];

  const daysOfWeek = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const timeSlots = [...new Set(
    schedule?.details?.map((detail) =>
      `${detail.hour?.hourStart} - ${detail.hour?.hourEnd}`
    ) || []
  )].sort();

  const scheduleMatrix = timeSlots.map((timeSlot) => {
    const row = { timeSlot };
    daysOfWeek.forEach((day) => {
      const detail = schedule?.details?.find(
        (d) =>
          d.dayOfWeek?.replace("-feira", "") === day &&
          `${d.hour?.hourStart} - ${d.hour?.hourEnd}` === timeSlot
      );
      row[day] = detail
        ? {
            discipline: detail.discipline?.name || "N/A",
            disciplineAcronym: detail.discipline?.acronym || detail.discipline?.sigla || "",
            professor: detail.professor?.username || "Sem professor",
            professorAcronym: detail.professor?.acronym || detail.professor?.sigla || "",
          }
        : null;
    });
    return row;
  });

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
                <strong>Turma:</strong> {schedule.class?.semester || "N/A"}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Turno: </strong>{determineTurn(schedule)}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Calendário:</strong>{" "}
                  {schedule.calendar?.startDate
                  ? `${new Date(schedule.calendar.startDate).getFullYear()}.${new Date(schedule.calendar.startDate).getMonth() < 6 ? '1' : '2'}`
                  : "N/A"}              
              </Typography>
              
              {schedule.details?.length > 0 ? (
                <>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Professor:</strong>{" "}
                    {currentDetail?.professor
                      ? `${currentDetail.professor.username} - ${currentDetail.professor.acronym || ""}`
                      : "Sem professor"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Disciplina:</strong>{" "}
                    {currentDetail?.discipline
                      ? `${currentDetail.discipline.name} - ${currentDetail.discipline.acronym || ""}`
                      : "N/A"}
                  </Typography>

                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 2 }}>
                    <IconButton
                      onClick={handlePreviousDetail}
                      disabled={currentDetailIndex === 0}
                      sx={{
                        color: "green",
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <ChevronLeft />
                    </IconButton>

                    <Typography variant="body2" sx={{ minWidth: 60, textAlign: "center" }}>
                      {currentDetailIndex + 1} de {schedule.details.length}
                    </Typography>

                    <IconButton
                      onClick={handleNextDetail}
                      disabled={currentDetailIndex === schedule.details.length - 1}
                      sx={{
                        color: "green",
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <ChevronRight />
                    </IconButton>
                  </Box>
                </>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Nenhum detalhe de aula disponível.
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body1" color="error">
              Nenhum dado disponível para esta grade de turma.
            </Typography>
          )}
        </Box>

        {/* Horários */}
        <Box component={Paper} elevation={3} sx={{ p: 5, m: 4, borderRadius: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Box
              sx={{
                backgroundColor: "green",
                borderRadius: "50%",
                width: 35,
                height: 35,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <History sx={{ color: "white", fontSize: 27 }} />
            </Box>
            <Typography variant="h5" color="green">
              Horário
            </Typography>
          </Box>

          <Divider sx={{ backgroundColor: "#C7C7C7", my: 2 }} />

          {schedule?.details?.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Horário</strong></TableCell>
                  {daysOfWeek.map((day) => (
                    <TableCell key={day}><strong>{day}</strong></TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {scheduleMatrix.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.timeSlot || "N/A"}</TableCell>
                    {daysOfWeek.map((day) => (
                      <TableCell key={day}>
                        {row[day] ? (
                          <Box sx={{ display: "flex", flexDirection: "column" }}>
                            <Typography variant="body2">{row[day].disciplineAcronym}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {row[day].professorAcronym}
                            </Typography>
                          </Box>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body1" color="error">
              Nenhum horário disponível para esta grade de turma.
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, mr: 4 }}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/class-schedule/edit/${classScheduleId}`)}
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