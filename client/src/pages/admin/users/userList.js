import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { Edit, Delete, Search } from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import UserRegistrationPopup from "./UserResgistrationPopup"; 


const SearchBar = ({ value, onChange, sx }) => (
  <TextField
    value={value}
    onChange={onChange}
    placeholder="Buscar..."
    variant="outlined"
    sx={{
      ...sx,
      "& .MuiInputBase-root": {
        height: "35px",
        fontSize: "0.875rem",
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
      }
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
  textAlign: 'center'
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: '#087619',
  '& th': {
    color: 'white',
    fontWeight: 'bold',
    padding: '12px',
    textAlign: 'center' 
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const UsersTable = ({ users, isMobileWidth }) => {
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
          {users.map((user) => (
            <StyledTableRow key={user.id}>
              <StyledTableCell>{user.id}</StyledTableCell>
              <StyledTableCell>{user.username}</StyledTableCell>
              <StyledTableCell>{user.email}</StyledTableCell>
              <StyledTableCell>{user.accessType}</StyledTableCell>
              <StyledTableCell>
                <IconButton aria-label="Editar" sx={{ mr: 1, color: '#087619' }}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton aria-label="Excluir" sx={{ color: '#FF1C1C' }}>
                  <Delete fontSize="small" />
                </IconButton>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Componente Principal
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false); 
  const isMobileWidth = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const fetchUsers = async () => {
      const data = [
        { id: 'JO', username: "José Olinda", email: "jolinda@ifce.edu.br", accessType: "Coordenador" },
        { id: 'SI', username: "Silvano", email: "silvano@ifce.edu.br", accessType: "Diretor Ensino" },
        { id: 'JA', username: "Jamires Costa", email: "fcosta@ifce.edu.br", accessType: "Professor" },
        { id: 'PE', username: "Pedro Barbosa", email: "plbs@ifce.edu.br", accessType: "Professor" },
        { id: 'SA', username: "Saulo Lima", email: "saulol@ifce.edu.br", accessType: "Professor" },
        { id: 'MI', username: "Michael Bastos", email: "michaelbast@ifce.edu.br", accessType: "Professor" },
      ];
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );


  const handleRegister = (userData) => {
    console.log('Dados do usuário a serem registrados:', userData);
    
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" align="center" gutterBottom style={{ fontWeight: 'bold', color: '#2c3e50' }}>
        Usuários
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mb: 2 }}>
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: isMobileWidth ? "100%" : "300px" }}
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
            padding: '8px 16px'
          }}
          onClick={() => setOpenDialog(true)} 
        >
          Cadastrar Usuário
        </Button>
      </Box>
      <UsersTable
        users={filteredUsers}
        isMobileWidth={isMobileWidth}
      />

      <UserRegistrationPopup
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        onRegister={handleRegister} 
      />
    </Box>
  );
};

export default UserList;
