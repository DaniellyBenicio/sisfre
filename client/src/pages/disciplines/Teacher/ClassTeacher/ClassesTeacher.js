import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody, 
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Tooltip,
} from "@mui/material";
import {
  School,
  MenuBook,
} from "@mui/icons-material";
import api from "../../../../service/api";

const ClassesTeacher = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const greenPrimary = "#087619";
  const greenLight = "#e8f5e9";
  const greyBorder = "#e0e0e0";
  const greyDivider = "#C7C7C7";
  const textColor = "#424242";
  const textSecondaryColor = "#757575";

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await api.get("/teacher-schedules");
        setSchedules(response.data.schedules || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Erro ao carregar horários");
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const groupedScheduleByTurno = useMemo(() => {
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

    const allTimeSlots = Array.from(
      new Set(
        schedules.map(
          (slot) => `${slot.schedule.hour?.start || "N/A"} - ${slot.schedule.hour?.end || "N/A"}`
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
          : startTime >= turnos["TARDE"].start && startTime < turnos["TARDE"].end
          ? "TARDE"
          : startTime >= turnos["NOITE"].start && startTime <= turnos["NOITE"].end
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
          const slotTimeKey = `${slot.schedule.hour?.start || "N/A"} - ${slot.schedule.hour?.end || "N/A"}`;
          const normalizedDay =
            dayMapping[
              slot.schedule.dayOfWeek
                ?.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
            ] || slot.schedule.dayOfWeek;

          if (slotTimeKey === timeSlot && row.hasOwnProperty(normalizedDay)) {
            row[normalizedDay] = {
              disciplineAcronym: slot.discipline?.acronym || "N/A",
              disciplineName: slot.discipline?.name || "Não Informada",
              course: slot.course?.acronym || "N/A",
              courseName: slot.course?.name || "Não Informado",
              semester: slot.class?.semester || "N/A",
              calendar: slot.calendar?.formatted || "N/A",
              turn: slot.schedule?.turn || "N/A",
            };
          }
        });
        groupedByTurno[turnoDoSlot].push(row);
      }
    });

    return groupedByTurno;
  }, [schedules]);

  const legendData = useMemo(() => {
    const courseMap = new Map();

    schedules.forEach((slot) => {
      const courseId = slot.course?.id || "N/A";
      const courseName = slot.course?.name || "Não Informado";
      const disciplineKey = `${slot.discipline?.id}-${slot.class?.id}-${slot.calendar?.id}`;
      const disciplineInfo = {
        acronym: slot.discipline?.acronym || "N/A",
        name: slot.discipline?.name || "Não Informada",
      };

      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          courseName,
          disciplines: new Map(),
        });
      }

      courseMap.get(courseId).disciplines.set(disciplineKey, disciplineInfo);
    });

    return Array.from(courseMap.values()).map(({ courseName, disciplines }) => ({
      courseName,
      disciplines: Array.from(disciplines.values()),
    }));
  }, [schedules]);

  const daysOfWeek = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        width: "100%",
        maxWidth: { xs: "100%", sm: "95%", md: "900px" },
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1, sm: 1.5, md: 2 },
      }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{
          fontWeight: "bold",
          color: greenPrimary,
          mt: 0.5,
          mb: 0.5,
          fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
        }}
      >
        Meus Horários
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress sx={{ color: greenPrimary }} />
        </Box>
      ) : error ? (
        <Typography
          color="error"
          align="center"
          sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "1.25rem" } }}
        >
          {error}
        </Typography>
      ) : schedules.length === 0 ? (
        <Typography
          variant="body1"
          sx={{
            mt: 2,
            textAlign: "center",
            color: textSecondaryColor,
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.25rem" },
          }}
        >
          Nenhum horário encontrado.
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
                    alignSelf: { sm: "stretch" },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      writingMode: { xs: "horizontal-tb", sm: "vertical-rl" },
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

                <Box sx={{ display: { xs: "block", sm: "none" } }}>
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
                                <Tooltip
                                  title={
                                    <Box sx={{ p: 1, textAlign: "center" }}>
                                      <Typography
                                        sx={{
                                          fontSize: "0.85rem",
                                          color: "#fff",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {row[day].disciplineName}
                                      </Typography>
                                      <Typography
                                        sx={{
                                          fontSize: "0.8rem",
                                          color: "#fff",
                                        }}
                                      >
                                        {row[day].courseName}
                                      </Typography>
                                    </Box>
                                  }
                                  placement="top"
                                  sx={{
                                    "& .MuiTooltip-tooltip": {
                                      backgroundColor: greenPrimary,
                                      border: "none",
                                      borderRadius: 2,
                                      boxShadow: `0 4px 8px rgba(0, 0, 0, 0.2)`,
                                      padding: 0,
                                    },
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: "0.75rem",
                                      color: textColor,
                                      cursor: "default",
                                    }}
                                  >
                                    {row[day].disciplineAcronym}
                                  </Typography>
                                </Tooltip>
                                <Typography
                                  sx={{
                                    fontSize: "0.7rem",
                                    color: textSecondaryColor,
                                  }}
                                >
                                  {row[day].course} - {row[day].semester}
                                </Typography>
                              </Box>
                            </Box>
                          )
                      )}
                    </Box>
                  ))}
                </Box>

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
                            fontSize: { sm: "0.8rem", md: "0.875rem" },
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
                              fontSize: { sm: "0.8rem", md: "0.875rem" },
                              minWidth: 100,
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
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell
                            sx={{
                              color: textColor,
                              fontSize: { sm: "0.8rem", md: "0.875rem" },
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
                                  <Tooltip
                                    title={
                                      <Box sx={{ p: 1, textAlign: "center" }}>
                                        <Typography
                                          sx={{
                                            fontSize: "0.85rem",
                                            color: "#fff",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {row[day].disciplineName}
                                        </Typography>
                                        <Typography
                                          sx={{
                                            fontSize: "0.8rem",
                                            color: "#fff",
                                          }}
                                        >
                                          {row[day].courseName}
                                        </Typography>
                                      </Box>
                                    }
                                    placement="top"
                                    sx={{
                                      "& .MuiTooltip-tooltip": {
                                        backgroundColor: greenPrimary,
                                        border: "none",
                                        borderRadius: 2,
                                        boxShadow: `0 4px 8px rgba(0, 0, 0, 0.2)`,
                                        padding: 0,
                                      },
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: textColor,
                                        fontSize: { sm: "0.8rem", md: "0.875rem" },
                                        cursor: "default",
                                      }}
                                    >
                                      {row[day].disciplineAcronym}
                                    </Typography>
                                  </Tooltip>
                                  <Typography
                                    variant="body2"
                                    color={textSecondaryColor}
                                    sx={{
                                      fontSize: { sm: "0.7rem", md: "0.75rem" },
                                    }}
                                  >
                                    {row[day].course} - {row[day].semester}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color={textSecondaryColor}
                                  sx={{
                                    fontSize: { sm: "0.8rem", md: "0.875rem" },
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

          <Card
            sx={{
              backgroundColor: "#FFFFFF",
              boxShadow: `0 6px 12px rgba(8, 118, 25, 0.1), 0 3px 6px rgba(8, 118, 25, 0.05)`,
              borderRadius: 2,
              border: `1px solid ${greyBorder}`,
              p: { xs: 1, sm: 1.5, md: 2 },
              mt: 2,
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
                <School
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
                  Legenda das Turmas
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: { xs: 1, sm: 1.5, md: 2 },
                }}
              >
                {legendData.map((course, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      borderBottom:
                        index < legendData.length - 1
                          ? `1px solid ${greyDivider}`
                          : "none",
                      pb: index < legendData.length - 1 ? 1 : 0,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <School
                        sx={{
                          fontSize: { xs: 14, sm: 16, md: 20 },
                          color: greenPrimary,
                        }}
                      />
                      <Typography
                        sx={{
                          color: textColor,
                          fontWeight: "bold",
                          fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1.1rem" },
                        }}
                      >
                        Curso: {course.courseName}
                      </Typography>
                    </Box>
                    <Box sx={{ pl: { xs: 2, sm: 3, md: 4 } }}>
                      <Typography
                        sx={{
                          color: textColor,
                          fontWeight: "bold",
                          fontSize: { xs: "0.8rem", sm: "0.875rem", md: "1rem" },
                          mb: 0.5,
                        }}
                      >
                        Disciplinas:
                      </Typography>
                      {course.disciplines.map((discipline, disciplineIndex) => (
                        <Box
                          key={disciplineIndex}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: disciplineIndex < course.disciplines.length - 1 ? 0.5 : 0,
                          }}
                        >
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
                            {discipline.acronym} - {discipline.name}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default ClassesTeacher;