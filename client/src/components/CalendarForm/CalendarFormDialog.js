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
import { ptBR } from "date-fns/locale";
import api from "../../service/api";
import { StyledTextField, StyledSelect } from "../../components/inputs/Input";
import DateRangePicker, { createLocalDate } from "./DateRangePicker";

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

let calendarTypes = ["CONVENCIONAL", "REGULAR", "PÓS-GREVE", "OUTRO"];

const formatDateForInput = (date) => {
  if (!date) return "";
  try {
    let d;
    if (typeof date === "string") {
      const parts = date.split("/");
      if (parts.length === 3) {
        // Assume DD/MM/YYYY
        d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
      } else {
        // Assume YYYY-MM-DD
        d = new Date(`${date}T00:00:00`);
      }
    } else if (date instanceof Date) {
      d = date;
    } else {
      return "";
    }

    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return "";
  } catch (error) {
    console.error("Erro ao formatar data para input:", error);
    return "";
  }
};

const CalendarFormDialog = ({
  open,
  onClose,
  calendarToEdit,
  onSubmitSuccess,
  isEditMode,
}) => {
  const [calendarData, setCalendarData] = useState({
    type: "",
    year: "",
    period: "",
    startDate: "",
    endDate: "",
  });
  const [initialCalendarData, setInitialCalendarData] = useState(null);
  const [customType, setCustomType] = useState("");
  const [error, setError] = useState(null);
  const [localCalendarTypes, setLocalCalendarTypes] = useState(calendarTypes);
  const [isYearDisabled, setIsYearDisabled] = useState(false);

  // Definições de isFormFilled e hasChanges
  const isFormFilled =
    calendarData.type &&
    calendarData.year &&
    calendarData.period &&
    calendarData.startDate &&
    calendarData.endDate &&
    (calendarData.type !== "OUTRO" ||
      (calendarData.type === "OUTRO" && customType));

  const hasChanges =
    isEditMode &&
    initialCalendarData &&
    (calendarData.type !== initialCalendarData.type ||
      calendarData.year !== initialCalendarData.year ||
      calendarData.period !== initialCalendarData.period ||
      calendarData.startDate !== initialCalendarData.startDate ||
      calendarData.endDate !== initialCalendarData.endDate ||
      (calendarData.type === "OUTRO" ? customType : calendarData.type) !==
        (initialCalendarData.type === "OUTRO"
          ? initialCalendarData.customType
          : initialCalendarData.type));

  useEffect(() => {
    if (open) {
      if (isEditMode && calendarToEdit) { // Condição explícita para modo de edição
        const typeToSet =
          localCalendarTypes.includes(calendarToEdit.type) ||
          calendarToEdit.type === "OUTRO"
            ? calendarToEdit.type
            : calendarToEdit.type;

        if (
          !localCalendarTypes.includes(calendarToEdit.type) &&
          calendarToEdit.type !== "OUTRO"
        ) {
          setLocalCalendarTypes((prevTypes) => {
            const newTypes = [...prevTypes.filter((t) => t !== "OUTRO"), calendarToEdit.type, "OUTRO"];
            calendarTypes = newTypes; // Atualiza a variável global (se necessário)
            return newTypes;
          });
        }

        const calendarDataToSet = {
          type: typeToSet,
          year: calendarToEdit.year || "",
          period: calendarToEdit.period || "",
          startDate: formatDateForInput(calendarToEdit.startDate),
          endDate: formatDateForInput(calendarToEdit.endDate),
          customType: typeToSet === "OUTRO" ? calendarToEdit.type : "",
        };
        setCalendarData({
          type: calendarDataToSet.type,
          year: calendarDataToSet.year,
          period: calendarDataToSet.period,
          startDate: calendarDataToSet.startDate,
          endDate: calendarDataToSet.endDate,
        });
        setInitialCalendarData(calendarDataToSet);
        setCustomType(typeToSet === "OUTRO" ? calendarToEdit.type : "");
        setError(null);

        // Lógica para desativar o ano no modo de edição se o calendário já começou
        const todayLocalMidnight = new Date();
        todayLocalMidnight.setHours(0, 0, 0, 0);
        const calendarStartDate = createLocalDate(calendarToEdit.startDate);
        setIsYearDisabled(calendarStartDate <= todayLocalMidnight); // Definir o estado

      } else { // Modo de cadastro
        setCalendarData({
          type: "",
          year: "",
          period: "",
          startDate: "",
          endDate: "",
        });
        setInitialCalendarData(null);
        setCustomType("");
        setError(null);
        // Garantir que os tipos de calendário estejam corretos no modo de cadastro
        // e que o campo de ano não esteja desativado.
        setLocalCalendarTypes(calendarTypes); // Usar a lista original de tipos
        setIsYearDisabled(false); // Resetar para o modo de cadastro (ano sempre habilitado)
      }
    }
  }, [calendarToEdit, open, isEditMode, localCalendarTypes]);

  const handleInputChange = (name, value) => {
    if (name === "year" || name === "period") {
      setCalendarData((prevData) => ({
        ...prevData,
        [name]: value,
        startDate: "",
        endDate: "",
      }));
    } else {
      setCalendarData({ ...calendarData, [name]: value });
    }
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setCalendarData({ ...calendarData, type: value });
    if (value !== "OUTRO") {
      setCustomType("");
    }
  };

  const handleCustomTypeChange = (e) => {
    setCustomType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let finalType = calendarData.type;
    if (calendarData.type === "OUTRO") {
      if (!customType || customType.trim().length < 3) {
        setError("O tipo personalizado deve ter pelo menos 3 caracteres.");
        return;
      }
      finalType = customType.trim().toUpperCase();
    } else {
      finalType = calendarData.type.toUpperCase();
    }

    if (
      !finalType ||
      !calendarData.year ||
      !calendarData.period ||
      !calendarData.startDate ||
      !calendarData.endDate
    ) {
      setError("Todos os campos são obrigatórios.");
      return;
    }

    if (!calendarData.year.match(/^\d{4}$/)) {
      setError("O ano deve estar no formato AAAA (ex.: 2025).");
      return;
    }

    if (!["1", "2"].includes(calendarData.period)) {
      setError("O período deve ser 1 ou 2.");
      return;
    }

    // --- Validação de Datas no Frontend ---
    const currentStartDate = createLocalDate(calendarData.startDate);
    const currentEndDate = createLocalDate(calendarData.endDate);
    const todayLocalMidnight = new Date();
    todayLocalMidnight.setHours(0, 0, 0, 0);

    // 1. Validação geral: Data de Fim deve ser posterior à Data de Início (duração mínima de 1 dia)
    if (currentStartDate >= currentEndDate) {
      setError("A data de fim deve ser posterior à data de início.");
      return;
    }

    // 2. Validação específica por modo (Cadastro vs. Edição) e por alteração da data de início
    if (isEditMode) {
      const initialStartDate = createLocalDate(initialCalendarData?.startDate);

      if (calendarData.startDate === initialCalendarData.startDate) {
          // Se a data de início não mudou, não aplicamos validações de "data retroativa".
          // Apenas seguimos em frente, permitindo a edição de outros campos.
      } else {
          // A data de início FOI ALTERADA. Agora precisamos validar a nova data.
          // Cenário 1: Calendário já começou (initialStartDate <= today) e está tentando retroceder a data de início
          if (initialStartDate <= todayLocalMidnight && currentStartDate < initialStartDate) {
              setError("Não é permitido retroceder a data de início de um calendário em andamento.");
              return;
          }
          // Cenário 2: Calendário futuro (initialStartDate > today) e está tentando definir uma data passada
          // OU tentando definir uma data anterior à initialStartDate (que ainda é futura)
          if (initialStartDate > todayLocalMidnight && currentStartDate < initialStartDate) {
              setError("A data de início de um calendário futuro não pode ser anterior à data original, nem passada.");
              return;
          }
      }
    } else { // Modo de Cadastro
        // Para um NOVO calendário, a data de início SEMPRE deve ser hoje ou no futuro.
        if (currentStartDate < todayLocalMidnight) {
            setError("A data de início para um novo calendário não pode ser anterior à data atual.");
            return;
        }
    }
    // --- Fim da Validação de Datas no Frontend ---

    // Validação para garantir que as datas estejam dentro do ano selecionado
    const selectedYear = parseInt(calendarData.year);
    const startYear = currentStartDate.getFullYear();
    const endYear = currentEndDate.getFullYear();

    if (startYear !== selectedYear || endYear !== selectedYear) {
      setError(`As datas de início e fim devem estar dentro do ano ${selectedYear}.`);
      return;
    }

    try {
      const payload = {
        type: finalType,
        year: calendarData.year,
        period: calendarData.period,
        startDate: calendarData.startDate,
        endDate: calendarData.endDate,
      };

      console.log("CalendarFormDialog - Payload enviado:", payload);

      let response;
      if (isEditMode) {
        response = await api.put(`/calendar/${calendarToEdit?.id}`, payload);
      } else {
        response = await api.post(`/calendar`, payload);
        if (
          calendarData.type === "OUTRO" &&
          !localCalendarTypes.includes(finalType)
        ) {
          const newTypes = [
            ...calendarTypes.filter((t) => t !== "OUTRO"),
            finalType,
            "OUTRO",
          ];
          setLocalCalendarTypes(newTypes);
          calendarTypes = newTypes; // Atualiza a variável global (se necessário)
          try {
            await api.post("/calendar-types", { type: finalType });
          } catch (typeError) {
            console.error("Erro ao cadastrar novo tipo:", typeError);
          }
        }
      }

      console.log("CalendarFormDialog - Resposta da API:", response.data);

      onSubmitSuccess(response.data.calendar, isEditMode);
      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        `Erro ao ${isEditMode ? "atualizar" : "cadastrar"} calendário: ${
          err.message
        }`;
      setError(errorMessage);
      console.error("CalendarFormDialog - Erro:", err);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => (2025 + i).toString());

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
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            marginTop: "15px",
            color: "#087619",
            fontWeight: "bold",
          }}
        >
          {isEditMode ? "Editar Calendário" : "Cadastrar Calendário"}
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 5 }}>
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Box sx={{ color: "red", marginBottom: 2, fontSize: "0.875rem" }}>
                {error}
              </Box>
            )}

            <FormControl
              fullWidth
              margin="normal"
              sx={{
                my: 1.5,
                "& .MuiOutlinedInput-root": {
                  height: "56px",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderWidth: "1px",
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#000000 !important",
                    borderWidth: "2px",
                  },
              }}
            >
              <InputLabel
                id="type-label"
                sx={{
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
                }}
              >
                Tipo
              </InputLabel>
              {calendarData.type === "OUTRO" ? (
                <StyledTextField
                  id="type-input"
                  name="type-full"
                  value={customType}
                  onChange={handleCustomTypeChange}
                  required
                  placeholder="Digite o tipo"
                  InputLabelProps={{
                    shrink: !!customType,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "56px",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderWidth: "1px",
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: "#000000 !important",
                        borderWidth: "2px",
                      },
                  }}
                />
              ) : (
                <StyledSelect
                  id="type-select"
                  name="type"
                  value={calendarData.type}
                  onChange={handleTypeChange}
                  required
                  label="Tipo"
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: "200px",
                        overflowY: "auto",
                        width: "auto",
                        "& .MuiMenuItem-root": {
                          "&:hover": {
                            backgroundColor: "#D5FFDB",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "#E8F5E9",
                            "&:hover": {
                              backgroundColor: "#D5FFDB",
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  {localCalendarTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </StyledSelect>
              )}
            </FormControl>

            <Box
              sx={{ display: "flex", gap: 2, my: 1.5, alignItems: "center" }}
            >
              <FormControl
                fullWidth
                margin="normal"
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    height: "56px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderWidth: "1px",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: "#000000 !important",
                      borderWidth: "2px",
                    },
                }}
              >
                <InputLabel
                  id="year-label"
                  sx={{
                    color: "#757575",
                    "&::after": { content: '" *"', color: "#757575" },
                    top: "50%",
                    transform: "translate(14px, -50%)",
                    fontSize: "1rem",
                    "&.Mui-focused, &.MuiInputLabel-shrink": {
                      color: "#000000",
                      "&::after": { content: '" *"', color: "#000000" },
                    },
                    "&.MuiInputLabel-shrink": {
                      top: 0,
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                    ...(isYearDisabled && {
                      color: "rgba(0, 0, 0, 0.38) !important",
                      "&::after": { content: '" *"', color: "rgba(0, 0, 0, 0.38) !important" },
                    }),
                  }}
                >
                  Ano
                </InputLabel>
                <StyledSelect
                  id="year-select"
                  name="year"
                  value={calendarData.year}
                  onChange={(e) =>
                    handleInputChange(e.target.name, e.target.value)
                  }
                  label="Ano"
                  required
                  disabled={isYearDisabled}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: "200px",
                        overflowY: "auto",
                        width: "auto",
                        "& .MuiMenuItem-root": {
                          "&:hover": {
                            backgroundColor: "#D5FFDB",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "#E8F5E9",
                            "&:hover": {
                              backgroundColor: "#D5FFDB",
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>

              <FormControl
                fullWidth
                margin="normal"
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    height: "56px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderWidth: "1px",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: "#000000 !important",
                      borderWidth: "2px",
                    },
                }}
              >
                <InputLabel
                  id="period-label"
                  sx={{
                    color: "#757575",
                    "&::after": { content: '" *"', color: "#757575" },
                    top: "50%",
                    transform: "translate(14px, -50%)",
                    fontSize: "1rem",
                    "&.Mui-focused, &.MuiInputLabel-shrink": {
                      color: "#000000",
                      "&::after": { content: '" *"', color: "#000000" },
                    },
                    "&.MuiInputLabel-shrink": {
                      top: 0,
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                  }}
                >
                  Período
                </InputLabel>
                <StyledSelect
                  id="period-select"
                  name="period"
                  value={calendarData.period}
                  onChange={(e) =>
                    handleInputChange(e.target.name, e.target.value)
                  }
                  label="Período"
                  required
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: "200px",
                        overflowY: "auto",
                        width: "auto",
                        "& .MuiMenuItem-root": {
                          "&:hover": {
                            backgroundColor: "#D5FFDB",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "#E8F5E9",
                            "&:hover": {
                              backgroundColor: "#D5FFDB",
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  {["1", "2"].map((period) => (
                    <MenuItem key={period} value={period}>
                      {period}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>
            </Box>

            <DateRangePicker
              calendarData={calendarData}
              handleInputChange={handleInputChange}
              isEditMode={isEditMode}
              selectedYear={parseInt(calendarData.year)}
            />

            <DialogActions
              sx={{
                justifyContent: "center",
                gap: 2,
                padding: "10px 24px",
                marginTop: "10px",
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
                disabled={
                  isEditMode ? !isFormFilled || !hasChanges : !isFormFilled
                }
                sx={{
                  backgroundColor: !isFormFilled ? "#E0E0E0" : INSTITUTIONAL_COLOR,
                  "&:hover": {
                    backgroundColor: !isFormFilled ? "#E0E0E0" : "#26692b",
                  },
                }}
              >
                <Save sx={{ fontSize: 24 }} />
                {isEditMode ? "Atualizar" : "Cadastrar"}
              </StyledButton>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CalendarFormDialog;