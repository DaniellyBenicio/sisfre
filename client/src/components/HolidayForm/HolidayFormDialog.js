import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  TextField,
  IconButton,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Close, Save } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ptBR } from "date-fns/locale";
import { parse, startOfDay, format } from "date-fns";
import api from "../../service/api";
import CustomAlert from '../alert/CustomAlert';

const INSTITUTIONAL_COLOR = "#307c34";

const StyledButton = styled(Button)(() => ({
  borderRadius: "8px",
  padding: { xs: "8px 20px", sm: "8px 28px" },
  textTransform: "none",
  fontWeight: "bold",
  fontSize: "0.875rem",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "fit-content",
  minWidth: 100,
}));

const HolidayFormDialog = ({
  open,
  onClose,
  holidayToEdit,
  onSubmitSuccess,
  isEditMode,
}) => {
  const [holiday, setHoliday] = useState({
    name: "",
    date: null,
    type: "NACIONAL",
  });
  const [initialHoliday, setInitialHoliday] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  const isFormFilled = holiday.name && holiday.date && holiday.type;

  const hasFormChanged = () => {
    if (!isEditMode || !initialHoliday) return true;
    return (
      holiday.name !== initialHoliday.name ||
      format(new Date(holiday.date), "yyyy-MM-dd") !== initialHoliday.date ||
      holiday.type !== initialHoliday.type
    );
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    if (open) {
      if (holidayToEdit && isEditMode) {
        const initialData = {
          name: holidayToEdit.name || "",
          date: holidayToEdit.date ? parse(holidayToEdit.date, "yyyy-MM-dd", new Date()) : null,
          type: holidayToEdit.type || "NACIONAL",
        };
        setHoliday(initialData);
        setInitialHoliday(initialData);
        setError(null);
      } else {
        setHoliday({ name: "", date: null, type: "NACIONAL" });
        setInitialHoliday(null);
        setError(null);
      }
    }
  }, [holidayToEdit, open, isEditMode]);

  const handleInputChange = (name, value) => {
    setHoliday({ ...holiday, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!holiday.name || !holiday.date || !holiday.type) {
      setError("Os campos nome, data e tipo são obrigatórios.");
      setLoading(false);
      return;
    }

    const formattedDate = holiday.date ? format(holiday.date, "yyyy-MM-dd") : null;
    if (!formattedDate || isNaN(new Date(formattedDate).getTime())) {
      setError("A data fornecida é inválida.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: holiday.name,
        date: formattedDate,
        type: holiday.type,
      };

      let response;
      if (isEditMode) {
        response = await api.put(`/holidays/${holidayToEdit?.id}`, payload);
      } else {
        response = await api.post(`/holidays`, payload);
      }

      const updatedHoliday = {
        ...response.data.holiday,
        id: response.data.holiday.id || holidayToEdit?.id,
      };

      onSubmitSuccess(updatedHoliday, isEditMode);
      setAlert({
        message: isEditMode ? 'Feriado atualizado com sucesso!' : 'Feriado cadastrado com sucesso!',
        type: 'success',
      });
      onClose();
    } catch (err) {
      console.error('Erro completo:', err);
      console.error('Resposta do erro:', err.response?.data);

      let errorMessage = err.response?.data?.error || `Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} feriado.`;
      if (Array.isArray(err.response?.data?.errors)) {
        errorMessage = err.response.data.errors.join(', ');
      }

      setError(errorMessage);
      setAlert({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
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
            sx={{
              textAlign: "center",
              marginTop: "27px",
              color: "#087619",
              fontWeight: "bold",
            }}
          >
            {isEditMode ? "Editar Feriado" : "Cadastrar Feriado"}
            <IconButton
              onClick={onClose}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ px: 5 }}>
            <form onSubmit={handleSubmit}>
              {error && (
                <Box
                  sx={{
                    color: "red",
                    marginBottom: 2,
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </Box>
              )}

              <TextField
                margin="normal"
                label="Nome"
                type="text"
                fullWidth
                value={holiday.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "56px",
                    "& fieldset": { borderColor: "#000000" },
                    "&:hover fieldset": { borderColor: "#000000" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#000000",
                      borderWidth: "2px",
                    },
                  },
                  my: 1.5,
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

              <DatePicker
                label="Data"
                value={holiday.date}
                onChange={(newValue) => handleInputChange("date", newValue)}
                format="yyyy-MM-dd"
                minDate={new Date("2025-01-01")}
                slotProps={{
                  textField: {
                    id: "date-input",
                    name: "date",
                    required: true,
                    fullWidth: true,
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        height: "56px",
                        "& fieldset": { borderColor: "#000000" },
                        "&:hover fieldset": { borderColor: "#000000" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#000000",
                          borderWidth: "2px",
                        },
                      },
                      my: 2.5,
                      "& .MuiInputLabel-root": {
                        top: "50%",
                        transform: "translate(14px, -50%)",
                        fontSize: "1rem",
                      },
                      "& .MuiInputLabel-shrink": {
                        top: 0,
                        transform: "translate(14px, -9px) scale(0.75)",
                      },
                    },
                  },
                }}
              />

              <FormControl fullWidth sx={{ my: 1.5 }}>
                <InputLabel id="type-label">Tipo</InputLabel>
                <Select
                  labelId="type-label"
                  id="type-select"
                  value={holiday.type}
                  label="Tipo"
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  required
                  sx={{
                    height: "56px",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#000000" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#000000" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#000000",
                      borderWidth: "2px",
                    },
                  }}
                >
                  <MenuItem value="NACIONAL">Nacional</MenuItem>
                  <MenuItem value="ESTADUAL">Estadual</MenuItem>
                  <MenuItem value="MUNICIPAL">Municipal</MenuItem>
                  <MenuItem value="INSTITUCIONAL">Institucional</MenuItem>
                </Select>
              </FormControl>

              <DialogActions
                sx={{
                  justifyContent: "center",
                  gap: 2,
                  padding: "10px 24px",
                  marginTop: "35px",
                }}
              >
                <StyledButton
                  onClick={onClose}
                  variant="contained"
                  sx={{
                    backgroundColor: "#F01424",
                    "&:hover": { backgroundColor: "#D4000F" },
                  }}
                >
                  <Close sx={{ fontSize: 24 }} />
                  Cancelar
                </StyledButton>
                <StyledButton
                  type="submit"
                  variant="contained"
                  disabled={isEditMode ? !isFormFilled || !hasFormChanged() || loading : !isFormFilled || loading}
                  sx={{
                    backgroundColor: isEditMode && (!hasFormChanged() || !isFormFilled) ? "#E0E0E0" : INSTITUTIONAL_COLOR,
                    "&:hover": {
                      backgroundColor: isEditMode && (!hasFormChanged() || !isFormFilled) ? "#E0E0E0" : "#26692b",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: '#fff' }} />
                  ) : (
                    <>
                      <Save sx={{ fontSize: 24 }} />
                      {isEditMode ? "Atualizar" : "Cadastrar"}
                    </>
                  )}
                </StyledButton>
              </DialogActions>
            </form>
          </DialogContent>
        </Dialog>
      </LocalizationProvider>
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

export default HolidayFormDialog;