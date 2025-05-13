import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, useMediaQuery,
  IconButton, InputAdornment, Button, CircularProgress
} from "@mui/material";
import { Edit, Delete, Search } from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import DeleteConfirmationDialog from "../../../components/DeleteConfirmationDialog";
import api from "../../../service/api";
import CourseModal from "../../../components/CourseModal";

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
        {courses.length === 0 ? (
          <TableRow>
            <StyledTableCell colSpan={5}>Nenhum curso encontrado</StyledTableCell>
          </TableRow>
        ) : (
          courses.map((course) => (
            <StyledTableRow key={course.id}>
              <StyledTableCell>{course.acronym}</StyledTableCell>
              <StyledTableCell>{course.name}</StyledTableCell>
              <StyledTableCell>{course.coordinatorName || course.coordinatorId || 'N/A'}</StyledTableCell>
              <StyledTableCell>
                {course.type === 'G' ? 'Graduação' : course.type === 'T' ? 'Técnico' : 'Integrado'}
              </StyledTableCell>
              <StyledTableCell>
                <IconButton sx={{ mr: 1, color: '#087619' }}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton sx={{ color: '#FF1C1C' }} onClick={() => onDelete(course)}>
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

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobileWidth = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const [coursesResponse, usersResponse] = await Promise.all([
          api.get("/courses"),
          api.get("/users")
        ]);
        console.log("Resposta da API /courses:", coursesResponse.data);
        console.log("Resposta da API /users:", usersResponse.data);

        let courses = coursesResponse.data;
        if (!Array.isArray(courses)) {
          console.warn("coursesResponse.data não é um array:", courses);
          courses = courses.courses || courses.data || [];
        }

        let users = usersResponse.data;
        if (!Array.isArray(users)) {
          console.warn("usersResponse.data não é um array:", users);
          users = users.users || users.data || [];
        }

        const coursesWithCoordinators = courses.map(course => ({
          ...course,
          coordinatorName: users.find(user => user.id === course.coordinatorId)?.username || 'N/A'
        }));

        setCourses(coursesWithCoordinators);
        if (courses.length === 0) {
          console.warn("Nenhum curso encontrado na resposta da API");
        }
        if (users.length === 0) {
          console.warn("Nenhum usuário encontrado na resposta da API");
        }
      } catch (error) {
        console.error("Erro ao buscar cursos:", error.message, error.response?.data);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = Array.isArray(courses)
    ? courses.filter(
        (course) =>
          course.name &&
          course.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleRegister = async (newCourse) => {
    console.log('Novo curso registrado:', newCourse);
    try {
      const [coursesResponse, usersResponse] = await Promise.all([
        api.get("/courses"),
        api.get("/users")
      ]);
      console.log("Resposta da API /courses após registro:", coursesResponse.data);
      console.log("Resposta da API /users após registro:", usersResponse.data);

      let courses = coursesResponse.data;
      if (!Array.isArray(courses)) {
        console.warn("coursesResponse.data não é um array:", courses);
        courses = courses.courses || courses.data || [];
      }

      let users = usersResponse.data;
      if (!Array.isArray(users)) {
        console.warn("usersResponse.data não é um array:", users);
        users = users.users || users.data || [];
      }

      const coursesWithCoordinators = courses.map(course => ({
        ...course,
        coordinatorName: users.find(user => user.id === course.coordinatorId)?.username || 'N/A'
      }));
      setCourses(coursesWithCoordinators);
    } catch (error) {
      console.error("Erro ao refetch cursos após registro:", error.message, error.response?.data);
      setCourses((prev) => [...prev, {
        ...newCourse,
        coordinatorName: newCourse.coordinatorId ? prev.find(c => c.coordinatorId === newCourse.coordinatorId)?.coordinatorName || 'N/A' : 'N/A'
      }]);
    }
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/courses/${courseToDelete.id}`);
      setCourses(courses.filter((c) => c.id !== courseToDelete.id));
      console.log(`Curso ${courseToDelete.name} excluído.`);
    } catch (error) {
      console.error("Erro ao excluir curso:", error);
    } finally {
      setOpenDeleteDialog(false);
      setCourseToDelete(null);
    }
  };

  return (
    <Box sx={{ p: 5 }}>
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

      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <CoursesTable
          courses={filteredCourses}
          onDelete={handleDeleteClick}
        />
      )}

      <CourseModal
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onUpdate={handleRegister}
      />

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar exclusão"
        message={`Deseja realmente excluir o curso "${courseToDelete?.name}"?`}
      />
    </Box>
  );
};

export default CourseList;