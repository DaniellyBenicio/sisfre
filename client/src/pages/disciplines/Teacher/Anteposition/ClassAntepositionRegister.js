import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Stack,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Close, Save, CloudUpload, ArrowBack } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ptBR } from "date-fns/locale";
import api from "../../../../service/api";
import { jwtDecode } from "jwt-decode";

const INSTITUTIONAL_COLOR = "#307c34";

const StyledButton = styled(Button)(() => ({
  borderRadius: '8px',
  padding: '8px 28px',
  textTransform: 'none',
  fontWeight: 'bold',
  fontSize: '0.875rem',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: 'fit-content',
  minWidth: 100,
  '@media (max-width: 600px)': {
    fontSize: '0.7rem',
    padding: '4px 8px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '120px',
  },
}));

const createLocalDate = (dateString) => {
  if (!dateString) return null;
  try {
    const parts = dateString.split('-');
    const dateObject = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    dateObject.setHours(0, 0, 0, 0);
    return dateObject;
  } catch (error) {
    console.error("Erro ao criar data local:", error);
    return null;
  }
};

// Estilos reutilizáveis para os campos
const inputStyles = {
  "& .MuiInputBase-root": {
    height: { xs: 40, sm: 56 }, // Altura ajustada para responsividade
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(0, 0, 0, 0.23)", // Borda padrão
    borderWidth: "1px",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#000000", // Borda preta ao passar o mouse
    borderWidth: "1px",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#000000", // Borda preta quando focado
    borderWidth: "1px",
  },
  "& .MuiInputLabel-root": {
    transform: "translate(14px, 7px) scale(1)", // Posição inicial do label
    color: "rgba(0, 0, 0, 0.6)", // Cor padrão do label
    "@media (max-width: 600px)": {
      fontSize: "0.875rem", // Tamanho da fonte em telas menores
    },
  },
  "& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-shrink": {
    transform: "translate(14px, -9px) scale(0.75)", // Label "flutuando" quando focado ou preenchido
    color: "#000000", // Label preto quando focado ou preenchido
  },
};

// Estilos específicos para o Select (incluindo MenuProps)
const selectStyles = {
  ...inputStyles,
  "& .MuiSelect-select": {
    paddingTop: "8px",
    paddingBottom: "8px",
  },
};

// Estilos para o Menu do Select
const menuProps = {
  PaperProps: {
    sx: {
      maxHeight: "200px",
      "& .MuiMenuItem-root": {
        "&:hover": { backgroundColor: "#D5FFDB" },
        "&.Mui-selected": { backgroundColor: "#E8F5E9", "&:hover": { backgroundColor: "#D5FFDB" } },
      },
    },
  },
};

const ClassAntepositionRegister = ({ setAlert }) => {
  const professor = localStorage.getItem("username") || "";
  const [course, setCourse] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [turn, setTurn] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);
  const [observation, setObservation] = useState("");
  const [scheduleDetails, setScheduleDetails] = useState([]);
  const [selectedClassLabel, setSelectedClassLabel] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await api.get("/professor/request");
        const details = response.data.scheduleDetails || [];
        const validatedDetails = details.filter(
          (sd) =>
            sd.course && sd.discipline && sd.turn && sd.acronym && sd.semester
        );
        setScheduleDetails(validatedDetails);
        if (validatedDetails.length === 0) {
          setAlert({
            message: "Nenhuma grade válida encontrada.",
            type: "error",
          });
        }
      } catch (error) {
        setAlert({
          message: "Erro ao carregar grade do professor.",
          type: "error",
        });
        setScheduleDetails([]);
      }
    };
    fetchSchedule();
  }, [setAlert]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleScheduleChange = (event) => {
    const selectedValue = event.target.value;
    const selected = scheduleDetails.find(
      (sd) => `${sd.course}|${sd.discipline}|${sd.turn}` === selectedValue
    );
    if (selected) {
      setCourse(selected.course);
      setDiscipline(selected.discipline);
      setTurn(selected.turn);
      setSelectedClassLabel(`${selected.acronym} - ${selected.semester}`);
    } else {
      setCourse("");
      setDiscipline("");
      setTurn("");
      setSelectedClassLabel("");
    }
  };

  const handleSubmit = async () => {
    if (!course || !discipline || !turn || !quantity || !date) {
      setAlert({
        message: "Preencha todos os campos obrigatórios.",
        type: "error",
      });
      return;
    }
    if (isNaN(quantity) || parseInt(quantity) > 4 || parseInt(quantity) < 1) {
      setAlert({ message: "Quantidade deve ser entre 1 e 4.", type: "error" });
      return;
    }
    const selectedDate = createLocalDate(date);
    const todayLocalMidnight = new Date();
    todayLocalMidnight.setHours(0, 0, 0, 0);
    if (selectedDate < todayLocalMidnight) {
      setAlert({
        message: "A data não pode ser anterior à atual.",
        type: "error",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setAlert({
        message: "Token não encontrado. Faça login novamente.",
        type: "error",
      });
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id;

      if (!userId || isNaN(userId)) {
        setAlert({
          message: "ID do usuário inválido no token. Faça login novamente.",
          type: "error",
        });
        navigate("/login");
        return;
      }

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("course", course);
      formData.append("discipline", discipline);
      formData.append("turn", turn);
      formData.append("type", "anteposicao");
      formData.append("quantity", parseInt(quantity));
      formData.append("date", date);
      if (file) formData.append("annex", file);
      formData.append("observation", observation);

      await api.post("/request", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAlert({
        message: "Anteposição cadastrada com sucesso!",
        type: "success",
      });
      navigate("/class-anteposition");
    } catch (error) {
      console.error("Erro ao enviar requisição:", error);
      setAlert({
        message:
          error.response?.data?.error ||
          "Erro ao cadastrar. Verifique os dados ou tente novamente.",
        type: "error",
      });
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleGoBack = () => {
    navigate("/class-anteposition");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ p: 2 }}>
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
            onClick={handleGoBack}
            sx={{
              position: "absolute",
              left: 0,
              color: INSTITUTIONAL_COLOR,
              "&:hover": { backgroundColor: "transparent" },
            }}
          >
            <ArrowBack sx={{ fontSize: 30 }} />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", textAlign: "center", flexGrow: 1 }}
          >
            Cadastrar Anteposição
          </Typography>
        </Box>

        <Paper elevation={2} sx={{ p: 2, mt: 1 }}>
          <Box component="form">
            <Box sx={{ display: "flex", gap: 2, my: 1.5, alignItems: "center" }}>
              <TextField
                label="Professor"
                value={professor}
                fullWidth
                disabled
                variant="outlined"
                sx={inputStyles} // Aplicar estilos
              />
              <FormControl fullWidth variant="outlined" required sx={inputStyles}>
                <InputLabel>Selecionar da Grade</InputLabel>
                <Select
                  value={
                    course && discipline && turn
                      ? `${course}|${discipline}|${turn}`
                      : ""
                  }
                  onChange={handleScheduleChange}
                  label="Selecionar da Grade"
                  sx={selectStyles} // Estilos específicos para Select
                  MenuProps={menuProps} // Estilos para o menu
                >
                  <MenuItem value="">Selecione</MenuItem>
                  {scheduleDetails.map((sd) => (
                    <MenuItem
                      key={`${sd.course}|${sd.discipline}|${sd.turn}`}
                      value={`${sd.course}|${sd.discipline}|${sd.turn}`}
                    >
                      {`${sd.acronym} - ${sd.semester} - ${sd.discipline}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", gap: 2, my: 1.5, alignItems: "center" }}>
              <TextField
                label="Turma"
                value={selectedClassLabel}
                fullWidth
                disabled
                variant="outlined"
                sx={inputStyles} // Aplicar estilos
              />
              <TextField
                label="Disciplina"
                value={discipline}
                fullWidth
                disabled
                variant="outlined"
                sx={inputStyles} // Aplicar estilos
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2, my: 1.5, alignItems: "center" }}>
              <TextField
                label="Turno"
                value={turn}
                fullWidth
                disabled
                variant="outlined"
                sx={inputStyles} // Aplicar estilos
              />
              <TextField
                label="Quantidade"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                fullWidth
                required
                variant="outlined"
                sx={inputStyles} // Aplicar estilos
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2, my: 1.5, alignItems: "center" }}>
              <DatePicker
                label="Data"
                value={createLocalDate(date)}
                onChange={(newValue) => {
                  let formattedDate = "";
                  if (newValue) {
                    const year = newValue.getFullYear();
                    const month = String(newValue.getMonth() + 1).padStart(2, "0");
                    const day = String(newValue.getDate()).padStart(2, "0");
                    formattedDate = `${year}-${month}-${day}`;
                  }
                  setDate(formattedDate);
                }}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    id: "date-input",
                    name: "date",
                    required: true,
                    fullWidth: true,
                    sx: {
                      ...inputStyles, // Aplicar estilos do token
                      minWidth: 150, // Manter o minWidth do exemplo
                    },
                  },
                  popper: {
                    sx: {
                      zIndex: 1500,
                      "& .MuiPickerStaticWrapper-root": {
                        maxWidth: { xs: "200px", sm: "250px" },
                        maxHeight: { xs: "250px", sm: "300px" },
                      },
                    },
                    placement: "top-start",
                  },
                }}
              />
              <TextField
                label="Anexar Ficha"
                value={file ? file.name : ""}
                fullWidth
                readOnly
                onClick={() =>
                  document.querySelector('input[type="file"]').click()
                }
                variant="outlined"
                sx={inputStyles} // Aplicar estilos
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CloudUpload sx={{ color: "#087619" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <input type="file" hidden onChange={handleFileChange} />
            </Box>
            <Box sx={{ my: 1.5 }}>
              <TextField
                label="Observação"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                sx={inputStyles} // Aplicar estilos
              />
            </Box>
          </Box>
        </Paper>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 3,
          }}
        >
          <Stack direction="row" spacing={2}>
            <StyledButton
              onClick={handleGoBack}
              variant="contained"
              sx={{
                backgroundColor: "#F01424",
                "&:hover": { backgroundColor: "#D4000F" },
              }}
            >
              <Close sx={{ fontSize: { xs: 20, sm: 24 } }} />
              Cancelar
            </StyledButton>
            <StyledButton
              onClick={handleSubmit}
              variant="contained"
              sx={{
                backgroundColor: INSTITUTIONAL_COLOR,
                "&:hover": { backgroundColor: "#26692b" },
              }}
            >
              <Save sx={{ fontSize: { xs: 20, sm: 24 } }} />
              Solicitar
            </StyledButton>
          </Stack>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ClassAntepositionRegister;