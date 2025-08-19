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
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const navigate = useNavigate();

  const handleAlertClose = () => {
    setAlert(null);
  };

  const fetchFrequencies = async () => {
    try {
      setLoading(true);
      const params = {
        attended:
          filterStatus === "Presença"
            ? true
            : filterStatus === "Falta"
            ? false
            : undefined,
        date:
          filterPeriod === "custom" && customStartDate
            ? customStartDate
            : undefined,
      };

      // A CORREÇÃO ESTÁ AQUI: a rota no backend para GET é a mesma da de POST.
      // E você precisa passar os parâmetros de filtro corretamente.
      const response = await api.get("/register-by-turn", { params });

      const formattedData = Array.isArray(response.data.attendances)
        ? response.data.attendances
            .map((freq) => ({
              id: freq.attendance.id,
              date: freq.attendance.date,
              displayDate: freq.attendance.date
                ? new Date(
                    freq.attendance.date + "T00:00:00"
                  ).toLocaleDateString("pt-BR")
                : "N/A",
              class: `${freq.course_acronym || "N/A"} - ${freq.class || "N/A"}`,
              discipline: freq.discipline || "N/A",
              time: freq.hour || "N/A",
              status: freq.attendance.attended ? "Presença" : "Falta",
              courseId: freq.courseId || "N/A",
              disciplineId: freq.disciplineId || "N/A",
            }))
            .sort((a, b) =>
              a.class.toLowerCase().localeCompare(b.class.toLowerCase())
            )
        : [];
      setFrequencies(formattedData);
    } catch (error) {
      console.error("Erro ao buscar frequências:", error);
      setAlert({
        message: error.response?.data?.error || "Erro ao carregar frequências.",
        type: "error",
      });
      setFrequencies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFrequencies();
  }, [filterStatus, filterPeriod, customStartDate, customEndDate]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterPeriod, customStartDate, customEndDate]);

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
    try {
      setLoading(true);

      let latitude = null;
      let longitude = null;
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0,
          });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (geoError) {
        setAlert({
          message:
            "Permissão de geolocalização negada. Ative a geolocalização no navegador.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      const response = await api.post("/register-by-turn", {
        latitude,
        longitude,
      });
      setAlert({
        message: response.data.message || "Frequência registrada com sucesso!",
        type: "success",
      });
      fetchFrequencies();
    } catch (error) {
      console.error("Erro ao registrar frequência:", error);
      let errorMessage = "Erro ao registrar frequência.";
      if (error.response?.status === 401) {
        errorMessage = "Usuário não autenticado. Faça login novamente.";
      } else if (error.response?.status === 403) {
        errorMessage =
          error.response.data.error || "Você precisa estar no campus.";
      } else if (error.response?.status === 404) {
        errorMessage =
          error.response.data.error || "Rota não encontrada. Verifique o URL.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else {
        errorMessage = error.message || "Erro ao registrar frequência.";
      }
      setAlert({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
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
              onChange={(e) => {
                setFilterStatus(e.target.value);
              }}
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
              onChange={(e) => {
                setFilterPeriod(e.target.value);
              }}
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
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                }}
                sx={commonDateInputSx}
              />
              <TextField
                label="Data Final"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={customEndDate}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                }}
                sx={commonDateInputSx}
              />
            </Stack>
          )}
        </Stack>

        <StyledButton
          variant="contained"
          onClick={handleRegisterFrequency}
          disabled={loading}
          sx={{
            flexShrink: 0,
            width: { xs: "100%", sm: "200px" },
            height: { xs: 40, sm: 36 },
            fontWeight: "bold",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "Registrando..." : "Registrar Frequência"}
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
