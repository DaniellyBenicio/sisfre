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
} from "@mui/material";
import { ArrowBack, Close, Save, Assignment, Schedule } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SideBar";
import api from "../../../service/api";

const CustomSelect = ({ label, name, value, onChange, children, ...props }) => {
  return (
    <FormControl fullWidth required sx={{ minWidth: 190, maxWidth: 400 }}>
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
    turn: "",
    calendarId: "",
    disciplineId: "",
    professorId: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  });
  const [classes, setClasses] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrors({});
      try {
        const [classesRes, disciplinesRes, usersRes, calendarsRes] = await Promise.all([
          api.get("/classes").catch((err) => {
            console.error("Classes error:", err.response?.data);
            return { data: [] };
          }),
          api.get("/course/discipline").catch((err) => {
            console.error("Disciplines error:", err.response?.data);
            return { data: [] };
          }),
          api.get("/users").catch((err) => {
            console.error("Users error:", err.response?.data);
            return { data: [] };
          }),
          api.get("/calendar").catch((err) => {
            console.error("Calendar error:", err.response?.data);
            return { data: [] };
          }),
        ]);

        console.log("Classes response:", classesRes.data);
        console.log("Disciplines response:", disciplinesRes.data);
        console.log("Users response:", usersRes.data);
        console.log("Calendars response:", calendarsRes.data);

        setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
        setDisciplines(Array.isArray(disciplinesRes.data) ? disciplinesRes.data : []);
        setProfessors(
        Array.isArray(usersRes.data.users)
          ? usersRes.data.users.filter((user) => user.accessType === "Professor")
          : []
        );
        console.log("Professores filtrados:", professors);
        setCalendars(
          Array.isArray(calendarsRes.data)
            ? calendarsRes.data
            : [
                { id: 1, period: "2025/1" },
                { id: 2, period: "2025/2" },
              ]
        );

        if (!classesRes.data.length) {
          setErrors((prev) => ({
            ...prev,
            classes: "Não foi possível carregar as turmas. Usando dados padrão.",
          }));
        }
        if (!disciplinesRes.data.length) {
          setErrors((prev) => ({
            ...prev,
            disciplines: "Não foi possível carregar as disciplinas. Usando dados padrão.",
          }));
        }
        if (!usersRes.data.length) {
          setErrors((prev) => ({
            ...prev,
            professors: "Não foi possível carregar os professores. Usando dados padrão.",
          }));
        }
        if (!calendarsRes.data.length) {
          setErrors((prev) => ({
            ...prev,
            calendars: "Não foi possível carregar os calendários. Usando dados padrão.",
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar dados para o formulário:", error);
        console.log("Error response:", error.response?.data);
        setErrors((prev) => ({
          ...prev,
          general: error.response?.data?.message || "Erro ao carregar os dados. Tente novamente.",
        }));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (Object.values(formData).some((value) => !value)) {
      setErrors((prev) => ({ ...prev, general: "Todos os campos são obrigatórios." }));
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const response = await api.post("/class-schedules", formData);
      navigate("/class-schedule", { state: { success: "Grade de turma criada com sucesso!" } });
    } catch (error) {
      console.error("Erro ao cadastrar grade de turma:", error);
      setErrors((prev) => ({
        ...prev,
        general: error.response?.data?.message || "Erro ao cadastrar a grade de turma. Tente novamente.",
      }));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
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

        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.general}
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
          <Grid container spacing={2.5} mt="10px">
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Turma"
                name="classId"
                value={formData.classId}
                onChange={handleChange}
              >
                {classes.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </CustomSelect>
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Turno"
                name="turn"
                value={formData.turn}
                onChange={handleChange}
              >
                <MenuItem value="Manhã">Manhã</MenuItem>
                <MenuItem value="Tarde">Tarde</MenuItem>
                <MenuItem value="Noite">Noite</MenuItem>
              </CustomSelect>
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Calendário"
                name="calendarId"
                value={formData.calendarId}
                onChange={handleChange}
              >
                {calendars.map((calendar) => (
                  <MenuItem key={calendar.id} value={calendar.id}>
                    {calendar.period || calendar.name}
                  </MenuItem>
                ))}
              </CustomSelect>
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Disciplina"
                name="disciplineId"
                value={formData.disciplineId}
                onChange={handleChange}
              >
                {disciplines.map((disc) => (
                  <MenuItem key={disc.id} value={disc.id}>
                    {disc.name}
                  </MenuItem>
                ))}
              </CustomSelect>
            </Grid>
          </Grid>
        </Box>

        {/* Seção Horários */}
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
            <Schedule sx={{ fontSize: "31px", color: "green" }} />
            <Typography variant="h5" color="green">
              Horários
            </Typography>
          </Box>
          <Grid container spacing={3} mt="10px">
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Professor"
                name="professorId"
                value={formData.professorId}
                onChange={handleChange}
              >
                {professors.map((prof) => (
                  <MenuItem key={prof.id} value={prof.id}>
                    {prof.name}
                  </MenuItem>
                ))}
              </CustomSelect>
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Dia da Semana"
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
              >
                <MenuItem value="Segunda-feira">Segunda-feira</MenuItem>
                <MenuItem value="Terça-feira">Terça-feira</MenuItem>
                <MenuItem value="Quarta-feira">Quarta-feira</MenuItem>
                <MenuItem value="Quinta-feira">Quinta-feira</MenuItem>
                <MenuItem value="Sexta-feira">Sexta-feira</MenuItem>
                <MenuItem value="Sábado">Sábado</MenuItem>
              </CustomSelect>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Horário de Início"
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                sx={{ minWidth: 200, maxWidth: 400 }}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Horário de Fim"
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                sx={{ minWidth: 200, maxWidth: 400 }}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
        </Box>

        {/* Botões */}
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
            disabled={loading}
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
            {loading ? <CircularProgress size={24} color="inherit" /> : <Save sx={{ fontSize: 24 }} />}
            Cadastrar
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ClassScheduleCreate;