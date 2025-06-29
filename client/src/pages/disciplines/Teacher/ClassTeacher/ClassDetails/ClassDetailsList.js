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
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, textAlign: "center" }}>
        <Typography
          variant="h6"
          color="error"
          sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "1.25rem" } }}
        >
          Nenhuma turma selecionada.
        </Typography>
        <IconButton
          onClick={handleBackClick}
          aria-label="Voltar"
          sx={{
            mt: 1,
            color: greenPrimary,
            fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.5rem" },
            p: { xs: 1, sm: 1.5 },
          }}
        >
          <ArrowBack fontSize="inherit" />
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
        p: { xs: 1, sm: 2, md: 3 },
        width: "100%",
        maxWidth: { xs: "100%", sm: "95%", md: "900px" },
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1, sm: 2, md: 3 },
      }}
    >
      {/* Botão de voltar e Título */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          mb: { xs: 1, sm: 1.5, md: 2 },
        }}
      >
        <IconButton
          onClick={handleBackClick}
          aria-label="Voltar"
          sx={{
            position: "absolute",
            left: 0,
            color: greenPrimary,
            "&:hover": {
              backgroundColor: "rgba(8, 118, 25, 0.08)",
            },
            fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.5rem" },
            p: { xs: 1, sm: 1.5 },
          }}
        >
          <ArrowBack fontSize="inherit" />
        </IconButton>
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: greenPrimary,
            m: 0,
            fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
          }}
        >
          Detalhes da Turma
        </Typography>
      </Box>

      {/* Seção de Horário (Card) */}
      <Card
        sx={{
          backgroundColor: "#FFFFFF",
          boxShadow: `0 6px 12px rgba(8, 118, 25, 0.1), 0 3px 6px rgba(8, 118, 25, 0.05)`,
          borderRadius: 2,
          border: `1px solid ${greyBorder}`,
          p: { xs: 1, sm: 1.5, md: 2 },
        }}
      >
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: { xs: 0.5, sm: 1, md: 2 },
              pb: { xs: 0.5, sm: 1 },
              borderBottom: `1px solid ${greyDivider}`,
            }}
          >
            <History
              sx={{
                fontSize: { xs: 20, sm: 24, md: 30 },
                color: greenPrimary,
                mr: 1,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: greenPrimary,
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1.25rem" },
              }}
            >
              Horário
            </Typography>
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: { xs: 1, sm: 2, md: 3 },
              }}
            >
              <CircularProgress sx={{ color: greenPrimary }} />
            </Box>
          ) : error ? (
            <Typography
              variant="body1"
              color="error"
              sx={{
                p: { xs: 1, sm: 2 },
                fontSize: { xs: "0.8rem", sm: "0.875rem", md: "1rem" },
              }}
            >
              {error}
            </Typography>
          ) : !hasSchedule ? (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                p: { xs: 1, sm: 2 },
                fontSize: { xs: "0.8rem", sm: "0.875rem", md: "1rem" },
              }}
            >
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
                      display: { xs: "block", sm: "flex" },
                      alignItems: { sm: "flex-start" },
                      mb: { xs: 1.5, sm: 2, md: 4 },
                      gap: { sm: 2 },
                    }}
                  >
                    {/* Título do Turno */}
                    <Box
                      sx={{
                        backgroundColor: greenLight,
                        py: { xs: 0.5, sm: 1 },
                        px: { xs: 1, sm: 2 },
                        borderRadius: 1,
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: { xs: "100%", sm: "40px" },
                        minHeight: { xs: "auto", sm: "100px" },
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          writingMode: {
                            xs: "horizontal-tb",
                            sm: "vertical-rl",
                          },
                          textOrientation: { sm: "mixed" },
                          transform: { sm: "rotate(180deg)" },
                          fontWeight: "bold",
                          color: greenPrimary,
                          letterSpacing: { sm: "2px" },
                          fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                        }}
                      >
                        {turno}
                      </Typography>
                    </Box>

                    {/* Mobile: Card-based layout */}
                    <Box
                      sx={{
                        display: { xs: "block", sm: "none" },
                      }}
                    >
                      {scheduleForTurno.map((row, index) => (
                        <Box
                          key={index}
                          sx={{
                            mb: 1,
                            p: 1,
                            border: `1px solid ${greyBorder}`,
                            borderRadius: 1,
                            backgroundColor: "#fff",
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: "bold",
                              fontSize: "0.8rem",
                              color: textColor,
                              mb: 0.5,
                            }}
                          >
                            {row.timeSlot || "N/A"}
                          </Typography>
                          {daysOfWeek.map(
                            (day) =>
                              row[day] && (
                                <Box
                                  key={day}
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    py: 0.5,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: "0.75rem",
                                      color: textColor,
                                    }}
                                  >
                                    {day}:
                                  </Typography>
                                  <Box sx={{ textAlign: "right" }}>
                                    <Typography
                                      sx={{
                                        fontSize: "0.75rem",
                                        color: textColor,
                                      }}
                                    >
                                      {row[day].disciplineAcronym}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: "0.7rem",
                                        color: textSecondaryColor,
                                      }}
                                    >
                                      {" "}
                                    </Typography>
                                  </Box>
                                </Box>
                              )
                          )}
                        </Box>
                      ))}
                    </Box>

                    {/* Desktop/Tablet: Table layout */}
                    <TableContainer
                      component={Paper}
                      elevation={0}
                      sx={{
                        display: { xs: "none", sm: "block" },
                        flex: 1,
                        border: `1px solid ${greyBorder}`,
                        borderRadius: 2,
                        overflowX: "auto",
                      }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell
                              scope="col"
                              sx={{
                                fontWeight: "bold",
                                color: textColor,
                                fontSize: {
                                  sm: "0.8rem",
                                  md: "0.875rem",
                                },
                                minWidth: 80,
                              }}
                            >
                              Horário
                            </TableCell>
                            {daysOfWeek.map((day) => (
                              <TableCell
                                key={day}
                                scope="col"
                                sx={{
                                  fontWeight: "bold",
                                  color: textColor,
                                  fontSize: {
                                    sm: "0.8rem",
                                    md: "0.875rem",
                                  },
                                  minWidth: 60,
                                }}
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
                              <TableCell
                                sx={{
                                  color: textColor,
                                  fontSize: {
                                    sm: "0.8rem",
                                    md: "0.875rem",
                                  },
                                }}
                              >
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
                                        sx={{
                                          color: textColor,
                                          fontSize: {
                                            sm: "0.8rem",
                                            md: "0.875rem",
                                          },
                                        }}
                                      >
                                        {row[day].disciplineAcronym}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color={textSecondaryColor}
                                        sx={{
                                          fontSize: {
                                            sm: "0.8rem",
                                            md: "0.875rem",
                                          },
                                        }}
                                      ></Typography>
                                    </Box>
                                  ) : (
                                    <Typography
                                      variant="body2"
                                      color={textSecondaryColor}
                                      sx={{
                                        fontSize: {
                                          sm: "0.8rem",
                                          md: "0.875rem",
                                        },
                                      }}
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

      {/* Card de Legenda */}
      <Card
        sx={{
          backgroundColor: "#FFFFFF",
          boxShadow: `0 6px 12px rgba(8, 118, 25, 0.1), 0 3px 6px rgba(8, 118, 25, 0.05)`,
          borderRadius: 2,
          border: `1px solid ${greyBorder}`,
          p: { xs: 1, sm: 1.5, md: 2 },
        }}
      >
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: { xs: 0.5, sm: 1, md: 2 },
              pb: { xs: 0.5, sm: 1 },
              borderBottom: `1px solid ${greyDivider}`,
            }}
          >
            <Class
              sx={{
                fontSize: { xs: 20, sm: 24, md: 30 },
                color: greenPrimary,
                mr: 1,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: greenPrimary,
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1.25rem" },
              }}
            >
              Turma
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: { xs: 0.5, sm: 0.75, md: 1 },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <School
                sx={{
                  fontSize: { xs: 14, sm: 16, md: 20 },
                  color: greenPrimary,
                }}
              />
              <Typography
                sx={{
                  color: textColor,
                  fontSize: { xs: "0.8rem", sm: "0.875rem", md: "1rem" },
                }}
              >
                <strong>Curso:</strong> {classItem.course || "N/A"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarToday
                sx={{
                  fontSize: { xs: 14, sm: 16, md: 20 },
                  color: greenPrimary,
                }}
              />
              <Typography
                sx={{
                  color: textColor,
                  fontSize: { xs: "0.8rem", sm: "0.875rem", md: "1rem" },
                }}
              >
                <strong>Calendário Letivo:</strong>{" "}
                {classItem.calendar || "N/A"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MenuBook
                sx={{
                  fontSize: { xs: 14, sm: 16, md: 20 },
                  color: greenPrimary,
                }}
              />
              <Typography
                sx={{
                  color: textColor,
                  fontSize: { xs: "0.8rem", sm: "0.875rem", md: "1rem" },
                }}
              >
                <strong>Disciplina:</strong> {fullDisciplineName}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTime
                sx={{
                  fontSize: { xs: 14, sm: 16, md: 20 },
                  color: greenPrimary,
                }}
              />
              <Typography
                sx={{
                  color: textColor,
                  fontSize: { xs: "0.8rem", sm: "0.875rem", md: "1rem" },
                }}
              >
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
