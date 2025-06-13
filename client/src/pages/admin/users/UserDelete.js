// ClassSchedulePage
import React, { useState } from 'react';
import api from "../../../service/api";
import DeleteConfirmationDialog from "../../../components/DeleteConfirmationDialog";
import { CustomAlert } from "../../../components/alert/CustomAlert";

const UserDelete = ({ open, onClose, userId, userName, onDeleteSuccess }) => {
  const [alert, setAlert] = useState(null);

  const handleDelete = async () => {
    if (!userId) {
      console.error('Erro: userId não fornecido');
      setAlert({
        message: 'Erro: ID do usuário não fornecido. Tente novamente.',
        type: 'error',
      });
      return;
    }

    try {
      console.log(`Enviando requisição DELETE para /users/${userId}`);
      const response = await api.delete(`/users/${userId}`);
      console.log('Resposta da API:', response);

      if (response.status === 200) {
        setAlert({
          message: 'Usuário deletado com sucesso!',
          type: 'success',
        });
        if (onDeleteSuccess) {
          onDeleteSuccess(userId);
        }
        onClose();
      } else {
        console.error('Resposta inesperada da API:', response.data);
        setAlert({
          message: 'Erro ao deletar usuário. Verifique os dados e tente novamente.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error.message);
      if (error.response) {
        console.error('Status do erro:', error.response.status);
        console.error('Detalhes do erro da API:', error.response.data);
        const errorMessage = error.response.data.error || 'Erro desconhecido.';
        if (error.response.status === 403) {
          setAlert({
            message: 'Erro: Você não tem permissão para deletar este usuário.',
            type: 'error',
          });
        } else if (error.response.status === 404) {
          setAlert({
            message: 'Erro: Usuário não encontrado.',
            type: 'error',
          });
        } else {
          setAlert({
            message: `Erro ao deletar usuário: ${errorMessage}`,
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
        message={`Deseja realmente excluir o usuário '${userName}'?`}
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

export default UserDelete;