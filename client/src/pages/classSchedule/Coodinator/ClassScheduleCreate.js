import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  CssBaseline,
  IconButton,
  CircularProgress,
  TextField,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  ArrowBack,
  Close,
  Save,
  Assignment,
  History,
  Check,
  Delete,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SideBar";
import api from "../../../service/api";

const CustomSelect = ({ label, name, value, onChange, children, selectSx, ...props }) => {
  return (
    <FormControl fullWidth required sx={{ minWidth: 190, maxWidth: 600, ...props.sx }}>
      <InputLabel
        id={`${name}-label`}
        sx={{
          "&.Mui-focused": { color: "#000" },
          "&.MuiInputLabel-shrink": { color: "#000" },
        }}
      >
        {label}
      </InputLabel>
      <Select
        labelId={`${name}-label`}
        name={name}
        value={value || ""}
        onChange={onChange}
        label={label}
        displayEmpty={false}
        sx={{
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.23)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000",
          },
          ...selectSx,
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: "200px",
              overflowY: "auto",
              width: "auto",
              "& .MuiMenuItem-root": {
                minHeight: "36px",
                display: "flex",
                alignItems: "center",
              },
              "& .MuiMenuItem-root.Mui-selected": {
                backgroundColor: "#D5FFDB",
                "&:hover": { backgroundColor: "#D5FFDB" },
              },
              "& .MuiMenuItem-root:hover": {
                backgroundColor: "#D5FFDB",
              },
            },
          },
        }}
        {...props}
      >
        {children}
      </Select>
    </FormControl>
  );
};

const ClassScheduleCreate = ({ setAuthenticated }) => {
  const [formData, setFormData] = useState({
    classId: "",
    calendarId: "",
    details: [
      {
        disciplineId: "",
        professorId: "",
        dayOfWeek: "",
        startTime: "",
        endTime: "",
        hourId: "",
        turn: "",
      },
    ],
    isActive: true,
  });
  const [confirmedDetails, setConfirmedDetails] = useState([]);
  const [classes, setClasses] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [availableHours, setAvailableHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrors({});
      try {
        const [classesRes, disciplinesRes, usersRes, calendarsRes] =
          await Promise.all([
            api.get("/classes-coordinator").catch((err) => ({ data: [] })),
            api.get("/course/discipline").catch((err) => ({ data: [] })),
            api.get("/users").catch((err) => ({ data: { users: [] } })),
            api.get("/calendar").catch((err) => ({ data: { calendars: [] } })),
          ]);

        setClasses(
          Array.isArray(classesRes.data.classes) ? classesRes.data.classes : []
        );

        setDisciplines(
          Array.isArray(disciplinesRes.data) ? disciplinesRes.data : []
        );

        const filteredProfessors = Array.isArray(usersRes.data.users)
          ? usersRes.data.users.filter(
              (user) => user.accessType === "Professor"
            )
          : [];
        setProfessors(filteredProfessors);

        setCalendars(
          Array.isArray(calendarsRes.data.calendars)
            ? calendarsRes.data.calendars.map((calendar) => ({
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
          message:
            error.response?.data?.message ||
            "Erro ao carregar os dados. Tente novamente.",
        }));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchHours = async () => {
      const currentDetail = formData.details[0];
      if (currentDetail.turn) {
        setLoading(true);
        try {
          let backendTurn = "";
          switch (currentDetail.turn) {
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
            setAvailableHours(response.data.hours || response.data);

            const currentStartTimeValid = response.data?.hours?.some(
              (h) => h.hourStart === currentDetail.startTime
            ) || response.data?.data?.some(
              (h) => h.hourStart === currentDetail.startTime
            );

            if (!currentStartTimeValid) {
              setFormData((prev) => ({
                ...prev,
                details: [
                  { ...currentDetail, startTime: "", endTime: "", hourId: "" },
                ],
              }));
            } else {
              const selectedHour = response.data?.hours?.find(
                (h) => h.hourStart === currentDetail.startTime
              ) || response.data?.data?.find(
                (h) => h.hourStart === currentDetail.startTime
              );
              if (
                selectedHour &&
                selectedHour.hourEnd !== currentDetail.endTime
              ) {
                setFormData((prev) => ({
                  ...prev,
                  details: [
                    {
                      ...currentDetail,
                      endTime: selectedHour?.hourEnd,
                      hourId: selectedHour?.id,
                    },
                  ],
                }));
              }
            }
          } else {
            setAvailableHours([]);
            setFormData((prev) => ({
              ...prev,
              details: [
                { ...prev.details[0], startTime: "", endTime: "", hourId: "" },
              ],
            }));
          }
        } catch (error) {
          setErrors((prev) => ({
            ...prev,
            hours:
              error.response?.data?.message ||
              "Erro ao carregar horários para o turno.",
          }));
          setAvailableHours([]);
          setFormData((prev) => ({
            ...prev,
            details: [
              { ...prev.details[0], startTime: "", endTime: "", hourId: "" },
            ],
          }));
        } finally {
          setLoading(false);
        }
      } else {
        setAvailableHours([]);
        setFormData((prev) => ({
          ...prev,
          details: [
            { ...prev.details[0], startTime: "", endTime: "", hourId: "" },
          ],
        }));
      }
    };
    fetchHours();
  }, [formData.details[0].turn]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      let newData = { ...prevData };

      if (["classId", "calendarId"].includes(name)) {
        newData[name] = value;
      } else if (
        ["disciplineId", "professorId", "dayOfWeek", "startTime", "turn"].includes(name)
      ) {
        const updatedDetails = [...newData.details];
        const currentDetail = { ...updatedDetails[0] };

        if (name === "startTime") {
          const selectedHour = availableHours.find(
            (hour) => hour.hourStart === value
          );
          if (selectedHour) {
            currentDetail.startTime = value;
            currentDetail.endTime = selectedHour.hourEnd;
            currentDetail.hourId = selectedHour.id;
          } else {
            currentDetail.startTime = "";
            currentDetail.endTime = "";
            currentDetail.hourId = "";
          }
        } else if (name === "turn") {
          currentDetail.turn = value;
          currentDetail.startTime = "";
          currentDetail.endTime = "";
          currentDetail.hourId = "";
        } else {
          currentDetail[name] = value;
        }
        updatedDetails[0] = currentDetail;
        newData.details = updatedDetails;
      }
      return newData;
    });
  };

  const handleAddDetail = () => {
    const currentDetail = formData.details[0];
    if (
      !currentDetail.disciplineId ||
      !currentDetail.dayOfWeek ||
      !currentDetail.hourId ||
      !currentDetail.turn
    ) {
      setErrors((prev) => ({
        ...prev,
        detail: "Disciplina, Dia da Semana, Turno e Horário de Início são obrigatórios.",
      }));
      return;
    }

    const discipline = disciplines.find(
      (d) => d.disciplineId === currentDetail.disciplineId
    );
    const professor = professors.find(
      (p) => p.id === currentDetail.professorId
    );

    setConfirmedDetails((prev) => [
      ...prev,
      {
        ...currentDetail,
        disciplineName: discipline?.name || "N/A",
        professorName: professor?.username || "Sem professor",
      },
    ]);

    setFormData((prev) => ({
      ...prev,
      details: [
        {
          disciplineId: "",
          professorId: "",
          dayOfWeek: "",
          startTime: "",
          endTime: "",
          hourId: "",
          turn: "",
        },
      ],
    }));
    setErrors((prev) => ({ ...prev, detail: null }));
  };

  const handleDeleteDetail = (index) => {
    setConfirmedDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      !formData.calendarId ||
      !formData.classId ||
      confirmedDetails.length === 0
    ) {
      setErrors((prev) => ({
        ...prev,
        message:
          "Turma, Calendário e pelo menos um horário são obrigatórios.",
      }));
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const detailsToSend = confirmedDetails.map((detail) => ({
        disciplineId: detail.disciplineId,
        hourId: detail.hourId,
        dayOfWeek: detail.dayOfWeek.replace("-feira", ""),
        userId: detail.professorId || null,
        turn: detail.turn === "Manhã" ? "MATUTINO" : detail.turn === "Tarde" ? "VESPERTINO" : "NOTURNO",
      }));

      const dataToSend = {
        calendarId: formData.calendarId,
        classId: formData.classId,
        isActive: formData.isActive,
        details: detailsToSend,
      };

      await api.post("/class-schedules", dataToSend);
      navigate("/class-schedule", {
        state: { success: "Grade de turma criada com sucesso!" },
      });
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        message:
          error.response?.data?.message ||
          "Erro ao cadastrar a grade de turma. Tente novamente.",
      }));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !errors.message && Object.keys(errors).length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

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
            Cadastrar Grade de Turma
          </Typography>
        </Box>

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

        <Box
          component={Paper}
          elevation={3}
          sx={{ p: 5, m: 4, borderRadius: 3 }}
        >
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
          <Grid container spacing={2.5} mt="10px" justifyContent="center">
            <Grid item xs={12} sm={6}>
              <CustomSelect
                label="Turma"
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                selectSx={{ width: "320px" }}
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
                label="Turno"
                name="turn"
                value={formData.details[0].turn}
                onChange={handleChange}
                selectSx={{ width: "320px" }}
              >
                <MenuItem value="Manhã">Manhã</MenuItem>
                <MenuItem value="Tarde">Tarde</MenuItem>
                <MenuItem value="Noite">Noite</MenuItem>
              </CustomSelect>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomSelect
                label="Calendário"
                name="calendarId"
                value={formData.calendarId}
                onChange={handleChange}
                selectSx={{ width: "380px" }}
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

        <Box
          component={Paper}
          elevation={3}
          sx={{ p: 5, m: 4, borderRadius: 3 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              marginLeft: "5px",
              mb: 2,
            }}
          >
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
          <Grid container spacing={3} mt="10px" justifyContent="center">
            <Grid item xs={12} sm={6}>
              <CustomSelect
                label="Professor"
                name="professorId"
                value={formData.details[0].professorId}
                onChange={handleChange}
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
              <CustomSelect
                label="Disciplina"
                name="disciplineId"
                value={formData.details[0].disciplineId}
                onChange={handleChange}
                selectSx={{ width: "520px" }}
              >
                {disciplines.map((disc) => (
                  <MenuItem key={disc.disciplineId} value={disc.disciplineId}>
                    {disc.name}
                  </MenuItem>
                ))}
              </CustomSelect>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomSelect
                label="Dia da Semana"
                name="dayOfWeek"
                value={formData.details[0].dayOfWeek}
                onChange={handleChange}
                selectSx={{ width: "520px" }}
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
                label="Horário de Início"
                name="startTime"
                value={formData.details[0].startTime}
                onChange={handleChange}
                disabled={!formData.details[0].turn || availableHours.length === 0}
                selectSx={{ width: "215px" }}
              >
                {availableHours.map((hour) => (
                  <MenuItem key={hour.id} value={hour.hourStart}>
                    {hour.hourStart}
                  </MenuItem>
                ))}
              </CustomSelect>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Horário de Fim"
                type="time"
                name="endTime"
                value={formData.details[0].endTime}
                onChange={handleChange}
                sx={{ width: "215px" }}
                InputLabelProps={{ shrink: true }}
                required
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                onClick={handleAddDetail}
                sx={{
                  minWidth: 0,
                  width: 40,
                  height: 40,
                  padding: 0,
                  mt: 1,
                  "&:hover": { backgroundColor: "#066915" },
                }}
              >
                <Check sx={{ fontSize: 34, color: "green" }} />
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box component={Paper} elevation={3} sx={{ p: 5, m: 4, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Horários Confirmados
          </Typography>
          {confirmedDetails.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Dia da Semana</strong></TableCell>
                  <TableCell><strong>Horário de Início</strong></TableCell>
                  <TableCell><strong>Horário de Fim</strong></TableCell>
                  <TableCell><strong>Disciplina</strong></TableCell>
                  <TableCell><strong>Professor</strong></TableCell>
                  <TableCell><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {confirmedDetails.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>{detail.dayOfWeek}</TableCell>
                    <TableCell>{detail.startTime}</TableCell>
                    <TableCell>{detail.endTime}</TableCell>
                    <TableCell>{detail.disciplineName}</TableCell>
                    <TableCell>{detail.professorName}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleDeleteDetail(index)}
                        sx={{ color: "#F01424", "&:hover": { color: "#D4000F" } }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Nenhum horário confirmado.
            </Typography>
          )}
        </Box>

        <Box
          display="flex"
          mt={4}
          sx={{
            justifyContent: "center",
            gap: 2,
            padding: "10px 24px",
            marginTop: "35px",
          }}
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
            disabled={loading || confirmedDetails.length === 0}
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
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <Save sx={{ fontSize: 24 }} />
            )}
            Cadastrar
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ClassScheduleCreate;