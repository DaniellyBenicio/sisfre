import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { StyledSelect } from "../../../../components/inputs/Input";
import api from "../../../../service/api";

const MyAbsences = () => {
  const [absences, setAbsences] = useState([]);
  const [courses, setCourses] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterDiscipline, setFilterDiscipline] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estilos de tabela copiados de FrequenciesTable.js
  const tableHeadStyle = {
    fontWeight: "bold",
    backgroundColor: "#087619",
    color: "#fff",
    borderRight: "1px solid #fff",
    padding: { xs: "4px", sm: "6px" },
    height: "30px",
    lineHeight: "30px",
  };

  const tableBodyCellStyle = {
    borderRight: "1px solid #e0e0e0",
    padding: { xs: "4px", sm: "6px" },
    height: "30px",
    lineHeight: "30px",
  };

  const commonFormControlSx = {
    width: { xs: "100%", sm: "200px" },
    "& .MuiInputBase-root": {
      height: { xs: 40, sm: 36 },
      display: "flex",
      alignItems: "center",
    },
    "& .MuiInputLabel-root": {
      transform: "translate(14px, 7px) scale(1)",
      "&.Mui-focused, &.MuiInputLabel-shrink": {
        transform: "translate(14px, -6px) scale(0.75)",
        color: "#000000",
      },
    },
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      height: "100% !important",
    },
  };

  const commonSelectSx = {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0, 0, 0, 0.23)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
    },
  };

  const commonMenuProps = {
    PaperProps: {
      sx: {
        maxHeight: "200px",
        overflowY: "auto",
        width: "auto",
        "& .MuiMenuItem-root": {
          "&:hover": {
            backgroundColor: "#D5FFDB",
          },
          "&.Mui-selected": {
            backgroundColor: "#E8F5E9",
            "&:hover": {
              backgroundColor: "#D5FFDB",
            },
          },
        },
      },
    },
  };

  const fetchAbsences = async () => {
    try {
      setLoading(true);
      const params = {
        attended: false,
        courseId: filterCourse !== "all" ? filterCourse : undefined,
        disciplineId: filterDiscipline !== "all" ? filterDiscipline : undefined,
      };

      const response = await api.get("/register-by-turn", { params });

      const groupedAbsences = (Array.isArray(response.data.attendances) ? response.data.attendances : [])
        .filter((freq) => !freq.attendance.attended)
        .reduce((acc, freq) => {
          const key = `${freq.courseId}-${freq.disciplineId}`;
          if (!acc[key]) {
            acc[key] = {
              id: key,
              course: freq.course_acronym,
              discipline: freq.discipline,
              count: 0,
              dates: [],
            };
          }
          acc[key].count += 1;
          acc[key].dates.push(new Date(freq.attendance.date + "T00:00:00").toLocaleDateString("pt-BR"));
          return acc;
        }, {});

      setAbsences(Object.values(groupedAbsences));
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar faltas:", err);
      setError("Não foi possível carregar suas faltas.");
      setAbsences([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesAndDisciplines = async () => {
    try {
      const coursesResponse = await api.get("/courses");
      // Correção: Garanta que a resposta é um array antes de atualizar o estado
      setCourses(Array.isArray(coursesResponse.data) ? coursesResponse.data : []);

      const disciplinesResponse = await api.get("/disciplines");
      // Correção: Garanta que a resposta é um array antes de atualizar o estado
      setDisciplines(Array.isArray(disciplinesResponse.data) ? disciplinesResponse.data : []);
    } catch (error) {
      console.error("Erro ao buscar cursos e disciplinas:", error);
      setError("Não foi possível carregar as opções de filtro.");
      setCourses([]);
      setDisciplines([]);
    }
  };

  useEffect(() => {
    fetchCoursesAndDisciplines();
  }, []);

  useEffect(() => {
    fetchAbsences();
  }, [filterCourse, filterDiscipline]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" mt={4}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="flex-start"
        sx={{ mb: 2 }}
      >
        <FormControl sx={commonFormControlSx}>
          <InputLabel id="filter-course-label">Curso</InputLabel>
          <StyledSelect
            labelId="filter-course-label"
            id="filter-course"
            value={filterCourse}
            label="Curso"
            onChange={(e) => setFilterCourse(e.target.value)}
            sx={commonSelectSx}
            MenuProps={commonMenuProps}
          >
            <MenuItem value="all">Todos os Cursos</MenuItem>
            {/* O erro ocorre aqui. A verificação if-else é a solução mais segura. */}
            {Array.isArray(courses) && courses.length > 0 ? (
                courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.acronym}
                  </MenuItem>
                ))
              ) : null}
          </StyledSelect>
        </FormControl>

        <FormControl sx={commonFormControlSx}>
          <InputLabel id="filter-discipline-label">Disciplina</InputLabel>
          <StyledSelect
            labelId="filter-discipline-label"
            id="filter-discipline"
            value={filterDiscipline}
            label="Disciplina"
            onChange={(e) => setFilterDiscipline(e.target.value)}
            sx={commonSelectSx}
            MenuProps={commonMenuProps}
          >
            <MenuItem value="all">Todas as Disciplinas</MenuItem>
            {/* O erro ocorre aqui. A verificação if-else é a solução mais segura. */}
            {Array.isArray(disciplines) && disciplines.length > 0 ? (
                disciplines.map((discipline) => (
                  <MenuItem key={discipline.id} value={discipline.id}>
                    {discipline.name}
                  </MenuItem>
                ))
              ) : null}
          </StyledSelect>
        </FormControl>
      </Stack>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={tableHeadStyle}>Data(s)</TableCell>
              <TableCell align="center" sx={tableHeadStyle}>Curso</TableCell>
              <TableCell align="center" sx={tableHeadStyle}>Disciplina</TableCell>
              <TableCell align="center" sx={tableHeadStyle}>Quantidade de Faltas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {absences.length > 0 ? (
              absences.map((absence) => (
                <TableRow key={absence.id}>
                  <TableCell align="center" sx={tableBodyCellStyle}>{absence.dates.join(', ')}</TableCell>
                  <TableCell align="center" sx={tableBodyCellStyle}>{absence.course}</TableCell>
                  <TableCell align="center" sx={tableBodyCellStyle}>{absence.discipline}</TableCell>
                  <TableCell align="center" sx={tableBodyCellStyle}>{absence.count}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={tableBodyCellStyle}>
                  Você não tem faltas registradas com base nos filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MyAbsences;