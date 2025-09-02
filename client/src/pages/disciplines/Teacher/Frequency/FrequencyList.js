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
  Tabs,
  Tab,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { CustomAlert } from "../../../../components/alert/CustomAlert";
import { StyledSelect } from "../../../../components/inputs/Input";
import FrequenciesTable from "./FrequenciesTable";
import MyAbsences from "./MyAbsences";
import api from "../../../../service/api";

const INSTITUTIONAL_COLOR = "#307c34";

const StyledButton = styled(Button)(() => ({
  textTransform: "none",
  fontWeight: "bold",
  backgroundColor: INSTITUTIONAL_COLOR,
  "&:hover": { backgroundColor: "#26692b" },
}));

const StyledTabs = styled(Tabs)({
  borderBottom: "1px solid #e8e8e8",
  "& .MuiTabs-indicator": {
    backgroundColor: INSTITUTIONAL_COLOR,
  },
  justifyContent: "center",
});

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
  ({ theme }) => ({
    textTransform: "none",
    minWidth: 0,
    [theme.breakpoints.up("sm")]: {
      minWidth: 0,
    },
    fontWeight: "bold",
    fontSize: "1.03rem",
    marginRight: theme.spacing(1),
    color: "rgba(0, 0, 0, 0.85)",
    "&:hover": {
      color: INSTITUTIONAL_COLOR,
      opacity: 1,
    },
    "&.Mui-selected": {
      color: INSTITUTIONAL_COLOR,
    },
    "&.Mui-focusVisible": {
      backgroundColor: "#d5ffdb",
    },
  })
);

const FrequencyList = () => {
  const [frequencies, setFrequencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [tabIndex, setTabIndex] = useState(0);
  const rowsPerPage = 7;
  const navigate = useNavigate();

  const handleAlertClose = () => {
    setAlert(null);
  };

  const handleChangeTab = (event, newValue) => {
    setTabIndex(newValue);
  };

  const fetchFrequencies = async () => {
    try {
      setLoading(true);

      const params = {
        status: filterStatus === "" ? undefined : filterStatus.toLowerCase(),
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (filterPeriod) {
        case "yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          params.startDate = yesterday.toLocaleDateString("en-CA");
          params.endDate = yesterday.toLocaleDateString("en-CA");
          break;
        case "lastWeek":
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);
          params.startDate = lastWeek.toLocaleDateString("en-CA");
          params.endDate = today.toLocaleDateString("en-CA");
          break;
        case "lastMonth":
          const lastMonth = new Date(today);
          lastMonth.setMonth(today.getMonth() - 1);
          params.startDate = lastMonth.toLocaleDateString("en-CA");
          params.endDate = today.toLocaleDateString("en-CA");
          break;
        case "custom":
          if (customStartDate && customEndDate) {
            params.startDate = customStartDate;
            params.endDate = customEndDate;
          }
          break;
        default:
          break;
      }

      console.log("Parâmetros enviados para GET /register-by-turn:", params);
      const response = await api.get("/register-by-turn", { params });
      console.log(
        "Resposta do backend (GET /register-by-turn):",
        response.data
      );

      const formattedData = Array.isArray(response.data.attendances)
        ? response.data.attendances.map((freq, index) => ({
            id: index.toString(),
            date: freq.date,
            turn: freq.turn,
            status: freq.status.charAt(0).toUpperCase() + freq.status.slice(1),
            justification: freq.justification,
          }))
        : [];

      const sortedData = formattedData.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split("/");
        const [dayB, monthB, yearB] = b.date.split("/");
        const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
        const dateB = new Date(`${yearB}-${monthB}-${dayB}`);

        if (dateA.getTime() !== dateB.getTime()) {
          return dateB - dateA;
        }

        const turnOrder = ["Noturno", "Vespertino", "Matutino"];
        return turnOrder.indexOf(a.turn) - turnOrder.indexOf(b.turn);
      });

      setFrequencies(sortedData);
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

    if (filterStatus !== "") {
      filtered = filtered.filter((freq) => freq.status === filterStatus);
    }

    return filtered;
  };

  const handleRegisterFrequency = async () => {
    try {
      setLoading(true);

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        });
      });
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      console.log("Chamando POST /register-by-turn com:", {
        latitude,
        longitude,
      });
      const response = await api.post("/register-by-turn", {
        latitude,
        longitude,
      });
      console.log(
        "Resposta do backend (POST /register-by-turn):",
        response.data
      );
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
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response.data.error || "Dados inválidos fornecidos.";
      } else if (error.response?.status === 404) {
        errorMessage =
          error.response.data.error ||
          "Nenhuma aula encontrada para o turno atual.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Erro de rede. Verifique sua conexão e tente novamente.";
      } else if (error.code === 1) {
        errorMessage =
          "Permissão de geolocalização negada. Ative a geolocalização no navegador.";
      } else if (error.code === 2) {
        errorMessage =
          "Não foi possível obter a localização. Verifique sua conexão ou configurações.";
      } else if (error.code === 3) {
        errorMessage =
          "Tempo esgotado ao obter a localização. Tente novamente.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
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
        courseId: frequencyItem.courseId || null,
        disciplineId: frequencyItem.disciplineId || null,
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
        <StyledTabs
          value={tabIndex}
          onChange={handleChangeTab}
          aria-label="frequencia tabs"
        >
          <StyledTab label="Frequências" />
          <StyledTab label="Minhas Faltas" />
        </StyledTabs>
      </Box>

      {tabIndex === 0 && (
        <Box>
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
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="Presença">Presenças</MenuItem>
                  <MenuItem value="Falta">Faltas</MenuItem>
                  <MenuItem value="Abonada">Abonadas</MenuItem>
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
                  <MenuItem value="">Todas</MenuItem>
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
                filterStatus !== "" ||
                filterPeriod !== "" ||
                (filterPeriod === "custom" &&
                  (customStartDate || customEndDate))
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
        </Box>
      )}

      {tabIndex === 1 && (
        <Box>
          <MyAbsences />
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
