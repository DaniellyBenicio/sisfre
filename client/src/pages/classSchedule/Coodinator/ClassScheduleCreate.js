import React, { useState } from "react";
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
} from "@mui/material";
import { ArrowBack, Close, Save, Assignment, Schedule } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SideBar";

const CustomSelect = ({ label, name, value, onChange, children, ...props }) => {
  return (
    <FormControl fullWidth required sx={{ minWidth: 190, maxWidth: 400 }}>
      <InputLabel
        id={`${name}-label`}
        sx={{
          "&.Mui-focused": {
            color: "#000"
          },
          "&.MuiInputLabel-shrink": {
            color: "#000"
          },
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
            borderColor: "rgba(0, 0, 0, 0.23)"
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000"
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
                "&:hover": {
                  backgroundColor: "#D5FFDB"
                },
              },
              "& .MuiMenuItem-root:hover": {
                backgroundColor: "#D5FFDB"
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
    class: "",
    turn: "",
    calendar: "",
    discipline: "",
    professor: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Formulário enviado:", formData);
    // Aqui você pode fazer o POST para sua API
  };

  const navigate = useNavigate();

  return (
    <>
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

          {/* Seção Aula */}
          <Box component={Paper} elevation={3} sx={{ p: 5, m: 4, borderRadius: 3 }} >
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
                <FormControl fullWidth required
                  sx={{ minWidth: 190, maxWidth: 400, marginLeft: "5px" }}
                >
                  <CustomSelect
                    label="Turma"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                  >
                    <MenuItem value="Turma A">Turma A</MenuItem>
                    <MenuItem value="Turma B">Turma B</MenuItem>
                    <MenuItem value="Turma C">Turma C</MenuItem>
                  </CustomSelect>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required sx={{ minWidth: 190, maxWidth: 400 }} >
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
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required sx={{ minWidth: 320, maxWidth: 500 }} >
                  <CustomSelect
                    label="Calendário"
                    name="calendar"
                    value={formData.calendar}
                    onChange={handleChange}
                  >
                    <MenuItem value="2025/1">2025/1</MenuItem>
                    <MenuItem value="2025/2">2025/2</MenuItem>
                  </CustomSelect>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required sx={{ minWidth: 320, maxWidth: 500 }} >
                  <CustomSelect
                    label="Disciplina"
                    name="discipline"
                    value={formData.discipline}
                    onChange={handleChange}
                  >
                    <MenuItem value="Matemática">Matemática</MenuItem>
                    <MenuItem value="Física">Física</MenuItem>
                    <MenuItem value="Química">Química</MenuItem>
                    <MenuItem value="Biologia">Biologia</MenuItem>
                  </CustomSelect>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Seção Horários */}
          <Box component={Paper} elevation={3} sx={{ p: 5, m: 4, borderRadius: 3 }} >
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
                <FormControl fullWidth required
                  sx={{ minWidth: 320, maxWidth: 500, marginLeft: "5px" }}
                >
                  <CustomSelect
                    label="Professor"
                    name="professor"
                    value={formData.professor}
                    onChange={handleChange}
                  >
                    <MenuItem value="João Silva">João Silva</MenuItem>
                    <MenuItem value="Maria Oliveira">Maria Oliveira</MenuItem>
                    <MenuItem value="Carlos Souza">Carlos Souza</MenuItem>
                    <MenuItem value="Ana Pereira">Ana Pereira</MenuItem>
                  </CustomSelect>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required sx={{ minWidth: 200, maxWidth: 400 }} >
                  <CustomSelect
                    label="Dias da Semana"
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleChange}
                  >
                    <MenuItem value="Segunda">Segunda</MenuItem>
                    <MenuItem value="Terça">Terça</MenuItem>
                    <MenuItem value="Quarta">Quarta</MenuItem>
                    <MenuItem value="Quinta">Quinta</MenuItem>
                    <MenuItem value="Sexta">Sexta</MenuItem>
                  </CustomSelect>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required sx={{ minWidth: 190, maxWidth: 400 }} >
                  <CustomSelect
                    label="Horário de Início"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                  >
                    <MenuItem value="13:00">13:00</MenuItem>
                    <MenuItem value="15:20">15:20</MenuItem>
                  </CustomSelect>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required sx={{ minWidth: 190, maxWidth: 400 }} >
                  <CustomSelect
                    label="Horário de Fim"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                  >
                    <MenuItem value="15:00">15:00</MenuItem>
                    <MenuItem value="17:20">17:20</MenuItem>
                  </CustomSelect>
                </FormControl>
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
    </>
  );
};

export default ClassScheduleCreate;