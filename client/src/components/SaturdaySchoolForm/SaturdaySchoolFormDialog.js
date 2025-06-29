import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  FormControl,
  MenuItem,
  IconButton,
  InputLabel,
} from "@mui/material";
import { Close, Save } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ptBR } from "date-fns/locale";
import { format, parseISO, isSaturday, startOfDay, isValid } from "date-fns";
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

const DEFAULT_CALENDAR_TYPES = ["CONVENCIONAL", "REGULAR", "PÓS-GREVE"];

const SaturdaySchoolFormDialog = ({
  open,
  onClose,
  saturdaySchoolToEdit,
  onSubmitSuccess,
  isEditMode,
}) => {
  const [saturdaySchool, setSaturdaySchool] = useState({
    date: "",
    dayOfWeek: "",
    calendarId: "",
  });
  const [initialSaturdaySchool, setInitialSaturdaySchool] = useState(null);
  const [calendars, setCalendars] = useState([]);
  const [calendarTypes, setCalendarTypes] = useState(DEFAULT_CALENDAR_TYPES);
  const [error, setError] = useState(null);
  const [loadingCalendars, setLoadingCalendars] = useState(true);

  const isFormFilled =
    saturdaySchool.date &&
    saturdaySchool.dayOfWeek &&
    saturdaySchool.calendarId;

  const hasFormChanged = () => {
    if (!isEditMode || !initialSaturdaySchool) return false;

    const currentCalendarId = String(saturdaySchool.calendarId);
    const initialCalendarId = String(initialSaturdaySchool.calendarId);

    return (
      saturdaySchool.date !== initialSaturdaySchool.date ||
      saturdaySchool.dayOfWeek !== initialSaturdaySchool.dayOfWeek ||
      currentCalendarId !== initialCalendarId
    );
  };

  useEffect(() => {
    const fetchCalendars = async () => {
      setLoadingCalendars(true);
      try {
        const calendarResponse = await api.get("/calendar");
        if (
          !calendarResponse.data ||
          !Array.isArray(calendarResponse.data.calendars)
        ) {
          throw new Error("Formato de dados de calendários inválido.");
        }
        setCalendars(calendarResponse.data.calendars);

        const newTypes = calendarResponse.data.calendars
          .map((cal) => cal.type)
          .filter((type) => type && !DEFAULT_CALENDAR_TYPES.includes(type));
        if (newTypes.length > 0) {
          setCalendarTypes([...DEFAULT_CALENDAR_TYPES, ...newTypes]);
        }
      } catch (err) {
        setError(
          "Erro ao carregar calendários. Verifique o console para detalhes."
        );
        setCalendars([]);
      } finally {
        setLoadingCalendars(false);
      }
    };
    fetchCalendars();
  }, []);

  const formatCalendarType = (type) => {
    if (!type) return "Desconhecido";
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  useEffect(() => {
    if (open) {
      if (isEditMode && saturdaySchoolToEdit) {
        let dateFromEdit = "";
        if (saturdaySchoolToEdit.date) {
          const parts = saturdaySchoolToEdit.date.split("/");
          if (parts.length === 3) {
            dateFromEdit = `${parts[2]}-${parts[1]}-${parts[0]}`; 
          }
        }

        let calendarIdFromEdit = "";
        if (saturdaySchoolToEdit.calendarId) {
          calendarIdFromEdit = saturdaySchoolToEdit.calendarId;
        } else if (
          saturdaySchoolToEdit.calendar &&
          typeof saturdaySchoolToEdit.calendar === "object" &&
          saturdaySchoolToEdit.calendar.id
        ) {
          calendarIdFromEdit = saturdaySchoolToEdit.calendar.id;
        } else if (
          saturdaySchoolToEdit.calendar &&
          typeof saturdaySchoolToEdit.calendar === "string"
        ) {
          if (calendars.length > 0) {
            const foundCalendar = calendars.find(
              (cal) =>
                `${cal.year}.${cal.period} - ${formatCalendarType(cal.type)}` ===
                saturdaySchoolToEdit.calendar
            );
            calendarIdFromEdit = foundCalendar ? foundCalendar.id : "";
          }
        }

        const initialData = {
          date: dateFromEdit,
          dayOfWeek: saturdaySchoolToEdit.dayOfWeek || "",
          calendarId: calendarIdFromEdit ? Number(calendarIdFromEdit) : "",
        };

        setSaturdaySchool(initialData);
        setInitialSaturdaySchool(initialData);
        setError(null);
      } else {
        setSaturdaySchool({
          date: "",
          dayOfWeek: "",
          calendarId: "",
        });
        setInitialSaturdaySchool(null);
        setError(null);
      }
    }
  }, [open, isEditMode, saturdaySchoolToEdit, calendars]);

  const handleInputChange = (name, value) => {
    setSaturdaySchool({ ...saturdaySchool, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (
      !saturdaySchool.date ||
      !saturdaySchool.dayOfWeek ||
      !saturdaySchool.calendarId
    ) {
      setError("Os campos data, dia da semana e calendário são obrigatórios.");
      return;
    }

    if (
      !["segunda", "terca", "quarta", "quinta", "sexta"].includes(
        saturdaySchool.dayOfWeek
      )
    ) {
      setError(
        'O dia da semana deve ser "segunda", "terça", "quarta", "quinta" ou "sexta".'
      );
      return;
    }

    const inputDate = parseISO(saturdaySchool.date);

    if (!isValid(inputDate)) {
      setError("A data fornecida é inválida. Use o formato AAAA-MM-DD.");
      return;
    }

    if (!isSaturday(inputDate)) {
      setError("A data informada deve ser um sábado.");
      return;
    }

    const selectedCalendar = calendars.find(
      (cal) => cal.id === Number(saturdaySchool.calendarId)
    );
    if (selectedCalendar) {
      const startDate = startOfDay(parseISO(selectedCalendar.startDate));
      const endDate = startOfDay(parseISO(selectedCalendar.endDate));
      const normalizedInputDate = startOfDay(inputDate);

      if (normalizedInputDate < startDate || normalizedInputDate > endDate) {
        setError(
          "A data do sábado letivo deve estar dentro do intervalo do calendário."
        );
        return;
      }
    } else {
      setError("Calendário selecionado não encontrado.");
      return;
    }

    try {
      const payload = {
        date: saturdaySchool.date,
        dayOfWeek: saturdaySchool.dayOfWeek,
        calendarId: saturdaySchool.calendarId,
      };

      let response;
      if (isEditMode) {
        response = await api.put(
          `/school-saturdays/${saturdaySchoolToEdit?.id}`,
          payload
        );
      } else {
        response = await api.post(`/school-saturdays`, payload);
      }

      const calendar = calendars.find(
        (cal) => cal.id === Number(saturdaySchool.calendarId)
      ) || {
        id: saturdaySchool.calendarId,
        year: "Desconhecido",
        period: "",
        type: "",
        name: "",
      };

      const updatedSaturdaySchool = {
        ...response.data.schoolSaturday,
        calendar: {
          id: calendar.id,
          name: `${calendar.year}.${calendar.period} - ${formatCalendarType(
            calendar.type
          )}`,
        },
      };

      onSubmitSuccess(updatedSaturdaySchool, isEditMode);
      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        `Erro ao ${isEditMode ? "atualizar" : "cadastrar"} sábado letivo: ${
          err.message
        }`;
      setError(
        errorMessage.includes("Já existe um sábado letivo com esta data")
          ? "Já existe um sábado letivo com esta data para o calendário informado."
          : errorMessage.includes("Calendário não encontrado")
          ? "O calendário selecionado não foi encontrado."
          : errorMessage.includes("A data informada deve ser um sábado")
          ? "A data informada deve ser um sábado."
          : errorMessage.includes("Formato de data inválido")
          ? "Formato de data inválido. Use AAAA-MM-DD."
          : errorMessage.includes("O dia da semana deve ser")
          ? 'O dia da semana deve ser "segunda", "terça", "quarta", "quinta" ou "sexta".'
          : errorMessage
      );
    }
  };

  const handleClose = () => {
    setSaturdaySchool({
      date: "",
      dayOfWeek: "",
      calendarId: "",
    });
    setInitialSaturdaySchool(null);
    setError(null);
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Dialog
        open={open}
        onClose={handleClose}
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
          {isEditMode ? "Editar Sábado Letivo" : "Cadastrar Sábado Letivo"}
          <IconButton
            onClick={handleClose}
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
              value={
                saturdaySchool.date && isValid(parseISO(saturdaySchool.date))
                  ? parseISO(saturdaySchool.date)
                  : null
              }
              onChange={(newValue) => {
                const formattedDate =
                  newValue && isValid(newValue)
                    ? format(newValue, "yyyy-MM-dd")
                    : "";
                handleInputChange("date", formattedDate);
              }}
              minDate={new Date()}
              shouldDisableDate={(date) => !isSaturday(date)}
              slotProps={{
                textField: {
                  id: "date-input",
                  name: "date",
                  required: true,
                  fullWidth: true,
                  InputLabelProps: {
                    sx: {
                      color: "#757575",
                      top: "50%",
                      transform: "translate(14px, -50%)",
                      fontSize: "1rem",
                      "&.Mui-focused, &.MuiInputLabel-shrink": {
                        color: "#000000",
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
                        borderColor: "#000000 !important",
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

            <FormControl
              fullWidth
              margin="normal"
              sx={{
                my: 1.5,
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#000000 !important",
                    borderWidth: "2px",
                  },
                "@media (max-width: 600px)": {
                  my: 1,
                },
              }}
            >
              <InputLabel
                id="dayOfWeek-label"
                sx={{
                  "&.Mui-focused, &.MuiInputLabel-shrink": { color: "#000000" },
                  "@media (max-width: 600px)": {
                    fontSize: "0.875rem",
                  },
                }}
              >
                Dia da Semana *
              </InputLabel>
              <StyledSelect
                name="dayOfWeek"
                value={saturdaySchool.dayOfWeek}
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
                label="Dia da Semana *"
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
                <MenuItem value="segunda">Segunda-feira</MenuItem>
                <MenuItem value="terca">Terça-feira</MenuItem>
                <MenuItem value="quarta">Quarta-feira</MenuItem>
                <MenuItem value="quinta">Quinta-feira</MenuItem>
                <MenuItem value="sexta">Sexta-feira</MenuItem>
              </StyledSelect>
            </FormControl>

            <FormControl
              fullWidth
              margin="normal"
              sx={{
                my: 1.5,
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#000000 !important",
                    borderWidth: "2px",
                  },
                "@media (max-width: 600px)": {
                  my: 1,
                },
              }}
            >
              <InputLabel
                id="calendarId-label"
                sx={{
                  "&.Mui-focused, &.MuiInputLabel-shrink": { color: "#000000" },
                  "@media (max-width: 600px)": {
                    fontSize: "0.875rem",
                  },
                }}
              >
                Calendário *
              </InputLabel>
              <StyledSelect
                name="calendarId"
                value={saturdaySchool.calendarId}
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
                label="Calendário *"
                required
                disabled={loadingCalendars}
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
                {loadingCalendars ? (
                  <MenuItem disabled>Carregando calendários...</MenuItem>
                ) : calendars.length === 0 ? (
                  <MenuItem disabled>Nenhum calendário encontrado</MenuItem>
                ) : (
                  calendars.map((calendar) => (
                    <MenuItem key={calendar.id} value={calendar.id}>
                      {`${calendar.year}.${calendar.period} - ${formatCalendarType(
                        calendar.type
                      )}`}
                    </MenuItem>
                  ))
                )}
              </StyledSelect>
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
                onClick={handleClose}
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
                    (isEditMode && !hasFormChanged()) || !isFormFilled
                      ? "#E0E0E0"
                      : INSTITUTIONAL_COLOR,
                  "&:hover": {
                    backgroundColor:
                      (isEditMode && !hasFormChanged()) || !isFormFilled
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

export default SaturdaySchoolFormDialog;