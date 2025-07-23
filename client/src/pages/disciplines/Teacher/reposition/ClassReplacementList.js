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
import ClassReplacementTable from './ClassReplacementTable';
import { CustomAlert } from '../../../../components/alert/CustomAlert';
import { StyledSelect } from '../../../../components/inputs/Input';

// Dados fictícios para simular a API
const mockReplacements = [
  {
    id: 1,
    professor: 'João Silva',
    professorId: 'prof1',
    coordinatorId: 'coord1',
    turma: 'Turma A',
    disciplina: 'Matemática',
    quantidade: '2',
    data: '2025-07-20',
    fileName: 'ficha_reposicao_1.pdf',
    observacao: 'Reposição devido a ausência',
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
    fileName: 'ficha_reposicao_2.pdf',
    observacao: 'Reposição para recuperação',
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
    fileName: 'ficha_reposicao_3.pdf',
    observacao: 'Reposição de aula extra',
    isActive: true,
    status: 'Pendente',
  },
];

const ClassReplacementList = () => {
  const [replacements, setReplacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filter states
  const [filterTurma, setFilterTurma] = useState('all');
  const [filterDisciplina, setFilterDisciplina] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [openToggleActiveDialog, setOpenToggleActiveDialog] = useState(false);
  const [replacementToToggleActive, setReplacementToToggleActive] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const navigate = useNavigate();

  const accessType = localStorage.getItem('accessType') || 'Professor';

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    const fetchReplacements = () => {
      try {
        setLoading(true);
        let replacementsArray = mockReplacements.map((item) => ({
          ...item,
          professor: item.professor || 'Desconhecido',
          turma: item.turma || 'Desconhecido',
          disciplina: item.disciplina || 'Desconhecido',
          status: item.status || 'Pendente',
        }));
        replacementsArray.sort((a, b) => {
          const turmaA = a.turma.toLowerCase();
          const turmaB = b.turma.toLowerCase();
          return turmaA.localeCompare(turmaB);
        });
        setReplacements(replacementsArray);
      } catch (error) {
        console.error('Erro ao carregar reposições fictícias:', error);
        setAlert({
          message: 'Erro ao carregar reposições.',
          type: 'error',
        });
        setReplacements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReplacements();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filterTurma, filterDisciplina, filterPeriod, filterStatus]);

  const handleRegisterOrUpdate = (updatedReplacement, isEditMode) => {
    try {
      if (isEditMode) {
        setReplacements(replacements.map((a) => (a.id === updatedReplacement.id ? { ...updatedReplacement, status: 'Pendente' } : a)).sort((a, b) => {
          const turmaA = a.turma.toLowerCase();
          const turmaB = b.turma.toLowerCase();
          return turmaA.localeCompare(turmaB);
        }));
        setAlert({
          message: `Reposição para ${updatedReplacement.turma} atualizada com sucesso!`,
          type: 'success',
        });
      } else {
        const newReplacement = {
          ...updatedReplacement,
          id: replacements.length + 1,
          isActive: true,
          status: 'Pendente',
          professorId: localStorage.getItem('username') || 'professor',
          coordinatorId: 'coord1',
        };
        setReplacements([...replacements, newReplacement].sort((a, b) => {
          const turmaA = a.turma.toLowerCase();
          const turmaB = b.turma.toLowerCase();
          return turmaA.localeCompare(turmaB);
        }));
        setAlert({
          message: `Reposição para ${updatedReplacement.turma} cadastrada com sucesso!`,
          type: 'success',
        });
      }
      setPage(1);
      navigate('/class-reposition');
    } catch (error) {
      console.error('Erro ao atualizar lista de reposições:', error);
      setAlert({
        message: 'Erro ao atualizar a lista de reposições.',
        type: 'error',
      });
    }
  };

  const handleEditReplacement = (replacement) => {
    navigate(`/class-reposition/edit/${replacement.id}`);
  };

  const handleApprove = (replacementId) => {
    try {
      setReplacements(replacements.map((a) =>
        a.id === replacementId ? { ...a, status: 'Aprovado' } : a
      ));
      setAlert({
        message: 'Reposição aprovada com sucesso!',
        type: 'success',
      });
    } catch (error) {
      console.error('Erro ao aprovar reposição:', error);
      setAlert({
        message: 'Erro ao aprovar reposição.',
        type: 'error',
      });
    }
  };

  const handleReject = (replacementId) => {
    try {
      setReplacements(replacements.map((a) =>
        a.id === replacementId ? { ...a, status: 'Rejeitado' } : a
      ));
      setAlert({
        message: 'Reposição rejeitada com sucesso!',
        type: 'success',
      });
    } catch (error) {
      console.error('Erro ao rejeitar reposição:', error);
      setAlert({
        message: 'Erro ao rejeitar reposição.',
        type: 'error',
      });
    }
  };

  const handleToggleActiveClick = (replacementId) => {
    const replacement = replacements.find((a) => a.id === replacementId);
    setReplacementToToggleActive(replacement);
    setOpenToggleActiveDialog(true);
  };

  const handleConfirmToggleActive = () => {
    try {
      setReplacements(replacements.map((a) =>
        a.id === replacementToToggleActive.id
          ? { ...a, isActive: !a.isActive }
          : a
      ).sort((a, b) => {
        const turmaA = a.turma.toLowerCase();
        const turmaB = b.turma.toLowerCase();
        return turmaA.localeCompare(turmaB);
      }));
      setAlert({
        message: `Reposição para ${replacementToToggleActive.turma} ${replacementToToggleActive.isActive ? 'inativada' : 'ativada'} com sucesso!`,
        type: 'success',
      });
      setPage(1);
    } catch (error) {
      console.error('Erro ao ativar/inativar reposição:', error);
      setAlert({
        message: 'Erro ao ativar/inativar reposição.',
        type: 'error',
      });
    } finally {
      setOpenToggleActiveDialog(false);
      setReplacementToToggleActive(null);
    }
  };

  const handleGoBack = () => {
    navigate('/class-reschedule-options');
  };

  // Get unique options for filters
  const turmas = [...new Set(replacements.map(a => a.turma))].sort();
  const disciplinas = [...new Set(replacements.map(a => a.disciplina))].sort();

  const applyFilters = (data) => {
    let filtered = Array.isArray(data) ? [...data] : [];

    // Filter by Turma
    if (filterTurma !== 'all') {
      filtered = filtered.filter((rep) => rep.turma === filterTurma);
    }

    // Filter by Disciplina
    if (filterDisciplina !== 'all') {
      filtered = filtered.filter((rep) => rep.disciplina === filterDisciplina);
    }

    // Filter by Status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((rep) => rep.status === filterStatus);
    }

    // Filter by Period (Date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filtered = filtered.filter(rep => {
      if (!rep.data) return false;
      const repDate = new Date(rep.data + 'T00:00:00');

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
        default: // 'all'
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
          Reposições de Aula
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
          onClick={() => navigate('/class-reposition/register')}
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
          Cadastrar Reposição
        </Button>
      </Stack>

      <ClassReplacementTable
        replacements={paginatedReplacements}
        onArchive={handleToggleActiveClick}
        onUpdate={handleEditReplacement}
        onApprove={accessType === 'Coordenador' ? handleApprove : undefined}
        onReject={accessType === 'Coordenador' ? handleReject : undefined}
        setAlert={setAlert}
        accessType={accessType}
      />

      <DeleteConfirmationDialog
        open={openToggleActiveDialog}
        onClose={() => {
          setOpenToggleActiveDialog(false);
          setReplacementToToggleActive(null);
        }}
        onConfirm={handleConfirmToggleActive}
        message={`Deseja realmente ${replacementToToggleActive?.isActive ? 'inativar' : 'ativar'} a reposição para "${replacementToToggleActive?.turma}"?`}
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

export default ClassReplacementList;