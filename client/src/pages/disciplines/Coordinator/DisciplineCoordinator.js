import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Stack, Tooltip } from "@mui/material";
import { Edit, PersonAdd } from "@mui/icons-material";
import api from "../../../service/api";
import SearchAndCreateBar from "../../../components/homeScreen/SearchAndCreateBar";
import { CustomAlert } from "../../../components/alert/CustomAlert";
import DisciplinesTableCoordinator from "./DisciplineTableCoordinator";

const DisciplineCoordinator = () => {
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
    fetchDisciplines();
  }, []);

  const fetchDisciplines = async () => {
    try {
      setLoading(true);
      const response = await api.get("/disciplines/all");
      console.log("DisciplineList - Resposta da API:", response.data);
      if (!response.data || !Array.isArray(response.data.disciplines)) {
        throw new Error("Erro ao buscar disciplinas: Dados inválidos");
      }
      setDisciplines(response.data.disciplines);
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error);
      setAlert({ message: "Erro ao carregar disciplinas.", type: "error" });
      setDisciplines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomEdit = (discipline) => {
    setDisciplineToEdit(discipline);
    setOpenDialog(true);
  };

  const handleAddProfessor = (discipline) => {
    console.log("Adicionar professor à disciplina:", discipline);
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
      />

      <DisciplinesTableCoordinator
        disciplines={filteredDisciplines}
        onUpdate={handleCustomEdit}
        search={search}
        showActions={true}
        renderActions={(item) => (
          <>
            <Tooltip title="Adicionar Professor">
              <IconButton
                onClick={() => handleAddProfessor(item)}
                sx={{ color: "#616561", "&:hover": { color: "#373B37" } }}
              >
                <PersonAdd />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={() => handleCustomEdit(item)}
              sx={{ color: "#087619", "&:hover": { color: "#065412" } }}
            >
              <Edit />
            </IconButton>
          </>
        )}
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