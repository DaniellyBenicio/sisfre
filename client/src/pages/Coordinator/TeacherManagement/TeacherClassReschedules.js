import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  CssBaseline,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import DeleteConfirmationDialog from "../../../components/DeleteConfirmationDialog";
import ClassAntepositionTable from "../../disciplines/Teacher/Anteposition/ClassAntepositionTable";
import { CustomAlert } from "../../../components/alert/CustomAlert";
import { StyledSelect } from "../../../components/inputs/Input";
import api from "../../../service/api";
import Sidebar from "../../../components/SideBar";

const INSTITUTIONAL_COLOR = "#307c34";

const StyledButton = styled(Button)(() => ({
  textTransform: "none",
  fontWeight: "bold",
  backgroundColor: INSTITUTIONAL_COLOR,
  "&:hover": { backgroundColor: "#26692b" },
}));

const TeacherClassReschedules = ({ setAuthenticated }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filterTurma, setFilterTurma] = useState("all");
  const [filterDisciplina, setFilterDisciplina] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const accessType = localStorage.getItem("accessType") || "Professor";

  // CORREÇÃO: Extrai o userId e converte para número imediatamente.
  const { userId: userIdFromState } = location.state || {};
  const userId = userIdFromState ? Number(userIdFromState) : null;

  const handleAlertClose = () => {
    setAlert(null);
  };

  // Funções para buscar os dados da API com o userId corrigido
  const fetchRequests = async () => {
    try {
      setLoading(true);

      // CORREÇÃO: Constrói a URL de forma precisa e robusta
      let url = "/request";
      const queryParams = new URLSearchParams();
      queryParams.append("type[]", "anteposicao");
      queryParams.append("type[]", "reposicao");
      if (userId) {
        url = `/requests/teacher`;
        queryParams.append("userId", userId);
      }

      const response = await api.get(`${url}?${queryParams.toString()}`);

      const requestsArray = Array.isArray(response.data.requests)
        ? response.data.requests
            .map((item) => {
              const semesterNumber = item.semester
                ? item.semester.replace(/^S/, "") || "N/A"
                : "N/A";
              return {
                id: item.id,
                professor: item.professor?.username || "Desconhecido",
                professorId: item.userId,
                turma: item.acronym
                  ? `${item.acronym} - S${semesterNumber}`
                  : "Desconhecido",
                disciplina: item.discipline || "Desconhecido",
                turn: item.turn || "N/A",
                quantidade: item.quantity.toString(),
                data: item.date,
                fileName: item.annex ? item.annex.split("/").pop() : "N/A",
                observacao: item.observation || "N/A",
                observationCoordinator: item.observationCoordinator || "N/A",
                status:
                  item.validated === 1
                    ? "Aprovado"
                    : item.validated === 2
                    ? "Rejeitado"
                    : "Pendente",
                tipo:
                  item.type === "anteposicao"
                    ? "Anteposição"
                    : item.type === "reposicao"
                    ? "Reposição"
                    : "N/A",
              };
            })
            .sort((a, b) =>
              a.turma.toLowerCase().localeCompare(b.turma.toLowerCase())
            )
        : [];
      setRequests(requestsArray);
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error);
      setAlert({ message: "Erro ao carregar solicitações.", type: "error" });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userId]); // Dependência atualizada

  useEffect(() => {
    setPage(1);
  }, [
    filterTurma,
    filterDisciplina,
    filterPeriod,
    filterStatus,
    filterType,
    userId,
  ]);

  const handleView = (id) => {
    navigate(`/class-anteposition/view/${id}`);
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/request/anteposition/${id}`);
      setAlert({
        message: "Solicitação aprovada com sucesso! Créditos atualizados.",
        type: "success",
      });
      // Recarrega os dados após a aprovação
      await fetchRequests();
    } catch (error) {
      console.error("Erro ao aprovar solicitação:", error);
      setAlert({ message: "Erro ao aprovar solicitação.", type: "error" });
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/request/negate/anteposition/${id}`, {
        observationCoordinator: "Rejeitado pelo coordenador",
      });
      setAlert({
        message: "Solicitação rejeitada com sucesso!",
        type: "success",
      });
      // Recarrega os dados após a rejeição
      await fetchRequests();
    } catch (error) {
      console.error("Erro ao rejeitar solicitação:", error);
      setAlert({ message: "Erro ao rejeitar solicitação.", type: "error" });
    }
  };

  const handleDeleteClick = (request) => {
    setRequestToDelete(request);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/request/${requestToDelete.id}`);
      setAlert({
        message: `Solicitação para ${requestToDelete.turma} deletada com sucesso!`,
        type: "success",
      });
      setOpenDeleteDialog(false);
      setRequestToDelete(null);
      // Recarrega os dados após a exclusão
      await fetchRequests();
      setPage(1);
    } catch (error) {
      console.error("Erro ao deletar solicitação:", error);
      setAlert({ message: "Erro ao deletar solicitação.", type: "error" });
    }
  };

  const handleGoBack = () => {
    navigate("/teachers-management");
  };

  const turmas = [...new Set(requests.map((a) => a.turma))].sort();
  const disciplinas = [...new Set(requests.map((a) => a.disciplina))].sort();

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

    if (filterType !== "all") {
      filtered = filtered.filter((rep) => rep.tipo === filterType);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filtered = filtered.filter((rep) => {
      if (!rep.data) return false;
      const repDate = new Date(rep.data + "T00:00:00");

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

  const filteredRequests = applyFilters(requests);
  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);
  const paginatedRequests = filteredRequests.slice(
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
            Anteposições e Reposições
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
                <MenuItem value="all">Todos</MenuItem>
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
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="yesterday">Dia Anterior</MenuItem>
                <MenuItem value="lastWeek">Última Semana</MenuItem>
                <MenuItem value="lastMonth">Último Mês</MenuItem>
              </StyledSelect>
            </FormControl>
          </Stack>
        </Stack>

        {loading ? (
          <Typography align="center">Carregando...</Typography>
        ) : (
          <ClassAntepositionTable
            antepositions={paginatedRequests || []}
            setAlert={setAlert}
            onView={handleView}
            onDelete={handleDeleteClick}
            onApprove={accessType === "Coordenador" ? handleApprove : undefined}
            onReject={accessType === "Coordenador" ? handleReject : undefined}
            accessType={accessType}
          />
        )}

        <DeleteConfirmationDialog
          open={openDeleteDialog}
          onClose={() => {
            setOpenDeleteDialog(false);
            setRequestToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          message={`Deseja realmente deletar a solicitação para "${requestToDelete?.turma}"?`}
        />

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

export default TeacherClassReschedules;
