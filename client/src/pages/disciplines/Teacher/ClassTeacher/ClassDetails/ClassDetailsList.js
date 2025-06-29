import React, { useMemo } from "react";
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
  Divider,
  CircularProgress,
} from "@mui/material"; 
import {
  Class,
  ArrowBack,
  History,
  School,
  CalendarToday,
  MenuBook,
  AccessTime,
} from "@mui/icons-material";

const ClassDetailsList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  const classItem = state?.classItem;
  const loading = false;
  const error = null;

  const greenPrimary = "#087619";
  const greenLight = "#e8f5e9";
  const greyBorder = "#e0e0e0";
  const greyDivider = "#C7C7C7";
  const textColor = "#424242";
  const textSecondaryColor = "#757575";

  const handleBackClick = () => {
    navigate(-1);
  };

  /**
   * Função para processar os horários e agrupá-los por turno.
   * Retorna um objeto onde as chaves são os turnos (MANHÃ, TARDE, NOITE).
   */
  const groupedScheduleByTurno = useMemo(() => {
    const schedules = classItem?.schedule || [];

    const dayMapping = {
      segunda: "Segunda",
      terca: "Terça",
      quarta: "Quarta",
      quinta: "Quinta",
      sexta: "Sexta",
      sabado: "Sábado",
      "segunda-feira": "Segunda",
      "terça-feira": "Terça",
      "quarta-feira": "Quarta",
      "quinta-feira": "Quinta",
      "sexta-feira": "Sexta",
      sábado: "Sábado",
    };

    const turnos = {
      MANHÃ: { start: "07:00", end: "12:00" },
      TARDE: { start: "12:00", end: "18:00" },
      NOITE: { start: "18:00", end: "23:59" },
    };

    const disciplineAcronym =
      classItem?.discipline?.acronym || classItem?.discipline || "N/A";
    const disciplineName =
      classItem?.discipline?.name || classItem?.discipline || "Não Informada";
    const allTimeSlots = Array.from(
      new Set(
        schedules.map(
          (slot) => `${slot.startTime || ""} - ${slot.endTime || ""}`
        )
      )
    ).sort();

    const groupedByTurno = {
      MANHÃ: [],
      TARDE: [],
      NOITE: [],
    };

    allTimeSlots.forEach((timeSlot) => {
      const [startTime] = timeSlot.split(" - ");
      const turnoDoSlot =
        startTime >= turnos["MANHÃ"].start && startTime < turnos["MANHÃ"].end
          ? "MANHÃ"
          : startTime >= turnos["TARDE"].start &&
            startTime < turnos["TARDE"].end
          ? "TARDE"
          : startTime >= turnos["NOITE"].start &&
            startTime <= turnos["NOITE"].end
          ? "NOITE"
          : null;

      if (turnoDoSlot) {
        const row = { timeSlot };
        ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].forEach(
          (day) => {
            row[day] = null;
          }
        );

        schedules.forEach((slot) => {
          const slotTimeKey = `${slot.startTime || ""} - ${slot.endTime || ""}`;
          const normalizedDay =
            dayMapping[
              slot.day
                ?.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
            ] || slot.day;

          if (slotTimeKey === timeSlot && row.hasOwnProperty(normalizedDay)) {
            row[normalizedDay] = {
              disciplineAcronym: disciplineAcronym,
              disciplineName: disciplineName,
            };
          }
        });
        groupedByTurno[turnoDoSlot].push(row);
      }
    });

    return groupedByTurno;
  }, [classItem]);

  const daysOfWeek = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  if (!classItem) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Nenhuma turma selecionada.
        </Typography>
        <IconButton
          onClick={handleBackClick}
          sx={{ mt: 2, color: greenPrimary }}
        >
          <ArrowBack />
        </IconButton>
      </Box>
    );
  }

  const fullDisciplineName =
    classItem?.discipline?.name || classItem?.discipline || "N/A";
  const hasSchedule = Object.values(groupedScheduleByTurno).some(
    (arr) => arr.length > 0
  );

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
      {/* Botão de voltar e Título */}
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
            color: greenPrimary,
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
          sx={{ fontWeight: "bold", color: greenPrimary, m: 0 }}
        >
          Detalhes da Turma
        </Typography>
      </Box>

      {/* Seção de Horário (Agora como um Card) */}
      <Card
        sx={{
          backgroundColor: "#FFFFFF",
          boxShadow: `0 6px 12px rgba(8, 118, 25, 0.1), 0 3px 6px rgba(8, 118, 25, 0.05)`,
          borderRadius: 2,
          border: `1px solid ${greyBorder}`,
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
              borderBottom: `1px solid ${greyDivider}`,
            }}
          >
            <History sx={{ fontSize: 30, color: greenPrimary, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: greenPrimary }}
            >
              Horário
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress sx={{ color: greenPrimary }} />
            </Box>
          ) : error ? (
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          ) : !hasSchedule ? (
            <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
              Nenhum horário disponível para esta grade de turma.
            </Typography>
          ) : (
            <Box>
              {Object.keys(groupedScheduleByTurno).map((turno) => {
                const scheduleForTurno = groupedScheduleByTurno[turno];
                if (scheduleForTurno.length === 0) {
                  return null;
                }

                return (
                  <Box
                    key={turno}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      mb: 4,
                      gap: 2,
                    }}
                  >
                    {/* Título do Turno na Vertical */}
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

                    {/* Tabela para o Turno */}
                    <TableContainer
                      component={Paper}
                      elevation={0}
                      sx={{
                        flex: 1,
                        border: `1px solid ${greyBorder}`,
                        borderRadius: 2,
                      }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{ fontWeight: "bold", color: textColor }}
                            >
                              Horário
                            </TableCell>
                            {daysOfWeek.map((day) => (
                              <TableCell
                                key={day}
                                sx={{ fontWeight: "bold", color: textColor }}
                              >
                                {day}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {scheduleForTurno.map((row, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell sx={{ color: textColor }}>
                                {row.timeSlot || "N/A"}
                              </TableCell>
                              {daysOfWeek.map((day) => (
                                <TableCell key={day}>
                                  {row[day] ? (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{ color: textColor }}
                                      >
                                        {row[day].disciplineAcronym}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color={textSecondaryColor}
                                      >
                                        {row[day].professorAcronym}
                                      </Typography>
                                    </Box>
                                  ) : (
                                    <Typography
                                      variant="body2"
                                      color={textSecondaryColor}
                                    >
                                      -
                                    </Typography>
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Card de Legenda (Mantido em baixo) */}
      <Card
        sx={{
          backgroundColor: "#FFFFFF",
          boxShadow: `0 6px 12px rgba(8, 118, 25, 0.1), 0 3px 6px rgba(8, 118, 25, 0.05)`,
          borderRadius: 2,
          border: `1px solid ${greyBorder}`,
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
              borderBottom: `1px solid ${greyDivider}`,
            }}
          >
            <Class sx={{ fontSize: 30, color: greenPrimary, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: greenPrimary }}
            >
              Turma
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <School sx={{ fontSize: 20, color: greenPrimary }} />
              <Typography sx={{ color: textColor }}>
                <strong>Curso:</strong> {classItem.course || "N/A"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarToday sx={{ fontSize: 20, color: greenPrimary }} />
              <Typography sx={{ color: textColor }}>
                <strong>Calendário Letivo:</strong>{" "}
                {classItem.calendar || "N/A"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MenuBook sx={{ fontSize: 20, color: greenPrimary }} />
              <Typography sx={{ color: textColor }}>
                <strong>Disciplina:</strong> {fullDisciplineName}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTime sx={{ fontSize: 20, color: greenPrimary }} />
              <Typography sx={{ color: textColor }}>
                <strong>Turno:</strong> {classItem.shift || "N/A"}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClassDetailsList;
