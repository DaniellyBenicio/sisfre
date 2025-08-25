import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Button,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { CustomAlert } from "../../../components/alert/CustomAlert";
import { StyledSelect } from "../../../components/inputs/Input";
import TeacherAbsencesDetailsTable from "./TeacherAbsencesDetailsTable";
import api from "../../../service/api";
import Sidebar from "../../../components/SideBar";

const INSTITUTIONAL_COLOR = "#307c34";

const TeacherAbsencesDetails = ({ setAuthenticated }) => {
  const [frequencies, setFrequencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [professorName, setProfessorName] = useState("Professor");
  const rowsPerPage = 7;
  const navigate = useNavigate();
  const { professorId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleAlertClose = () => {
    setAlert(null);
  };

  const fetchFrequencies = async () => {
    try {
      setLoading(true);

      if (!professorId) {
        setAlert({
          message: "ID do professor não fornecido. Por favor, retorne e selecione um professor.",
          type: "error",
        });
        setFrequencies([]);
        setLoading(false);
        navigate("/professor-absences");
        return;
      }

      const params = {
        status: filterStatus !== "all" ? filterStatus : undefined,
      };

      if (filterPeriod !== "all") {
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
              message: "Por favor, selecione datas inicial e final válidas para o período personalizado.",
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
              message: "Datas inválidas. A data inicial deve ser anterior ou igual à data final.",
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

      const response = await api.get(`/absences/professor/${professorId}`, { params });

      let formattedData = Array.isArray(response.data.absence_details)
        ? response.data.absence_details.map((item, idx) => ({
            id: idx,
            date: item.data,
            displayDate: item.data
              ? new Date(item.data + "T00:00:00").toLocaleDateString("pt-BR")
              : "N/A",
            class: item["curso-turma"],
            turno: item.turno || "N/A",
            status: item.status,
            justification: item.justificativa || "N/A",
          }))
        : [];

      if (filterPeriod === "custom" && customStartDate && customEndDate) {
        const start = new Date(customStartDate + "T00:00:00");
        const end = new Date(customEndDate + "T23:59:59");
        formattedData = formattedData.filter((item) => {
          if (!item.date) return false;
          const itemDate = new Date(item.date + "T00:00:00");
          return itemDate >= start && itemDate <= end;
        });
      }

      console.log("Dados formatados após filtragem:", formattedData);

      setFrequencies(formattedData);
    } catch (error) {
      console.error("Erro ao buscar frequências:", error);
      if (error.response?.status === 404) {
        setFrequencies([]);
      } else {
        setAlert({
          message: error.response?.data?.error || "Erro ao carregar frequências.",
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
    if (filterPeriod === "custom" && (!customStartDate || !customEndDate)) {
      return;
    }
    fetchFrequencies();
  }, [filterStatus, filterPeriod, customStartDate, customEndDate, professorId]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterPeriod, customStartDate, customEndDate]);

  const handleApplyCustomFilter = () => {
    if (!customStartDate || !customEndDate) {
      setAlert({
        message: "Por favor, selecione datas inicial e final válidas.",
        type: "error",
      });
      return;
    }
    fetchFrequencies();
  };

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

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Sidebar setAuthenticated={setAuthenticated} />
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
            mt: 5,
          }}
        >
          <IconButton
            onClick={() => navigate("/teacher-absences")}
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
            Faltas
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
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="yesterday">Dia Anterior</MenuItem>
                <MenuItem value="lastWeek">Última Semana</MenuItem>
                <MenuItem value="lastMonth">Último Mês</MenuItem>
                <MenuItem value="custom">Intervalo Personalizado</MenuItem>
              </StyledSelect>
            </FormControl>

            {filterPeriod === "custom" && (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
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
          </Stack>
        </Stack>

        {loading ? (
          <Typography align="center">Carregando...</Typography>
        ) : (
          <TeacherAbsencesDetailsTable
            frequencies={paginatedFrequencies || []}
            isFiltered={
              filterStatus !== "all" ||
              filterPeriod !== "all" ||
              (filterPeriod === "custom" && customStartDate && customEndDate)
            }
            setAlert={setAlert}
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
    </Box>
  );
};

export default TeacherAbsencesDetails;