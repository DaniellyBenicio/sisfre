import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  useMediaQuery, // Adicionado para a lógica responsiva
  useTheme, // Adicionado para acessar os temas de breakpoints
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import SearchAndCreateBar from "../../../components/homeScreen/SearchAndCreateBar";
import api from "../../../service/api";
import SaturdaySchoolTable from "./SaturdaySchoolTable";
import SaturdaySchoolFormDialog from "../../../components/SaturdaySchoolForm/SaturdaySchoolFormDialog";
import DeleteConfirmationDialog from "../../../components/DeleteConfirmationDialog";
import { CustomAlert } from "../../../components/alert/CustomAlert";

// Função para formatar o tipo de calendário
const formatCalendarType = (type) => {
  if (!type) return "Desconhecido";
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

const SaturdaySchoolList = () => {
  const [saturdaySchools, setSaturdaySchools] = useState([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [saturdaySchoolToEdit, setSaturdaySchoolToEdit] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [saturdaySchoolToDelete, setSaturdaySchoolToDelete] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Usando useMediaQuery para detectar o tamanho da tela
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    const fetchSaturdaySchools = async () => {
      try {
        setLoading(true);
        const response = await api.get("/school-saturdays/all");
        console.log("SaturdaySchoolList - API Response:", response.data);
        if (!response.data || !Array.isArray(response.data.schoolSaturdays)) {
          throw new Error("Error fetching Saturday schools: Invalid data");
        }
        // Normaliza os dados para incluir o campo calendar
        const normalizedSaturdaySchools = response.data.schoolSaturdays.map(
          (item) => ({
            ...item,
            calendar: item.calendarSaturdays?.[0]
              ? {
                  id: item.calendarSaturdays[0].id,
                  name: `${item.calendarSaturdays[0].year}.${
                    item.calendarSaturdays[0].period
                  } - ${formatCalendarType(item.calendarSaturdays[0].type)}`,
                }
              : { id: item.calendarId, name: "Desconhecido" },
          })
        );
        setSaturdaySchools(normalizedSaturdaySchools);
      } catch (error) {
        console.error(
          "Erro ao buscar sábados letivos:",
          error.message,
          error.response?.data
        );
        setAlert({
          message: "Erro ao buscar sábados letivos.",
          type: "error",
        });
        setSaturdaySchools([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSaturdaySchools();
  }, []);

  const handleRegisterOrUpdateSuccess = (updatedSaturdaySchool, isEditMode) => {
    try {
      if (isEditMode) {
        setSaturdaySchools((prev) =>
          prev.map((s) =>
            s.id === updatedSaturdaySchool.id ? updatedSaturdaySchool : s
          )
        );
        setAlert({
          message: `Sábado letivo ${
            updatedSaturdaySchool.calendar?.name || updatedSaturdaySchool.date
          } atualizado com sucesso!`,
          type: "success",
        });
      } else {
        setSaturdaySchools((prev) => [...prev, updatedSaturdaySchool]);
        setAlert({
          message: `Sábado letivo ${
            updatedSaturdaySchool.calendar?.name || updatedSaturdaySchool.date
          } cadastrado com sucesso!`,
          type: "success",
        });
      }
      setOpenDialog(false);
      setSaturdaySchoolToEdit(null);
    } catch (error) {
      console.error("Erro ao atualizar lista de sábados letivos:", error);
      setAlert({
        message: "Erro ao atualizar a lista de sábados letivos.",
        type: "error",
      });
    }
  };

  const handleEdit = (saturdaySchool) => {
    setSaturdaySchoolToEdit(saturdaySchool);
    setOpenDialog(true);
  };

  const handleDeleteClick = (saturdaySchoolId) => {
    const saturdaySchool = saturdaySchools.find(
      (s) => s.id === saturdaySchoolId
    );
    console.log("Sábado letivo recebido para exclusão:", saturdaySchool);
    console.log("ID do sábado letivo a ser excluído:", saturdaySchoolId);
    setSaturdaySchoolToDelete(saturdaySchool);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/school-saturdays/${saturdaySchoolToDelete.id}`);
      setSaturdaySchools((prev) =>
        prev.filter((s) => s.id !== saturdaySchoolToDelete.id)
      );
      setAlert({
        message: `Sábado letivo ${
          saturdaySchoolToDelete.calendar?.name || saturdaySchoolToDelete.date
        } excluído com sucesso!`,
        type: "success",
      });
    } catch (error) {
      console.error(
        "Erro ao excluir sábado letivo:",
        error.message,
        error.response?.data
      );
      const errorMessage =
        error.response?.status === 401
          ? "Você não está autorizado a excluir sábados letivos."
          : error.response?.status === 403
          ? "Apenas administradores podem excluir sábados letivos."
          : error.response?.data?.error || "Erro ao excluir sábado letivo.";
      setAlert({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setOpenDeleteDialog(false);
      setSaturdaySchoolToDelete(null);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const filteredSaturdaySchools = Array.isArray(saturdaySchools)
    ? saturdaySchools.filter((saturdaySchool) => {
        const normalizedSearch = search
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const normalizedDayOfWeek =
          saturdaySchool.dayOfWeek
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") || "";

        const normalizedDate =
          saturdaySchool.date
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") || "";

        const normalizedCalendar =
          saturdaySchool.calendar?.name
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") || "";

        return (
          normalizedDayOfWeek.includes(normalizedSearch) ||
          normalizedDate.includes(normalizedSearch) ||
          normalizedCalendar.includes(normalizedSearch)
        );
      })
    : [];

  return (
    <Box
      padding={3}
      sx={{
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
          mb: 2,
        }}
      >
        {/* Lógica para esconder o botão de voltar em telas móveis */}
        {!isMobile && (
          <IconButton
            onClick={handleBackClick}
            sx={{
              position: "absolute",
              left: 0,
              color: "#087619",
              "&:hover": {
                backgroundColor: "rgba(8, 118, 25, 0.08)",
              },
            }}
          >
            <ArrowBack />
          </IconButton>
        )}
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#000000",
            flexGrow: 1,
            mt: { xs: 2, sm: 0 }, // Adicionado margem superior apenas em mobile
            mb: 2,
          }}
        >
          Sábados Letivos
        </Typography>
      </Box>
      <SearchAndCreateBar
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        createButtonLabel="Cadastrar Sábado Letivo"
        onCreateClick={() => {
          setSaturdaySchoolToEdit(null);
          setOpenDialog(true);
        }}
      />
      <SaturdaySchoolTable
        saturdaySchools={filteredSaturdaySchools}
        search={search}
        onUpdate={handleEdit}
        onDelete={handleDeleteClick}
        setAlert={setAlert}
      />
      <SaturdaySchoolFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSaturdaySchoolToEdit(null);
        }}
        saturdaySchoolToEdit={saturdaySchoolToEdit}
        onSubmitSuccess={handleRegisterOrUpdateSuccess}
        isEditMode={!!saturdaySchoolToEdit}
      />
      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setSaturdaySchoolToDelete(null);
        }}
        message={`Deseja realmente excluir o sábado letivo "${
          saturdaySchoolToDelete?.calendar?.name ||
          saturdaySchoolToDelete?.date ||
          "Desconhecido"
        }"?`}
        onConfirm={handleConfirmDelete}
      />
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={handleAlertClose}
        />
      )}
    </Box>
  );
};

export default SaturdaySchoolList;