import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import DeleteConfirmationDialog from '../../../../components/DeleteConfirmationDialog';
import SearchAndCreateBar from '../../../../components/homeScreen/SearchAndCreateBar';
import ClassAntepositionTable from './ClassAntepositionTable';
import { CustomAlert } from '../../../../components/alert/CustomAlert';
import Paginate from '../../../../components/paginate/Paginate';

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
  const [search, setSearch] = useState('');
  const [openToggleActiveDialog, setOpenToggleActiveDialog] = useState(false);
  const [antepositionToToggleActive, setAntepositionToToggleActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const navigate = useNavigate();

  // Simula recuperação do accessType do localStorage
  const accessType = localStorage.getItem('accessType') || 'Professor';

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    // Simula a chamada à API com dados fictícios
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
        console.log('Anteposições fictícias:', antepositionsArray.map(a => ({
          id: a.id,
          professor: a.professor,
          turma: a.turma,
          disciplina: a.disciplina,
          isActive: a.isActive,
          status: a.status,
        })));
        antepositionsArray.sort((a, b) => {
          const professorA = a.professor.toLowerCase();
          const professorB = b.professor.toLowerCase();
          const turmaA = a.turma.toLowerCase();
          const turmaB = b.turma.toLowerCase();
          if (professorA !== professorB) {
            return professorA.localeCompare(professorB);
          }
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
  }, [search]);

  const handleRegisterOrUpdate = (updatedAnteposition, isEditMode) => {
    try {
      if (isEditMode) {
        setAntepositions(antepositions.map((a) => (a.id === updatedAnteposition.id ? { ...updatedAnteposition, status: 'Pendente' } : a)).sort((a, b) => {
          const professorA = a.professor.toLowerCase();
          const professorB = b.professor.toLowerCase();
          const turmaA = a.turma.toLowerCase();
          const turmaB = b.turma.toLowerCase();
          if (professorA !== professorB) {
            return professorA.localeCompare(professorB);
          }
          return turmaA.localeCompare(turmaB);
        }));
        setAlert({
          message: `Anteposição para ${updatedAnteposition.professor} atualizada com sucesso!`,
          type: 'success',
        });
      } else {
        const newAnteposition = {
          ...updatedAnteposition,
          id: antepositions.length + 1, // Simula um novo ID
          isActive: true, // Nova anteposição é ativa por padrão
          status: 'Pendente', // Nova anteposição começa como Pendente
          professorId: localStorage.getItem('username') || 'professor',
          coordinatorId: 'coord1', // Simula um coordenador fixo
        };
        setAntepositions([...antepositions, newAnteposition].sort((a, b) => {
          const professorA = a.professor.toLowerCase();
          const professorB = b.professor.toLowerCase();
          const turmaA = a.turma.toLowerCase();
          const turmaB = b.turma.toLowerCase();
          if (professorA !== professorB) {
            return professorA.localeCompare(professorB);
          }
          return turmaA.localeCompare(turmaB);
        }));
        setAlert({
          message: `Anteposição para ${updatedAnteposition.professor} cadastrada com sucesso!`,
          type: 'success',
        });
      }
      setPage(1);
      navigate('/anteposition'); // Volta para a lista após cadastro/edição
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
    console.log('Anteposição recebida para ativar/inativar:', anteposition);
    console.log('ID da anteposição a ser ativada/inativada:', antepositionId);
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
        const professorA = a.professor.toLowerCase();
        const professorB = b.professor.toLowerCase();
        const turmaA = a.turma.toLowerCase();
        const turmaB = b.turma.toLowerCase();
        if (professorA !== professorB) {
          return professorA.localeCompare(professorB);
        }
        return turmaA.localeCompare(turmaB);
      }));
      setAlert({
        message: `Anteposição para ${antepositionToToggleActive.professor} ${antepositionToToggleActive.isActive ? 'inativada' : 'ativada'} com sucesso!`,
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

  const filteredAntepositions = Array.isArray(antepositions)
    ? antepositions.filter((anteposition) => {
        const normalizedSearch = search.trim().toLowerCase();
        const normalizedProfessor = anteposition.professor?.toLowerCase() || '';
        const normalizedTurma = anteposition.turma?.toLowerCase() || '';
        const normalizedDisciplina = anteposition.disciplina?.toLowerCase() || '';
        const normalizedStatus = anteposition.status?.toLowerCase() || '';
        return (
          normalizedProfessor.includes(normalizedSearch) ||
          normalizedTurma.includes(normalizedSearch) ||
          normalizedDisciplina.includes(normalizedSearch) ||
          normalizedStatus.includes(normalizedSearch)
        );
      })
    : [];

  const totalPages = Math.ceil(filteredAntepositions.length / rowsPerPage);
  const paginatedAntepositions = filteredAntepositions.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

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
      <Typography
        variant='h5'
        align='center'
        gutterBottom
        sx={{ fontWeight: 'bold', mt: 2, mb: 2 }}
      >
        Anteposições de Aula
      </Typography>

      <SearchAndCreateBar
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        createButtonLabel='Cadastrar Anteposição'
        onCreateClick={() => navigate('/anteposition/register')}
      />

      <ClassAntepositionTable
        antepositions={paginatedAntepositions}
        onArchive={handleToggleActiveClick}
        onUpdate={handleEditAnteposition}
        onApprove={accessType === 'Coordenador' ? handleApprove : undefined}
        onReject={accessType === 'Coordenador' ? handleReject : undefined}
        search={search}
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
        message={`Deseja realmente ${antepositionToToggleActive?.isActive ? 'inativar' : 'ativar'} a anteposição para "${antepositionToToggleActive?.professor}"?`}
      />

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Paginate
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
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