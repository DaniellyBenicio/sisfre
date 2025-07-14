import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Button,
  Stack,
  TextField,
  MenuItem, // Import MenuItem
} from "@mui/material";
import { QrCodeScanner } from "@mui/icons-material";
import api from "../../../../service/api"; // Assuming this is your API service
import { CustomAlert } from "../../../../components/alert/CustomAlert";
import FrequenciesTable from "./FrequenciesTable";
import { StyledSelect } from "../../../../components/inputs/Input"; // Assuming StyledSelect is a custom component

const FrequencyList = () => {
  const [frequencies, setFrequencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const handleAlertClose = () => {
    setAlert(null);
  };

  const fetchFrequencies = async () => {
    try {
      setLoading(true);
      // Simulate API call with static data
      const simulatedData = [
        { id: 'f1', date: '2025-07-12', class: 'SI - S2', time: '08:00', status: 'Presença' },
        { id: 'f2', date: '2025-07-11', class: 'ENG - S4', time: '14:00', status: 'Falta' },
        { id: 'f3', date: '2025-07-10', class: 'SI - S2', time: '08:00', status: 'Presença' },
        { id: 'f4', date: '2025-07-09', class: 'ENG - S4', time: '14:00', status: 'Falta' },
        { id: 'f5', date: '2025-07-08', class: 'SI - S2', time: '08:00', status: 'Presença' },
        { id: 'f6', date: '2025-07-07', class: 'ENG - S4', time: '14:00', status: 'Presença' },
        { id: 'f7', date: '2025-07-06', class: 'SI - S2', time: '08:00', status: 'Falta' },
        { id: 'f8', date: '2025-07-05', class: 'ENG - S4', time: '14:00', status: 'Presença' },
        { id: 'f9', date: '2025-07-04', class: 'SI - S2', time: '08:00', status: 'Presença' },
        { id: 'f10', date: '2025-07-03', class: 'ENG - S4', time: '14:00', status: 'Falta' },
        { id: 'f11', date: '2025-07-02', class: 'SI - S2', time: '08:00', status: 'Presença' },
        { id: 'f12', date: '2025-07-01', class: 'ENG - S4', time: '14:00', status: 'Presença' },
      ];

      const formattedDataForDisplay = simulatedData.map(freq => ({
        ...freq,
        displayDate: freq.date ? new Date(freq.date + 'T00:00:00').toLocaleDateString('pt-BR') : '',
      }));

      setFrequencies(formattedDataForDisplay);
    } catch (error) {
      console.error("Erro ao buscar frequências:", error);
      setAlert({
        message: "Erro ao carregar as frequências.",
        type: "error",
      });
      setFrequencies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFrequencies();
  }, []);

  const applyFilters = (data) => {
    let filtered = Array.isArray(data) ? [...data] : [];

    // Filter by Status
    if (filterStatus === "absences") {
      filtered = filtered.filter((freq) => freq.status === "Falta");
    } else if (filterStatus === "presences") {
      filtered = filtered.filter((freq) => freq.status === "Presença");
    }

    // Filter by Period
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filtered = filtered.filter(freq => {
      if (!freq.date) return false;
      const freqDate = new Date(freq.date + 'T00:00:00');

      switch (filterPeriod) {
        case "yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          return freqDate.toDateString() === yesterday.toDateString();
        case "lastWeek":
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);
          return freqDate >= lastWeek && freqDate <= today;
        case "lastMonth":
          const lastMonth = new Date(today);
          lastMonth.setMonth(today.getMonth() - 1);
          return freqDate >= lastMonth && freqDate <= today;
        case "custom":
          if (customStartDate && customEndDate) {
            const start = new Date(customStartDate + 'T00:00:00');
            const end = new Date(customEndDate + 'T23:59:59'); // Include the entire end day
            return freqDate >= start && freqDate <= end;
          }
          return true; // If custom selected but dates not set, show all
        default: // 'all'
          return true;
      }
    });

    return filtered;
  };

  // Re-run filters whenever frequencies or filter states change
  const filteredFrequencies = applyFilters(frequencies);

  const handleUploadFrequency = (frequencyItem) => {
    console.log("Iniciando processo de upload para:", frequencyItem);
    setAlert({
      message: `Simulando upload para frequência em ${frequencyItem.displayDate} da turma ${frequencyItem.class}.`,
      type: "info",
    });
  };

  const handleScanQRCode = () => {
    console.log("Botão 'Ler QR Code' clicado.");
    setAlert({
      message: "Funcionalidade de leitura de QR Code em desenvolvimento.",
      type: "info",
    });
  };

  const commonFormControlSx = {
    width: { xs: "100%", sm: "200px" },
    "& .MuiInputBase-root": {
      height: { xs: 40, sm: 36 },
      display: "flex",
      alignItems: "center",
    },
    "& .MuiInputLabel-root": {
      transform: "translate(14px, 7px) scale(1)",
      "&.Mui-focused, &.MuiInputLabel-shrink": {
        transform: "translate(14px, -6px) scale(0.75)",
        color: "#000000",
      },
    },
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      height: "100% !important",
    },
  };

  const commonSelectSx = {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0, 0, 0, 0.23)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
    },
  };

  const commonMenuProps = {
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
  };

  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", mt: 2, mb: 2 }}
      >
        Frequências
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ mb: 2 }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <FormControl sx={commonFormControlSx}>
            <InputLabel id="filter-status-label">Status</InputLabel>
            <StyledSelect
              labelId="filter-status-label"
              id="filter-status"
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={commonSelectSx}
              MenuProps={commonMenuProps}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="presences">Presenças</MenuItem>
              <MenuItem value="absences">Faltas</MenuItem>
            </StyledSelect>
          </FormControl>

          <FormControl sx={commonFormControlSx}>
            <InputLabel id="filter-period-label">Período</InputLabel>
            <StyledSelect
              labelId="filter-period-label"
              id="filter-period"
              value={filterPeriod}
              label="Período"
              onChange={(e) => setFilterPeriod(e.target.value)}
              sx={commonSelectSx}
              MenuProps={commonMenuProps}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="yesterday">Dia Anterior</MenuItem>
              <MenuItem value="lastWeek">Última Semana</MenuItem>
              <MenuItem value="lastMonth">Último Mês</MenuItem>
              <MenuItem value="custom">Intervalo Personalizado</MenuItem>
            </StyledSelect>
          </FormControl>

          {filterPeriod === "custom" && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ flexShrink: 0 }}
            >
              <TextField
                label="Data Inicial"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                sx={{
                  minWidth: 150,
                  "& .MuiInputBase-root": { height: { xs: 40, sm: 36 } },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.23)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#000000",
                  },
                }}
              />
              <TextField
                label="Data Final"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                sx={{
                  minWidth: 150,
                  "& .MuiInputBase-root": { height: { xs: 40, sm: 36 } },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.23)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#000000",
                  },
                }}
              />
            </Stack>
          )}
        </Stack>

        <Button
          variant="contained"
          startIcon={<QrCodeScanner />}
          onClick={handleScanQRCode}
          sx={{
            backgroundColor: "#087619",
            "&:hover": { backgroundColor: "#065412" },
            textTransform: "none",
            flexShrink: 0,
            width: { xs: "100%", sm: "200px" },
            height: { xs: 40, sm: 36 },
            fontWeight: "bold",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            whiteSpace: 'nowrap',
          }}
        >
          Ler QR Code
        </Button>
      </Stack>

      <FrequenciesTable
        frequencies={filteredFrequencies}
        onUpload={handleUploadFrequency}
        search="" // Assuming 'search' prop is not used for this filtering logic
        isFiltered={filterStatus !== "all" || filterPeriod !== "all" || (filterPeriod === "custom" && (customStartDate || customEndDate))}
        setAlert={setAlert}
      />

      {loading && <Typography align="center">Carregando frequências...</Typography>}
      {!loading && filteredFrequencies.length === 0 && (
        <Typography align="center">Nenhum item encontrado</Typography>
      )}

      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={handleAlertClose}
        />
      )}
    </Box>
  );
};

export default FrequencyList;