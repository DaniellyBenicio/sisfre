import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, useMediaQuery,
  IconButton, InputAdornment, Button
} from "@mui/material";
import { Edit, Delete, Search } from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import DeleteConfirmationDialog from "../../../components/DeleteConfirmationDialog";
import api from "../../../service/api";

const SearchBar = ({ value, onChange, sx }) => (
  <TextField
    value={value}
    onChange={onChange}
    placeholder="Buscar..."
    variant="outlined"
    sx={{
      ...sx,
      "& .MuiInputBase-root": { height: "35px", fontSize: "0.875rem" },
      borderRadius: '10px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ced4da' },
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#087619' },
      '& .MuiInputBase-input': { padding: '8px 12px' }
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

const StyledTableCell = styled(TableCell)({
  padding: '12px',
  textAlign: 'center',
  borderRight: '1px solid #e0e0e0',
  '&:last-child': { borderRight: 'none' }
});

const StyledTableHead = styled(TableHead)({
  backgroundColor: '#087619',
  '& th': {
    color: 'white',
    fontWeight: 'bold',
    padding: '12px',
    textAlign: 'center'
  },
});

const StyledTableRow = styled(TableRow)({
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
});

const CoursesTable = ({ courses, onDelete }) => (
  <TableContainer component={Paper} style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
    <Table>
      <StyledTableHead>
        <TableRow>
          <StyledTableCell>Sigla</StyledTableCell>
          <StyledTableCell>Nome</StyledTableCell>
          <StyledTableCell>Coordenador</StyledTableCell>
          <StyledTableCell>Tipo</StyledTableCell>
          <StyledTableCell>Ações</StyledTableCell>
        </TableRow>
      </StyledTableHead>
      <TableBody>
        {courses.map((course) => (
          <StyledTableRow key={course.id}>
            <StyledTableCell>{course.id}</StyledTableCell>
            <StyledTableCell>{course.coursename}</StyledTableCell>
            <StyledTableCell>{course.email}</StyledTableCell>
            <StyledTableCell>{course.accessType}</StyledTableCell>
            <StyledTableCell>
              <IconButton sx={{ mr: 1, color: '#087619' }}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton sx={{ color: '#FF1C1C' }} onClick={() => onDelete(course)}>
                <Delete fontSize="small" />
              </IconButton>
            </StyledTableCell>
          </StyledTableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const isMobileWidth = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Erro ao buscar cursos:", error);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.coursename.toLowerCase().includes(search.toLowerCase())
  );

  const handleRegister = (newCourse) => {
    setCourses((prev) => [...prev, newCourse]);
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/courses/${courseToDelete.id}`);
      setCourses(courses.filter((c) => c.id !== courseToDelete.id));
      console.log(`Curso ${courseToDelete.coursename} excluído.`);
    
    } catch (error) {
      console.error("Erro ao excluir curso:", error);
    } finally {
      setOpenDeleteDialog(false);
      setCourseToDelete(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
        Cursos
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mb: 2 }}>
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: isMobileWidth ? "100%" : "300px" }}
        />
        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          sx={{
            backgroundColor: '#087619',
            color: 'white',
            borderRadius: '10px',
            textTransform: 'none',
            padding: '8px 16px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
            '&:hover': { backgroundColor: '#056012' }
          }}
        >
          Cadastrar Curso
        </Button>
      </Box>

      <CoursesTable
        courses={filteredCourses}
        onDelete={handleDeleteClick}
      />

      {/*<CourseRegistrationPopup
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onRegister={handleRegister}
      />*/}

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar exclusão"
        message={`Deseja realmente excluir o curso "${courseToDelete?.coursename}"?`}
      />
    </Box>
  );
};

export default CourseList;