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

const UserDelete = ({ open, onClose, onConfirm, userName }) => {
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
        {/* O nome do usuário não aparece na imagem, então removi essa parte */}
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px', justifyContent: 'flex-end' }}>
        <Button
          onClick={onConfirm} // Corrigido: "Sim" agora chama onConfirm
          sx={{
            backgroundColor: '#4CAF50', // Cor do botão "Sim"
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
          onClick={onClose} // Corrigido: "Não" agora chama onClose
          sx={{
            backgroundColor: '#f44336', // Cor do botão "Não"
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