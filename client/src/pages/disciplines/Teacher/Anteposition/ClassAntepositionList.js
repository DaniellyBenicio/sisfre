import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import DeleteConfirmationDialog from '../../../../components/DeleteConfirmationDialog';
import ClassAntepositionTable from './ClassAntepositionTable';
import { CustomAlert } from '../../../../components/alert/CustomAlert';
import { StyledSelect } from '../../../../components/inputs/Input';

// Dados fictícios para simular a API
const mockAntepositions = [
  {
    id: 1,
    professor: 'João Silva',
    professorId: 'prof1',
    coordinatorId: 'coord1',
    turma: 'Turma A',
    disciplina: 'Matemática',
    quantidade: '2',
    data: '2025-07-20',
    fileName: 'ficha_aula_1.pdf',
    observacao: 'Aula remarcada devido a feriado',
    isActive: true,
    status: 'Pendente',
  },
  {
    id: 2,
    professor: 'Maria Oliveira',
    professorId: 'prof2',
    coordinatorId: 'coord1',
    turma: 'Turma B',
    disciplina: 'Português',
    quantidade: '1',
    data: '2025-07-22',
    fileName: 'ficha_aula_2.pdf',
    observacao: 'Aula antecipada para revisão',
    isActive: false,
    status: 'Aprovado',
  },
  {
    id: 3,
    professor: 'Carlos Souza',
    professorId: 'prof3',
    coordinatorId: 'coord1',
    turma: 'Turma C',
    disciplina: 'História',
    quantidade: '3',
    data: '2025-07-25',
    fileName: 'ficha_aula_3.pdf',
    observacao: 'Aula extra para reforço',
    isActive: true,
    status: 'Pendente',
  },
];

const ClassAntepositionList = () => {
  const [antepositions, setAntepositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filter states, now aligned with the FrequencyList structure
  const [filterTurma, setFilterTurma] = useState('all');
  const [filterDisciplina, setFilterDisciplina] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [openToggleActiveDialog, setOpenToggleActiveDialog] = useState(false);
  const [antepositionToToggleActive, setAntepositionToToggleActive] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const navigate = useNavigate();

  const accessType = localStorage.getItem('accessType') || 'Professor';

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    const fetchAntepositions = () => {
      try {
        setLoading(true);
        let antepositionsArray = mockAntepositions.map((item) => ({
          ...item,
          professor: item.professor || 'Desconhecido',
          turma: item.turma || 'Desconhecido',
          disciplina: item.disciplina || 'Desconhecido',
          status: item.status || 'Pendente',
        }));
        antepositionsArray.sort((a, b) => {
          const turmaA = a.turma.toLowerCase();
          const turmaB = b.turma.toLowerCase();
          return turmaA.localeCompare(turmaB);
        });
        setAntepositions(antepositionsArray);
      } catch (error) {
        console.error('Erro ao carregar anteposições fictícias:', error);
        setAlert({
          message: 'Erro ao carregar anteposições.',
          type: 'error',
        });
        setAntepositions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAntepositions();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filterTurma, filterDisciplina, filterPeriod, filterStatus]);

  const handleRegisterOrUpdate = (updatedAnteposition, isEditMode) => {
    try {
      if (isEditMode) {
        setAntepositions(antepositions.map((a) => (a.id === updatedAnteposition.id ? { ...updatedAnteposition, status: 'Pendente' } : a)).sort((a, b) => {
          const turmaA = a.turma.toLowerCase();
          const turmaB = b.turma.toLowerCase();
          return turmaA.localeCompare(turmaB);
        }));
        setAlert({
          message: `Anteposição para ${updatedAnteposition.turma} atualizada com sucesso!`,
          type: 'success',
        });
      } else {
        const newAnteposition = {
          ...updatedAnteposition,
          id: antepositions.length + 1,
          isActive: true,
          status: 'Pendente',
          professorId: localStorage.getItem('username') || 'professor',
          coordinatorId: 'coord1',
        };
        setAntepositions([...antepositions, newAnteposition].sort((a, b) => {
          const turmaA = a.turma.toLowerCase();
          const turmaB = b.turma.toLowerCase();
          return turmaA.localeCompare(turmaB);
        }));
        setAlert({
          message: `Anteposição para ${updatedAnteposition.turma} cadastrada com sucesso!`,
          type: 'success',
        });
      }
      setPage(1);
      navigate('/class-anteposition');
    } catch (error) {
      console.error('Erro ao atualizar lista de anteposições:', error);
      setAlert({
        message: 'Erro ao atualizar a lista de anteposições.',
        type: 'error',
      });
    }
  };

  const handleEditAnteposition = (anteposition) => {
    navigate(`/anteposition/edit/${anteposition.id}`);
  };

  const handleApprove = (antepositionId) => {
    try {
      setAntepositions(antepositions.map((a) =>
        a.id === antepositionId ? { ...a, status: 'Aprovado' } : a
      ));
      setAlert({
        message: 'Anteposição aprovada com sucesso!',
        type: 'success',
      });
    } catch (error) {
      console.error('Erro ao aprovar anteposição:', error);
      setAlert({
        message: 'Erro ao aprovar anteposição.',
        type: 'error',
      });
    }
  };

  const handleReject = (antepositionId) => {
    try {
      setAntepositions(antepositions.map((a) =>
        a.id === antepositionId ? { ...a, status: 'Rejeitado' } : a
      ));
      setAlert({
        message: 'Anteposição rejeitada com sucesso!',
        type: 'success',
      });
    } catch (error) {
      console.error('Erro ao rejeitar anteposição:', error);
      setAlert({
        message: 'Erro ao rejeitar anteposição.',
        type: 'error',
      });
    }
  };

  const handleToggleActiveClick = (antepositionId) => {
    const anteposition = antepositions.find((a) => a.id === antepositionId);
    setAntepositionToToggleActive(anteposition);
    setOpenToggleActiveDialog(true);
  };

  const handleConfirmToggleActive = () => {
    try {
      setAntepositions(antepositions.map((a) =>
        a.id === antepositionToToggleActive.id
          ? { ...a, isActive: !a.isActive }
          : a
      ).sort((a, b) => {
        const turmaA = a.turma.toLowerCase();
        const turmaB = b.turma.toLowerCase();
        return turmaA.localeCompare(turmaB);
      }));
      setAlert({
        message: `Anteposição para ${antepositionToToggleActive.turma} ${antepositionToToggleActive.isActive ? 'inativada' : 'ativada'} com sucesso!`,
        type: 'success',
      });
      setPage(1);
    } catch (error) {
      console.error('Erro ao ativar/inativar anteposição:', error);
      setAlert({
        message: 'Erro ao ativar/inativar anteposição.',
        type: 'error',
      });
    } finally {
      setOpenToggleActiveDialog(false);
      setAntepositionToToggleActive(null);
    }
  };

  const handleGoBack = () => {
    navigate('/class-reschedule-options'); // Botão de voltar para a página de opções
  };

  // Get unique options for filters
  const turmas = [...new Set(antepositions.map(a => a.turma))].sort();
  const disciplinas = [...new Set(antepositions.map(a => a.disciplina))].sort();

  const applyFilters = (data) => {
    let filtered = Array.isArray(data) ? [...data] : [];

    // Filter by Turma
    if (filterTurma !== 'all') {
      filtered = filtered.filter((ante) => ante.turma === filterTurma);
    }

    // Filter by Disciplina
    if (filterDisciplina !== 'all') {
      filtered = filtered.filter((ante) => ante.disciplina === filterDisciplina);
    }

    // Filter by Status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((ante) => ante.status === filterStatus);
    }

    // Filter by Period (Date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filtered = filtered.filter(ante => {
      if (!ante.data) return false;
      const anteDate = new Date(ante.data + 'T00:00:00');

      switch (filterPeriod) {
        case "yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          return anteDate.toDateString() === yesterday.toDateString();
        case "lastWeek":
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);
          return anteDate >= lastWeek && anteDate <= today;
        case "lastMonth":
          const lastMonth = new Date(today);
          lastMonth.setMonth(today.getMonth() - 1);
          return anteDate >= lastMonth && anteDate <= today;
        default: // 'all'
          return true;
      }
    });

    return filtered;
  };

  const filteredAntepositions = applyFilters(antepositions);

  const totalPages = Math.ceil(filteredAntepositions.length / rowsPerPage);
  const paginatedAntepositions = filteredAntepositions.slice(
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
    <Box
      sx={{
        p: 3,
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', mb: 3 }}>
        <IconButton
          onClick={handleGoBack}
          sx={{
            position: 'absolute',
            left: 0,
            color: '#307c34',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
        >
          <ArrowBack sx={{ fontSize: 35 }} />
        </IconButton>
        <Typography
          variant='h5'
          align='center'
          gutterBottom
          sx={{ fontWeight: 'bold', flexGrow: 1 }}
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
                <MenuItem key={turma} value={turma}>{turma}</MenuItem>
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
                <MenuItem key={disciplina} value={disciplina}>{disciplina}</MenuItem>
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
            </StyledSelect>
          </FormControl>
        </Stack>

        <Button
          variant="contained"
          onClick={() => navigate('/anteposition/register')}
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
          Cadastrar Anteposição
        </Button>
      </Stack>

      <ClassAntepositionTable
        antepositions={paginatedAntepositions}
        onArchive={handleToggleActiveClick}
        onUpdate={handleEditAnteposition}
        onApprove={accessType === 'Coordenador' ? handleApprove : undefined}
        onReject={accessType === 'Coordenador' ? handleReject : undefined}
        setAlert={setAlert}
        accessType={accessType}
      />

      <DeleteConfirmationDialog
        open={openToggleActiveDialog}
        onClose={() => {
          setOpenToggleActiveDialog(false);
          setAntepositionToToggleActive(null);
        }}
        onConfirm={handleConfirmToggleActive}
        message={`Deseja realmente ${antepositionToToggleActive?.isActive ? 'inativar' : 'ativar'} a anteposição para "${antepositionToToggleActive?.turma}"?`}
      />

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
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