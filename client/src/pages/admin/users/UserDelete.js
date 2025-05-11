import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import api from '../../../service/api';

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
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: '5px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', padding: '16px 24px' }}>
        <Warning sx={{ color: '#FF9800', mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
          Deseja realmente excluir esse usuário?
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ padding: '20px 24px' }}>
        <Typography>
          Esta ação não pode ser desfeita. O usuário {userName} será removido permanentemente.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px', justifyContent: 'flex-end' }}>
        <Button
          onClick={handleDelete}
          sx={{
            backgroundColor: '#4CAF50',
            color: 'white',
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: '5px',
            '&:hover': {
              backgroundColor: '#388E3C',
            },
            mr: 1,
            px: 2,
          }}
        >
          Sim
        </Button>
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: '#f44336',
            color: 'white',
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: '5px',
            '&:hover': {
              backgroundColor: '#d32f2f',
            },
            px: 2,
          }}
        >
          Não
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDelete;