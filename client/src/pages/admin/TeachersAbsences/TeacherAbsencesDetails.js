import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Stack,
  MenuItem,
  Pagination,
  IconButton,
  TextField,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import { ArrowBack, ExpandMore, School } from "@mui/icons-material";
import { CustomAlert } from "../../../components/alert/CustomAlert";
import { StyledSelect, StyledDateFilter } from "../../../components/inputs/Input";
import api from "../../../service/api";
import Sidebar from "../../../components/SideBar";

const INSTITUTIONAL_COLOR = "#307c34";

const TeacherAbsencesDetails = ({ setAuthenticated }) => {
  const [frequencies, setFrequencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [professorName, setProfessorName] = useState("");
  const rowsPerPage = 7;
  const navigate = useNavigate();
  const { professorId } = useParams();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { userId: userIdFromState } = location.state || {};
  const userId = userIdFromState
    ? Number(userIdFromState)
    : professorId
    ? Number(professorId)
    : null;

  const handleAlertClose = () => {
    setAlert(null);
  };

  const fetchProfessorName = async () => {
    if (!userId) {
      console.log("No userId or professorId provided");
      setProfessorName("Desconhecido");
      return;
    }
    try {
      const response = await api.get(`/users/${userId}`);
      const name = response.data.user?.username || "Desconhecido";
      setProfessorName(name);
    } catch (error) {
      console.error(
        "Erro ao carregar nome do professor:",
        error.response?.data || error.message
      );
      setAlert({
        message:
          error.response?.data?.error ||
          "Erro ao carregar nome do professor. Verifique se o ID do professor é válido.",
        type: "error",
      });
      setProfessorName("Desconhecido");
    }
  };

  const fetchFrequencies = async () => {
    try {
      setLoading(true);

      if (!professorId) {
        setAlert({
          message:
            "ID do professor não fornecido. Por favor, retorne e selecione um professor.",
          type: "error",
        });
        setFrequencies([]);
        setLoading(false);
        navigate("/teacher-absences");
        return;
      }

      const params = {
        status: filterStatus !== "" ? filterStatus.toLowerCase() : undefined,
      };

      if (filterPeriod !== "") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (filterPeriod === "yesterday") {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          params.startDate = yesterday.toISOString().split("T")[0];
          params.endDate = yesterday.toISOString().split("T")[0];
        } else if (filterPeriod === "lastWeek") {
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);
          params.startDate = lastWeek.toISOString().split("T")[0];
          params.endDate = today.toISOString().split("T")[0];
        } else if (filterPeriod === "lastMonth") {
          const lastMonth = new Date(today);
          lastMonth.setMonth(today.getMonth() - 1);
          params.startDate = lastMonth.toISOString().split("T")[0];
          params.endDate = today.toISOString().split("T")[0];
        } else if (filterPeriod === "custom") {
          if (!customStartDate || !customEndDate) {
            setAlert({
              message:
                "Por favor, selecione datas inicial e final válidas para o período personalizado.",
              type: "error",
            });
            setFrequencies([]);
            setLoading(false);
            return;
          }
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          if (isNaN(start) || isNaN(end) || start > end) {
            setAlert({
              message:
                "Datas inválidas. A data inicial deve ser anterior ou igual à data final.",
              type: "error",
            });
            setFrequencies([]);
            setLoading(false);
            return;
          }
          params.startDate = customStartDate;
          params.endDate = customEndDate;
        }
      }

      console.log("Parâmetros enviados à API:", params);

      const response = await api.get(`/absences/professor/${professorId}`, {
        params,
      });

      let formattedData = Array.isArray(response.data.absence_details)
        ? response.data.absence_details.map((item, idx) => ({
            id: idx,
            date: item.data,
            displayDate: item.data
              ? new Date(item.data + "T00:00:00").toLocaleDateString("pt-BR")
              : "N/A",
            class: item["curso-turma"],
            disciplina: item.disciplina || "N/A",
            turno: item.turno || "N/A",
            status: item.status,
            justification: item.justificativa || "N/A",
            quantidade_faltas: item.quantidade_faltas || 0,
          }))
        : [];

      formattedData.sort((a, b) => new Date(b.date) - new Date(a.date));

      setFrequencies(formattedData);
    } catch (error) {
      console.error("Erro ao buscar frequências:", error);
      if (error.response?.status === 404) {
        setFrequencies([]);
      } else {
        setAlert({
          message:
            error.response?.data?.error || "Erro ao carregar frequências.",
          type: "error",
        });
        setFrequencies([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterPeriod !== "custom") {
      setCustomStartDate("");
      setCustomEndDate("");
    }
  }, [filterPeriod]);

  useEffect(() => {
    if (userId || professorId) {
      fetchProfessorName();
    }
    fetchFrequencies();
  }, [userId, professorId]);

  useEffect(() => {
    if (filterPeriod === "custom" && (!customStartDate || !customEndDate)) {
      return;
    }
    fetchFrequencies();
  }, [filterStatus, filterPeriod, customStartDate, customEndDate, professorId]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterPeriod, customStartDate, customEndDate]);

  const totalPages = Math.ceil(frequencies.length / rowsPerPage);
  const paginatedFrequencies = frequencies.slice(
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "abonada":
        return "success";
      case "falta":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar setAuthenticated={setAuthenticated} />
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          flexGrow: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            mb: 3,
            mt: { xs: 3, sm: 5 },
          }}
        >
          {!isMobile && (
            <IconButton
              onClick={() => navigate("/teacher-absences")}
              sx={{
                position: "absolute",
                left: 0,
                color: INSTITUTIONAL_COLOR,
              }}
            >
              <ArrowBack sx={{ fontSize: 35 }} />
            </IconButton>
          )}
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{
              fontWeight: "bold",
              flexGrow: 1,
              fontSize: { xs: "1.2rem", sm: "1.5rem" },
            }}
          >
            Faltas de {professorName}
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
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="Abonada">Abonadas</MenuItem>
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
                <MenuItem value="">Todos</MenuItem>
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
                alignItems="center"
              >
                <StyledDateFilter
                  label="Data Inicial"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  sx={commonDateInputSx}
                />
                <StyledDateFilter
                  label="Data Final"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  sx={commonDateInputSx}
                />
              </Stack>
            )}
          </Stack>
        </Stack>

        {loading ? (
          <Typography align="center">Carregando...</Typography>
        ) : paginatedFrequencies.length > 0 ? (
          <Stack spacing={2}>
            {paginatedFrequencies.map((absence, index) => (
              <Accordion
                key={`${absence.class}-${absence.date}-${absence.turno}-${index}`}
                elevation={3}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls={`panel-${index}-content`}
                  id={`panel-${index}-header`}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Box display="flex" alignItems="center" flexWrap="wrap">
                      <School sx={{ mr: 1, fontSize: 32, color: "#087619" }} />
                      <Typography fontWeight="bold">{absence.class}</Typography>
                    </Box>
                    <Chip
                      label={`${absence.quantidade_faltas} Faltas`}
                      color={getStatusColor(absence.status)}
                      sx={{
                        color: "#ffffff",
                        bgcolor:"#ff0000ff"
                      }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    sx={{
                      p: { xs: 1, sm: 2 },
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: { xs: 1, sm: 2 },
                      overflow: "hidden",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        <strong>Disciplina:</strong> {absence.disciplina}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        <strong>Data:</strong> {absence.displayDate}
                      </Typography>
                      <Typography variant="subtitle2" gutterBottom>
                        <strong>Turno:</strong> {absence.turno}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                        <strong>Status: </strong>
                        <Box
                          component="span"
                          sx={{
                            color:
                              absence.status.toLowerCase() === "falta"
                                ? "#ff0000"
                                : absence.status.toLowerCase() === "abonada"
                                ? "#fbc000ff"
                                : "inherit",
                            fontWeight: "bold",
                            textTransform: 'capitalize',
                          }}
                        >
                          {absence.status}
                        </Box>
                      </Typography>
                      {absence.justification !== "N/A" && (
                        <Typography
                          variant="subtitle2"
                          sx={{
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                          }}
                        >
                          <strong>Justificativa:</strong>{" "}
                          {absence.justification}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        ) : (
          <Typography
            variant="body"
            color="text.secondary"
            align="center"
            sx={{ mt: 20, mb: 4, fontSize: "1.2rem" }}
          >
            Não foram encontradas faltas.
          </Typography>
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
    </Box>
  );
};

export default TeacherAbsencesDetails;
