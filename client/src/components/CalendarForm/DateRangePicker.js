import React from "react";
import { Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ptBR } from "date-fns/locale";

// Função utilitária para criar uma data local a partir de uma string YYYY-MM-DD
// Evita problemas de fuso horário e garante que seja o início do dia local
export const createLocalDate = (dateString) => {
  if (!dateString) return null;
  try {
    const parts = dateString.split('-');
    // Date(year, monthIndex, day) cria a data no fuso horário local
    const dateObject = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    // Zera as horas para garantir comparação correta do dia
    dateObject.setHours(0, 0, 0, 0);
    return dateObject;
  } catch (error) {
    console.error("Erro ao criar data local:", error);
    return null;
  }
};

const DateRangePicker = ({ calendarData, handleInputChange, isEditMode }) => { // Adicionado isEditMode como prop

  // Data atual no fuso horário do Brasil, ajustada para meia-noite
  const today = new Date();
  const todayLocalMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  todayLocalMidnight.setHours(0, 0, 0, 0);

  // Verifica se o calendário já iniciou.
  // No modo de edição, se a data de início salva for anterior ou igual ao dia atual, ele é considerado iniciado.
  const isCalendarStarted =
    isEditMode && // Apenas faz sentido verificar isso no modo de edição
    calendarData.startDate &&
    createLocalDate(calendarData.startDate) <= todayLocalMidnight;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          my: 1.5,
          alignItems: "stretch",
        }}
      >
        <DatePicker
          label="Data de Início"
          value={createLocalDate(calendarData.startDate)}
          onChange={(newValue) => {
            let formattedDate = "";
            if (newValue) {
              const year = newValue.getFullYear();
              const month = String(newValue.getMonth() + 1).padStart(2, "0");
              const day = String(newValue.getDate()).padStart(2, "0");
              formattedDate = `${year}-${month}-${day}`;
            }
            handleInputChange("startDate", formattedDate);
          }}
          // Desativa o DatePicker se o calendário já iniciou (no modo de edição)
          disabled={isCalendarStarted} 
          // minDate:
          // Se o calendário JÁ COMEÇOU (isCalendarStarted é true), não há minDate, permitindo qualquer data para exibir a salva.
          // Se o calendário AINDA NÃO COMEÇOU (isCalendarStarted é false), a minDate é o dia atual.
          minDate={isCalendarStarted ? null : todayLocalMidnight} // Usar null para nenhum limite inferior
          slotProps={{
            textField: {
              id: "startDate-input",
              name: "startDate",
              required: true,
              fullWidth: true,
              InputLabelProps: {
                sx: {
                  "&.Mui-focused": {
                    color: "#000000",
                  },
                },
              },
              sx: {
                "& .MuiOutlinedInput-root": {
                  minHeight: { xs: "40px", sm: "56px" },
                  "& fieldset": {
                    borderColor: "#000000",
                  },
                  "&:hover fieldset": {
                    borderColor: "#000000",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#000000",
                    borderWidth: "2px",
                  },
                  "&.Mui-disabled fieldset": {
                    borderColor: "#757575",
                  },
                },
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

        <DatePicker
          label="Data de Fim"
          value={createLocalDate(calendarData.endDate)}
          onChange={(newValue) => {
            let formattedDate = "";
            if (newValue) {
              const year = newValue.getFullYear();
              const month = String(newValue.getMonth() + 1).padStart(2, "0");
              const day = String(newValue.getDate()).padStart(2, "0");
              formattedDate = `${year}-${month}-${day}`;
            }
            handleInputChange("endDate", formattedDate);
          }}
          // minDate para Data de Fim: deve ser a Data de Início ou o dia atual (se Data de Início estiver vazia)
          minDate={createLocalDate(calendarData.startDate) || todayLocalMidnight}
          slotProps={{
            textField: {
              id: "endDate-input",
              name: "endDate",
              required: true,
              fullWidth: true,
              InputLabelProps: {
                sx: {
                  "&.Mui-focused": {
                    color: "#000000",
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
              placement: "bottom-start",
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;