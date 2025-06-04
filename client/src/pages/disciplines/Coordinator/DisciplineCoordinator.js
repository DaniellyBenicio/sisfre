import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import api from "../../../service/api";
import SearchAndCreateBar from "../../../components/homeScreen/SearchAndCreateBar";
import { CustomAlert } from "../../../components/alert/CustomAlert";
import DisciplinesTableCoordinator from "./DisciplineTableCoordinator";
import DisciplineCourse from "../../../components/disciplineForm/DisciplineCourseModal";
import DeleteConfirmationDialog from "../../../components/DeleteConfirmationDialog";

const DisciplineCoordinator = () => {
  const [disciplines, setDisciplines] = useState([]);
  const [search, setSearch] = useState("");
  const [openAddToCourseDialog, setOpenAddToCourseDialog] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const accessType = localStorage.getItem("accessType");
  const [disciplineToEdit, setDisciplineToEdit] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [disciplineToDelete, setDisciplineToDelete] = useState(null);
  const [disciplineNameToDelete, setDisciplineNameToDelete] = useState("");

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    fetchDisciplines();
  }, []);

  const fetchDisciplines = async () => {
    try {
      setLoading(true);
      const response = await api.get("/course/discipline");
      console.log("DisciplineList - Resposta da API:", response.data);

      const fetchedDisciplines = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.disciplines)
        ? response.data.disciplines
        : [];

      if (!fetchedDisciplines.length) {
        console.warn("Nenhuma disciplina associada encontrada.");
      }

      const validDisciplines = fetchedDisciplines.filter(
        (d) => d.disciplineId !== undefined && d.disciplineId !== null
      );
      console.log("Disciplinas válidas:", validDisciplines);
      setDisciplines(validDisciplines);
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setAlert({
        message: error.response?.data?.message || "Erro ao carregar disciplinas.",
        type: "error",
      });
      setDisciplines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomEdit = (row) => {
    setDisciplineToEdit(row);
    setOpenAddToCourseDialog(true);
  };

  const handleCloseModal = () => {
    setOpenAddToCourseDialog(false);
    setDisciplineToEdit(null);
  };

  const handleDeleteClick = (disciplineId) => {
    console.log("ID recebido em handleDeleteClick:", disciplineId);
    if (disciplineId === undefined || disciplineId === null) {
      setAlert({
        message: "ID da disciplina inválido.",
        type: "error",
      });
      return;
    }
    const discipline = disciplines.find((d) => d.disciplineId === disciplineId);
    console.log("Disciplina recebida para exclusão:", discipline);
    if (!discipline) {
      setAlert({
        message: `Disciplina com ID ${disciplineId} não encontrada.`,
        type: "error",
      });
      return;
    }
    setDisciplineToDelete(discipline);
    setDisciplineNameToDelete(discipline.name || "");
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!disciplineToDelete || !disciplineToDelete.disciplineId) {
      setAlert({
        message: "Nenhuma disciplina selecionada para exclusão.",
        type: "error",
      });
      setOpenDeleteDialog(false);
      return;
    }
    try {
      await api.delete(`/course/discipline/${disciplineToDelete.disciplineId}`);
      setDisciplines(disciplines.filter((c) => c.disciplineId !== disciplineToDelete.disciplineId));
      setAlert({
        message: `Disciplina "${disciplineNameToDelete}" excluída com sucesso!`,
        type: "success",
      });
    } catch (error) {
      console.error("Erro ao excluir disciplina:", error);
      setAlert({
        message:
          error.response?.data?.mensagem || "Erro ao excluir disciplina.",
        type: "error",
      });
    } finally {
      setOpenDeleteDialog(false);
      setDisciplineToDelete(null);
    }
  };

  const handleAddToCourse = () => {
    setDisciplineToEdit(null);
    setOpenAddToCourseDialog(true);
  };

  const handleDisciplineAdded = (data) => {
    setAlert({
      message: data.message || "Disciplina adicionada ou atualizada com sucesso!",
      type: "success",
    });
    fetchDisciplines();
  };

  const filteredDisciplines = Array.isArray(disciplines)
    ? disciplines.filter(
        (discipline) =>
          discipline.acronym?.toLowerCase().includes(search.trim().toLowerCase()) ||
          discipline.name?.toLowerCase().includes(search.trim().toLowerCase()) ||
          String(discipline.workload)
            .toLowerCase()
            .includes(search.trim().toLowerCase())
      )
    : [];

  return (
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
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", mt: 2, mb: 2 }}
      >
        Disciplinas
      </Typography>

      <SearchAndCreateBar
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        {...(accessType === "Coordenador" && {
          createButtonLabel: "Adicionar Disciplina",
          onCreateClick: handleAddToCourse,
        })}
      />

      <DisciplinesTableCoordinator
        disciplines={filteredDisciplines}
        onUpdate={handleCustomEdit}
        search={search}
        showActions={true}
        renderActions={(item) => {
          return (
            <>
              <IconButton
                onClick={() => handleCustomEdit(item)}
                sx={{ color: "#087619", "&:hover": { color: "#065412" } }}
              >
                <Edit />
              </IconButton>
              <IconButton
                onClick={() => handleDeleteClick(item.disciplineId)}
                sx={{ color: "#FF1C1C", "&:hover": { color: "#D4000F" } }}
              >
                <Delete />
              </IconButton>
            </>
          );
        }}
      />

      <DisciplineCourse
        open={openAddToCourseDialog}
        onClose={handleCloseModal}
        onUpdate={handleDisciplineAdded}
        editingData={disciplineToEdit}
      />

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        message={`Deseja realmente excluir a disciplina "${disciplineNameToDelete}"?`}
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

export default DisciplineCoordinator;