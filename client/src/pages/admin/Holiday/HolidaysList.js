import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import DeleteConfirmationDialog from '../../../components/DeleteConfirmationDialog';
import api from '../../../service/api';
import HolidayFormDialog from "../../../components/HolidayForm/HolidayFormDialog";
import HolidaysTable from './HolidaysTable';
import CustomAlert from "../../../components/alert/CustomAlert";

const HolidaysList = () => {
  const [holidays, setHolidays] = useState([]);
  const [year, setYear] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [holidayToEdit, setHolidayToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const handleAlertClose = () => {
    setAlert(null);
  };

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const queryParams = {};
      if (year) queryParams.year = year;
      if (typeFilter) queryParams.type = typeFilter;
      const response = await api.get('/holidays', { params: queryParams });
      setHolidays(response.data.holidays || []);
    } catch (error) {
      console.error('Erro ao buscar feriados:', error);
      setAlert({ message: 'Erro ao buscar feriados.', type: 'error' });
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [year, typeFilter]);

  const handleRegisterOrUpdate = (updatedHoliday, isEditMode) => {
    try {
      if (isEditMode) {
        setHolidays(holidays.map((h) => (h.id === updatedHoliday.id ? updatedHoliday : h)));
        setAlert({
          message: `Feriado "${updatedHoliday.name}" atualizado com sucesso!`,
          type: 'success',
        });
      } else {
        setHolidays([...holidays, updatedHoliday]);
        setAlert({
          message: `Feriado "${updatedHoliday.name}" cadastrado com sucesso!`,
          type: 'success',
        });
      }
      setOpenFormDialog(false);
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
    setOpenFormDialog(true);
  };

  // Função atualizada para aceitar o ID do feriado, semelhante ao SaturdaySchoolList
  const handleDeleteClick = (holidayId) => {
    const holiday = holidays.find((h) => h.id === holidayId);
    console.log("Feriado recebido para exclusão:", holiday);
    console.log("ID do feriado a ser excluído:", holidayId);
    setHolidayToDelete(holiday);
    setOpenDeleteDialog(true);
  };

  // Função atualizada para manter consistência com SaturdaySchoolList
  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/holidays/${holidayToDelete.id}`);
      setHolidays((prev) => prev.filter((h) => h.id !== holidayToDelete.id));
      setAlert({
        message: `Feriado "${holidayToDelete.name}" excluído com sucesso!`,
        type: 'success',
      });
    } catch (error) {
      console.error("Erro ao excluir feriado:", error.message, error.response?.data);
      const errorMessage =
        error.response?.status === 401
          ? "Você não está autorizado a excluir feriados."
          : error.response?.status === 403
          ? "Apenas administradores podem excluir feriados."
          : error.response?.data?.error || "Erro ao excluir feriado.";
      setAlert({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setOpenDeleteDialog(false);
      setHolidayToDelete(null);
    }
  };

  const filteredHolidays = holidays;

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

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

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl
            sx={{
              minWidth: 200,
              '& .MuiInputBase-root': {
                height: 36,
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
            }}
          >
            <InputLabel id="year-filter-label">Ano</InputLabel>
            <Select
              labelId="year-filter-label"
              value={year}
              label="Ano"
              onChange={(e) => setYear(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#000000',
                },
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              {years.map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            sx={{
              minWidth: 200,
              '& .MuiInputBase-root': {
                height: 36,
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
            }}
          >
            <InputLabel id="type-filter-label">Tipo</InputLabel>
            <Select
              labelId="type-filter-label"
              value={typeFilter}
              label="Tipo"
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#000000',
                },
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="NACIONAL">Nacional</MenuItem>
              <MenuItem value="ESTADUAL">Estadual</MenuItem>
              <MenuItem value="MUNICIPAL">Municipal</MenuItem>
              <MenuItem value="INSTITUCIONAL">Institucional</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            setHolidayToEdit(null);
            setOpenFormDialog(true);
          }}
          sx={{
            backgroundColor: '#087619',
            '&:hover': { backgroundColor: '#065412' },
            textTransform: 'none',
            width: '200px',
            height: '36px',
            fontWeight: 'bold',
          }}
        >
          Cadastrar Feriado
        </Button>
      </Box>

      <HolidaysTable
        holidays={filteredHolidays}
        onDelete={handleDeleteClick}
        onUpdate={handleEditHoliday}
        search={null}
        setAlert={setAlert}
        loading={loading}
      />

      <HolidayFormDialog
        open={openFormDialog}
        onClose={() => {
          setOpenFormDialog(false);
          setHolidayToEdit(null);
        }}
        holidayToEdit={holidayToEdit}
        onSubmitSuccess={handleRegisterOrUpdate}
        isEditMode={!!holidayToEdit}
      />

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setHolidayToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        message={`Deseja realmente excluir o feriado "${holidayToDelete?.name || "Desconhecido"}"?`}
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