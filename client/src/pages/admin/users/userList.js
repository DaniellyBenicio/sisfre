import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import UserRegistrationPopup from './UserResgistrationPopup';
import UserDelete from './UserDelete';
import UserUpdatePopup from './UserUpdatePopup';
import api from '../../../service/api';
import UsersTable from './UsersTable';

const SearchBar = ({ value, onChange }) => (
  <TextField
    value={value}
    onChange={onChange}
    placeholder='Buscar...'
    variant='outlined'
    sx={{
      width: '400px',
      '& .MuiInputBase-root': {
        height: '36px',
      },
      '& .MuiOutlinedInput-root': {
        '&.Mui-focused fieldset': {
          borderColor: '#087619',
        },
      },
    }}
    InputProps={{
      startAdornment: (
        <InputAdornment position='start'>
          <Search />
        </InputAdornment>
      ),
    }}
  />
);

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/all');
      console.log('UserList - Resposta da API:', response.data);
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
      setUsers([]);
    }
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) =>
        user.username.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleRegister = (newUser) => {
    console.log('UserList - Novo usuário adicionado:', newUser);
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  const handleEdit = (user) => {
    console.log('UserList - Usuário para edição:', user);
    setUserToEdit(user);
    setOpenUpdateDialog(true);
  };

  const handleUpdate = (updatedUser) => {
    console.log('UserList - Usuário atualizado:', updatedUser);
    setUsers((prevUsers) => {
      const newUsers = prevUsers.map((user) =>
        String(user.id) === String(updatedUser.id) ? updatedUser : user
      );
      console.log('UserList - Nova lista de usuários:', newUsers);
      console.log('UserList - filteredUsers após atualização:', newUsers.filter((user) =>
        user.username.toLowerCase().includes(search.toLowerCase())
      ));
      return newUsers;
    });
    setOpenUpdateDialog(false);
    setUserToEdit(null);
  };

  const handleDelete = (userId) => {
    console.log('UserList - Usuário para deleção:', userId);
    setUserToDelete(users.find((u) => u.id === userId));
    setOpenDeleteDialog(true);
  };

  const handleDeleteSuccess = (userId) => {
    console.log('UserList - Usuário deletado:', userId);
    fetchUsers();
  };

  return (
    <Box padding={3}>
      <Typography variant='h5' align='center' gutterBottom sx={{ mb: 3 }}>
        Usuários
      </Typography>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        marginBottom={2}
        gap={2}
      >
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button
          variant='contained'
          onClick={() => setOpenDialog(true)}
          sx={{
            backgroundColor: '#087619',
            '&:hover': { backgroundColor: '#065412' },
            textTransform: 'none',
          }}
        >
          Cadastrar Usuário
        </Button>
      </Box>
      <UsersTable users={filteredUsers} onDelete={handleDelete} onUpdate={handleEdit} />
      <UserRegistrationPopup
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onRegister={handleRegister}
      />
      <UserUpdatePopup
        open={openUpdateDialog}
        onClose={() => {
          setOpenUpdateDialog(false);
          setUserToEdit(null);
        }}
        user={userToEdit}
        onUpdate={handleUpdate}
      />
      <UserDelete
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setUserToDelete(null);
        }}
        userId={userToDelete ? userToDelete.id : null}
        userName={userToDelete ? userToDelete.username : ''}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </Box>
  );
};

export default UserList;