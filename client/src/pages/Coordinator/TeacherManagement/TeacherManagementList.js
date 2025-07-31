import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  IconButton,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ClassScheduleTable from './TeacherManagementTable';
import api from '../../../service/api';
import { CustomAlert } from '../../../components/alert/CustomAlert';
import { StyledSelect } from '../../../components/inputs/Input';
import SearchAndCreateBar from '../../../components/homeScreen/SearchAndCreateBar';

const TeacherManagementList = () => {
  const [teachers, setTeachers] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/teachers-by-course");
        console.log(response.data.professors);
        const professorsData = response.data.professors || [];
        
        const formattedTeachers = professorsData.map(prof => ({
          id: prof.professor.id,
          acronym: prof.professor.acronym,
          name: prof.professor.name,
          email: prof.professor.email,
          absences: '',
        }));

        setTeachers(formattedTeachers);
        setLoading(false);
      } catch (err) {
        setError("Erro ao carregar os dados dos professores. Tente novamente mais tarde.");
        setLoading(false);
        console.error("Erro ao buscar professores:", err);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/courses");
        setCourses(response.data);
      } catch (err) {
        console.error("Erro ao buscar cursos:", err);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  const handleAlertClose = () => {
    setAlert(null);
  }

  const handleCalendarChange = (event) => {
    setSelectedCalendar(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleViewTeacherDetails = (teacherId) => {
    navigate('/teacher-schedule', { state: { teacherId } });
  };

  const handleBackClick = () => {
    navigate('/teachers-management/options');
  };

  const filteredTeachers = teachers
    .filter((teacher) =>
      selectedCourse
        ? teacher.course?.id === selectedCourse
        : true
    )
    .filter((teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.email && teacher.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <Box
      sx={{
        p: 2,
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box
        sx={{
          position: "relative",
          alignItems: "center",
          gap: 1,
          mb: 3,
        }}
      >
        {!isMobile && (
          <IconButton
            onClick={handleBackClick}
            sx={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", mt: 2, ml: -1 }}
          >
            <ArrowBack sx={{ color: "green", fontSize: "2.2rem" }} />
          </IconButton>
        )}
        <Typography variant="h5" align="center" sx={{ fontWeight: "bold", mt: 2 }}>
          Gestão de Professores
        </Typography>
      </Box>

      {error && (
        <CustomAlert
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={handleAlertClose}
        />
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
          mb: 1,
        }}
      >
        <SearchAndCreateBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          placeholder="Pesquisar por nome ou e-mail"
        />
        <FormControl
            sx={{
              minWidth: { xs: '100%', sm: 200 },
              '& .MuiInputBase-root': {
                height: 36,
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiInputLabel-root': {
                transform: 'translate(14px, 7px) scale(1)',
                '&.Mui-focused, &.MuiInputLabel-shrink': {
                  transform: 'translate(14px, -6px) scale(0.75)',
                  color: '#000000',
                },
              },
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                height: '100% !important',
              },
            }}
          >
            <InputLabel id="calendar-filter-label">Calendário</InputLabel>
            <StyledSelect
              labelId="calendar-filter-label"
              value={selectedCalendar}
              label="Calendar"
              onChange={handleCalendarChange}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#000000',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: '200px',
                    overflowY: 'auto',
                    width: 'auto',
                    '& .MuiMenuItem-root': {
                      minHeight: '36px',
                      display: 'flex',
                      alignItems: 'center',
                    },
                    '& .MuiMenuItem-root.Mui-selected': {
                      backgroundColor: '#D5FFDB',
                      '&:hover': {
                        backgroundColor: '#C5F5CB',
                      },
                    },
                    '& .MuiMenuItem-root:hover': {
                      backgroundColor: '#D5FFDB',
                    },
                  },
                },
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              {calendars.map((calendar) => (
                <MenuItem key={calendar.id} value={calendar.id}>
                  {calendar.name}
                </MenuItem>
              ))}
            </StyledSelect>
          </FormControl>
      </Box>

      <ClassScheduleTable
        teachers={filteredTeachers}
        onView={handleViewTeacherDetails}
        search={searchTerm}
        showActions={true}
        loading={loading}
      />
    </Box>
  );
};

export default TeacherManagementList;