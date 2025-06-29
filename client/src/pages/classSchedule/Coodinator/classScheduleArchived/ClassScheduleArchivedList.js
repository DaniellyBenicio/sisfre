import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
  CssBaseline
} from "@mui/material";
import { FilterListAlt, Visibility } from "@mui/icons-material";
import { CustomAlert } from "../../../../components/alert/CustomAlert";
import ClassScheduleTable from "../ClassScheduleTable";
import { StyledSelect } from "../../../../components/inputs/Input";
import { useNavigate } from "react-router-dom";
import api from "../../../../service/api";
import Sidebar from "../../../../components/SideBar.js";

const ClassScheduleListArchived = ({ setAuthenticated }) => {
  const [schedules, setSchedules] = useState([]);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [calendars, setCalendars] = useState([]);
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArchivedSchedules = async () => {
      setLoading(true);
      try {
        const response = await api.get("/archived-class-schedules");
        console.log("API Response (Archived):", response.data);

        const schedules = Array.isArray(response.data.schedules)
          ? response.data.schedules.map((schedule) => ({
              id: schedule.id,
              calendar: schedule.calendar,
              calendarType: schedule.calendarType,
              class: schedule.turma,
              turn: determineTurn(schedule.turnCounts),
              details: schedule.details,
            }))
          : [];

        setSchedules(schedules);

        const uniqueCalendars = [...new Set(schedules.map((item) => item.calendar))].filter((cal) => cal);
        const uniqueClasses = [...new Set(schedules.map((item) => item.class))].filter((cls) => cls);

        setCalendars(uniqueCalendars);
        setClasses(uniqueClasses);
      } catch (error) {
        console.error("API Error:", error.response || error);
        setAlert({
          message: error.response?.data?.message || "Erro ao carregar as grades arquivadas.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedSchedules();
  }, []);

  const determineTurn = (turnCounts) => {
    const { MATUTINO, VESPERTINO, NOTURNO } = turnCounts;
    const totalLessons = MATUTINO + VESPERTINO + NOTURNO;

    if (totalLessons === 0) return "N/A";

    const maxLessons = Math.max(MATUTINO, VESPERTINO, NOTURNO);
    const maxShifts = [
      { shift: "Manhã", count: MATUTINO },
      { shift: "Tarde", count: VESPERTINO },
      { shift: "Noite", count: NOTURNO },
    ].filter((s) => s.count === maxLessons);

    if (maxShifts.length > 1) return "Integral";
    if (maxLessons === MATUTINO) return "Manhã";
    if (maxLessons === VESPERTINO) return "Tarde";
    if (maxLessons === NOTURNO) return "Noite";
    return "N/A";
  };

  const handleViewClick = (item) => {
    navigate(`/class-schedule/details/${item.id}`);
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  const filteredSchedules = schedules.filter((item) => {
    const matchesSearch = Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(search.toLowerCase())
    );
    const matchesCalendar = selectedCalendar ? item.calendar === selectedCalendar : true;
    const matchesClass = selectedClass ? item.class === selectedClass : true;
    return matchesSearch && matchesCalendar && matchesClass;
  });

  return (
    <Box sx={{ display: "flex"}}>
      <CssBaseline />
      <Sidebar setAuthenticated={setAuthenticated} />
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
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", mt: "45px", mb: 3 }}
        >
          Grades Arquivadas
        </Typography>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <Typography>Carregando...</Typography>
          </Box>
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
            justifyContent: "flex-start",
            alignItems: { xs: "stretch", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                borderRadius: "8px",
                p: 1,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <FormControl
                sx={{
                  minWidth: { xs: "100%", sm: 200 },
                  "& .MuiInputBase-root": { height: 36, display: "flex", alignItems: "center" },
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 7px) scale(1)",
                    "&.Mui-focused, &.MuiInputLabel-shrink": {
                      transform: "translate(14px, -6px) scale(0.75)",
                      color: "#000000",
                    },
                  },
                  "& .MuiSelect-select": { display: "flex", alignItems: "center", height: "100% !important" },
                }}
              >
                <InputLabel id="calendar-filter-label">Calendário</InputLabel>
                <StyledSelect
                  labelId="calendar-filter-label"
                  value={selectedCalendar}
                  label="Calendário"
                  onChange={(e) => setSelectedCalendar(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0, 0, 0, 0.23)" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#000000" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: "200px",
                        overflowY: "auto",
                        width: "auto",
                        "& .MuiMenuItem-root": { minHeight: "36px", display: "flex", alignItems: "center" },
                        "& .MuiMenuItem-root.Mui-selected": {
                          backgroundColor: "#D5FFDB",
                          "&:hover": { backgroundColor: "#C5F5CB" },
                        },
                        "& .MuiMenuItem-root:hover": { backgroundColor: "#D5FFDB" },
                      },
                    },
                  }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {calendars.map((calendar) => (
                    <MenuItem key={calendar} value={calendar}>
                      {calendar}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>
              <FormControl
                sx={{
                  minWidth: { xs: "100%", sm: 200 },
                  "& .MuiInputBase-root": { height: 36, display: "flex", alignItems: "center" },
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 7px) scale(1)",
                    "&.Mui-focused, &.MuiInputLabel-shrink": {
                      transform: "translate(14px, -6px) scale(0.75)",
                      color: "#000000",
                    },
                  },
                  "& .MuiSelect-select": { display: "flex", alignItems: "center", height: "100% !important" },
                }}
              >
                <InputLabel id="class-filter-label">Turma</InputLabel>
                <StyledSelect
                  labelId="class-filter-label"
                  value={selectedClass}
                  label="Turma"
                  onChange={(e) => setSelectedClass(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0, 0, 0, 0.23)" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#000000" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: "200px",
                        overflowY: "auto",
                        width: "auto",
                        "& .MuiMenuItem-root": { minHeight: "36px", display: "flex", alignItems: "center" },
                        "& .MuiMenuItem-root.Mui-selected": {
                          backgroundColor: "#D5FFDB",
                          "&:hover": { backgroundColor: "#C5F5CB" },
                        },
                        "& .MuiMenuItem-root:hover": { backgroundColor: "#D5FFDB" },
                      },
                    },
                  }}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls} value={cls}>
                      {cls}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>
            </Box>
          </Box>
        </Box>

        <ClassScheduleTable
          classesSchedule={filteredSchedules}
          search={search}
          showActions={true}
          renderActions={(item) => (
            <IconButton
              onClick={() => handleViewClick(item)}
              sx={{ color: "#666666", "&:hover": { color: "#535252" } }}
            >
              <Visibility />
            </IconButton>
          )}
        />
      </Box>
    </Box>
  );
};

export default ClassScheduleListArchived;