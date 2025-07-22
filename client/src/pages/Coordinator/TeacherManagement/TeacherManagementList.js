import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon, Visibility as VisibilityIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Importe o serviço ou API que buscará os dados dos professores
// Exemplo: import { getTeachersData } from '../../services/api'; 
// Substitua pelo caminho real do seu serviço de API

const TeacherManagementList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        // Simulação de chamada de API:
        // Substitua esta lógica pela sua chamada de API real
        const dummyData = [
          { id: 1, name: 'João Silva', email: 'joao.silva@escola.com', avatar: 'https://via.placeholder.com/40/087619/FFFFFF?text=JS' },
          { id: 2, name: 'Maria Souza', email: 'maria.souza@escola.com', avatar: 'https://via.placeholder.com/40/087619/FFFFFF?text=MS' },
          { id: 3, name: 'Carlos Santos', email: 'carlos.santos@escola.com', avatar: 'https://via.placeholder.com/40/087619/FFFFFF?text=CS' },
          { id: 4, name: 'Ana Pereira', email: 'ana.pereira@escola.com', avatar: 'https://via.placeholder.com/40/087619/FFFFFF?text=AP' },
        ];
        // const response = await getTeachersData(); // Use sua função de API real aqui
        // setTeachers(response.data); // Ajuste conforme a estrutura da sua resposta
        
        setTimeout(() => { // Simula um atraso de rede
          setTeachers(dummyData);
          setLoading(false);
        }, 1000);

      } catch (err) {
        setError("Erro ao carregar os dados dos professores. Tente novamente mais tarde.");
        setLoading(false);
        console.error("Erro ao buscar professores:", err);
      }
    };

    fetchTeachers();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewTeacherDetails = (teacherId) => {
    // Implemente a navegação para uma página de detalhes do professor
    // ou abra um modal com mais informações sobre faltas, reposições, etc.
    console.log(`Ver detalhes do professor com ID: ${teacherId}`);
    // Exemplo de navegação (se você tiver react-router-dom):
    // navigate(`/teacher-details/${teacherId}`);
  };

  const handleBackClick = () => {
    navigate('/teachers-management/options');
  };

  return (
    <Box sx={{ mt: 4, width: '100%', position: 'relative' }}>
      <IconButton
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          color: '#087619',
        }}
        aria-label="back"
        onClick={handleBackClick}
      >
        <ArrowBackIcon sx={{ fontSize: '2.5rem' }} />
      </IconButton>
      <Typography 
        variant="h5" 
        component="h1" 
        gutterBottom 
        sx={{ 
          color: '#000000', 
          fontWeight: 'bold', 
          textAlign: 'center' 
        }}
      >
        Gestão de Docentes
      </Typography>
    </Box>
  );
};

export default TeacherManagementList;