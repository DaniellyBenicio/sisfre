import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import SearchAndCreateBar from '../../../components/homeScreen/SearchAndCreateBar';
import DeleteConfirmationDialog from '../../../components/DeleteConfirmationDialog';
import api from '../../../service/api';
import ClassesTable from './ClassesTable';
import ClassFormDialog from '../../../components/classForm/ClassFormDialog';
import { CustomAlert } from '../../../components/alert/CustomAlert';

const ClassesList = () => {
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [classToEdit, setClassToEdit] = useState(null);
  const [alert, setAlert] = useState(null);

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/classes');
        console.log('ClassesList - Resposta da API:', response.data);
        let classesArray = Array.isArray(response.data)
          ? response.data
          : response.data.classes || [];
        // Normaliza os dados para garantir a estrutura correta
        classesArray = classesArray.map(item => ({
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
      }
    };
    fetchClasses();
  }, []);

  const handleRegisterOrUpdateSuccess = (updatedClass, isEditMode) => {
    console.log('ClassesList - Turma recebida:', updatedClass, 'EditMode:', isEditMode);
    try {
      if (isEditMode) {
        setClasses(classes.map(c => (c.id === updatedClass.id ? updatedClass : c)));
        setAlert({
          message: `Turma atualizada com sucesso!`,
          type: 'success',
        });
      } else {
        setClasses([...classes, updatedClass]);
        setAlert({
          message: `Turma cadastrada com sucesso!`,
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

  const handleEdit = (classItem) => {
    setClassToEdit(classItem);
    setOpenDialog(true);
  };

  const handleDeleteClick = (classId) => {
    const classItem = classes.find(c => c.id === classId);
    console.log('Turma recebida para exclusão:', classItem);
    console.log('ID da turma a ser excluída:', classId);
    setClassToDelete(classItem);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/classes/${classToDelete.id}`);
      setClasses(classes.filter(c => c.id !== classToDelete.id));
      setAlert({
        message: `Turma ${classToDelete.course.name} excluída com sucesso!`,
        type: 'success',
      });
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      setAlert({
        message: 'Erro ao excluir turma.',
        type: 'error',
      });
    } finally {
      setOpenDeleteDialog(false);
      setClassToDelete(null);
    }
  };

  const filteredClasses = Array.isArray(classes)
    ? classes.filter((classItem) => {
        const normalizedSearch = search
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        const normalizedCourse =
          classItem.course?.name
            ?.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') || '';

        const normalizedSemester =
          classItem.semester
            ?.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') || '';

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
        search={search}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        setAlert={setAlert}
      />

      <ClassFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setClassToEdit(null);
        }}
        classToEdit={classToEdit}
        onSubmitSuccess={handleRegisterOrUpdateSuccess}
        isEditMode={!!classToEdit}
      />

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
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