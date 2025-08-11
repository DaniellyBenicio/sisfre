import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { styled } from '@mui/material/styles';
import DeleteConfirmationDialog from '../../../../components/DeleteConfirmationDialog';
import ClassReplacementTable from './ClassReplacementTable';
import { CustomAlert } from '../../../../components/alert/CustomAlert';
import { StyledSelect } from '../../../../components/inputs/Input';
import api from '../../../../service/api';

const INSTITUTIONAL_COLOR = '#307c34';

const StyledButton = styled(Button)(() => ({
  textTransform: 'none',
  fontWeight: 'bold',
  backgroundColor: INSTITUTIONAL_COLOR,
  '&:hover': { backgroundColor: '#26692b' },
}));

const ClassReplacementList = () => {
  const [replacements, setReplacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filterTurma, setFilterTurma] = useState('all');
  const [filterDisciplina, setFilterDisciplina] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [replacementToDelete, setReplacementToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const navigate = useNavigate();
  const location = useLocation();
  const accessType = localStorage.getItem('accessType') || 'Professor';

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    const fetchReplacements = async () => {
      try {
        setLoading(true);
        const response = await api.get('/request', { params: { type: 'reposicao' } });
        const replacementsArray = Array.isArray(response.data.requests)
          ? response.data.requests.map((item) => ({
              id: item.id,
              professor: item.professor?.username || 'Desconhecido',
              professorId: item.userId,
              turma: item.course || 'Desconhecido',
              disciplina: item.discipline || 'Desconhecido',
              turn: item.turn || 'N/A',
              quantidade: item.quantity.toString(),
              data: item.date,
              fileName: item.annex ? item.annex.split('/').pop() : 'N/A',
              observacao: item.observation || 'N/A',
              observationCoordinator: item.observationCoordinator || 'N/A',
              status: item.validated === 1 ? 'Aprovado' : item.validated === 2 ? 'Rejeitado' : 'Pendente',
            })).sort((a, b) => a.turma.toLowerCase().localeCompare(b.turma.toLowerCase()))
          : [];
        setReplacements(replacementsArray);
      } catch (error) {
        console.error('Erro ao carregar reposições:', error);
        setAlert({ message: 'Erro ao carregar reposições.', type: 'error' });
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

  const handleView = (id) => {
    navigate(`/class-reposition/view/${id}`);
  };

  const handleApprove = async (id) => {
    try {
      // Adicionado body para garantir que validated seja setado para 1
      await api.put(`/request/reposition/${id}`, { validated: 1 });
      setAlert({ message: 'Reposição aprovada com sucesso! Créditos atualizados.', type: 'success' });
      // Recarrega a lista
      const response = await api.get('/request', { params: { type: 'reposicao' } });
      setReplacements(
        Array.isArray(response.data.requests)
          ? response.data.requests.map((item) => ({
              id: item.id,
              professor: item.professor?.username || 'Desconhecido',
              professorId: item.userId,
              turma: item.course || 'Desconhecido',
              disciplina: item.discipline || 'Desconhecido',
              turn: item.turn || 'N/A',
              quantidade: item.quantity.toString(),
              data: item.date,
              fileName: item.annex ? item.annex.split('/').pop() : 'N/A',
              observacao: item.observation || 'N/A',
              observationCoordinator: item.observationCoordinator || 'N/A',
              status: item.validated === 1 ? 'Aprovado' : item.validated === 2 ? 'Rejeitado' : 'Pendente',
            }))
          : []
      );
    } catch (error) {
      console.error('Erro ao aprovar reposição:', error.response?.data || error);
      setAlert({ message: error.response?.data?.error || 'Erro ao aprovar reposição. Verifique o backend.', type: 'error' });
    }
  };

  const handleReject = async (id) => {
    try {
      // Mudado o endpoint para um padrão (removido /negate/), e adicionado validated: 2 no body
      await api.put(`/request/${id}`, {
        validated: 2,
        observationCoordinator: 'Rejeitado pelo coordenador',
      });
      setAlert({ message: 'Reposição rejeitada com sucesso!', type: 'success' });
      // Recarrega a lista
      const response = await api.get('/request', { params: { type: 'reposicao' } });
      setReplacements(
        Array.isArray(response.data.requests)
          ? response.data.requests.map((item) => ({
              id: item.id,
              professor: item.professor?.username || 'Desconhecido',
              professorId: item.userId,
              turma: item.course || 'Desconhecido',
              disciplina: item.discipline || 'Desconhecido',
              turn: item.turn || 'N/A',
              quantidade: item.quantity.toString(),
              data: item.date,
              fileName: item.annex ? item.annex.split('/').pop() : 'N/A',
              observacao: item.observation || 'N/A',
              observationCoordinator: item.observationCoordinator || 'N/A',
              status: item.validated === 1 ? 'Aprovado' : item.validated === 2 ? 'Rejeitado' : 'Pendente',
            }))
          : []
      );
    } catch (error) {
      console.error('Erro ao rejeitar reposição:', error.response?.data || error);
      setAlert({ message: error.response?.data?.error || 'Erro ao rejeitar reposição. Verifique o backend.', type: 'error' });
    }
  };

  const handleDeleteClick = (replacement) => {
    setReplacementToDelete(replacement);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/request/${replacementToDelete.id}`);
      setAlert({
        message: `Reposição para ${replacementToDelete.turma} deletada com sucesso!`,
        type: 'success',
      });
      const response = await api.get('/request', { params: { type: 'reposicao' } });
      setReplacements(
        Array.isArray(response.data.requests)
          ? response.data.requests.map((item) => ({
              id: item.id,
              professor: item.professor?.username || 'Desconhecido',
              professorId: item.userId,
              turma: item.course || 'Desconhecido',
              disciplina: item.discipline || 'Desconhecido',
              turn: item.turn || 'N/A',
              quantidade: item.quantity.toString(),
              data: item.date,
              fileName: item.annex ? item.annex.split('/').pop() : 'N/A',
              observacao: item.observation || 'N/A',
              observationCoordinator: item.observationCoordinator || 'N/A',
              status: item.validated === 1 ? 'Aprovado' : item.validated === 2 ? 'Rejeitado' : 'Pendente',
            }))
          : []
      );
      setPage(1);
    } catch (error) {
      console.error('Erro ao deletar reposição:', error);
      setAlert({ message: 'Erro ao deletar reposição.', type: 'error' });
    } finally {
      setOpenDeleteDialog(false);
      setReplacementToDelete(null);
    }
  };

  const handleGoBack = () => {
    navigate('/class-reschedule-options');
  };

  const turmas = [...new Set(replacements.map((a) => a.turma))].sort();
  const disciplinas = [...new Set(replacements.map((a) => a.disciplina))].sort();

  const applyFilters = (data) => {
    let filtered = Array.isArray(data) ? [...data] : [];

    if (filterTurma !== 'all') {
      filtered = filtered.filter((rep) => rep.turma === filterTurma);
    }

    if (filterDisciplina !== 'all') {
      filtered = filtered.filter((rep) => rep.disciplina === filterDisciplina);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((rep) => rep.status === filterStatus);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filtered = filtered.filter((rep) => {
      if (!rep.data) return false;
      const repDate = new Date(rep.data + 'T00:00:00');

      switch (filterPeriod) {
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          return repDate.toDateString() === yesterday.toDateString();
        case 'lastWeek':
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);
          return repDate >= lastWeek && repDate <= today;
        case 'lastMonth':
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
    width: { xs: '100%', sm: '150px' },
    '& .MuiInputBase-root': {
      height: { xs: 40, sm: 36 },
      display: 'flex',
      alignItems: 'center',
    },
    '& .MuiInputLabel-root': {
      transform: 'translate(14px, 7px) scale(1)',
      '&.Mui-focused, &.MuiInputLabel-shrink': {
        transform: 'translate(14px, -6px) scale(0.75)',
        color: '#000000',
      },
    },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      height: '100% !important',
    },
  };

  const commonSelectSx = {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 0, 0, 0.23)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#000000',
    },
  };

  const commonMenuProps = {
    PaperProps: {
      sx: {
        maxHeight: '200px',
        overflowY: 'auto',
        width: 'auto',
        '& .MuiMenuItem-root': {
          '&:hover': {
            backgroundColor: '#D5FFDB',
          },
          '&.Mui-selected': {
            backgroundColor: '#E8F5E9',
            '&:hover': {
              backgroundColor: '#D5FFDB',
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
            color: INSTITUTIONAL_COLOR,
            '&:hover': { backgroundColor: 'transparent' },
          }}
        >
          <ArrowBack sx={{ fontSize: 35 }} />
        </IconButton>
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontWeight: 'bold', flexGrow: 1 }}
        >
          Reposições de Aula
        </Typography>
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ mb: 2 }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
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
          onClick={() => navigate('/class-reposition/register')}
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: '200px' },
            height: { xs: 40, sm: 36 },
            fontWeight: 'bold',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            whiteSpace: 'nowrap',
          }}
        >
          Cadastrar reposição
        </StyledButton>
      </Stack>

      {loading ? (
        <Typography align="center">Carregando...</Typography>
      ) : (
        <ClassReplacementTable
          replacements={paginatedReplacements || []}
          setAlert={setAlert}
          onView={handleView}
          onDelete={handleDeleteClick}
          onApprove={accessType === 'Coordenador' ? handleApprove : undefined}
          onReject={accessType === 'Coordenador' ? handleReject : undefined}
          accessType={accessType}
        />
      )}

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setReplacementToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        message={`Deseja realmente deletar a reposição para "${replacementToDelete?.turma}"?`}
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