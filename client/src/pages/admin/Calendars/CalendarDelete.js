import React, { useState } from 'react';
import api from "../../../service/api";
import DeleteConfirmationDialog from "../../../components/DeleteConfirmationDialog";
import { CustomAlert } from "../../../components/alert/CustomAlert";

const CalendarDelete = ({ open, onClose, calendarId, calendarName, onDeleteSuccess }) => {
  const [alert, setAlert] = useState(null);

  const handleDelete = async () => {
    if (!calendarId) {
      console.error('Erro: calendarId não fornecido');
      setAlert({
        message: 'Erro: ID do calendário não fornecido. Tente novamente.',
        type: 'error',
      });
      return;
    }

    try {
      const response = await api.delete(`/calendar/${calendarId}`);

      if (response.status === 200) {
        setAlert({
          message: 'Calendário deletado com sucesso!',
          type: 'success',
        });
        if (onDeleteSuccess) {
          onDeleteSuccess(calendarId);
        }
        onClose();
      } else {
        console.error('Resposta inesperada da API:', response.data);
        setAlert({
          message: 'Erro ao deletar calendário. Verifique os dados e tente novamente.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao deletar calendário:', error.message);
      if (error.response) {
        console.error('Status do erro:', error.response.status);
        console.error('Detalhes do erro da API:', error.response.data);
        const errorMessage = error.response.data.error || 'Erro desconhecido.';
        if (error.response.status === 403) {
          setAlert({
            message: 'Erro: Você não tem permissão para deletar este calendário.',
            type: 'error',
          });
        } else if (error.response.status === 404) {
          setAlert({
            message: 'Erro: Calendário não encontrado.',
            type: 'error',
          });
        } else {
          setAlert({
            message: `Erro ao deletar calendário: ${errorMessage}`,
            type: 'error',
          });
        }
      } else if (error.request) {
        console.error('Sem resposta do servidor:', error.request);
        setAlert({
          message: 'Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.',
          type: 'error',
        });
      } else {
        console.error('Erro na configuração da requisição:', error.message);
        setAlert({
          message: 'Erro inesperado. Tente novamente.',
          type: 'error',
        });
      }
    }
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  return (
    <>
      <DeleteConfirmationDialog
        open={open}
        onClose={onClose}
        message={`Deseja realmente excluir o calendário '${calendarName}'?`}
        onConfirm={handleDelete}
        userName=""
      />
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={handleAlertClose}
        />
      )}
    </>
  );
};

export default CalendarDelete;