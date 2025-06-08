import React from "react";
import { Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ptBR } from "date-fns/locale";
import { useTheme } from "@mui/material/styles";

const DateRangePicker = ({ calendarData, handleInputChange }) => {
  const theme = useTheme();

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
          value={
            calendarData.startDate ? new Date(calendarData.startDate) : null
          }
          onChange={(newValue) =>
            handleInputChange(
              "startDate",
              newValue ? newValue.toISOString().split("T")[0] : ""
            )
          }
          slotProps={{
            textField: {
              id: "startDate-input",
              name: "startDate",
              required: true,
              fullWidth: true,
              InputLabelProps: {
                sx: {
                  color: "#000000",
                  "&.Mui-focused": {
                    color: "#000000",
                  },
                },
              },
              sx: {
                "& .MuiOutlinedInput-root": {
                  minHeight: { xs: "40px", sm: "56px" }, // Ajuste para mobile
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
                marginTop: "20px",
              },
              placement: "bottom-start",
            },
          }}
        />

        <DatePicker
          label="Data de Fim"
          value={calendarData.endDate ? new Date(calendarData.endDate) : null}
          onChange={(newValue) =>
            handleInputChange(
              "endDate",
              newValue ? newValue.toISOString().split("T")[0] : ""
            )
          }
          slotProps={{
            textField: {
              id: "endDate-input",
              name: "endDate",
              required: true,
              fullWidth: true,
              InputLabelProps: {
                sx: {
                  color: "#000000",
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
