import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
  Box,
  IconButton,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogContent,
} from "@mui/material";
import { Close, Save, ArrowForward, ArrowBack } from "@mui/icons-material";
import { StyledTextField, StyledSelect } from "../inputs/Input";
import CustomAlert from "../alert/CustomAlert";

const ClassScheduleModal = ({ open, onClose, editingData = null, onUpdate }) => {
  const [classSchedule, setClassSchedule] = useState({
    calendar: "",
    teacher: null,
    class: "",
    discipline: null,
    turn: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  });
  const [currentSection, setCurrentSection] = useState(1);
  const [alert, setAlert] = useState(null);
  const [isEditMode, setIsEditMode] = useState(Boolean(editingData));

  // Dados mockados
  const mockDisciplines = [
    { id: 1, name: "Matemática" },
    { id: 2, name: "Física" },
    { id: 3, name: "Química" },
    { id: 4, name: "Biologia" },
  ];
  const mockTeachers = [
    { id: 1, name: "João Silva" },
    { id: 2, name: "Maria Oliveira" },
    { id: 3, name: "Carlos Souza" },
    { id: 4, name: "Ana Pereira" },
  ];
  const mockCalendars = ["2025/1", "2025/2", "2026/1"];
  const mockClasses = ["Turma A", "Turma B", "Turma C"];
  const mockTurns = ["Manhã", "Tarde", "Noite"];
  const mockDaysOfWeek = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  useEffect(() => {
    if (editingData) {
      setClassSchedule({
        calendar: editingData.calendar || "",
        teacher: mockTeachers.find((t) => t.name === editingData.teacher) || null,
        class: editingData.class || "",
        discipline: mockDisciplines.find((d) => d.name === editingData.discipline) || null,
        turn: editingData.turn || "",
        dayOfWeek: editingData.dayOfWeek || "",
        startTime: editingData.startTime || "",
        endTime: editingData.endTime || "",
      });
    } else {
      setClassSchedule({
        calendar: "",
        teacher: null,
        class: "",
        discipline: null,
        turn: "",
        dayOfWeek: "",
        startTime: "",
        endTime: "",
      });
    }
    setCurrentSection(1);
  }, [editingData, open]);

  const isFirstSectionFilled = () =>
    classSchedule.calendar &&
    classSchedule.discipline &&
    classSchedule.turn &&
    classSchedule.class;

  const handleChange = (field, value) => {
    setClassSchedule((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados enviados:", classSchedule);
    setAlert({
      message: isEditMode ? "Grade de turma atualizada (simulação)" : "Grade de turma criada (simulação)",
      type: "success",
    });
    setTimeout(() => {
      onClose();
      setCurrentSection(1);
    }, 1000);
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  const handleNext = () => {
    if (isFirstSectionFilled()) {
      setCurrentSection(2);
    } else {
      setAlert({ message: "Preencha todos os campos da primeira seção", type: "error" });
    }
  };

  const handleBack = () => {
    setCurrentSection(1);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
            width: "520px",
            maxWidth: "90vw",
          },
        }}
      >
        <DialogTitle
          sx={{ textAlign: "center", marginTop: "27px", color: "#087619", fontWeight: "bold" }}
        >
          {isEditMode ? "Editar Grade de Turma" : "Criar Grade de Turma"}
          <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 5, pt: 3 }}>
          {/* Barras de progresso */}
          <Box sx={{ display: "flex", gap: 1, mb: 3, justifyContent: "center" }}>
            <Box
              sx={{
                width: "50%",
                height: 6,
                backgroundColor: currentSection >= 1 ? "#087619" : "#E0E0E0",
                borderRadius: 3,
              }}
            />
            <Box
              sx={{
                width: "50%",
                height: 6,
                backgroundColor: currentSection >= 2 ? "#087619" : "#E0E0E0",
                borderRadius: 3,
              }}
            />
          </Box>

          <form onSubmit={handleSubmit}>
            {currentSection === 1 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Autocomplete
                  options={mockDisciplines}
                  getOptionLabel={(option) => option.name || ""}
                  value={classSchedule.discipline}
                  onChange={(e, value) => handleChange("discipline", value)}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Disciplina"
                      variant="outlined"
                      fullWidth
                      required
                      sx={{
                        "& .MuiInputBase-root": { height: "56px" },
                        "& .MuiInputLabel-root": {
                          top: "50%",
                          transform: "translate(14px, -50%)",
                          fontSize: "1rem",
                        },
                        "& .MuiInputLabel-shrink": {
                          top: 0,
                          transform: "translate(14px, -9px) scale(0.75)",
                        },
                      }}
                    />
                  )}
                  noOptionsText="Nenhuma disciplina encontrada"
                  componentsProps={{
                    paper: { sx: { width: "auto" } },
                    listbox: {
                      sx: {
                        maxHeight: "200px",
                        overflowY: "auto",
                        "& .MuiAutocomplete-option:hover": {
                          backgroundColor: "#D5FFDB",
                        },
                        "& .MuiAutocomplete-option.Mui-focused": {
                          backgroundColor: "transparent",
                        },
                        "& .MuiAutocomplete-option[aria-selected='true'].Mui-focused": {
                          backgroundColor: "#E8F5E9",
                        },
                      },
                    },
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel
                  >
                    Calendário
                  </InputLabel>
                  <StyledSelect
                    value={classSchedule.calendar}
                    label="Calendário"
                    onChange={(e) => handleChange("calendar", e.target.value)}
                    required
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: '200px',
													overflowY: 'auto',
													width: 'auto',
													'& .MuiMenuItem-root:hover': {
														backgroundColor: '#D5FFDB',
													},
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Selecione</MenuItem>
                    {mockCalendars.map((calendar) => (
                      <MenuItem key={calendar} value={calendar}>
                        {calendar}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel
                  >
                    Turno
                  </InputLabel>
                  <StyledSelect
                    value={classSchedule.turn}
                    label="Turno"
                    onChange={(e) => handleChange("turn", e.target.value)}
                    required
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: '200px',
													overflowY: 'auto',
													width: 'auto',
													'& .MuiMenuItem-root:hover': {
														backgroundColor: '#D5FFDB',
													},
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Selecione</MenuItem>
                    {mockTurns.map((turn) => (
                      <MenuItem key={turn} value={turn}>
                        {turn}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel
                  >
                    Turma
                  </InputLabel>
                  <StyledSelect
                    value={classSchedule.class}
                    label="Turma"
                    onChange={(e) => handleChange("class", e.target.value)}
                    required
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: '200px',
													overflowY: 'auto',
													width: 'auto',
													'& .MuiMenuItem-root:hover': {
														backgroundColor: '#D5FFDB',
													},
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Selecione</MenuItem>
                    {mockClasses.map((cls) => (
                      <MenuItem key={cls} value={cls}>
                        {cls}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </Box>
            )}

            {currentSection === 2 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Autocomplete
                  options={mockTeachers}
                  getOptionLabel={(option) => option.name || ""}
                  value={classSchedule.teacher}
                  onChange={(e, value) => handleChange("teacher", value)}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Professor"
                      variant="outlined"
                      fullWidth
                      required
                      sx={{
                        "& .MuiInputBase-root": { height: "56px" },
                        "& .MuiInputLabel-root": {
                          top: "50%",
                          transform: "translate(14px, -50%)",
                          fontSize: "1rem",
                        },
                        "& .MuiInputLabel-shrink": {
                          top: 0,
                          transform: "translate(14px, -9px) scale(0.75)",
                        },
                      }}
                    />
                  )}
                  noOptionsText="Nenhum professor encontrado"
                  componentsProps={{
                    paper: { sx: { width: "auto" } },
                    listbox: {
                      sx: {
                        maxHeight: "200px",
                        overflowY: "auto",
                        "& .MuiAutocomplete-option:hover": {
                          backgroundColor: "#D5FFDB",
                        },
                        "& .MuiAutocomplete-option.Mui-focused": {
                          backgroundColor: "transparent",
                        },
                        "& .MuiAutocomplete-option[aria-selected='true'].Mui-focused": {
                          backgroundColor: "#E8F5E9",
                        },
                      },
                    },
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel
                    sx={{
                      top: "50%",
                      transform: "translate(14px, -50%)",
                      fontSize: "1rem",
                      "&.MuiInputLabel-shrink": {
                        top: 0,
                        transform: "translate(14px, -9px) scale(0.75)",
                      },
                      "&.Mui-focused": { color: "#087619" },
                    }}
                  >
                    Dia da Semana
                  </InputLabel>
                  <StyledSelect
                    value={classSchedule.dayOfWeek}
                    label="Dia da Semana"
                    onChange={(e) => handleChange("dayOfWeek", e.target.value)}
                    required
                    sx={{
                      height: "56px",
                      "& .MuiSelect-select": { padding: "16.5px 14px" },
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#087619" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#065412" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#087619",
                        borderWidth: 2,
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: "200px",
                          "& .MuiMenuItem-root:hover": { backgroundColor: "#D5FFDB" },
                          "& .Mui-selected": { backgroundColor: "#E8F5E9 !important" },
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Selecione</MenuItem>
                    {mockDaysOfWeek.map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
                <StyledTextField
                  label="Hora de Início"
                  type="time"
                  value={classSchedule.startTime}
                  onChange={(e) => handleChange("startTime", e.target.value)}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiInputBase-root": { height: "56px" },
                    "& .MuiInputLabel-root": {
                      top: "50%",
                      transform: "translate(14px, -50%)",
                      fontSize: "1rem",
                      "&.MuiInputLabel-shrink": {
                        top: 0,
                        transform: "translate(14px, -9px) scale(0.75)",
                      },
                    },
                  }}
                />
                <StyledTextField
                  label="Hora de Fim"
                  type="time"
                  value={classSchedule.endTime}
                  onChange={(e) => handleChange("endTime", e.target.value)}
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiInputBase-root": { height: "56px" },
                    "& .MuiInputLabel-root": {
                      top: "50%",
                      transform: "translate(14px, -50%)",
                      fontSize: "1rem",
                      "&.MuiInputLabel-shrink": {
                        top: 0,
                        transform: "translate(14px, -9px) scale(0.75)",
                      },
                    },
                  }}
                />
              </Box>
            )}

            <DialogActions
              sx={{
                justifyContent: "center",
                gap: 2,
                padding: "20px 24px",
                marginTop: "35px",
              }}
            >
              {currentSection === 1 && (
                <>
                  <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                      minWidth: 120,
                      padding: "8px 20px",
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: "bold",
                      backgroundColor: "#F01424",
                      "&:hover": { backgroundColor: "#D4000F" },
                    }}
                  >
                    <Close sx={{ fontSize: 24, mr: 1 }} />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    sx={{
                      minWidth: 120,
                      padding: "8px 20px",
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: "bold",
                      backgroundColor: "#087619",
                      "&:hover": { backgroundColor: "#066915" },
                    }}
                    disabled={!isFirstSectionFilled()}
                  >
                    Próximo
                    <ArrowForward sx={{ fontSize: 24, ml: 1 }} />
                  </Button>
                </>
              )}
              {currentSection === 2 && (
                <>
                  <Button
                    onClick={handleBack}
                    variant="contained"
                    sx={{
                      minWidth: 120,
                      padding: "8px 20px",
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: "bold",
                      backgroundColor: "#757575",
                      "&:hover": { backgroundColor: "#616161" },
                    }}
                  >
                    <ArrowBack sx={{ fontSize: 24, mr: 1 }} />
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      !classSchedule.teacher ||
                      !classSchedule.dayOfWeek ||
                      !classSchedule.startTime ||
                      !classSchedule.endTime
                    }
                    sx={{
                      minWidth: 120,
                      padding: "8px 20px",
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: "bold",
                      backgroundColor: "#087619",
                      "&:hover": { backgroundColor: "#066915" },
                    }}
                  >
                    <Save sx={{ fontSize: 24, mr: 1 }} />
                    {isEditMode ? "Atualizar" : "Adicionar"}
                  </Button>
                </>
              )}
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={handleAlertClose}
        />
      )}
    </>
  );
};

export default ClassScheduleModal;