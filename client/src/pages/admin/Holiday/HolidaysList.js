import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import DeleteConfirmationDialog from '../../../components/DeleteConfirmationDialog';
import api from '../../../service/api';
import SearchAndCreateBar from '../../../components/homeScreen/SearchAndCreateBar';
import HolidayFormDialog from "../../../components/HolidayForm/HolidayFormDialog"; 
import HolidaysTable from './HolidaysTable';
import { CustomAlert } from '../../../components/alert/CustomAlert';

const HolidaysList = () => {
  const [holidays, setHolidays] = useState([]);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [holidayToEdit, setHolidayToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const response = await api.get('/holidays?limit=1000'); // Ajuste a rota conforme sua API
        console.log('Resposta da API /holidays:', response.data);

        let holidaysArray = Array.isArray(response.data)
          ? response.data
          : response.data.holidays || response.data.data || [];

        setHolidays(holidaysArray);
      } catch (error) {
        console.error('Erro ao buscar feriados:', error.message, error.response?.data);
        setAlert({
          message: 'Erro ao buscar feriados.',
          type: 'error',
        });
        setHolidays([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, []);

  const handleRegisterOrUpdate = (updatedHoliday, isEditMode) => {
    try {
      if (isEditMode) {
        setHolidays(holidays.map((h) => (h.id === updatedHoliday.id ? updatedHoliday : h)));
        setAlert({
          message: `Feriado de ${updatedHoliday.date} atualizado com sucesso!`,
          type: 'success',
        });
      } else {
        setHolidays([...holidays, updatedHoliday]);
        setAlert({
          message: `Feriado de ${updatedHoliday.date} cadastrado com sucesso!`,
          type: 'success',
        });
      }
      setOpenDialog(false);
      setHolidayToEdit(null);
    } catch (error) {
      console.error('Erro ao atualizar lista de feriados:', error);
      setAlert({
        message: 'Erro ao atualizar a lista de feriados.',
        type: 'error',
      });
    }
  };

  const handleEditHoliday = (holidayItem) => {
    setHolidayToEdit(holidayItem);
    setOpenDialog(true);
  };

  const handleDeleteClick = (holidayId) => {
    const holidayItem = holidays.find((h) => h.id === holidayId);
    console.log('Feriado recebido para exclusão:', holidayItem);
    console.log('ID do feriado a ser excluído:', holidayId);
    setHolidayToDelete(holidayItem);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/holidays/${holidayToDelete.id}`); // Ajuste a rota conforme sua API
      setHolidays(holidays.filter((h) => h.id !== holidayToDelete.id));
      setAlert({
        message: `Feriado de ${holidayToDelete.date} excluído com sucesso!`,
        type: 'success',
      });
    } catch (error) {
      console.error('Erro ao excluir feriado:', error.message, error.response?.data);
      const errorMessage =
        error.response?.status === 401
          ? 'Você não está autorizado a excluir feriados.'
          : error.response?.status === 403
          ? 'Apenas administradores podem excluir feriados.'
          : error.response?.data?.error || 'Erro ao excluir feriado.';
      setAlert({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setOpenDeleteDialog(false);
      setHolidayToDelete(null);
    }
  };

  const filteredHolidays = Array.isArray(holidays)
    ? holidays.filter((holidayItem) => {
        const normalizedSearch = search.trim().toLowerCase();
        const normalizedDate = holidayItem.date?.toLowerCase() || '';
        const normalizedObservation = holidayItem.observation?.toLowerCase() || '';
        return (
          normalizedDate.includes(normalizedSearch) ||
          normalizedObservation.includes(normalizedSearch)
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
        Feriados
      </Typography>

      <SearchAndCreateBar
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        createButtonLabel='Cadastrar Feriado'
        onCreateClick={() => {
          setHolidayToEdit(null);
          setOpenDialog(true);
        }}
      />

      <HolidaysTable
        holidays={filteredHolidays}
        onDelete={handleDeleteClick}
        onUpdate={handleEditHoliday}
        search={search}
        setAlert={setAlert}
      />

      <HolidayFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setHolidayToEdit(null);
        }}
        holidayToEdit={holidayToEdit}
        onSubmitSuccess={handleRegisterOrUpdate}
        isEditMode={!!holidayToEdit}
        setAlert={setAlert}
      />

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setHolidayToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        message={`Deseja realmente excluir o feriado de "${holidayToDelete?.date}"?`}
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

export default HolidaysList;