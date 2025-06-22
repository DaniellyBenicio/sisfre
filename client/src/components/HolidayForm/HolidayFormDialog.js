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
import { parse, format } from "date-fns";
import api from "../../service/api";
import CustomAlert from '../alert/CustomAlert';

const INSTITUTIONAL_COLOR = "#307c34";

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
    type: "",
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
          type: holidayToEdit.type || "",
        };
        setHoliday(initialData);
        setInitialHoliday(initialData);
        setError(null);
      } else {
        setHoliday({ name: "", date: null, type: "" });
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

  const grayBorderFieldStyles = {
    "& .MuiOutlinedInput-root": {
      minHeight: { xs: "40px", sm: "56px" },
      "& fieldset": { borderColor: "#9b9b9b" },
      "&:hover fieldset": { borderColor: "#9b9b9b" },
      "&.Mui-focused fieldset": {
        borderColor: "#000000 !important",
        borderWidth: "2px",
      },
    },
    my: 1.5,
    "@media (max-width: 600px)": {
      my: 1,
    },
  };

  const inputLabelStyles = {
    color: "#9b9b9b",
    top: "50%",
    transform: "translate(14px, -50%)",
    fontSize: "1rem",
    "&.Mui-focused, &.MuiInputLabel-shrink": {
      color: "#000000",
      top: 0,
      transform: "translate(14px, -9px) scale(0.75)",
    },
    "@media (max-width: 600px)": {
      fontSize: "0.875rem",
    },
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
              "@media (max-width: 600px)": {
                width: "100%",
                margin: "8px",
              },
            },
          }}
        >
          <DialogTitle
            sx={{
              textAlign: "center",
              marginTop: "15px",
              color: "#087619",
              fontWeight: "bold",
              "@media (max-width: 600px)": {
                fontSize: "1.25rem",
              },
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

          <DialogContent sx={{ px: { xs: 3, sm: 5 } }}>
            <form onSubmit={handleSubmit}>
              {error && (
                <Box
                  sx={{
                    color: "red",
                    marginBottom: 2,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
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
                InputLabelProps={{
                  sx: inputLabelStyles,
                }}
                sx={grayBorderFieldStyles}
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
                    InputLabelProps: {
                      sx: inputLabelStyles,
                    },
                    sx: {
                      ...grayBorderFieldStyles,
                      my: 1.5,
                    },
                  },
                  popper: {
                    sx: {
                      zIndex: 1500,
                      "& .MuiPickerStaticWrapper-root": {
                        maxWidth: { xs: "200px", sm: "250px" },
                        maxHeight: { xs: "250px", sm: "300px" },
                      },
                      marginTop: "20px",
                    },
                    placement: "bottom-start",
                  },
                }}
              />

              <FormControl
                fullWidth
                margin="normal"
                sx={{
                  ...grayBorderFieldStyles,
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#000000 !important",
                    borderWidth: "2px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#9b9b9b",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#9b9b9b",
                  },
                }}
              >
                <InputLabel id="type-label" sx={inputLabelStyles}>
                  Tipo *
                </InputLabel>
                <Select
                  labelId="type-label"
                  id="type-select"
                  value={holiday.type}
                  label="Tipo *"
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  required
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: "200px",
                        overflowY: "auto",
                        width: "auto",
                        "& .MuiMenuItem-root:hover": {
                          backgroundColor: "#D5FFDB",
                        },
                      },
                    },
                  }}
                  sx={{
                    "@media (max-width: 600px)": {
                      fontSize: "0.875rem",
                      height: "48px",
                    },
                  }}
                >
                  <MenuItem value="">Selecione um tipo</MenuItem>
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
                  marginTop: "10px",
                  "@media (max-width: 600px)": {
                    padding: "8px 12px",
                    gap: "8px",
                  },
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
                  <Close sx={{ fontSize: { xs: 20, sm: "24" } }} />
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
                      <Save sx={{ fontSize: { xs: 20, sm: 24 } }} />
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