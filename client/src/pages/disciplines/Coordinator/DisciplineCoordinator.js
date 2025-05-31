import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import api from "../../../service/api";
import SearchAndCreateBar from "../../../components/homeScreen/SearchAndCreateBar";
import { CustomAlert } from "../../../components/alert/CustomAlert";
import DisciplinesTableCoordinator from "./DisciplineTableCoordinator";
import DisciplineCourse from "../../../components/disciplineForm/DisciplineCourseModal";

const DisciplineCoordinator = () => {
  const [disciplines, setDisciplines] = useState([]);
  const [search, setSearch] = useState("");
  const [openAddToCourseDialog, setOpenAddToCourseDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [disciplineToEdit, setDisciplineToEdit] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const accessType = localStorage.getItem("accessType");
  const courseId = localStorage.getItem("courseId");

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

      let fetchedDisciplines = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.disciplines)
        ? response.data.disciplines
        : [];

      // Fetch disciplineId for each discipline if missing
      fetchedDisciplines = await Promise.all(
        fetchedDisciplines.map(async (discipline) => {
          if (!discipline.disciplineId && discipline.acronym) {
            try {
              const disciplineResponse = await api.get('/disciplines', {
                params: { acronym: discipline.acronym },
              });
              const matchingDiscipline = disciplineResponse.data.disciplines?.[0];
              if (matchingDiscipline) {
                return { ...discipline, disciplineId: matchingDiscipline.id };
              }
            } catch (err) {
              console.error(`Erro ao buscar disciplineId para ${discipline.acronym}:`, err);
            }
          }
          return discipline;
        })
      );

      if (!fetchedDisciplines.length) {
        console.warn("Nenhuma disciplina associada encontrada.");
      }

      setDisciplines(fetchedDisciplines);
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setAlert({ message: error.response?.data?.message || "Erro ao carregar disciplinas.", type: "error" });
      setDisciplines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomEdit = (discipline) => {
    console.log('Editing discipline:', discipline);
    setDisciplineToEdit(discipline);
    setOpenEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setDisciplineToEdit(null);
    setOpenEditDialog(false);
  };

  const handleCustomDelete = async (discipline) => {
    if (!discipline.disciplineId) {
      setAlert({ message: "ID da disciplina não disponível para exclusão.", type: "error" });
      return;
    }
    try {
      await api.delete(`/course/discipline/${discipline.disciplineId}`);
      setAlert({ message: "Disciplina removida com sucesso!", type: "success" });
      fetchDisciplines();
    } catch (err) {
      setAlert({ message: err.response?.data?.message || "Erro ao remover disciplina.", type: "error" });
    }
  };

  const handleAddToCourse = () => {
    setOpenAddToCourseDialog(true);
  };

  const handleAddToCourseClose = () => {
    setOpenAddToCourseDialog(false);
  };

  const handleDisciplineAddedOrUpdated = (data) => {
    setAlert({ message: data.message || "Operação realizada com sucesso!", type: "success" });
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
        renderActions={(item) => (
          <>
            <IconButton
              onClick={() => handleCustomEdit(item)}
              sx={{ color: "#087619", "&:hover": { color: "#065412" } }}
            >
              <Edit />
            </IconButton>
            <IconButton
              onClick={() => handleCustomDelete(item)}
              sx={{ color: "#FF1C1C", "&:hover": { color: "#D4000F" } }}
            >
              <Delete />
            </IconButton>
          </>
        )}
      />

      <DisciplineCourse
        open={openAddToCourseDialog}
        onClose={handleAddToCourseClose}
        courseId={courseId}
        onUpdate={handleDisciplineAddedOrUpdated}
        disciplineToEdit={null}
      />

      <DisciplineCourse
        open={openEditDialog}
        onClose={handleEditDialogClose}
        courseId={courseId}
        onUpdate={handleDisciplineAddedOrUpdated}
        disciplineToEdit={disciplineToEdit}
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