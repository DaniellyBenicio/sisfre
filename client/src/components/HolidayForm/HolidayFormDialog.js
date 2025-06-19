import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  FormControl,
  TextField,
  IconButton,
  InputLabel,
} from "@mui/material";
import { Close, Save } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ptBR } from "date-fns/locale";
import { parse, startOfDay } from "date-fns";
import api from "../../service/api";
import { StyledSelect } from "../../components/inputs/Input";

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
  setAlert,
}) => {
  const [holiday, setHoliday] = useState({
    date: "",
    observation: "",
  });
  const [initialHoliday, setInitialHoliday] = useState(null);
  const [error, setError] = useState(null);

  // Verifica se o formulário está preenchido (para modo de criação)
  const isFormFilled = holiday.date && holiday.observation;

  // Verifica se o formulário foi alterado (para modo de edição)
  const hasFormChanged = () => {
    if (!isEditMode || !initialHoliday) return false;
    return (
      holiday.date !== initialHoliday.date ||
      holiday.observation !== initialHoliday.observation
    );
  };

  // Inicializa o formulário com dados de edição ou reseta para modo de criação
  useEffect(() => {
    if (holidayToEdit && isEditMode) {
      const initialData = {
        date: holidayToEdit.date || "",
        observation: holidayToEdit.observation || "",
      };
      setHoliday(initialData);
      setInitialHoliday(initialData);
      setError(null);
    } else {
      setHoliday({
        date: "",
        observation: "",
      });
      setInitialHoliday(null);
      setError(null);
    }
  }, [holidayToEdit, open, isEditMode]);

  const handleInputChange = (name, value) => {
    setHoliday({ ...holiday, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validações do lado do cliente
    if (!holiday.date || !holiday.observation) {
      setError("Os campos data e observações são obrigatórios.");
      return;
    }

    // Validação da data
    const dateParts = holiday.date.split("-");
    if (dateParts.length !== 3 || dateParts.some((part) => isNaN(Number(part)))) {
      setError("Formato de data inválido. Use AAAA-MM-DD.");
      return;
    }

    // Parse da data usando date-fns para garantir consistência no fuso horário local (-03:00)
    const inputDate = startOfDay(parse(holiday.date, "yyyy-MM-dd", new Date()));
    if (isNaN(inputDate.getTime())) {
      setError("A data fornecida é inválida.");
      return;
    }

    try {
      const payload = {
        date: holiday.date,
        observation: holiday.observation,
      };

      console.log("HolidayFormDialog - Payload enviado:", payload);

      let response;
      if (isEditMode) {
        response = await api.put(`/holidays/${holidayToEdit?.id}`, payload);
      } else {
        response = await api.post(`/holidays`, payload);
      }

      console.log("HolidayFormDialog - Resposta da API:", response.data);

      const updatedHoliday = {
        ...response.data.holiday,
        id: response.data.holiday.id || holidayToEdit?.id || Date.now(), // Ajuste conforme API
      };

      onSubmitSuccess(updatedHoliday, isEditMode);
      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        `Erro ao ${isEditMode ? "atualizar" : "cadastrar"} feriado: ${err.message}`;
      setError(
        errorMessage.includes("Já existe um feriado com esta data")
          ? "Já existe um feriado com esta data."
          : errorMessage
      );
      console.error("HolidayFormDialog - Erro:", err);
      if (setAlert) {
        setAlert({
          message: errorMessage,
          type: "error",
        });
      }
    }
  };

  return (
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
              minDate={new Date("2025-01-01")} // Ajuste conforme necessário
              slotProps={{
                textField: {
                  id: "date-input",
                  name: "date",
                  required: true,
                  fullWidth: true,
                  InputLabelProps: {
                    sx: {
                      color: "#757575",
                      "&::after": { content: '" *"', color: "#757575" },
                      top: "50%",
                      transform: "translate(14px, -50%)",
                      fontSize: "1rem",
                      "&.Mui-focused, &.MuiInputLabel-shrink": {
                        color: "#000000",
                        "&::after": { content: '" *"', color: "#000000" },
                        top: 0,
                        transform: "translate(14px, -9px) scale(0.75)",
                      },
                    },
                  },
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      minHeight: { xs: "40px", sm: "56px" },
                      "& fieldset": { borderColor: "#000000" },
                      "&:hover fieldset": { borderColor: "#000000" },
                      "&.Mui-focused fieldset": {
                        borderColor: "#000000",
                        borderWidth: "2px",
                      },
                    },
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

            <TextField
              margin="normal"
              label="Observações"
              type="text"
              fullWidth
              value={holiday.observation}
              onChange={(e) => handleInputChange("observation", e.target.value)}
              required
              InputLabelProps={{
                sx: {
                  color: "#757575",
                  "&::after": { content: '" *"', color: "#757575" },
                  top: "50%",
                  transform: "translate(14px, -50%)",
                  fontSize: "1rem",
                  "&.Mui-focused, &.MuiInputLabel-shrink": {
                    color: "#000000",
                    "&::after": { content: '" *"', color: "#000000" },
                    top: 0,
                    transform: "translate(14px, -9px) scale(0.75)",
                  },
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  minHeight: { xs: "40px", sm: "56px" },
                  "& fieldset": { borderColor: "#000000" },
                  "&:hover fieldset": { borderColor: "#000000" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#000000",
                    borderWidth: "2px",
                  },
                },
                my: 1.5,
              }}
            />

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
                <Close sx={{ fontSize: { xs: 20, sm: 24 } }} />
                Cancelar
              </StyledButton>
              <StyledButton
                type="submit"
                variant="contained"
                disabled={isEditMode ? !hasFormChanged() : !isFormFilled}
                sx={{
                  backgroundColor:
                    isEditMode && !hasFormChanged()
                      ? "#E0E0E0"
                      : !isFormFilled
                      ? "#E0E0E0"
                      : INSTITUTIONAL_COLOR,
                  "&:hover": {
                    backgroundColor:
                      isEditMode && !hasFormChanged()
                        ? "#E0E0E0"
                        : !isFormFilled
                        ? "#E0E0E0"
                        : "#26692b",
                  },
                }}
              >
                <Save sx={{ fontSize: { xs: 20, sm: 24 } }} />
                {isEditMode ? "Atualizar" : "Cadastrar"}
              </StyledButton>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
};

export default HolidayFormDialog;