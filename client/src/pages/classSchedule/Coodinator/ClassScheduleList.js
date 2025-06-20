import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, FilterListAlt, Visibility } from "@mui/icons-material";
import { CustomAlert } from "../../../components/alert/CustomAlert";
import ClassScheduleTable from "./ClassScheduleTable";
import { StyledSelect } from "../../../components/inputs/Input";
import ClassScheduleModal from "../Coodinator/ClassScheduleCreate";
import { useNavigate } from "react-router-dom";

const ClassScheduleList = () => {
  const [disciplines, setDisciplines] = useState([]);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const accessType = localStorage.getItem("accessType") || "Admin";
  const [classScheduleToEdit, setClassScheduleToEdit] = useState(null);
  const [selectedCalendar, setSelectedCalendar] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [calendars, setCalendars] = useState([]);
  const [classes, setClasses] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const navigate = useNavigate();

  // Simulação
  const mockClassesSchedule = [
    {
      disciplineId: 1,
      calendar: "2025/1",
      teacher: "João Silva",
      class: "Turma A",
      discipline: "Matemática",
      turn: "Manhã",
    },
    {
      disciplineId: 2,
      calendar: "2025/1",
      teacher: "Maria Oliveira",
      class: "Turma B",
      discipline: "Física",
      turn: "Tarde",
    },
    {
      disciplineId: 3,
      calendar: "2025/2",
      teacher: "Carlos Souza",
      class: "Turma C",
      discipline: "Química",
      turn: "Noite",
    },
    {
      disciplineId: 4,
      calendar: "2025/2",
      teacher: "Ana Pereira",
      class: "Turma A",
      discipline: "Biologia",
      turn: "Manhã",
    },
  ];

  useEffect(() => {
    setDisciplines(mockClassesSchedule);
    // Extrair calendários únicos
    const uniqueCalendars = [...new Set(mockClassesSchedule.map((item) => item.calendar))];
    setCalendars(uniqueCalendars);
    // Extrair turmas únicas
    const uniqueClasses = [...new Set(mockClassesSchedule.map((item) => item.class))];
    setClasses(uniqueClasses);
  }, []);

  const onCreateClick = () => {
    navigate("/class-schedule-create");
  };

  const handleViewClick = (disciplineId) => {
    const item = mockClassesSchedule.find((d) => d.disciplineId === disciplineId);
    console.log("Visualizar item:", item);
    setAlert({ message: `Visualizando grade de turma: ${item.discipline}`, type: "info" });
  };

  const handleCustomEdit = (item) => {
    console.log("Editar item:", item);
    setClassScheduleToEdit(item);
    setAlert({ message: `Editar grade de turma: ${item.discipline}`, type: "info" });
  };

  const handleAlertClose = () => {
    console.log("Fechar alerta");
    setAlert(null);
  };

  const filteredDisciplines = disciplines.filter((item) => {
    const matchesSearch = Object.values(item).some((val) =>
      val.toString().toLowerCase().includes(search.toLowerCase())
    );
    const matchesCalendar = selectedCalendar ? item.calendar === selectedCalendar : true;
    const matchesClass = selectedClass ? item.class === selectedClass : true;
    return matchesSearch && matchesCalendar && matchesClass;
  });

  return (
    <Box
      sx={{
        p: 2,
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", mt: 2, mb: 3 }}
      >
        Grade de Turma
      </Typography>

      {/* Box de filtros e botão de criação */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Ícone de filtro */}
          <FilterListAlt
            sx={{ 
              color: "#087619", 
              fontSize: "1.7rem",
              alignSelf: "center",
              mt: { xs: 0, sm: 0.5 }
            }} 
          />
          
          {/* Box dos selects */}
          <Box
            sx={{
              borderRadius: "8px",
              p: 1,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <FormControl
              sx={{
                minWidth: { xs: "100%", sm: 200 },
                "& .MuiInputBase-root": {
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiInputLabel-root": {
                  transform: "translate(14px, 7px) scale(1)",
                  "&.Mui-focused, &.MuiInputLabel-shrink": {
                    transform: "translate(14px, -6px) scale(0.75)",
                    color: "#000000",
                  },
                },
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  height: "100% !important",
                },
              }}
            >
              <InputLabel id="calendar-filter-label">Calendário</InputLabel>
              <StyledSelect
                labelId="calendar-filter-label"
                value={selectedCalendar}
                label="Calendário"
                onChange={(e) => setSelectedCalendar(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.23)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#000000",
                  }
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
                          backgroundColor: "#C5F5CB",
                        },
                      },
                      "& .MuiMenuItem-root:hover": {
                        backgroundColor: "#D5FFDB",
                      },
                    },
                  },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {calendars.map((calendar) => (
                  <MenuItem key={calendar} value={calendar}>
                    {calendar}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
            <FormControl
              sx={{
                minWidth: { xs: "100%", sm: 200 },
                "& .MuiInputBase-root": {
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiInputLabel-root": {
                  transform: "translate(14px, 7px) scale(1)",
                  "&.Mui-focused, &.MuiInputLabel-shrink": {
                    transform: "translate(14px, -6px) scale(0.75)",
                    color: "#000000",
                  },
                },
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  height: "100% !important",
                },
              }}
            >
              <InputLabel id="class-filter-label">Turma</InputLabel>
              <StyledSelect
                labelId="class-filter-label"
                value={selectedClass}
                label="Turma"
                onChange={(e) => setSelectedClass(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.23)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#000000",
                  }
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
                          backgroundColor: "#C5F5CB",
                        },
                      },
                      "& .MuiMenuItem-root:hover": {
                        backgroundColor: "#D5FFDB",
                      },
                    },
                  },
                }}
              >
                <MenuItem value="">Todas</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls} value={cls}>
                    {cls}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={onCreateClick}
          sx={{
            backgroundColor: "#087619",
            "&:hover": { backgroundColor: "#065412" },
            textTransform: "none",
            width: { xs: "100%", sm: "auto" },
            fontWeight: "bold",
            height: 36,
          }}
        >
          Criar Grade de Turma
        </Button>
      </Box>

      <ClassScheduleTable
        classesSchedule={filteredDisciplines}
        onUpdate={handleCustomEdit}
        search={search}
        showActions={true}
        renderActions={(item) => (
          <>
            <IconButton
              onClick={() => handleCustomEdit(item)}
              sx={{ color: "#087619", "&:hover": { color: "#065412" } }}
            >
              <Edit />
            </IconButton>
            <IconButton
              onClick={() => handleViewClick(item.disciplineId)}
              sx={{ color: "#666666", "&:hover": { color: "#535252" } }}
            >
              <Visibility />
            </IconButton>
          </>
        )}
      />

      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={handleAlertClose}
        />
      )}
    </Box>
  );
};

export default ClassScheduleList;