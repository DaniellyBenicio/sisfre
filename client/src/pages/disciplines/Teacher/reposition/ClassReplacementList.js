import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Pagination,
  MenuItem,
} from "@mui/material";
import { ArrowBack, ExpandMore, School } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { CustomAlert } from "../../../../components/alert/CustomAlert";
import { StyledSelect } from "../../../../components/inputs/Input";
import api from "../../../../service/api";

const INSTITUTIONAL_COLOR = "#307c34";

const StyledButton = styled(Button)(() => ({
  textTransform: "none",
  fontWeight: "bold",
  backgroundColor: INSTITUTIONAL_COLOR,
  "&:hover": { backgroundColor: "#26692b" },
}));

const ClassReplacementList = () => {
  const [replacements, setReplacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filterTurma, setFilterTurma] = useState("all");
  const [filterDisciplina, setFilterDisciplina] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const navigate = useNavigate();

  const handleAlertClose = () => {
    setAlert(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString + "T00:00:00");
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  useEffect(() => {
    const fetchReplacements = async () => {
      try {
        setLoading(true);
        const response = await api.get("/requests/only", {
          params: { type: "reposicao" },
        });
        const replacementsArray = Array.isArray(response.data.requests)
          ? response.data.requests
              .map((item) => ({
                id: item.id,
                professor: item.professor?.username || "Desconhecido",
                turma: item.acronym
                  ? `${item.acronym} - ${item.semester || "N/A"}`
                  : "Desconhecido",
                disciplina: item.discipline || "Desconhecido",
                quantidade: item.quantity.toString(),
                data: formatDate(item.date),
                dataAusencia: formatDate(item.dateAbsence),
                fileName: item.annex
                  ? JSON.parse(item.annex || "[]")
                      .map((path) => path.split("/").pop())
                      .join(", ")
                  : "N/A",
                observacao: item.observation || "N/A",
                observationCoordinator: item.observationCoordinator || "N/A",
                status:
                  item.validated === 1
                    ? "Aprovado"
                    : item.validated === 2
                    ? "Rejeitado"
                    : "Pendente",
              }))
              .sort((a, b) =>
                a.data.localeCompare(b.data) || a.id - b.id // Ordena por data e ID como fallback
              )
          : [];
        setReplacements(replacementsArray);
      } catch (error) {
        console.error("Erro ao carregar reposições:", error);
        setAlert({ message: "Erro ao carregar reposições.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchReplacements();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filterTurma, filterDisciplina, filterPeriod, filterStatus]);

  const handleGoBack = () => {
    navigate("/class-reschedule-options");
  };

  const turmas = [...new Set(replacements.map((a) => a.turma))].sort();
  const disciplinas = [...new Set(replacements.map((a) => a.disciplina))].sort();

  const applyFilters = (data) => {
    let filtered = Array.isArray(data) ? [...data] : [];

    if (filterTurma !== "all") {
      filtered = filtered.filter((rep) => rep.turma === filterTurma);
    }

    if (filterDisciplina !== "all") {
      filtered = filtered.filter((rep) => rep.disciplina === filterDisciplina);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((rep) => rep.status === filterStatus);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filtered = filtered.filter((rep) => {
      if (!rep.data) return false;
      const repDate = new Date(rep.data + "T00:00:00");
      repDate.setHours(0, 0, 0, 0);

      switch (filterPeriod) {
        case "yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          return repDate.getTime() === yesterday.getTime();
        case "lastWeek":
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);
          return repDate >= lastWeek && repDate <= today;
        case "lastMonth":
          const lastMonth = new Date(today);
          lastMonth.setMonth(today.getMonth() - 1);
          return repDate >= lastMonth && repDate <= today;
        default:
          return true;
      }
    });

    return filtered;
  };

  const filteredReplacements = applyFilters(replacements);
  const totalPages = Math.ceil(filteredReplacements.length / rowsPerPage);
  const paginatedReplacements = filteredReplacements.slice(
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Aprovado":
        return "success";
      case "Rejeitado":
        return "error";
      case "Pendente":
      default:
        return "warning";
    }
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
          onClick={handleGoBack}
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
          Minhas Reposições de Aula
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
            <InputLabel id="filter-turma-label">Turma</InputLabel>
            <StyledSelect
              labelId="filter-turma-label"
              id="filter-turma"
              value={filterTurma}
              label="Turma"
              onChange={(e) => setFilterTurma(e.target.value)}
              sx={commonSelectSx}
              MenuProps={commonMenuProps}
            >
              <MenuItem value="all">Todas</MenuItem>
              {turmas.map((turma) => (
                <MenuItem key={turma} value={turma}>
                  {turma}
                </MenuItem>
              ))}
            </StyledSelect>
          </FormControl>

          <FormControl sx={commonFormControlSx}>
            <InputLabel id="filter-disciplina-label">Disciplina</InputLabel>
            <StyledSelect
              labelId="filter-disciplina-label"
              id="filter-disciplina"
              value={filterDisciplina}
              label="Disciplina"
              onChange={(e) => setFilterDisciplina(e.target.value)}
              sx={commonSelectSx}
              MenuProps={commonMenuProps}
            >
              <MenuItem value="all">Todas</MenuItem>
              {disciplinas.map((disciplina) => (
                <MenuItem key={disciplina} value={disciplina}>
                  {disciplina}
                </MenuItem>
              ))}
            </StyledSelect>
          </FormControl>

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
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="Pendente">Pendente</MenuItem>
              <MenuItem value="Aprovado">Aprovado</MenuItem>
              <MenuItem value="Rejeitado">Rejeitado</MenuItem>
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
            </StyledSelect>
          </FormControl>
        </Stack>

        <StyledButton
          variant="contained"
          onClick={() => navigate("/class-reposition/register")}
          sx={{
            flexShrink: 0,
            width: { xs: "100%", sm: "200px" },
            height: { xs: 40, sm: 36 },
            fontWeight: "bold",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            whiteSpace: "nowrap",
          }}
        >
          Cadastrar Reposição
        </StyledButton>
      </Stack>

      {loading ? (
        <Typography align="center">Carregando...</Typography>
      ) : paginatedReplacements.length > 0 ? (
        <Stack spacing={2}>
          {paginatedReplacements.map((replacement) => (
            <Accordion key={replacement.id} elevation={3}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls={`panel-${replacement.id}-content`}
                id={`panel-${replacement.id}-header`}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                >
                  <Box display="flex" alignItems="center">
                    <School sx={{ mr: 1, fontSize: 32, color: "#087619" }} />
                    <Typography fontWeight="bold">
                      {replacement.turma} ({replacement.disciplina}) -{" "}
                      {replacement.data}
                    </Typography>
                  </Box>
                  <Chip
                    label={replacement.status}
                    color={getStatusColor(replacement.status)}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ fontSize: "1rem" }}
                    >
                      <strong>Professor:</strong> {replacement.professor}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ fontSize: "1rem" }}
                    >
                      <strong>Quantidade de Aulas:</strong>{" "}
                      {replacement.quantidade}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ fontSize: "1rem" }}
                    >
                      <strong>Data da Reposição:</strong> {replacement.data}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ fontSize: "1rem" }}
                    >
                      <strong>Data da Ausência:</strong> {replacement.dataAusencia}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ fontSize: "1rem" }}
                    >
                      <strong>Anexo(s):</strong> {replacement.fileName}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ fontSize: "1rem" }}
                    >
                      <strong>Observação:</strong> {replacement.observacao}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ fontSize: "1rem" }}
                    >
                      <strong>Observação do Coordenador:</strong>{" "}
                      {replacement.observationCoordinator}
                    </Typography>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      ) : (
        <Typography variant="body1" color="text.secondary" align="center">
          Não foram encontradas reposições.
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
  );
};

export default ClassReplacementList;