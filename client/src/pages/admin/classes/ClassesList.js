import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import DeleteConfirmationDialog from '../../../components/DeleteConfirmationDialog';
import api from '../../../service/api';
import SearchAndCreateBar from '../../../components/homeScreen/SearchAndCreateBar';
import ClassFormDialog from '../../../components/classForm/ClassFormDialog';
import ClassesTable from './ClassesTable';
import { CustomAlert } from '../../../components/alert/CustomAlert';

const ClassesList = () => {
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [classToEdit, setClassToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/classes');
        console.log('Resposta da API /classes:', response.data);

        let classesArray = Array.isArray(response.data)
          ? response.data
          : response.data.classes || response.data.data || [];
        
        // Normaliza os dados
        classesArray = classesArray.map((item) => ({
          ...item,
          course: item.course || { id: item.courseId, name: 'Desconhecido' },
        }));

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

  const handleRegisterOrUpdate = (updatedClass, isEditMode) => {
    try {
      if (isEditMode) {
        setClasses(classes.map((c) => (c.id === updatedClass.id ? updatedClass : c)));
        setAlert({
          message: `Turma ${updatedClass.course.name} atualizada com sucesso!`,
          type: 'success',
        });
      } else {
        setClasses([...classes, updatedClass]);
        setAlert({
          message: `Turma ${updatedClass.course.name} cadastrada com sucesso!`,
          type: 'success',
        });
      }
      setOpenDialog(false);
      setClassToEdit(null);
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

  const handleDeleteClick = (classId) => {
    const classItem = classes.find((c) => c.id === classId);
    console.log('Turma recebida para exclusão:', classItem);
    console.log('ID da turma a ser excluída:', classId);
    setClassToDelete(classItem);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Chama a rota DELETE /classes/:id com autenticação
      await api.delete(`/classes/${classToDelete.id}`);
      setClasses(classes.filter((c) => c.id !== classToDelete.id));
      setAlert({
        message: `Turma ${classToDelete.course.name} excluída com sucesso!`,
        type: 'success',
      });
    } catch (error) {
      console.error('Erro ao excluir turma:', error.message, error.response?.data);
      const errorMessage =
        error.response?.status === 401
          ? 'Você não está autorizado a excluir turmas.'
          : error.response?.status === 403
          ? 'Apenas administradores podem excluir turmas.'
          : error.response?.data?.error || 'Erro ao excluir turma.';
      setAlert({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setOpenDeleteDialog(false);
      setClassToDelete(null);
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
        classes={filteredClasses}
        onDelete={handleDeleteClick}
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
      />

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setClassToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        message={`Deseja realmente excluir a turma "${classToDelete?.course.name}"?`}
      />

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