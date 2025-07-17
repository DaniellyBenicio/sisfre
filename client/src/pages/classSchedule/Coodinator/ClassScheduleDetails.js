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
  CircularProgress,
} from "@mui/material";
import { ArrowBack, School, History, Edit } from "@mui/icons-material";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Sidebar from "../../../components/SideBar";
import api from "../../../service/api";
import ScheduleTable from "../../../components/scheduleTable/ScheduleTable";

const ClassScheduleDetails = ({ setAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { classScheduleId } = useParams();
  console.log("ID recebido na URL:", classScheduleId);
  const { schedule: initialSchedule } = location.state || {};
  const [schedule, setSchedule] = useState(initialSchedule);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!initialSchedule);
  const accessType = localStorage.getItem("accessType") || "";

  const greenLight = "#E8F5E9";
  const greenPrimary = "#087619";
  const greyBorder = "#C7C7C7";

  const getTurnoFromTimeSlot = (timeSlot) => {
    if (!timeSlot) return null;
    const [startHour] = timeSlot
      .split("-")
      .map((t) => parseInt(t.split(":")[0]));
    if (startHour >= 6 && startHour < 12) return "Manhã";
    if (startHour >= 12 && startHour < 18) return "Tarde";
    if (startHour >= 18 && startHour <= 23) return "Noite";
    return null;
  };

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
          setLoading(true);
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Usuário não autenticado.");
          }

          const response = await api.get(
            `/class-schedules/${classScheduleId}/details`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("API Response:", response.data);

          const normalizedSchedule = {
            ...response.data.schedule,
            nome_curso: response.data.schedule.course?.name || "N/A",
            sigla_curso: response.data.schedule.course?.acronym || "N/A",
          };
          setSchedule(response.data.schedule);
          setError(null);
        } catch (error) {
          console.error("Erro ao buscar horário:", error);
          setError(
            error.response?.data?.message ||
              "Erro ao carregar os detalhes do horário."
          );
        } finally {
          setLoading(false);
        }
      };
      fetchSchedule();
    } else {
      const normalizedInitialSchedule = initialSchedule
      ? {
          ...initialSchedule,
          nome_curso: initialSchedule.course?.name || initialSchedule.nome_curso || "N/A",
          sigla_curso: initialSchedule.course?.acronym || initialSchedule.sigla_curso || "N/A",
        }
      : null;
      setSchedule(normalizedInitialSchedule || initialSchedule);
      setLoading(false);
    }
  }, [initialSchedule, classScheduleId]);

  const daysOfWeek = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];
  const timeSlots = [
    ...new Set(
      schedule?.details?.map(
        (detail) => `${detail.hour?.hourStart} - ${detail.hour?.hourEnd}`
      ) || []
    ),
  ].sort();

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
            disciplineName: detail.discipline?.name || "N/A",
            disciplineAcronym:
              detail.discipline?.acronym || detail.discipline?.sigla || "",
            professorName: detail.professor?.username || "Sem professor",
            professorAcronym:
              detail.professor?.acronym || detail.professor?.sigla || "",
            hourId: detail.hourId || null,
          }
        : null;
    });
    return row;
  });

  const groupedByTurno = scheduleMatrix.reduce(
    (acc, row) => {
      const turno = getTurnoFromTimeSlot(row.timeSlot);
      if (turno) {
        if (!acc[turno]) acc[turno] = [];
        acc[turno].push(row);
      }
      return acc;
    },
    { Manhã: [], Tarde: [], Noite: [] }
  );

  return (
    <Box display="flex">
      <CssBaseline />
      <Sidebar setAuthenticated={setAuthenticated} />

      <Box sx={{ flexGrow: 1, p: 4, mt: 4 }}>
        <Box
          sx={{
            position: "relative",
            alignItems: "center",
            gap: 1,
            mb: 3,
          }}
        >
          <IconButton
            onClick={() =>
              navigate(
                accessType === "Admin"
                  ? "/classSchedule"
                  : schedule?.isActive
                  ? "/class-schedule"
                  : "/class-schedule/archived"
              )
            }
            sx={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <ArrowBack sx={{ color: "green", fontSize: "2.2rem" }} />
          </IconButton>
          <Typography
            variant="h5"
            align="center"
            sx={{ fontWeight: "bold", mt: 2 }}
          >
            Detalhes de Grade de Turma
          </Typography>
        </Box>

        {/* Horários */}
        <Box
          component={Paper}
          elevation={3}
          sx={{ p: 5, m: 4, borderRadius: 3 }}
        >
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

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress sx={{ color: "green" }} />
            </Box>
          ) : error && !schedule?.details?.length ? (
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          ) : schedule?.details?.length > 0 ? (
            ["Manhã", "Tarde", "Noite"].map((turno) => {
              const turnoMatrix = groupedByTurno[turno] || [];
              return (
                turnoMatrix.length > 0 && (
                  <Box
                    key={turno}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      mb: 4,
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: greenLight,
                        py: 1,
                        px: 2,
                        borderRadius: 1,
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "100px",
                        alignSelf: "stretch",
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                          transform: "rotate(180deg)",
                          fontWeight: "bold",
                          color: greenPrimary,
                          letterSpacing: "2px",
                        }}
                      >
                        {turno}
                      </Typography>
                    </Box>
                    <ScheduleTable
                      scheduleMatrix={turnoMatrix}
                      daysOfWeek={daysOfWeek}
                      disableTooltips={true}
                      sx={{
                        border: `1px solid ${greyBorder}`,
                      }}
                    />
                  </Box>
                )
              );
            })
          ) : (
            <Typography variant="body1" color="text.secondary">
              Nenhum horário disponível para esta grade de turma.
            </Typography>
          )}
        </Box>

        {/* Turma */}
        <Box
          component={Paper}
          elevation={3}
          sx={{ p: 5, m: 4, borderRadius: 3 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <School sx={{ fontSize: "31px", color: "green" }} />
            <Typography variant="h5" color="green">
              Turma
            </Typography>
          </Box>

          <Divider sx={{ backgroundColor: "#C7C7C7", my: 2 }} />

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress sx={{ color: "green" }} />
            </Box>
          ) : error && !schedule ? (
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          ) : schedule ? (
            <Box>
              {accessType === "Admin" && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Curso:</strong>{" "}
                  {schedule.course?.name && schedule.course?.acronym
                    ? `${schedule.course.name} - ${schedule.course.acronym}`
                    : schedule.course?.name || schedule.course?.acronym || "N/A"}
                </Typography>
              )}
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Turma:</strong> {schedule.class?.semester || "N/A"}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Turno: </strong>
                {determineTurn(schedule)}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Calendário:</strong>{" "}
                {schedule.calendar?.startDate
                  ? `${new Date(schedule.calendar.startDate).getFullYear()}.${
                      new Date(schedule.calendar.startDate).getMonth() < 6
                        ? "1"
                        : "2"
                    } - ${schedule.calendar.type}`
                  : "N/A"}
              </Typography>

              {schedule.details?.length > 0 ? (
                <Box>
                  <Table sx={{ minWidth: 300, border: "1px solid #E0E0E0" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            color: "#000",
                            borderBottom: "1px solid #E0E0E0",
                            py: 1,
                          }}
                        >
                          Professor
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            color: "#000",
                            borderBottom: "1px solid #E0E0E0",
                            py: 1,
                          }}
                        >
                          Disciplina
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        ...new Map(
                          schedule.details.map((detail) => [
                            `${detail.discipline?.id}-${
                              detail.professor?.id || "N/A"
                            }`,
                            detail,
                          ])
                        ).values(),
                      ].map((detail, index) => (
                        <TableRow
                          key={index}
                          sx={{ "&:last-child td": { borderBottom: 0 } }}
                        >
                          <TableCell sx={{ py: 1, color: "#333" }}>
                            {detail.professor
                              ? `${detail.professor.username} - ${
                                  detail.professor.acronym || ""
                                }`
                              : "Sem professor"}
                          </TableCell>
                          <TableCell sx={{ py: 1, color: "#333" }}>
                            {detail.discipline
                              ? `${detail.discipline.name} - ${
                                  detail.discipline.acronym || ""
                                }`
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Nenhum detalhe de aula disponível.
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Nenhum dado disponível para esta grade de turma.
            </Typography>
          )}
        </Box>

        {schedule?.isActive && accessType === "Coordenador" && (
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", mt: 2, mr: 4 }}
          >
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() =>
                navigate(`/class-schedule/edit/${classScheduleId}`)
              }
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
        )}
      </Box>
    </Box>
  );
};

export default ClassScheduleDetails;