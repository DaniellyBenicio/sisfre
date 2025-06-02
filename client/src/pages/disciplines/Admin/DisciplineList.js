import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import DeleteConfirmationDialog from "../../../components/DeleteConfirmationDialog";
import api from "../../../service/api";
import SearchAndCreateBar from "../../../components/homeScreen/SearchAndCreateBar";
import { CustomAlert } from "../../../components/alert/CustomAlert";
import DisciplinesTable from "./DisciplinesTable";
import DisciplineModal from "../../../components/disciplineForm/DisciplineModal";

const DisciplineList = () => {
  const [disciplines, setDisciplines] = useState([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [disciplineToDelete, setDisciplineToDelete] = useState(null);
  const [disciplineToEdit, setDisciplineToEdit] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const accessType = localStorage.getItem("accessType");

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        setLoading(true);
        const response = await api.get("/disciplines/all");
        console.log("DisciplineList - Resposta da API:", response.data);
        if (!response.data || !Array.isArray(response.data.disciplines)) {
          throw new Error("Erro ao buscar disciplinas: Dados inválidos");
        }
        // Sort disciplines alphabetically by name when fetched
        const sortedDisciplines = response.data.disciplines.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setDisciplines(sortedDisciplines);
      } catch (error) {
        console.error("Erro ao buscar disciplinas:", error);
        setAlert({ message: "Erro ao carregar disciplinas.", type: "error" });
        setDisciplines([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDisciplines();
  }, []);

  const filteredDisciplines = Array.isArray(disciplines)
    ? disciplines.filter(
        (discipline) =>
          discipline.acronym
            ?.toLowerCase()
            .includes(search.trim().toLowerCase()) ||
          discipline.name?.toLowerCase().includes(search.trim().toLowerCase())
      )
    : [];

  const handleSaveDiscipline = (data) => {
    const { discipline, isEditMode } = data;
    console.log("DisciplineList - Dados recebidos para salvar:", data);

    try {
      if (isEditMode) {
        // Update the discipline in the state
        setDisciplines(
          disciplines.map((d) =>
            d.id === discipline.id ? { ...d, ...discipline } : d
          )
        );
      } else {
        // Add new discipline and sort the array alphabetically by name
        const updatedDisciplines = [...disciplines, discipline].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setDisciplines(updatedDisciplines);
      }
      setAlert({
        message: isEditMode
          ? `Disciplina "${discipline.name}" atualizada com sucesso!`
          : `Disciplina "${discipline.name}" cadastrada com sucesso!`,
        type: "success",
      });
    } catch (error) {
      console.error(
        `Erro ao ${isEditMode ? "atualizar" : "cadastrar"} disciplina no estado:`,
        error
      );
      setAlert({
        message: `Erro ao ${isEditMode ? "atualizar" : "cadastrar"} disciplina.`,
        type: "error",
      });
    } finally {
      setOpenDialog(false);
      setDisciplineToEdit(null);
    }
  };

  const handleEditDiscipline = (discipline) => {
    console.log("DisciplineList - Disciplina para editar:", discipline);
    setDisciplineToEdit(discipline);
    setOpenDialog(true);
  };

  const handleDeleteClick = (disciplineId) => {
    const discipline = disciplines.find((d) => d.id === disciplineId);
    console.log("DisciplineList - Disciplina para exclusão:", discipline);
    setDisciplineToDelete(discipline);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/discipline/${disciplineToDelete.id}`);
      setDisciplines(disciplines.filter((c) => c.id !== disciplineToDelete.id));
      setAlert({
        message: `Disciplina "${disciplineToDelete.name}" excluída com sucesso!`,
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
        {...(accessType === "Admin" && {
          createButtonLabel: "Cadastrar Disciplina",
          onCreateClick: () => {
            setDisciplineToEdit(null);
            setOpenDialog(true);
          },
        })}
      />

      <DisciplinesTable
        disciplines={filteredDisciplines}
        onDelete={handleDeleteClick}
        onUpdate={handleEditDiscipline}
        search={search}
        setAlert={setAlert}
      />

      <DisciplineModal
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setDisciplineToEdit(null);
        }}
        onUpdate={handleSaveDiscipline}
        disciplineToEdit={disciplineToEdit}
      />

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        message={`Deseja realmente excluir a disciplina "${disciplineToDelete?.name}"?`}
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

export default DisciplineList;