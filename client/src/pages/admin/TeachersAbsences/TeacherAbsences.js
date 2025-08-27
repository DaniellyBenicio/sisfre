import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Pagination,
  CssBaseline,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { CustomAlert } from "../../../components/alert/CustomAlert";
import TeacherAbsencesTable from "./TeacherAbsenceTable";
import api from "../../../service/api";
import Sidebar from "../../../components/SideBar";
import SearchAndCreateBar from "../../../components/homeScreen/SearchAndCreateBar";

const INSTITUTIONAL_COLOR = "#307c34";

const TeacherAbsences = ({ setAuthenticated }) => {
  const [frequencies, setFrequencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleAlertClose = () => {
    setAlert(null);
  };

  const fetchAbsences = async () => {
    try {
      setLoading(true);
      const params = { search: search || undefined, status: "all", };
      const response = await api.get("/total-absences-by-teacher", { params });
      const formattedData = Array.isArray(response.data.total_absences)
        ? response.data.total_absences.map((item) => ({
            professor_id: item.professor_id,
            teacher: item.professor_name,
            count: item.count,
          }))
        : [];
      setFrequencies(formattedData);
    } catch (error) {
      console.error("Erro ao buscar total de faltas:", error);
      if (error.response?.status === 404) {
        setFrequencies([]);
      } else {
        setAlert({
          message: error.response?.data?.error || "Erro ao carregar faltas.",
          type: "error",
        });
        setFrequencies([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const paginatedFrequencies = frequencies.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const totalPages = Math.ceil(frequencies.length / rowsPerPage);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Sidebar setAuthenticated={setAuthenticated} />
      <Box
        sx={{
          p: 3,
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            mb: 3,
            mt: 5,
          }}
        >
          <IconButton
            onClick={() => navigate("/teacher-absences/options")}
            sx={{
              position: "absolute",
              left: 0,
              color: INSTITUTIONAL_COLOR,
              "&:hover": { backgroundColor: "transparent" },
            }}
          >
            <ArrowBack sx={{ fontSize: 35 }} />
          </IconButton>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", flexGrow: 1 }}
          >
            Faltas por Professor
          </Typography>
        </Box>

        <SearchAndCreateBar
          searchValue={search}
          onSearchChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <Typography align="center">Carregando...</Typography>
        ) : (
          <TeacherAbsencesTable
            frequencies={paginatedFrequencies || []}
            search={search}
            isFiltered={!!search}
          />
        )}

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        )}

        {alert && (
          <CustomAlert
            message={alert.message}
            type={alert.type}
            onClose={handleAlertClose}
          />
        )}
      </Box>
    </Box>
  );
};

export default TeacherAbsences;