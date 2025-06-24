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

const DateRangePicker = ({ calendarData, handleInputChange, isEditMode, selectedYear }) => { // NOVO: selectedYear

  const today = new Date();
  const todayLocalMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  todayLocalMidnight.setHours(0, 0, 0, 0);

  const isCalendarStarted =
    isEditMode &&
    calendarData.startDate &&
    createLocalDate(calendarData.startDate) <= todayLocalMidnight;

  // NOVO: Definir minDate e maxDate com base no selectedYear
  const yearStartDate = selectedYear ? new Date(selectedYear, 0, 1) : null; // 1º de janeiro do ano selecionado
  const yearEndDate = selectedYear ? new Date(selectedYear, 11, 31) : null; // 31 de dezembro do ano selecionado


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
          disabled={isCalendarStarted}
          // minDate para Data de Início:
          // Se o calendário JÁ COMEÇOU, permite que a data original (passada) seja exibida, mas não para seleção.
          // O minDate real para seleção deve ser o hoje OU o início do ano selecionado, o que for MAIOR.
          minDate={
            isCalendarStarted 
              ? null // No modo de edição de calendário iniciado, não queremos minDate para exibição
              : (yearStartDate && todayLocalMidnight && yearStartDate > todayLocalMidnight)
                ? yearStartDate
                : todayLocalMidnight // Se yearStartDate é antes de today, use today
          }
          // NOVO: maxDate para Data de Início (fim do ano selecionado)
          maxDate={yearEndDate}
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
          // minDate para Data de Fim:
          // Deve ser o dia seguinte à data de início (para garantir 1 dia de duração),
          // OU o início do ano selecionado (se calendarData.startDate estiver vazio),
          // OU o dia atual (se calendarData.startDate estiver vazio e o ano selecionado for o ano atual).
          minDate={
            calendarData.startDate
              ? new Date(createLocalDate(calendarData.startDate).getTime() + (24 * 60 * 60 * 1000)) // Dia seguinte à startDate
              : (yearStartDate && todayLocalMidnight && yearStartDate > todayLocalMidnight)
                ? yearStartDate
                : todayLocalMidnight
          }
          // NOVO: maxDate para Data de Fim (fim do ano selecionado)
          maxDate={yearEndDate}
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