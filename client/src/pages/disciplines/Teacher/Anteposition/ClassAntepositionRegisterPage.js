import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import SideBar from "../../../../components/SideBar";
import ClassAntepositionRegister from './ClassAntepositionRegister'; // O formulário de registro

const ClassAntepositionRegisterPage = ({ setAuthenticated, setAlert }) => { // Adicione setAlert aqui
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <SideBar setAuthenticated={setAuthenticated} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* Agora o ClassAntepositionRegister é o conteúdo principal da página */}
        <ClassAntepositionRegister setAlert={setAlert} /> {/* Passa setAlert para o formulário */}
      </Box>
    </Box>
  );
};

export default ClassAntepositionRegisterPage;