import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  IconButton,
  InputAdornment,
  Button,
} from '@mui/material';
import { Edit, Delete, Search } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import UserRegistrationPopup from './UserResgistrationPopup';
import UserDelete from './UserDelete';
import api from "../../../service/api";

const SearchBar = ({ value, onChange, sx }) => (
  <TextField
    value={value}
    onChange={onChange}
    placeholder="Buscar..."
    variant="outlined"
    sx={{
      ...sx,
      '& .MuiInputBase-root': {
        height: '35px',
        fontSize: '0.875rem',
      },
      borderRadius: '10px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#ced4da',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#087619',
      },
      '& .MuiInputBase-input': {
        padding: '8px 12px',
      },
    }}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <Search sx={{ color: 'action.active' }} />
        </InputAdornment>
      ),
    }}
  />
);

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderRight: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderRight: 'none',
  },
  padding: '12px',
  textAlign: 'center',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: '#087619',
  '& th': {
    color: 'white',
    fontWeight: 'bold',
    padding: '12px',
    textAlign: 'center',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const UsersTable = ({ users, isMobileWidth, onDelete }) => {
  return (
    <TableContainer component={Paper} style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <Table>
        <StyledTableHead>
          <TableRow>
            <StyledTableCell>Cód.</StyledTableCell>
            <StyledTableCell>Nome</StyledTableCell>
            <StyledTableCell>Email</StyledTableCell>
            <StyledTableCell>Tipo</StyledTableCell>
            <StyledTableCell>Ações</StyledTableCell>
          </TableRow>
        </StyledTableHead>
        <TableBody>
          {users.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={5} sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body1" color="black">
                  Nenhum usuário cadastrado
                </Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            users.map((user) => (
              <StyledTableRow key={user.id}>
                <StyledTableCell>{user.id}</StyledTableCell>
                <StyledTableCell>{user.username}</StyledTableCell>
                <StyledTableCell>{user.email}</StyledTableCell>
                <StyledTableCell>{user.accessType}</StyledTableCell>
                <StyledTableCell>
                  <IconButton aria-label="Editar" sx={{ mr: 1, color: '#087619' }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="Excluir"
                    sx={{ color: '#FF1C1C' }}
                    onClick={() => onDelete(user)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const isMobileWidth = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/all');
      console.log('Resposta da API:', response.data); 
      if (!response.data || !Array.isArray(response.data.users)) {
        throw new Error('Erro ao buscar usuários: Dados inválidos');
      }
      setUsers(response.data.users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Dados do erro:', error.response.data);
      }
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleRegister = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
    console.log('Novo usuário adicionado à lista:', newUser);
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter((user) => user.id !== userToDelete.id));
      console.log(`Usuário ${userToDelete.username} excluído.`);
    }
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" align="center" gutterBottom style={{ fontWeight: 'bold', color: '#2c3e50' }}>
        Usuários
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: isMobileWidth ? '100%' : '300px' }}
        />
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#087619',
            color: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              backgroundColor: '#056012',
            },
            textTransform: 'none',
            padding: '8px 16px',
          }}
          onClick={() => setOpenDialog(true)}
        >
          Cadastrar Usuário
        </Button>
      </Box>
      <UsersTable
        users={filteredUsers}
        isMobileWidth={isMobileWidth}
        onDelete={handleDelete}
      />
      <UserRegistrationPopup
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onRegister={handleRegister}
      />
      <UserDelete
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        userName={userToDelete ? userToDelete.username : ''}
      />
    </Box>
  );
};

export default UserList;