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
} from "@mui/material";
import { Close, Save } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ptBR } from "date-fns/locale";
import { parse, startOfDay } from "date-fns";
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
    date: "",
    observation: "",
  });
  const [initialHoliday, setInitialHoliday] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  const isFormFilled = holiday.date && holiday.observation && holiday.observation.trim() !== '';

  const hasFormChanged = () => {
    if (!isEditMode || !initialHoliday) return false;
    return (
      holiday.date !== initialHoliday.date ||
      holiday.observation !== initialHoliday.observation
    );
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    if (open) {
      if (holidayToEdit && isEditMode) {
        const initialData = {
          date: holidayToEdit.date || "",
          observation: holidayToEdit.observation || "",
        };
        setHoliday(initialData);
        setInitialHoliday(initialData);
        setError(null);
      } else {
        setHoliday({ date: "", observation: "" });
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

    if (!holiday.date || !holiday.observation) {
      setError("Os campos data e observações são obrigatórios.");
      setLoading(false);
      return;
    }

    const dateParts = holiday.date.split("-");
    if (dateParts.length !== 3 || dateParts.some((part) => isNaN(Number(part)))) {
      setError("Formato de data inválido. Use AAAA-MM-DD.");
      setLoading(false);
      return;
    }

    const inputDate = startOfDay(parse(holiday.date, "yyyy-MM-dd", new Date()));
    if (isNaN(inputDate.getTime())) {
      setError("A data fornecida é inválida.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        date: holiday.date,
        observation: holiday.observation,
      };

      let response;
      if (isEditMode) {
        response = await api.put(`/holidays/${holidayToEdit?.id}`, payload);
      } else {
        response = await api.post(`/holidays`, payload);
      }

      const updatedHoliday = {
        ...response.data.holiday,
        id: response.data.holiday.id || holidayToEdit?.id || Date.now(),
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

      let errorMessage = err.response?.data?.message ||
                        err.response?.data?.error ||
                        err.response?.data?.errors?.[0] ||
                        err.message ||
                        `Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} feriado.`;

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

              <DatePicker
                label="Data"
                value={holiday.date ? parse(holiday.date, "yyyy-MM-dd", new Date()) : null}
                onChange={(newValue) =>
                  handleInputChange(
                    "date",
                    newValue ? newValue.toISOString().split("T")[0] : ""
                  )
                }
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

              <TextField
                margin="normal"
                label="Observações"
                type="text"
                fullWidth
                value={holiday.observation}
                onChange={(e) => handleInputChange("observation", e.target.value)}
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