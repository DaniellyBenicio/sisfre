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
  const [filterCourseAcronym, setFilterCourseAcronym] = useState("all");
  const [filterDisciplineName, setFilterDisciplineName] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        courseAcronym:
          filterCourseAcronym !== "all" ? filterCourseAcronym : undefined,
        disciplineName:
          filterDisciplineName !== "all" ? filterDisciplineName : undefined,
      };

      const response = await api.get("/teacher-absences", { params });
      const absencesData = response.data || [];
      setError(null);

      // Usar `flatMap` para criar uma única lista de todos os detalhes
      const allDetails = absencesData.flatMap((absence) =>
        absence.details.map(detail => ({
            ...detail,
            date: absence.date,
        }))
      );

      // Agrupar faltas por curso e disciplina
      const groupedAbsences = allDetails.reduce((acc, detail) => {
        const key = `${detail.course}-${detail.semester}-${detail.discipline}`;
        if (!acc[key]) {
          acc[key] = {
            course: detail.course,
            semester: detail.semester,
            discipline: detail.discipline,
            absenceCount: 0,
            dates: new Set(),
          };
        }
        acc[key].absenceCount += 1;
        // Adiciona a data original ao conjunto
        const formattedDate = new Date(detail.date + 'T00:00:00')
          .toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        acc[key].dates.add(formattedDate);
        return acc;
      }, {});

      const processedAbsences = Object.values(groupedAbsences).map((group) => ({
        ...group,
        // Converte o conjunto de datas para uma string separada por vírgulas
        dates: Array.from(group.dates).join(", "),
      }));

      setAbsences(processedAbsences);

      const uniqueCourses = Array.from(
        new Set(allDetails.map((detail) => detail.course))
      )
        .filter(Boolean)
        .map((acronym) => ({ acronym }));

      const uniqueDisciplines = Array.from(
        new Set(allDetails.map((detail) => detail.discipline))
      )
        .filter(Boolean)
        .map((name) => ({ name }));

      setCourses(uniqueCourses);
      setDisciplines(uniqueDisciplines);
    } catch (err) {
      console.error("Erro ao buscar faltas:", err);
      setError(
        err.response?.data?.error || "Não foi possível carregar suas faltas."
      );
      setAbsences([]);
      setCourses([]);
      setDisciplines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, [filterCourseAcronym, filterDisciplineName]);

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
            value={filterCourseAcronym}
            label="Curso"
            onChange={(e) => setFilterCourseAcronym(e.target.value)}
            sx={commonSelectSx}
            MenuProps={commonMenuProps}
          >
            <MenuItem value="all">Todos os Cursos</MenuItem>
            {Array.isArray(courses) && courses.length > 0 ? (
              courses.map((course, index) => (
                <MenuItem key={index} value={course.acronym}>
                  {course.acronym}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Nenhum curso disponível</MenuItem>
            )}
          </StyledSelect>
        </FormControl>

        <FormControl sx={commonFormControlSx}>
          <InputLabel id="filter-discipline-label">Disciplina</InputLabel>
          <StyledSelect
            labelId="filter-discipline-label"
            id="filter-discipline"
            value={filterDisciplineName}
            label="Disciplina"
            onChange={(e) => setFilterDisciplineName(e.target.value)}
            sx={commonSelectSx}
            MenuProps={commonMenuProps}
          >
            <MenuItem value="all">Todas as Disciplinas</MenuItem>
            {Array.isArray(disciplines) && disciplines.length > 0 ? (
              disciplines.map((discipline, index) => (
                <MenuItem key={index} value={discipline.name}>
                  {discipline.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Nenhuma disciplina disponível</MenuItem>
            )}
          </StyledSelect>
        </FormControl>
      </Stack>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={tableHeadStyle}>
                Datas
              </TableCell>
              <TableCell align="center" sx={tableHeadStyle}>
                Curso/Turma
              </TableCell>
              <TableCell align="center" sx={tableHeadStyle}>
                Disciplina
              </TableCell>
              <TableCell align="center" sx={tableHeadStyle}>
                Quantidade de Faltas
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {absences.length > 0 ? (
              absences.map((absence, index) => (
                <TableRow key={index}>
                  <TableCell align="center" sx={tableBodyCellStyle}>
                    {absence.dates}
                  </TableCell>
                  <TableCell align="center" sx={tableBodyCellStyle}>
                    {absence.course} - {absence.semester}
                  </TableCell>
                  <TableCell align="center" sx={tableBodyCellStyle}>
                    {absence.discipline}
                  </TableCell>
                  <TableCell align="center" sx={tableBodyCellStyle}>
                    {absence.absenceCount}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={tableBodyCellStyle}>
                  Não foram encontradas faltas para este professor.
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