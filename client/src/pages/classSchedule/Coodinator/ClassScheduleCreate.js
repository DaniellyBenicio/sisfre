import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Button, MenuItem, Grid, Paper, CssBaseline, IconButton, Alert, Table, TableHead, TableRow, TableCell, 
  TableBody, Divider, Tooltip, TableContainer
} from "@mui/material";
import { ArrowBack, Close, Save, School, History, Delete, AddCircleOutline, Remove, Check } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SideBar";
import api from "../../../service/api";
import { CustomAlert } from "../../../components/alert/CustomAlert";
import DeleteConfirmationDialog from "../../../components/DeleteConfirmationDialog";
import CustomAutocomplete from "../../../components/inputs/CustomAutocompletePage";
import CustomSelect from "../../../components/inputs/CustomSelectPage";
import ScheduleTable from "../../../components/scheduleTable/ScheduleTable";

const ClassScheduleCreate = ({ setAuthenticated }) => {
  const [formData, setFormData] = useState({
    classId: "",
    calendarId: "",
    details: [
      {
        disciplineId: "",
        professorId: "",
        dayOfWeek: "",
        turn: "",
        selectedHourStartId: "",
        selectedHourEndId: "",
        displayStartTime: "",
        displayEndTime: "",
      },
    ],
    isActive: true,
  });
  const [confirmedDetails, setConfirmedDetails] = useState([]);
  const [classes, setClasses] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [availableHoursByDetail, setAvailableHoursByDetail] = useState({});
  const [hoursLoadingByDetail, setHoursLoadingByDetail] = useState({});
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailToDelete, setDetailToDelete] = useState(null);
  const errorRef = useRef(null);

  const clearErrors = () => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.detail;
      delete newErrors.message;
      return newErrors;
    });
  };

  useEffect(() => {
    if (
      errors.message ||
      errors.classes ||
      errors.disciplines ||
      errors.professors ||
      errors.calendars ||
      errors.hours ||
      errors.detail
    ) {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [errors]);

  const handleAlertClose = () => {
    setAlert(null);
  };

  const greenLight = "#E8F5E9";
  const greenPrimary = "#087619";
  const greyBorder = "#C7C7C7";

  useEffect(() => {
    const fetchData = async () => {
      setErrors({});
      try {
        const [classesRes, disciplinesRes, usersRes, calendarsRes] = await Promise.all([
          api.get("/classes-coordinator").catch((err) => ({ data: [] })),
          api.get("/course/discipline").catch((err) => ({ data: [] })),
          api.get("/users").catch((err) => ({ data: { users: [] } })),
          api.get("/calendar").catch((err) => ({ data: { calendars: [] } })),
        ]);

        setClasses(Array.isArray(classesRes.data.classes) ? classesRes.data.classes : []);
        setDisciplines(Array.isArray(disciplinesRes.data) ? disciplinesRes.data : []);
        const filteredProfessors = Array.isArray(usersRes.data.users)
        ? usersRes.data.users.filter((user) => user.accessType === "Professor" && user.isActive === true)
        : [];
        setProfessors(filteredProfessors);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setCalendars(
          Array.isArray(calendarsRes.data.calendars)
            ? calendarsRes.data.calendars
                .filter((calendar) => {
                  const endDate = new Date(calendar.endDate);
                  return endDate > today;
                })
                .map((calendar) => ({
                  ...calendar,
                  display: `${calendar.year}.${calendar.period} - ${calendar.type || "N/A"}`,
                }))
            : []
        );

        if (!classesRes.data.classes?.length) {
          setErrors((prev) => ({
            ...prev,
            classes: "Não foi possível carregar as turmas.",
          }));
        }
        if (!disciplinesRes.data?.length) {
          setErrors((prev) => ({
            ...prev,
            disciplines: "Não foi possível carregar as disciplinas.",
          }));
        }
        if (!filteredProfessors.length) {
          setErrors((prev) => ({
            ...prev,
            professors: "Não foi possível carregar os professores.",
          }));
        }
        if (!calendarsRes.data.calendars?.length) {
          setErrors((prev) => ({
            ...prev,
            calendars: "Não foi possível carregar os calendários.",
          }));
        }
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          message: error.response?.data?.message || "Erro ao carregar os dados. Tente novamente.",
        }));
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchHoursForDetail = async (index, turn, dayOfWeek) => {
      if (turn && dayOfWeek) {
        setHoursLoadingByDetail((prev) => ({ ...prev, [index]: true }));
        try {
          let backendTurn = "";
          switch (turn) {
            case "Manhã":
              backendTurn = "MATUTINO";
              break;
            case "Tarde":
              backendTurn = "VESPERTINO";
              break;
            case "Noite":
              backendTurn = "NOTURNO";
              break;
            default:
              backendTurn = "";
          }

          if (backendTurn) {
            const response = await api.get(`/hours?turn=${backendTurn}`);
            let fetchedHours = response.data.hours || response.data;
            const usedHourIds = new Set();

            confirmedDetails.forEach((detail) => {
              if (
                detail.dayOfWeek.replace("-feira", "").toLowerCase() === dayOfWeek.replace("-feira", "").toLowerCase() &&
                detail.turn === turn
              ) {
                usedHourIds.add(detail.hourId);
              }
            });

            formData.details.forEach((detail, idx) => {
              if (idx !== index && detail.dayOfWeek === dayOfWeek && detail.turn === turn) {
                if (detail.selectedHourStartId && detail.selectedHourEndId) {
                  const startIndex = (availableHoursByDetail[idx] || []).findIndex(
                    (h) => h.id === detail.selectedHourStartId
                  );
                  const endIndex = (availableHoursByDetail[idx] || []).findIndex(
                    (h) => h.id === detail.selectedHourEndId
                  );
                  for (let i = startIndex; i <= endIndex && i >= 0; i++) {
                    const hourBlock = (availableHoursByDetail[idx] || [])[i];
                    if (hourBlock) {
                      usedHourIds.add(hourBlock.id);
                    }
                  }
                }
              }
            });

            fetchedHours = fetchedHours.filter((hour) => !usedHourIds.has(hour.id));

            setAvailableHoursByDetail((prev) => ({
              ...prev,
              [index]: fetchedHours,
            }));
          }
        } catch (error) {
          setErrors((prev) => ({
            ...prev,
            hours: error.response?.data?.message || "Erro ao carregar os horários. Tente novamente.",
          }));
          setAvailableHoursByDetail((prev) => ({
            ...prev,
            [index]: [],
          }));
        } finally {
          setHoursLoadingByDetail((prev) => ({ ...prev, [index]: false }));
        }
      } else {
        setAvailableHoursByDetail((prev) => ({
          ...prev,
          [index]: [],
        }));
      }
    };

    formData.details.forEach((detail, index) => {
      fetchHoursForDetail(index, detail.turn, detail.dayOfWeek);
    });
  }, [formData.details.map((detail) => `${detail.turn}-${detail.dayOfWeek}`).join(",")]);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    if (errors.detail || errors.message) {
      clearErrors();
    }
    setFormData((prevData) => {
      let newData = { ...prevData };
      if (["classId", "calendarId", "isActive"].includes(name)) {
        newData[name] = value;
      } else {
        newData.details = newData.details.map((detail, i) =>
          i === index
            ? {
                ...detail,
                [name]: value,
                ...(name === "turn"
                  ? {
                      selectedHourStartId: "",
                      selectedHourEndId: "",
                      displayStartTime: "",
                      displayEndTime: "",
                    }
                  : name === "selectedHourStartId"
                  ? {
                      displayStartTime:
                        (availableHoursByDetail[index] || []).find((h) => h.id === value)?.hourStart || "",
                    }
                  : name === "selectedHourEndId"
                  ? {
                      displayEndTime:
                        (availableHoursByDetail[index] || []).find((h) => h.id === value)?.hourEnd || "",
                    }
                  : {}),
              }
            : detail
        );
      }
      return newData;
    });
  };

  const handleAddDetail = () => {
    setFormData((prev) => ({
      ...prev,
      details: [
        ...prev.details,
        {
          disciplineId: prev.details[0].disciplineId,
          professorId: prev.details[0].professorId,
          dayOfWeek: "",
          turn: "",
          selectedHourStartId: "",
          selectedHourEndId: "",
          displayStartTime: "",
          displayEndTime: "",
        },
      ],
    }));
  };

  const handleRemoveDetail = (index) => {
    if (formData.details.length > 1) {
      setFormData((prev) => ({
        ...prev,
        details: prev.details.filter((_, i) => i !== index),
      }));
      setAvailableHoursByDetail((prev) => {
        const newHours = { ...prev };
        delete newHours[index];
        return newHours;
      });
      setHoursLoadingByDetail((prev) => {
        const newLoading = { ...prev };
        delete newLoading[index];
        return newLoading;
      });
    }
  };

  const handleSaveDetails = () => {
    let hasError = false;
    const newDetailsToAdd = [];
    clearErrors();

    const existingConfirmedDetailsSet = new Set(
      confirmedDetails.map(
        (d) => `${d.dayOfWeek}-${d.startTime}-${d.endTime}`
      )
    );

    for (const [index, currentDetail] of formData.details.entries()) {
      const existingFormDetailsSet = new Set(
        formData.details
        .flatMap((detail, idx) => {
          if (idx === index) return [];
          if (
            detail.dayOfWeek &&
            detail.selectedHourStartId &&
            detail.selectedHourEndId
          ) {
            const startIndex = (availableHoursByDetail[idx] || []).findIndex(
              (h) => h.id === detail.selectedHourStartId
            );
            const endIndex = (availableHoursByDetail[idx] || []).findIndex(
              (h) => h.id === detail.selectedHourEndId
            );
            const slots = [];
            for (let i = startIndex; i <= endIndex; i++) {
              const hourBlock = (availableHoursByDetail[idx] || [])[i];
              if (hourBlock) {
                slots.push(
                  `${detail.dayOfWeek}-${hourBlock.hourStart}-${hourBlock.hourEnd}`
                );
              }
            }
            return slots;
          }
          return [];
        })
      );

      if (
        !currentDetail.disciplineId ||
        !currentDetail.dayOfWeek ||
        !currentDetail.turn ||
        !currentDetail.selectedHourStartId ||
        !currentDetail.selectedHourEndId
      ) {
        setErrors((prev) => ({
          ...prev,
          detail: "Disciplina, Dia da Semana, Turno, Horário de Início e Horário de Fim são obrigatórios para todos os horários.",
        }));
        hasError = true;
        return;
      }

      const startIndex = (availableHoursByDetail[index] || []).findIndex(
        (h) => h.id === currentDetail.selectedHourStartId
      );
      const endIndex = (availableHoursByDetail[index] || []).findIndex(
        (h) => h.id === currentDetail.selectedHourEndId
      );
      if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
        setErrors((prev) => ({
          ...prev,
          detail: "Selecione um intervalo de horários válido e sequencial.",
        }));
        hasError = true;
        return;
      }
      if (endIndex - startIndex > 1) {
        setErrors((prev) => ({
          ...prev,
          detail: "A aula não pode exceder dois blocos de horários consecutivos (ex: 7:20 - 9:20).",
        }));
        hasError = true;
        return;
      }

      for (let i = startIndex; i <= endIndex; i++) {
        const hourBlock = (availableHoursByDetail[index] || [])[i];
        if (i > startIndex) {
          const prevHourBlock = (availableHoursByDetail[index] || [])[i - 1];
          if (hourBlock.hourStart !== prevHourBlock.hourEnd) {
            setErrors((prev) => ({
              ...prev,
              detail: "Os horários selecionados devem ser blocos consecutivos.",
            }));
            hasError = true;
            return;
          }
        }

        const slotKey = `${currentDetail.dayOfWeek}-${hourBlock.hourStart}-${hourBlock.hourEnd}`;
        if (existingConfirmedDetailsSet.has(slotKey) || existingFormDetailsSet.has(slotKey)) {
          setErrors((prev) => ({
            ...prev,
            detail: `O horário ${currentDetail.dayOfWeek} ${hourBlock.hourStart} - ${hourBlock.hourEnd} já está ocupado.`,
          }));
          hasError = true;
          return;
        }

        const discipline = disciplines.find(
          (d) => d.disciplineId === currentDetail.disciplineId
        );
        const professor = professors.find(
          (p) => p.id === currentDetail.professorId
        );
        newDetailsToAdd.push({
          disciplineId: currentDetail.disciplineId,
          professorId: currentDetail.professorId,
          dayOfWeek: currentDetail.dayOfWeek,
          turn: currentDetail.turn,
          hourId: hourBlock.id,
          startTime: hourBlock.hourStart,
          endTime: hourBlock.hourEnd,
          disciplineName: discipline?.name || "N/A",
          disciplineAcronym: discipline?.acronym || discipline?.sigla || "",
          professorName: professor?.username || "Sem professor",
          professorAcronym: professor?.acronym || professor?.sigla || "",
        });
      }
    }

    if (!hasError) {
      setConfirmedDetails((prev) => [...prev, ...newDetailsToAdd]);
      setFormData((prev) => ({
        ...prev,
        details: [
          {
            disciplineId: "",
            professorId: "",
            dayOfWeek: "",
            turn: "",
            selectedHourStartId: "",
            selectedHourEndId: "",
            displayStartTime: "",
            displayEndTime: "",
          },
        ],
      }));
      setAvailableHoursByDetail((prev) => {
        const newHours = {};
        newHours[0] = [];
        return newHours;
      });
      setHoursLoadingByDetail((prev) => {
        const newLoading = {};
        newLoading[0] = false;
        return newLoading;
      });
      setErrors((prev) => ({ ...prev, detail: null, message: null }));
    }
  };

  const handleDeleteDetail = (day, timeSlot, hourId) => {
    setDetailToDelete({ day, timeSlot, hourId });
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (detailToDelete) {
      const hourIds = typeof detailToDelete.hourId === 'string' 
        ? detailToDelete.hourId.split(",").map(id => id.trim()) 
        : [String(detailToDelete.hourId)];
      setConfirmedDetails((prev) => {
        const newDetails = prev.filter(
          (detail) =>
            !(
              detail.dayOfWeek.replace("-feira", "").trim().toLowerCase() === detailToDelete.day.trim().toLowerCase() &&
              hourIds.includes(String(detail.hourId))
            )
        );
        console.log("After filtering:", newDetails);
        return newDetails;
      });
      setDialogOpen(false);
      setDetailToDelete(null);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDetailToDelete(null);
  };

  const handleSubmit = async () => {
    clearErrors();
    if (
      !formData.calendarId ||
      !formData.classId ||
      confirmedDetails.length === 0
    ) {
      setErrors((prev) => ({
        ...prev,
        message: "Turma, Calendário e pelo menos um horário são obrigatórios.",
      }));
      return;
    }

    try {
      const detailsToSend = confirmedDetails.map((detail) => ({
        disciplineId: detail.disciplineId,
        hourId: detail.hourId,
        dayOfWeek: detail.dayOfWeek.replace("-feira", ""),
        userId: detail.professorId || null,
        turn:
          detail.turn === "Manhã"
            ? "MATUTINO"
            : detail.turn === "Tarde"
            ? "VESPERTINO"
            : "NOTURNO",
      }));

      const dataToSend = {
        calendarId: formData.calendarId,
        classId: formData.classId,
        isActive: formData.isActive,
        details: detailsToSend,
      };

      await api.post("/class-schedules", dataToSend);
      setAlert({
        message: "Grade de turma criada com sucesso!",
        type: "success",
      });
      setTimeout(() => {
        navigate("/class-schedule", {
          state: { success: "Grade de turma criada com sucesso!" },
        });
      }, 3000);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        message: error.response?.data?.message || "Erro ao cadastrar a grade de turma. Tente novamente.",
      }));
    }
  };

  const groupedDetails = {
    Manhã: confirmedDetails.filter((detail) => detail.turn === "Manhã"),
    Tarde: confirmedDetails.filter((detail) => detail.turn === "Tarde"),
    Noite: confirmedDetails.filter((detail) => detail.turn === "Noite"),
  };

  const daysOfWeek = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  const getScheduleMatrix = (details) => {
    const groupedByDayAndDiscipline = details.reduce((acc, detail) => {
      const key = `${detail.dayOfWeek}-${detail.disciplineId}-${detail.professorId}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(detail);
      return acc;
    }, {});

    const mergedDetails = [];
    Object.values(groupedByDayAndDiscipline).forEach((group) => {
      group.sort((a, b) => a.startTime.localeCompare(b.startTime));

      let current = { ...group[0] };
      for (let i = 1; i < group.length; i++) {
        const prev = group[i - 1];
        const curr = group[i];

        if (prev.endTime === curr.startTime) {
          current.endTime = curr.endTime;
          current.hourId = `${current.hourId},${curr.hourId}`;
        } else {
          mergedDetails.push(current);
          current = { ...curr };
        }
      }
      mergedDetails.push(current);
    });
    const weatheredTimeSlots = [...new Set(
      mergedDetails.map((detail) => `${detail.startTime} - ${detail.endTime}`)
    )].sort();

    return weatheredTimeSlots.map((timeSlot) => {
      const row = { timeSlot };
      daysOfWeek.forEach((day) => {
        const detail = mergedDetails.find(
          (d) =>
            d.dayOfWeek.replace("-feira", "") === day &&
            `${d.startTime} - ${d.endTime}` === timeSlot
        );
        row[day] = detail
          ? {
              disciplineAcronym: detail.disciplineAcronym || "",
              professorAcronym: detail.professorAcronym || "",
              disciplineName: detail.disciplineName || "N/A",
              professorName: detail.professorName || "Sem professor",
              hourId: detail.hourId,
            }
          : null;
      });
      return row;
    });
  };

  return (
    <Box display="flex">
      <CssBaseline />
      <Sidebar setAuthenticated={setAuthenticated} />
      <Box sx={{ flexGrow: 1, p: 4, mt: 4 }}>
        <DeleteConfirmationDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          title="Confirmar Exclusão"
          message="Deseja realmente excluir o horário"
          onConfirm={handleConfirmDelete}
          userName={detailToDelete ? `${detailToDelete.day} ${detailToDelete.timeSlot}` : ""}
        />
        <Box sx={{ position: "relative", mb: 3 }} >
          <IconButton onClick={() => navigate("/class-schedule")}
            sx={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)" }}  
          >
            <ArrowBack sx={{ color: "green", fontSize: "2.2rem" }} />
          </IconButton>
          <Typography variant="h5" align="center" sx={{ fontWeight: "bold" }}>
            Cadastrar Grade de Turma
          </Typography>
        </Box>

        <Box ref={errorRef} sx={{ m: 4, borderRadius: 3 }} >
          {errors.message && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.message}
            </Alert>
          )}
          {errors.classes && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {errors.classes}
            </Alert>
          )}
          {errors.disciplines && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {errors.disciplines}
            </Alert>
          )}
          {errors.professors && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {errors.professors}
            </Alert>
          )}
          {errors.calendars && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {errors.calendars}
            </Alert>
          )}
          {errors.hours && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {errors.hours}
            </Alert>
          )}
          {errors.detail && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.detail}
            </Alert>
          )}
          {alert && (
            <CustomAlert
              message={alert.message}
              type={alert.type}
              onClose={handleAlertClose}
            />
          )}
        </Box>

        <Box component={Paper} elevation={3} sx={{ p: 5, m: 4, borderRadius: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginLeft: "5px", mb: 2 }}>
            <School sx={{ fontSize: "31px", color: "green" }} />
            <Typography variant="h5" color="green">
              Turma
            </Typography>
          </Box>
          <Grid container spacing={2.5} mt="10px">
            <Grid item xs={12} sm={6}>
              <CustomSelect
                label="Turma"
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                disabled={confirmedDetails.length > 0}
                selectSx={{ width: "520px" }}
              >
                {classes
                  .slice()
                  .sort((a, b) => {
                    const getNumber = (s) => parseInt(s.semester.replace("S", ""), 10);
                    return getNumber(a) - getNumber(b);
                  })
                  .map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.semester}
                    </MenuItem>
                  ))}
              </CustomSelect>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomSelect
                label="Calendário"
                name="calendarId"
                value={formData.calendarId}
                onChange={handleChange}
                disabled={confirmedDetails.length > 0}
                selectSx={{ width: "520px" }}
              >
                {calendars.map((calendar) => (
                  <MenuItem key={calendar.id} value={calendar.id}>
                    {calendar.display}
                  </MenuItem>
                ))}
              </CustomSelect>
            </Grid>
          </Grid>
        </Box>
        
        {/* Horários */}
        <Box component={Paper} elevation={3} sx={{ p: 5, pb: 12, m: 4, borderRadius: 3, position: "relative" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginLeft: "5px", mb: 2 }}>
            <Box
              sx={{
                backgroundColor: "green",
                borderRadius: "50%",
                width: 33,
                height: 33,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <History sx={{ color: "white", fontSize: 25 }} />
            </Box>
            <Typography variant="h5" color="green">
              Horários
            </Typography>
          </Box>
          <Grid container spacing={3} mt="10px">
            <Grid item xs={12} sm={6}>
              <CustomSelect
                label="Professor"
                name="professorId"
                value={formData.details[0].professorId}
                onChange={(e) => handleChange(e, 0)}
                selectSx={{ width: "520px" }}
              >
                {professors.map((prof) => (
                  <MenuItem key={prof.id} value={prof.id}>
                    {prof.username}
                  </MenuItem>
                ))}
              </CustomSelect>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomAutocomplete
                label="Disciplina *"
                name="disciplineId"
                value={disciplines.find(disc => disc.disciplineId === formData.details[0].disciplineId) || null}
                onChange={(event, newValue) => {
                  handleChange({ target: { name: 'disciplineId', value: newValue ? newValue.disciplineId : '' } }, 0);
                }}
                options={disciplines}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.disciplineId === value.disciplineId}
                selectSx={{ width: "520px" }}
              />
            </Grid>
            {formData.details.map((detail, index) => (
              <Grid container spacing={3} key={index} sx={{ mt: index === 0 ? 2 : 0, alignItems: "center" }}>
                <Grid item xs={12} sm={6}>
                  <CustomSelect
                    label="Dia da Semana"
                    name="dayOfWeek"
                    value={detail.dayOfWeek}
                    onChange={(e) => handleChange(e, index)}
                    selectSx={{ width: "248px" }}
                  >
                    <MenuItem value="Segunda-feira">Segunda-feira</MenuItem>
                    <MenuItem value="Terça-feira">Terça-feira</MenuItem>
                    <MenuItem value="Quarta-feira">Quarta-feira</MenuItem>
                    <MenuItem value="Quinta-feira">Quinta-feira</MenuItem>
                    <MenuItem value="Sexta-feira">Sexta-feira</MenuItem>
                    <MenuItem value="Sábado">Sábado</MenuItem>
                  </CustomSelect>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomSelect
                    label="Turno"
                    name="turn"
                    value={detail.turn}
                    onChange={(e) => handleChange(e, index)}
                    selectSx={{ width: "248px" }}
                  >
                    <MenuItem value="Manhã">Manhã</MenuItem>
                    <MenuItem value="Tarde">Tarde</MenuItem>
                    <MenuItem value="Noite">Noite</MenuItem>
                  </CustomSelect>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomSelect
                    label="Início da Aula"
                    name="selectedHourStartId"
                    value={detail.selectedHourStartId}
                    onChange={(e) => handleChange(e, index)}
                    disabled={!detail.turn || !detail.dayOfWeek}
                    loading={hoursLoadingByDetail[index]}
                    selectSx={{ width: "215px" }}
                  >
                    {(availableHoursByDetail[index] || []).length > 0 ? (
                      (availableHoursByDetail[index] || []).map((hour) => (
                        <MenuItem key={hour.id} value={hour.id}>
                          {hour.hourStart}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        {detail.turn && detail.dayOfWeek ? "Nenhum horário disponível" : "Selecione turno e dia"}
                      </MenuItem>
                    )}
                  </CustomSelect>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CustomSelect
                      label="Fim da Aula"
                      name="selectedHourEndId"
                      value={detail.selectedHourEndId}
                      onChange={(e) => handleChange(e, index)}
                      disabled={!detail.turn || !detail.dayOfWeek || !detail.selectedHourStartId}
                      loading={hoursLoadingByDetail[index]}
                      selectSx={{ width: "215px" }}
                    >
                      {(availableHoursByDetail[index] || [])
                        .filter((hour) => {
                          const startIndex = (availableHoursByDetail[index] || []).findIndex(
                            (h) => h.id === detail.selectedHourStartId
                          );
                          const currentIndex = (availableHoursByDetail[index] || []).findIndex(
                            (h) => h.id === hour.id
                          );
                          if (currentIndex < startIndex) return false;
                          if (currentIndex === startIndex) return true;
                          if (currentIndex === startIndex + 1) {
                            const prevHour = (availableHoursByDetail[index] || [])[currentIndex - 1];
                            return prevHour && hour.hourStart === prevHour.hourEnd;
                          }
                          return false;
                        })
                        .map((hour) => (
                          <MenuItem key={hour.id} value={hour.id}>
                            {hour.hourEnd}
                          </MenuItem>
                        ))}
                    </CustomSelect>
                    {index === formData.details.length - 1 && (
                      <IconButton
                        onClick={handleAddDetail}
                        sx={{
                          color: "#087619",
                          "&:hover": { color: "#066915" },
                        }}
                      >
                        <AddCircleOutline sx={{ fontSize: 34 }} />
                      </IconButton>
                    )}
                  </Box>
                </Grid>
                {formData.details.length > 1 && index !== formData.details.length - 1 && (
                  <Grid item xs={12} sm={1}>
                    <IconButton
                      onClick={() => handleRemoveDetail(index)}
                      sx={{
                        color: "#F01424",
                        "&:hover": { color: "#D4000F" },
                        ml: "-13px"
                      }}
                    >
                      <Remove sx={{ fontSize: 34 }} />
                    </IconButton>
                  </Grid>
                )}
              </Grid>
            ))}
            <Box sx={{ position: "absolute", bottom: 15, right: 48, }}>
              <Button
                variant="outlined"
                onClick={handleSaveDetails}
                color="success"
                sx={{
                  width: "fit-content",
                  minWidth: 100,
                  padding: { xs: "9px 15px", sm: "9px 15px" },
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  color: 'green',
                  borderWidth: 1.5,
                  borderColor: 'green',
                  gapjoner: {
                    offset: [20, -8],
                  },
                }}
              >
                <Check sx={{ fontSize: 24, color: "green"}} />
                Salvar
              </Button>
            </Box>
          </Grid>
        </Box>

        <Box component={Paper} elevation={3} sx={{ p: 5, m: 4, borderRadius: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="h5" color="green">
              Horários Confirmados
            </Typography>
          </Box>
          <Divider sx={{ backgroundColor: "#C7C7C7", my: 2 }} />
          {["Manhã", "Tarde", "Noite"].map((turn) => {
            const scheduleMatrix = getScheduleMatrix(groupedDetails[turn]);
            return (
              scheduleMatrix.length > 0 && (
                <Box key={turn} sx={{ display: "flex", alignItems: "flex-start", mb: 4, gap: 2, }}>
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
                      {turn}
                    </Typography>
                  </Box>
                  <ScheduleTable
                    scheduleMatrix={scheduleMatrix}
                    daysOfWeek={daysOfWeek}
                    disableTooltips={false}
                    handleDeleteDetail={handleDeleteDetail}
                  />
                </Box>
              )
            );
          })}
          {confirmedDetails.length === 0 && (
            <Typography variant="body1" color="text.secondary">
              Nenhum horário confirmado.
            </Typography>
          )}
        </Box>

        <Box display="flex" mt={4}
          sx={{ justifyContent: "center", gap: 2, padding: "10px 24px", marginTop: "35px" }}
        >
          <Button
            variant="contained"
            color="error"
            onClick={() => navigate("/class-schedule")}
            sx={{
              width: "fit-content",
              minWidth: 100,
              padding: { xs: "8px 20px", sm: "8px 28px" },
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#F01424",
              "&:hover": { backgroundColor: "#D4000F" },
            }}
          >
            <Close sx={{ fontSize: 24 }} />
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={confirmedDetails.length === 0}
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
              "&:hover": { backgroundColor: "#066915" },
            }}
          >
            <Save sx={{ fontSize: 24 }} />
            Cadastrar
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ClassScheduleCreate;