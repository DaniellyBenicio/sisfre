import React from "react";
import { Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ptBR } from "date-fns/locale";

const DateRangePicker = ({ calendarData, handleInputChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          my: 1.5,
          alignItems: "center",
          position: "relative",
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
                flex: 1,
                "& .MuiInputBase-input": {
                  paddingTop: "24px",
                  paddingBottom: "8px",
                },
                "& .MuiOutlinedInput-root": {
                  height: "56px",
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
                },
              },
            },
            popper: {
              sx: {
                zIndex: 1500, 
                "& .MuiPickerStaticWrapper-root": {
                  maxWidth: "280px",
                  maxHeight: "300px",
                },
              },
              placement: "bottom-start",
              modifiers: [
                {
                  name: "flip",
                  enabled: true, 
                  options: {
                    fallbackPlacements: ["top-start", "bottom-end", "top-end"], 
                  },
                },
                {
                  name: "preventOverflow",
                  enabled: true,
                  options: {
                    boundary: "clippingAncestors", 
                    padding: 8,
                  },
                },
                {
                  name: "offset",
                  enabled: true,
                  options: {
                    offset: [0, 8], 
                  },
                },
              ],
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
                flex: 1,
                "& .MuiInputBase-input": {
                  paddingTop: "24px",
                  paddingBottom: "8px",
                },
                "& .MuiOutlinedInput-root": {
                  height: "56px",
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
                },
              },
            },
            popper: {
              sx: {
                zIndex: 1500, 
                "& .MuiPickerStaticWrapper-root": {
                  maxWidth: "280px",
                  maxHeight: "300px",
                },
              },
              placement: "bottom-start", 
              modifiers: [
                {
                  name: "flip",
                  enabled: true,
                  options: {
                    fallbackPlacements: ["top-start", "bottom-end", "top-end"], 
                  },
                },
                {
                  name: "preventOverflow",
                  enabled: true,
                  options: {
                    boundary: "clippingAncestors",
                    padding: 8, 
                  },
                },
                {
                  name: "offset",
                  enabled: true,
                  options: {
                    offset: [0, 8], 
                  },
                },
              ],
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;
