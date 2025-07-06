import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import DeleteConfirmationDialog from '../../../components/DeleteConfirmationDialog';
import api from '../../../service/api';
import SearchAndCreateBar from '../../../components/homeScreen/SearchAndCreateBar';
import ClassFormDialog from '../../../components/classForm/ClassFormDialog';
import ClassesTable from './ClassesTable';
import { CustomAlert } from '../../../components/alert/CustomAlert';
import Paginate from '../../../components/paginate/Paginate';

const ClassesList = () => {
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openToggleActiveDialog, setOpenToggleActiveDialog] = useState(false);
  const [classToToggleActive, setClassToToggleActive] = useState(null);
  const [classToEdit, setClassToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/classes-all?includeInactive=true');
        let classesArray = Array.isArray(response.data)
          ? response.data
          : response.data.classes || response.data.data || [];
        classesArray = classesArray.map((item) => ({
          ...item,
          course: item.course || { id: item.courseId, name: 'Desconhecido' },
        }));
        console.log('Turmas recebidas da API:', classesArray.map(c => ({
          courseClassId: c.courseClassId,
          course: c.course.name,
          isActive: c.isActive
        })));
        classesArray.sort((a, b) => {
          const courseNameA = a.course.name.toLowerCase();
          const courseNameB = b.course.name.toLowerCase();
          const semesterA = parseInt(a.semester.replace('S', '')) || 0;
          const semesterB = parseInt(b.semester.replace('S', '')) || 0;
          if (courseNameA !== courseNameB) {
            return courseNameA.localeCompare(courseNameB);
          }
          return semesterA - semesterB;
        });
        setClasses(classesArray);
      } catch (error) {
        console.error('Erro ao buscar turmas:', error.message, error.response?.data);
        setAlert({
          message: 'Erro ao buscar turmas.',
          type: 'error',
        });
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleRegisterOrUpdate = (updatedClass, isEditMode) => {
    try {
      if (isEditMode) {
        setClasses(classes.map((c) => (c.courseClassId === updatedClass.courseClassId ? updatedClass : c)).sort((a, b) => {
          const courseNameA = a.course.name.toLowerCase();
          const courseNameB = b.course.name.toLowerCase();
          const semesterA = parseInt(a.semester.replace('S', '')) || 0;
          const semesterB = parseInt(b.semester.replace('S', '')) || 0;
          if (courseNameA !== courseNameB) {
            return courseNameA.localeCompare(courseNameB);
          }
          return semesterA - semesterB;
        }));
        setAlert({
          message: `Turma ${updatedClass.course.name} atualizada com sucesso!`,
          type: 'success',
        });
      } else {
        setClasses([...classes, updatedClass].sort((a, b) => {
          const courseNameA = a.course.name.toLowerCase();
          const courseNameB = b.course.name.toLowerCase();
          const semesterA = parseInt(a.semester.replace('S', '')) || 0;
          const semesterB = parseInt(b.semester.replace('S', '')) || 0;
          if (courseNameA !== courseNameB) {
            return courseNameA.localeCompare(courseNameB);
          }
          return semesterA - semesterB;
        }));
        setAlert({
          message: `Turma ${updatedClass.course.name} cadastrada com sucesso!`,
          type: 'success',
        });
      }
      setOpenDialog(false);
      setClassToEdit(null);
      setPage(1);
    } catch (error) {
      console.error('Erro ao atualizar lista de turmas:', error);
      setAlert({
        message: 'Erro ao atualizar a lista de turmas.',
        type: 'error',
      });
    }
  };

  const handleEditClass = (classItem) => {
    setClassToEdit(classItem);
    setOpenDialog(true);
  };

  const handleToggleActiveClick = (courseClassId) => {
    const classItem = classes.find((c) => c.courseClassId === courseClassId);
    console.log('Turma recebida para ativar/inativar:', classItem);
    console.log('ID da turma a ser ativada/inativada:', courseClassId);
    setClassToToggleActive(classItem);
    setOpenToggleActiveDialog(true);
  };

  const handleConfirmToggleActive = async () => {
    try {
      const response = await api.delete(`/classes/${classToToggleActive.courseClassId}`);
      console.log('Resposta da API ao ativar/inativar:', response.data);
      setClasses(classes.map((c) => 
        c.courseClassId === classToToggleActive.courseClassId 
          ? { ...c, isActive: response.data.class.isActive } 
          : c
      ).sort((a, b) => {
        const courseNameA = a.course.name.toLowerCase();
        const courseNameB = b.course.name.toLowerCase();
        const semesterA = parseInt(a.semester.replace('S', '')) || 0;
        const semesterB = parseInt(b.semester.replace('S', '')) || 0;
        if (courseNameA !== courseNameB) {
          return courseNameA.localeCompare(courseNameB);
        }
        return semesterA - semesterB;
      }));
      setAlert({
        message: response.data.message,
        type: 'success',
      });
      setPage(1);
    } catch (error) {
      console.error('Erro ao ativar/inativar turma:', error.message, error.response?.data);
      const errorMessage =
        error.response?.status === 401
          ? 'Você não está autorizado a ativar/inativar turmas.'
          : error.response?.status === 403
            ? 'Apenas administradores podem ativar/inativar turmas.'
            : error.response?.data?.error || 'Erro ao ativar/inativar turma.';
      setAlert({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setOpenToggleActiveDialog(false);
      setClassToToggleActive(null);
    }
  };

  const filteredClasses = Array.isArray(classes)
    ? classes.filter((classItem) => {
        const normalizedSearch = search.trim().toLowerCase();
        const normalizedCourse = classItem.course?.name?.toLowerCase() || '';
        const normalizedSemester = classItem.semester?.toLowerCase() || '';
        return (
          normalizedCourse.includes(normalizedSearch) ||
          normalizedSemester.includes(normalizedSearch)
        );
      })
    : [];

  const totalPages = Math.ceil(filteredClasses.length / rowsPerPage);
  const paginatedClasses = filteredClasses.slice(
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
        Turmas
      </Typography>

      <SearchAndCreateBar
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        createButtonLabel='Cadastrar Turma'
        onCreateClick={() => {
          setClassToEdit(null);
          setOpenDialog(true);
        }}
      />

      <ClassesTable
        classes={paginatedClasses}
        onArchive={handleToggleActiveClick}
        onUpdate={handleEditClass}
        search={search}
        setAlert={setAlert}
      />

      <ClassFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setClassToEdit(null);
        }}
        classToEdit={classToEdit}
        onSubmitSuccess={handleRegisterOrUpdate}
        isEditMode={!!classToEdit}
        setAlert={setAlert}
      />

      <DeleteConfirmationDialog
        open={openToggleActiveDialog}
        onClose={() => {
          setOpenToggleActiveDialog(false);
          setClassToToggleActive(null);
        }}
        onConfirm={handleConfirmToggleActive}
        message={`Deseja realmente ${classToToggleActive?.isActive ? 'inativar' : 'ativar'} a turma "${classToToggleActive?.course.name}"?`}
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

export default ClassesList;