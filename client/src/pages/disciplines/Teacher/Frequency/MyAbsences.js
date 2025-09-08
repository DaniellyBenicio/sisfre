import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { StyledSelect } from "../../../../components/inputs/Input";
import api from "../../../../service/api";
import SchoolIcon from "@mui/icons-material/School";

const MyAbsences = () => {
  const [absences, setAbsences] = useState([]);
  const [courses, setCourses] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [filterCourseAcronym, setFilterCourseAcronym] = useState("");
  const [filterDisciplineName, setFilterDisciplineName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const disciplineFormControlSx = {
    width: { xs: "100%", sm: "302px" },
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
          filterCourseAcronym !== "" ? filterCourseAcronym : undefined,
        disciplineName:
          filterDisciplineName !== "" ? filterDisciplineName : undefined,
      };

      const response = await api.get("/teacher-absences", { params });
      const absencesData = response.data || [];
      setError(null);

      const allDetails = absencesData.flatMap((absence) =>
        absence.details.map((detail) => ({
          ...detail,
          date: absence.date,
        }))
      );

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
        const formattedDate = new Date(detail.date + "T00:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        acc[key].dates.add(formattedDate);
        return acc;
      }, {});

      const processedAbsences = Object.values(groupedAbsences).map((group) => ({
        ...group,
        dates: Array.from(group.dates),
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
        sx={{ mb: 4 }}
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
            <MenuItem value="">Todos os Cursos</MenuItem>
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

        <FormControl sx={disciplineFormControlSx}>
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
            <MenuItem value="">Todas as Disciplinas</MenuItem>
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

      <Stack spacing={2}>
        {absences.length > 0 ? (
          absences.map((absence, index) => (
            <Accordion key={`${absence.course}-${absence.discipline}-${index}`} elevation={3}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${index}-content`}
                id={`panel-${index}-header`}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                >
                  <Box display="flex" alignItems="center">
                    <SchoolIcon sx={{ mr: 1, fontSize: 32, color: "#087619" }} />
                    <Typography fontWeight="bold">
                      {absence.course} - {absence.semester} ({absence.discipline})
                    </Typography>
                  </Box>
                  <Chip
                    label={`${absence.absenceCount} faltas`}
                    color="error"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" gutterBottom>
                  Datas das faltas:
                </Typography>
                <Stack direction="row" flexWrap="wrap" spacing={1}>
                  {Array.isArray(absence.dates) && absence.dates.length > 0 ? (
                    absence.dates.map((date, dateIndex) => (
                      <Chip
                        key={dateIndex}
                        label={date}
                        size="small"
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma data de falta encontrada.
                    </Typography>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
          >
            Não foram encontradas faltas para este professor.
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default MyAbsences;