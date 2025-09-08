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
  CssBaseline,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close, Save, CloudUpload, ArrowBack } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ptBR } from "date-fns/locale";
import SideBar from "../../../../components/SideBar";
import api from "../../../../service/api";
import { jwtDecode } from "jwt-decode";
import { CustomAlert } from "../../../../components/alert/CustomAlert";

const INSTITUTIONAL_COLOR = "#307c34";

// Regras do Multer replicadas no frontend
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const StyledButton = styled(Button)(() => ({
  borderRadius: "8px",
  padding: "8px 28px",
  textTransform: "none",
  fontWeight: "bold",
  fontSize: "0.875rem",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "fit-content",
  minWidth: 100,
  "@media (max-width: 600px)": {
    fontSize: "0.7rem",
    padding: "4px 8px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "120px",
  },
}));

const inputStyles = {
  "& .MuiInputBase-root": {
    height: { xs: 40, sm: 56 },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(0, 0, 0, 0.23)",
    borderWidth: "1px",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#000000",
    borderWidth: "1px",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#000000",
    borderWidth: "1px",
  },
  "& .MuiInputLabel-root": {
    transform: "translate(14px, 7px) scale(1)",
    color: "rgba(0, 0, 0, 0.6)",
    "@media (max-width: 600px)": {
      fontSize: "0.875rem",
    },
  },
  "& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-shrink": {
    transform: "translate(14px, -9px) scale(0.75)",
    color: "#000000",
  },
};

const selectStyles = {
  ...inputStyles,
  "& .MuiSelect-select": {
    paddingTop: "8px",
    paddingBottom: "8px",
  },
};

const menuProps = {
  PaperProps: {
    sx: {
      maxHeight: "150px",
      "& .MuiMenuItem-root": {
        fontSize: "0.875rem",
        minHeight: "auto",
        "&:hover": { backgroundColor: "#D5FFDB" },
        "&.Mui-selected": {
          backgroundColor: "#E8F5E9",
          "&:hover": { backgroundColor: "#D5FFDB" },
        },
      },
    },
  },
};

const createLocalDate = (dateString) => {
  if (!dateString) return null;
  try {
    const parts = dateString.split("-");
    const dateObject = new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2])
    );
    dateObject.setHours(0, 0, 0, 0);
    return dateObject;
  } catch (error) {
    console.error("Erro ao criar data local:", error);
    return null;
  }
};

const ClassReplacementRegister = ({ setAlert }) => {
  const professor = localStorage.getItem("username") || "";
  const [course, setCourse] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState("");
  const [selectedDateAbsence, setSelectedDateAbsence] = useState("");
  const [files, setFiles] = useState([]);
  const [observation, setObservation] = useState("");
  const [scheduleDetails, setScheduleDetails] = useState([]);
  const [existingRequests, setExistingRequests] = useState([]);
  const [selectedClassLabel, setSelectedClassLabel] = useState("");
  const [localAlert, setLocalAlert] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchScheduleAndRequests = async () => {
      try {
        const scheduleResponse = await api.get("/professor/request");
        const details = scheduleResponse.data.scheduleDetails || [];
        const validatedDetails = details.filter(
          (sd) =>
            sd.course &&
            sd.discipline &&
            sd.acronym &&
            sd.semester &&
            sd.absenceDates?.length > 0
        );
        setScheduleDetails(validatedDetails);

        const requestsResponse = await api.get("/requests/only", {
          params: { type: "reposicao" },
        });
        setExistingRequests(requestsResponse.data.requests || []);

        if (validatedDetails.length === 0) {
          (setAlert || setLocalAlert)({
            message: "Nenhuma turma com faltas encontrada.",
            type: "error",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        (setAlert || setLocalAlert)({
          message: "Erro ao carregar grade ou solicitações do professor.",
          type: "error",
        });
        setScheduleDetails([]);
        setExistingRequests([]);
      }
    };
    fetchScheduleAndRequests();
  }, [setAlert]);

  useEffect(() => {
    const fetchAbsenceDates = async () => {
      if (!course || !discipline) {
        setAvailableDates([]);
        setSelectedDateAbsence("");
        return;
      }
      try {
        const selectedSchedule = scheduleDetails.find(
          (sd) => sd.course === course && sd.discipline === discipline
        );
        if (selectedSchedule && selectedSchedule.absenceDates) {
          const filteredDates = selectedSchedule.absenceDates.filter((date) => {
            // Novo filtro: exclui apenas se existe request NÃO rejeitada (validated !== 2)
            return !existingRequests.some(
              (req) =>
                req.course === course &&
                req.discipline === discipline &&
                req.dateAbsence === date &&
                req.validated !== 2 // Ignora rejeitadas
            );
          });
          setAvailableDates(filteredDates);
        } else {
          setAvailableDates([]);
        }
      } catch (error) {
        console.error("Erro ao carregar datas de ausência:", error);
        setAvailableDates([]);
        (setAlert || setLocalAlert)({
          message: "Erro ao carregar datas de ausência.",
          type: "error",
        });
      }
    };
    fetchAbsenceDates();
  }, [course, discipline, scheduleDetails, existingRequests, setAlert]);

  const handleFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    // Valida cada arquivo
    for (const file of selectedFiles) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        (setAlert || setLocalAlert)({
          message: `O arquivo não é permitido. Apenas arquivos PDF ou imagens (JPEG, PNG, JPG) são aceitos.`,
          type: "error",
        });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        (setAlert || setLocalAlert)({
          message: `O arquivo excede o limite de 5MB.`,
          type: "error",
        });
        return;
      }
    }
    setFiles(selectedFiles);
  };

  const handleScheduleChange = (event) => {
    const selectedValue = event.target.value;
    const selected = scheduleDetails.find(
      (sd) => `${sd.course}|${sd.discipline}` === selectedValue
    );
    if (selected) {
      setCourse(selected.course);
      setDiscipline(selected.discipline);
      setSelectedClassLabel(`${selected.acronym} - ${selected.semester}`);
      setSelectedDateAbsence("");
    } else {
      setCourse("");
      setDiscipline("");
      setSelectedClassLabel("");
      setSelectedDateAbsence("");
    }
  };

  const handleSubmit = async () => {
    if (
      !course ||
      !discipline ||
      !quantity ||
      !date ||
      !selectedDateAbsence ||
      files.length === 0
    ) {
      (setAlert || setLocalAlert)({
        message:
          "Preencha todos os campos obrigatórios, incluindo anexo(s) e uma data de ausência.",
        type: "error",
      });
      return;
    }
    if (isNaN(quantity) || parseInt(quantity) > 4 || parseInt(quantity) < 1) {
      (setAlert || setLocalAlert)({
        message: "Quantidade deve ser entre 1 e 4.",
        type: "error",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      (setAlert || setLocalAlert)({
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
        (setAlert || setLocalAlert)({
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
      formData.append("type", "reposicao");
      formData.append("quantity", parseInt(quantity));
      formData.append("date", date);
      formData.append("dateAbsence", selectedDateAbsence);
      files.forEach((file) => formData.append("annex", file));
      formData.append("observation", observation);

      await api.post("/request", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      (setAlert || setLocalAlert)({
        message: "Reposição cadastrada com sucesso!",
        type: "success",
      });
      navigate("/class-reposition");
    } catch (error) {
      console.error("Erro ao enviar requisição:", error);
      let errorMessage =
        "Erro ao cadastrar. Verifique os dados ou tente novamente.";
      if (error.response?.data?.error) {
        if (
          error.response.data.error.includes("Apenas arquivos PDF ou imagens")
        ) {
          errorMessage =
            "Apenas arquivos PDF ou imagens (JPEG, PNG, JPG) são permitidos.";
        } else if (error.response.data.error.includes("tamanho")) {
          errorMessage = "Um ou mais arquivos excedem o limite de 5MB.";
        } else {
          errorMessage = error.response.data.error;
        }
      }
      (setAlert || setLocalAlert)({
        message: errorMessage,
        type: "error",
      });
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleGoBack = () => {
    navigate("/class-reposition");
  };

  const handleAlertClose = () => {
    (setAlert || setLocalAlert)(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString + "T00:00:00");
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <CssBaseline />
        <SideBar setAuthenticated={() => {}} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflowY: "auto",
            backgroundColor: "#fff",
            py: { xs: 2, md: 4 },
            mt: 5,
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "1000px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              mb: 3,
              mt: 2,
            }}
          >
            {!isMobile && (
              <IconButton
                onClick={handleGoBack}
                sx={{
                  position: "absolute",
                  left: 0,
                  color: INSTITUTIONAL_COLOR,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <ArrowBack sx={{ fontSize: 35 }} />
              </IconButton>
            )}
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", textAlign: "center", flexGrow: 1, fontSize: { xs: "1.1rem", sm: "1.5rem" } }}
            >
              Cadastrar Reposição
            </Typography>
          </Box>

          <Paper
            elevation={3}
            sx={{ p: 4, mt: 2, width: "100%", maxWidth: "1000px" }}
          >
            <Box component="form">
              <Box
                sx={{ display: "flex", gap: 2, my: 1.5, alignItems: "center" }}
              >
                <TextField
                  label="Professor"
                  value={professor}
                  fullWidth
                  disabled
                  variant="outlined"
                  sx={inputStyles}
                />
                <FormControl
                  fullWidth
                  variant="outlined"
                  required
                  sx={inputStyles}
                >
                  <InputLabel>Selecionar da Grade</InputLabel>
                  <Select
                    value={
                      course && discipline ? `${course}|${discipline}` : ""
                    }
                    onChange={handleScheduleChange}
                    label="Selecionar da Grade"
                    sx={selectStyles}
                    MenuProps={menuProps}
                  >
                    <MenuItem value="">Selecione</MenuItem>
                    {scheduleDetails.map((sd) => (
                      <MenuItem
                        key={`${sd.course}|${sd.discipline}`}
                        value={`${sd.course}|${sd.discipline}`}
                      >
                        {`${sd.acronym} - ${sd.semester} - ${sd.discipline}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box
                sx={{ display: "flex", gap: 2, my: 1.5, alignItems: "center" }}
              >
                <TextField
                  label="Turma"
                  value={selectedClassLabel}
                  fullWidth
                  disabled
                  variant="outlined"
                  sx={inputStyles}
                />
                <TextField
                  label="Disciplina"
                  value={discipline}
                  fullWidth
                  disabled
                  variant="outlined"
                  sx={inputStyles}
                />
              </Box>
              <Box
                sx={{ display: "flex", gap: 2, my: 1.5, alignItems: "center" }}
              >
                <FormControl
                  fullWidth
                  variant="outlined"
                  required
                  sx={inputStyles}
                >
                  <InputLabel id="referente-a-label">Referente a</InputLabel>
                  <Select
                    labelId="referente-a-label"
                    value={selectedDateAbsence}
                    onChange={(e) => setSelectedDateAbsence(e.target.value)}
                    label="Referente a"
                    MenuProps={menuProps}
                  >
                    <MenuItem value="">Selecione</MenuItem>
                    {availableDates.map((date) => (
                      <MenuItem key={date} value={date}>
                        {formatDate(date)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Quantidade"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                  sx={inputStyles}
                />
              </Box>
              <Box
                sx={{ display: "flex", gap: 2, my: 1.5, alignItems: "center" }}
              >
                <DatePicker
                  label="Data da Reposição"
                  value={createLocalDate(date)}
                  onChange={(newValue) => {
                    let formattedDate = "";
                    if (newValue) {
                      const year = newValue.getFullYear();
                      const month = String(newValue.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const day = String(newValue.getDate()).padStart(2, "0");
                      formattedDate = `${year}-${month}-${day}`;
                    }
                    setDate(formattedDate);
                  }}
                  slotProps={{
                    textField: {
                      id: "date-input",
                      name: "date",
                      required: true,
                      fullWidth: true,
                      sx: { ...inputStyles, width: "50%" },
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
                  label="Anexar Ficha(s)"
                  value={files.map((f) => f.name).join(", ")}
                  fullWidth
                  readOnly
                  onClick={() =>
                    document.querySelector('input[type="file"]').click()
                  }
                  variant="outlined"
                  sx={{ ...inputStyles, width: "50%" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <CloudUpload sx={{ color: "#087619" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleFilesChange}
                  accept="application/pdf,image/jpeg,image/png,image/jpg"
                />
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
                  sx={inputStyles}
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
          {localAlert && (
            <CustomAlert
              message={localAlert.message}
              type={localAlert.type}
              onClose={handleAlertClose}
            />
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ClassReplacementRegister;