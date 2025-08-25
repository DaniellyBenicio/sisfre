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
import {
  ArrowBack,
  ExpandMore,
  Check,
  Close,
  School,
  Link,
} from "@mui/icons-material";
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

// Endereço base do servidor backend
const API_BASE_URL = "http://localhost:3333";

// Novo endereço para os arquivos estáticos (anexos)
const ATTACHMENTS_BASE_URL = "http://localhost:3000";

const ClassAntepositionList = () => {
  const [antepositions, setAntepositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filterTurma, setFilterTurma] = useState("all");
  const [filterDisciplina, setFilterDisciplina] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const navigate = useNavigate();
  const accessType = localStorage.getItem("accessType") || "Professor";

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    const fetchAntepositions = async () => {
      try {
        setLoading(true);
        const response = await api.get("/requests/only", {
          params: { type: "anteposicao" },
        });
        const antepositionsArray = Array.isArray(response.data.requests)
          ? response.data.requests
              .map((item) => ({
                id: item.id,
                professor: item.professor?.username || "Desconhecido",
                professorId: item.userId,
                turma: item.acronym
                  ? `${item.acronym} - ${item.semester || "N/A"}`
                  : "Desconhecido",
                acronym: item.acronym || "N/A",
                semester: item.semester || "N/A",
                discipline: item.discipline || "Desconhecido",
                quantidade: item.quantity.toString(),
                data: item.date,
                fileName: item.annex
                  ? JSON.parse(item.annex || "[]").length > 0
                    ? JSON.parse(item.annex)[0].split("/").pop()
                    : "N/A"
                  : "N/A",
                // Corrigido para usar ATTACHMENTS_BASE_URL
                fileLink: item.annex
                  ? JSON.parse(item.annex || "[]").length > 0
                    ? `${ATTACHMENTS_BASE_URL}/${JSON.parse(item.annex)[0].replace(/\\/g, "/")}`
                    : null
                  : null,
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
                a.turma.toLowerCase().localeCompare(b.turma.toLowerCase())
              )
          : [];
        setAntepositions(antepositionsArray);
      } catch (error) {
        console.error("Erro ao carregar anteposições:", error);
        setAlert({ message: "Erro ao carregar anteposições.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchAntepositions();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filterTurma, filterDisciplina, filterPeriod, filterStatus]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/request/anteposition/${id}`);
      setAlert({
        message: "Anteposição aprovada com sucesso! Créditos atualizados.",
        type: "success",
      });
      const response = await api.get("/requests/only", {
        params: { type: "anteposicao" },
      });
      setAntepositions(
        Array.isArray(response.data.requests)
          ? response.data.requests.map((item) => ({
              id: item.id,
              professor: item.professor?.username || "Desconhecido",
              professorId: item.userId,
              turma: item.acronym
                ? `${item.acronym} - ${item.semester || "N/A"}`
                : "Desconhecido",
              acronym: item.acronym || "N/A",
              semester: item.semester || "N/A",
              discipline: item.discipline || "Desconhecido",
              quantidade: item.quantity.toString(),
              data: item.date,
              fileName: item.annex
                ? JSON.parse(item.annex || "[]").length > 0
                  ? JSON.parse(item.annex)[0].split("/").pop()
                  : "N/A"
                : "N/A",
              fileLink: item.annex
                ? JSON.parse(item.annex || "[]").length > 0
                  ? `${ATTACHMENTS_BASE_URL}/${JSON.parse(item.annex)[0].replace(/\\/g, "/")}`
                  : null
                : null,
              observacao: item.observation || "N/A",
              observationCoordinator: item.observationCoordinator || "N/A",
              status:
                item.validated === 1
                  ? "Aprovado"
                  : item.validated === 2
                  ? "Rejeitado"
                  : "Pendente",
            }))
          : []
      );
    } catch (error) {
      console.error("Erro ao aprovar anteposição:", error);
      setAlert({ message: "Erro ao aprovar anteposição.", type: "error" });
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/request/negate/anteposition/${id}`, {
        observationCoordinator: "Rejeitado pelo coordenador",
      });
      setAlert({
        message: "Anteposição rejeitada com sucesso!",
        type: "success",
      });
      const response = await api.get("/requests/only", {
        params: { type: "anteposicao" },
      });
      setAntepositions(
        Array.isArray(response.data.requests)
          ? response.data.requests.map((item) => ({
              id: item.id,
              professor: item.professor?.username || "Desconhecido",
              professorId: item.userId,
              turma: item.acronym
                ? `${item.acronym} - ${item.semester || "N/A"}`
                : "Desconhecido",
              acronym: item.acronym || "N/A",
              semester: item.semester || "N/A",
              discipline: item.discipline || "Desconhecido",
              quantidade: item.quantity.toString(),
              data: item.date,
              fileName: item.annex
                ? JSON.parse(item.annex || "[]").length > 0
                  ? JSON.parse(item.annex)[0].split("/").pop()
                  : "N/A"
                : "N/A",
              fileLink: item.annex
                ? JSON.parse(item.annex || "[]").length > 0
                  ? `${ATTACHMENTS_BASE_URL}/${JSON.parse(item.annex)[0].replace(/\\/g, "/")}`
                  : null
                : null,
              observacao: item.observation || "N/A",
              observationCoordinator: item.observationCoordinator || "N/A",
              status:
                item.validated === 1
                  ? "Aprovado"
                  : item.validated === 2
                  ? "Rejeitado"
                  : "Pendente",
            }))
          : []
      );
    } catch (error) {
      console.error("Erro ao rejeitar anteposição:", error);
      setAlert({ message: "Erro ao rejeitar anteposição.", type: "error" });
    }
  };

  const handleGoBack = () => {
    navigate("/class-reschedule-options");
  };

  const turmas = [...new Set(antepositions.map((a) => a.turma))].sort();
  const disciplinas = [...new Set(antepositions.map((a) => a.discipline))].sort();

  const applyFilters = (data) => {
    let filtered = Array.isArray(data) ? [...data] : [];

    if (filterTurma !== "all") {
      filtered = filtered.filter((rep) => rep.turma === filterTurma);
    }

    if (filterDisciplina !== "all") {
      filtered = filtered.filter((rep) => rep.discipline === filterDisciplina);
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
          return repDate.toDateString() === yesterday.toDateString();
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

  const groupAntepositions = (data) => {
    const grouped = data.reduce((acc, anteposition) => {
      const key = `${anteposition.turma}-${anteposition.discipline}-${anteposition.status}`;
      if (!acc[key]) {
        acc[key] = {
          turma: anteposition.turma,
          acronym: anteposition.acronym,
          discipline: anteposition.discipline,
          status: anteposition.status,
          antepositions: [],
        };
      }
      acc[key].antepositions.push(anteposition);
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) =>
      a.turma.toLowerCase().localeCompare(b.turma.toLowerCase())
    );
  };

  const filteredAntepositions = applyFilters(antepositions);
  const groupedAntepositions = groupAntepositions(filteredAntepositions);
  const totalPages = Math.ceil(groupedAntepositions.length / rowsPerPage);
  const paginatedAntepositions = groupedAntepositions.slice(
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
          Anteposições de Aula
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
          onClick={() => navigate("/class-anteposition/register")}
          sx={{
            flexShrink: 0,
            width: { xs: "100%", sm: "200px" },
            height: { xs: 40, sm: 36 },
            fontWeight: "bold",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            whiteSpace: "nowrap",
          }}
        >
          Cadastrar anteposição
        </StyledButton>
      </Stack>

      {loading ? (
        <Typography align="center">Carregando...</Typography>
      ) : paginatedAntepositions.length > 0 ? (
        <Stack spacing={2}>
          {paginatedAntepositions.map((group, index) => (
            <Accordion
              key={`${group.turma}-${group.discipline}-${index}`}
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
                  <Box display="flex" alignItems="center">
                    <School sx={{ mr: 1, fontSize: 32, color: "#087619" }} />
                    <Typography fontWeight="bold">
                      {group.turma} ({group.discipline})
                    </Typography>
                  </Box>
                  <Chip
                    label={group.status}
                    color={getStatusColor(group.status)}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {group.antepositions.map((anteposition, idx) => (
                  <Box
                    key={idx}
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
                        <strong>Professor:</strong> {anteposition.professor}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{ fontSize: "1rem" }}
                      >
                        <strong>Quantidade de Aulas:</strong>{" "}
                        {anteposition.quantidade}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{ fontSize: "1rem" }}
                      >
                        <strong>Data:</strong>{" "}
                        {new Date(anteposition.data + "T00:00:00").toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{
                          fontSize: "1rem",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <strong>Anexo:</strong>
                        {anteposition.fileLink && (
                          <IconButton
                            size="small"
                            onClick={() => window.open(anteposition.fileLink, "_blank")}
                            sx={{ color: INSTITUTIONAL_COLOR }}
                          >
                            <Link fontSize="small" />
                          </IconButton>
                        )}
                      </Typography>
                      {anteposition.observacao !== "N/A" && (
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{ fontSize: "1rem" }}
                        >
                          <strong>Observação:</strong> {anteposition.observacao}
                        </Typography>
                      )}
                      {anteposition.observationCoordinator !== "N/A" && (
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{ fontSize: "1rem" }}
                        >
                          <strong>Justificativa:</strong>{" "}
                          {anteposition.observationCoordinator}
                        </Typography>
                      )}
                    </Box>
                    {accessType === "Coordenador" && anteposition.status === "Pendente" && (
                      <Box sx={{ gridColumn: "1 / -1", mt: 2, display: "flex", gap: 1 }}>
                        <StyledButton
                          variant="contained"
                          size="small"
                          onClick={() => handleApprove(anteposition.id)}
                          startIcon={<Check />}
                          sx={{
                            backgroundColor: "#087619",
                            "&:hover": { backgroundColor: "#065013" },
                          }}
                        >
                          Aprovar
                        </StyledButton>
                        <StyledButton
                          variant="contained"
                          size="small"
                          onClick={() => handleReject(anteposition.id)}
                          startIcon={<Close />}
                          sx={{
                            backgroundColor: "#F01424",
                            "&:hover": { backgroundColor: "#D4000F" },
                          }}
                        >
                          Rejeitar
                        </StyledButton>
                      </Box>
                    )}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      ) : (
        <Typography variant="body1" color="text.secondary" align="center">
          Não foram encontradas anteposições.
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

export default ClassAntepositionList;