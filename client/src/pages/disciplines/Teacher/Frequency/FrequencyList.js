import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Button,
  Stack,
  MenuItem,
  Pagination,
  IconButton,
  TextField,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { CustomAlert } from "../../../../components/alert/CustomAlert";
import { StyledSelect } from "../../../../components/inputs/Input";
import FrequenciesTable from "./FrequenciesTable";
import api from "../../../../service/api";

const INSTITUTIONAL_COLOR = "#307c34";

const StyledButton = styled(Button)(() => ({
  textTransform: "none",
  fontWeight: "bold",
  backgroundColor: INSTITUTIONAL_COLOR,
  "&:hover": { backgroundColor: "#26692b" },
}));

const FrequencyList = () => {
  const [frequencies, setFrequencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [turno, setTurno] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const navigate = useNavigate();

  const handleAlertClose = () => {
    setAlert(null);
  };

  const fetchFrequencies = async () => {
    try {
      setLoading(true);
      const response = await api.get("/register-by-turn", {
        params: {
          turno: filterStatus !== "all" ? turno : undefined,
          attended: filterStatus === "Presença" ? true : filterStatus === "Falta" ? false : undefined,
          date: filterPeriod === "custom" && customStartDate && customEndDate ? customStartDate : undefined,
        },
      });
      const formattedData = Array.isArray(response.data.attendances)
        ? response.data.attendances.map((freq) => ({
            id: freq.attendance.id,
            date: freq.attendance.date,
            displayDate: freq.attendance.date
              ? new Date(freq.attendance.date + "T00:00:00").toLocaleDateString("pt-BR")
              : "N/A",
            class: freq.class || "N/A",
            discipline: freq.discipline || "N/A",
            time: freq.hour || "N/A",
            status: freq.attendance.attended ? "Presença" : "Falta",
            courseId: freq.course_acronym || "N/A",
            disciplineId: freq.discipline_acronym || "N/A",
          }))
          .sort((a, b) => a.class.toLowerCase().localeCompare(b.class.toLowerCase()))
        : [];
      setFrequencies(formattedData);
    } catch (error) {
      console.error("Erro ao buscar frequências:", error);
      setAlert({ message: error.response?.data?.error || "Erro ao carregar frequências.", type: "error" });
      setFrequencies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFrequencies();
  }, [filterStatus, filterPeriod, customStartDate, customEndDate, turno]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterPeriod, customStartDate, customEndDate, turno]);

  const applyFilters = (data) => {
    let filtered = Array.isArray(data) ? [...data] : [];

    if (filterStatus !== "all") {
      filtered = filtered.filter((freq) => freq.status === filterStatus);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filtered = filtered.filter((freq) => {
      if (!freq.date) return false;
      const freqDate = new Date(freq.date + "T00:00:00");
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
            const start = new Date(customStartDate + "T00:00:00");
            const end = new Date(customEndDate + "T23:59:59");
            return freqDate >= start && freqDate <= end;
          }
          return true;
        default:
          return true;
      }
    });

    return filtered;
  };

  const handleRegisterFrequency = async () => {
    if (!turno) {
      setAlert({ message: "Por favor, selecione um turno.", type: "error" });
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const { latitude, longitude } = position.coords;

      setLoading(true);
      const response = await api.post("/register-by-turn", {
        turno,
        latitude,
        longitude,
      });
      setAlert({ message: response.data.message || "Frequência registrada com sucesso!", type: "success" });
      fetchFrequencies();
    } catch (error) {
      console.error("Erro ao registrar frequência:", error);
      setAlert({
        message: error.response?.data?.error || "Erro ao registrar frequência.",
        type: "error",
      });
    } finally {
      setLoading(false);
      setTurno(""); // Limpar o turno após o registro
    }
  };

  const handleRegisterAbsenceWithCredit = async (frequencyItem) => {
    try {
      const now = new Date();
      const response = await api.post("/frequency/absence-credit", {
        courseId: frequencyItem.courseId,
        disciplineId: frequencyItem.disciplineId,
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().split(" ")[0],
        useCredit: true,
      });
      setAlert({ message: response.data.message, type: "success" });
      fetchFrequencies();
    } catch (error) {
      console.error("Erro ao registrar falta com crédito:", error);
      setAlert({
        message: error.response?.data?.error || "Erro ao registrar falta.",
        type: "error",
      });
    }
  };

  const filteredFrequencies = applyFilters(frequencies);
  const totalPages = Math.ceil(filteredFrequencies.length / rowsPerPage);
  const paginatedFrequencies = filteredFrequencies.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const commonFormControlSx = {
    width: { xs: "100%", sm: "150px" },
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

  const commonDateInputSx = {
    width: { xs: "100%", sm: "150px" },
    "& .MuiInputBase-root": { height: { xs: 40, sm: 36 } },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0, 0, 0, 0.23)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          mb: 3,
        }}
      >
        <IconButton
          onClick={() => navigate("/dashboard")}
          sx={{
            position: "absolute",
            left: 0,
            color: INSTITUTIONAL_COLOR,
            "&:hover": { backgroundColor: "transparent" },
          }}
        >
          <ArrowBack sx={{ fontSize: 35 }} />
        </IconButton>
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", flexGrow: 1 }}
        >
          Frequências
        </Typography>
      </Box>

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
              <MenuItem value="Presença">Presenças</MenuItem>
              <MenuItem value="Falta">Faltas</MenuItem>
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
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                label="Data Inicial"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                sx={commonDateInputSx}
              />
              <TextField
                label="Data Final"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                sx={commonDateInputSx}
              />
            </Stack>
          )}

          <FormControl sx={commonFormControlSx}>
            <InputLabel id="turno-label">Turno</InputLabel>
            <StyledSelect
              labelId="turno-label"
              id="turno"
              value={turno}
              label="Turno"
              onChange={(e) => setTurno(e.target.value)}
              sx={commonSelectSx}
              MenuProps={commonMenuProps}
            >
              <MenuItem value="">Selecione um turno</MenuItem>
              <MenuItem value="MATUTINO">Matutino</MenuItem>
              <MenuItem value="VESPERTINO">Vespertino</MenuItem>
              <MenuItem value="NOTURNO">Noturno</MenuItem>
            </StyledSelect>
          </FormControl>
        </Stack>

        <StyledButton
          variant="contained"
          onClick={handleRegisterFrequency}
          disabled={!turno}
          sx={{
            flexShrink: 0,
            width: { xs: "100%", sm: "200px" },
            height: { xs: 40, sm: 36 },
            fontWeight: "bold",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            whiteSpace: "nowrap",
            backgroundColor: !turno ? "#E0E0E0" : INSTITUTIONAL_COLOR,
            "&:hover": { backgroundColor: !turno ? "#E0E0E0" : "#26692b" },
          }}
        >
          Registrar Frequência
        </StyledButton>
      </Stack>

      {loading ? (
        <Typography align="center">Carregando...</Typography>
      ) : (
        <FrequenciesTable
          frequencies={paginatedFrequencies || []}
          setAlert={setAlert}
          onRegisterAbsenceWithCredit={handleRegisterAbsenceWithCredit}
          isFiltered={
            filterStatus !== "all" ||
            filterPeriod !== "all" ||
            (filterPeriod === "custom" && (customStartDate || customEndDate))
          }
        />
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
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