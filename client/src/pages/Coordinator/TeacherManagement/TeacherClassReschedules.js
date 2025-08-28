import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Pagination,
  MenuItem,
  CssBaseline,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ArrowBack,
  ExpandMore,
  School,
  Link,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { CustomAlert } from "../../../components/alert/CustomAlert";
import { StyledSelect } from "../../../components/inputs/Input";
import api from "../../../service/api";
import Sidebar from "../../../components/SideBar";

const INSTITUTIONAL_COLOR = "#307c34";

const API_BASE_URL = "http://localhost:3333";
const ATTACHMENTS_BASE_URL = "http://localhost:3000";

const TeacherClassReschedulesList = ({ setAuthenticated }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filterTurma, setFilterTurma] = useState("");
  const [filterDisciplina, setFilterDisciplina] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [page, setPage] = useState(1);
  const [professorName, setProfessorName] = useState("Desconhecido");
  const rowsPerPage = 7;
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const accessType = localStorage.getItem("accessType") || "Professor";

  const { userId: userIdFromState } = location.state || {};
  const userId = userIdFromState ? Number(userIdFromState) : null;

  const handleAlertClose = () => {
    setAlert(null);
  };

  const fetchProfessorName = async () => {
    if (!userId) {
      console.log("No userId provided in location.state");
      setProfessorName("Desconhecido");
      return;
    }
    try {
      const response = await api.get(`/users/${userId}`);
      const name = response.data.user?.username || "Desconhecido";
      setProfessorName(name);
    } catch (error) {
      console.error("Erro ao carregar nome do professor:", error.response?.data || error.message);
      setAlert({ message: error.response?.data?.error || "Erro ao carregar nome do professor.", type: "error" });
      setProfessorName("Desconhecido");
    }
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

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append("type[]", "anteposicao");
      queryParams.append("type[]", "reposicao");
      if (userId) {
        queryParams.append("userId", userId);
      }

      const response = await api.get(`/requests/teacher?${queryParams.toString()}`);
      const requestsArray = Array.isArray(response.data.requests)
        ? response.data.requests
            .map((item) => ({
              id: item.id,
              professor: item.professor?.username || "Desconhecido",
              professorId: item.userId,
              turma: item.acronym && item.semester
                ? `${item.acronym} - ${item.semester || "N/A"}`
                : "Desconhecido",
              acronym: item.acronym || "N/A",
              semester: item.semester || "N/A",
              disciplina: item.discipline || "Desconhecido",
              quantidade: item.quantity?.toString() || "N/A",
              data: item.date || "N/A",
              dataAusencia: formatDate(item.dateAbsence),
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
              status: item.validated === 1 ? "Aprovado" : item.validated === 2 ? "Rejeitado" : "Pendente",
              tipo: item.type === "anteposicao" ? "Anteposição" : item.type === "reposicao" ? "Reposição" : "N/A",
            }))
            .sort((a, b) => a.turma.toLowerCase().localeCompare(b.turma.toLowerCase()))
        : [];
      setRequests(requestsArray);
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error.response?.data || error.message);
      setAlert({ message: error.response?.data?.error || "Erro ao carregar solicitações.", type: "error" });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfessorName();
    }
    fetchRequests();
  }, [userId]);

  useEffect(() => {
    setPage(1);
  }, [filterTurma, filterDisciplina, filterPeriod, filterStatus, filterType]);

  const handleGoBack = () => {
    navigate("/teachers-management");
  };

  const turmas = [...new Set(requests.map((a) => a.turma))].sort();
  const disciplinas = [...new Set(requests.map((a) => a.disciplina))].sort();

  const applyFilters = (data) => {
    let filtered = Array.isArray(data) ? [...data] : [];

    if (filterTurma !== "") {
      filtered = filtered.filter((rep) => rep.turma === filterTurma);
    }

    if (filterDisciplina !== "") {
      filtered = filtered.filter((rep) => rep.disciplina === filterDisciplina);
    }

    if (filterStatus !== "") {
      filtered = filtered.filter((rep) => rep.status === filterStatus);
    }

    if (filterType !== "") {
      filtered = filtered.filter((rep) => rep.tipo === filterType);
    }

    if (filterPeriod !== "") {
      filtered = filtered.filter((rep) => {
        if (!rep.data) return false;
        const repDate = new Date(`${rep.data}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

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
    }

    return filtered;
  };

  const groupRequests = (data) => {
    const grouped = data.reduce((acc, request) => {
      const key = `${request.turma}-${request.disciplina}-${request.status}`;
      if (!acc[key]) {
        acc[key] = {
          turma: request.turma,
          disciplina: request.disciplina,
          status: request.status,
          tipo: request.tipo,
          requests: [],
        };
      }
      acc[key].requests.push(request);
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) =>
      a.turma.toLowerCase().localeCompare(b.turma.toLowerCase())
    );
  };

  const filteredRequests = applyFilters(requests);
  const groupedRequests = groupRequests(filteredRequests);
  const totalPages = Math.ceil(groupedRequests.length / rowsPerPage);
  const paginatedRequests = groupedRequests.slice(
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
          minHeight: "36px",
          display: "flex",
          alignItems: "center",
        },
        "& .MuiMenuItem-root.Mui-selected": {
          backgroundColor: "#D5FFDB",
          "&:hover": {
            backgroundColor: "#C5F5CB",
          },
        },
        "& .MuiMenuItem-root:hover": {
          backgroundColor: "#D5FFDB",
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
    <Box display="flex">
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
            mt: 4,
          }}
        >
          {!isMobile && (
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
          )}
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", flexGrow: 1 }}
          >
            Anteposições e Reposições de {professorName}
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
                <MenuItem value="">Todas</MenuItem>
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
                <MenuItem value="">Todas</MenuItem>
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
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Pendente">Pendente</MenuItem>
                <MenuItem value="Aprovado">Aprovado</MenuItem>
                <MenuItem value="Rejeitado">Rejeitado</MenuItem>
              </StyledSelect>
            </FormControl>

            <FormControl sx={commonFormControlSx}>
              <InputLabel id="filter-type-label">Tipo</InputLabel>
              <StyledSelect
                labelId="filter-type-label"
                id="filter-type"
                value={filterType}
                label="Tipo"
                onChange={(e) => setFilterType(e.target.value)}
                sx={commonSelectSx}
                MenuProps={commonMenuProps}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Anteposição">Anteposição</MenuItem>
                <MenuItem value="Reposição">Reposição</MenuItem>
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
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="yesterday">Dia Anterior</MenuItem>
                <MenuItem value="lastWeek">Última Semana</MenuItem>
                <MenuItem value="lastMonth">Último Mês</MenuItem>
              </StyledSelect>
            </FormControl>
          </Stack>
        </Stack>

        {loading ? (
          <Typography align="center">Carregando...</Typography>
        ) : paginatedRequests.length > 0 ? (
          <Stack spacing={2}>
            {paginatedRequests.map((group, index) => (
              <Accordion
                key={`${group.turma}-${group.disciplina}-${index}`}
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
                        {group.turma} ({group.disciplina})
                      </Typography>
                    </Box>
                    <Chip
                      label={group.status}
                      color={getStatusColor(group.status)}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {group.requests.map((request, idx) => (
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
                          <strong>Tipo:</strong> {request.tipo}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{ fontSize: "1rem" }}
                        >
                          <strong>Quantidade de Aulas:</strong> {request.quantidade}
                        </Typography>
                        {request.tipo === "Reposição" && request.referenteData !== "N/A" ? (
                          <Typography
                            variant="subtitle2"
                            gutterBottom
                            sx={{ fontSize: "1rem" }}
                          >
                            <strong>Data de Reposição:</strong>{" "}
                            {new Date(`${request.data}T00:00:00`).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </Typography>
                        ) : (
                          <Typography
                            variant="subtitle2"
                            gutterBottom
                            sx={{ fontSize: "1rem" }}
                          >
                            <strong>Data:</strong>{" "}
                            {new Date(`${request.data}T00:00:00`).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </Typography>
                        )}
                        {request.tipo === "Reposição" && request.referenteData !== "N/A" && (
                          <Typography
                            variant="subtitle2"
                            gutterBottom
                            sx={{ fontSize: "1rem" }}
                          >
                            <strong>Data da Ausência:</strong> {request.dataAusencia}
                          </Typography>
                        )}
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
                          {request.fileLink && (
                            <IconButton
                              size="small"
                              onClick={() => window.open(request.fileLink, "_blank")}
                              sx={{ color: INSTITUTIONAL_COLOR }}
                            >
                              <Link fontSize="small" />
                            </IconButton>
                          )}
                        </Typography>
                        {request.observacao !== "N/A" && (
                          <Typography
                            variant="subtitle2"
                            gutterBottom
                            sx={{ fontSize: "1rem" }}
                          >
                            <strong>Observação:</strong> {request.observacao}
                          </Typography>
                        )}
                        {request.observationCoordinator !== "N/A" && (
                          <Typography
                            variant="subtitle2"
                            gutterBottom
                            sx={{ fontSize: "1rem" }}
                          >
                            <strong>Justificativa:</strong>{" "}
                            {request.observationCoordinator}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        ) : (
          <Typography variant="h6" color="text.secondary" align="center" mt={15}>
            Não foram encontradas solicitações.
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

export default TeacherClassReschedulesList;