import React from 'react';
import api from "../../../service/api";
import DeleteConfirmationDialog from "../../../components/DeleteConfirmationDialog"; 

const UserDelete = ({ open, onClose, userId, userName, onDeleteSuccess }) => {
  const handleDelete = async () => {
    if (!userId) {
      console.error('Erro: userId não fornecido');
      alert('Erro: ID do usuário não fornecido. Tente novamente.');
      return;
    }

    try {
      console.log(`Enviando requisição DELETE para /users/${userId}`);
      const response = await api.delete(`/users/${userId}`);
      console.log('Resposta da API:', response);

      if (response.status === 200) {
        alert('Usuário deletado com sucesso!');
        if (onDeleteSuccess) {
          onDeleteSuccess(userId);
        }
        onClose();
      } else {
        console.error('Resposta inesperada da API:', response.data);
        alert('Erro ao deletar usuário. Verifique os dados e tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error.message);
      if (error.response) {
        console.error('Status do erro:', error.response.status);
        console.error('Detalhes do erro da API:', error.response.data);
        const errorMessage = error.response.data.error || 'Erro desconhecido.';
        if (error.response.status === 403) {
          alert('Erro: Você não tem permissão para deletar este usuário.');
        } else if (error.response.status === 404) {
          alert('Erro: Usuário não encontrado.');
        } else {
          alert(`Erro ao deletar usuário: ${errorMessage}`);
        }
      } else if (error.request) {
        console.error('Sem resposta do servidor:', error.request);
        alert('Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.');
      } else {
        console.error('Erro na configuração da requisição:', error.message);
        alert('Erro inesperado. Tente novamente.');
      }
    }
  };

  return (
    <DeleteConfirmationDialog
      open={open}
      onClose={onClose}
      message={`Deseja realmente excluir o usuário '${userName}'?`}
      onConfirm={handleDelete}
      userName=""
    />
  );
};

export default UserDelete;