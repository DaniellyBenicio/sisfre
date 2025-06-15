import React, { useState, useEffect } from "react";
import { Box, Typography, Snackbar, Alert } from "@mui/material";
import SearchAndCreateBar from "../../../components/homeScreen/SearchAndCreateBar";
import api from "../../../service/api";
import ClassesTable from "./ClassesTable";
import ClassFormDialog from "../../../components/classForm/ClassFormDialog";

const ClassesList = () => {
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [classToEdit, setClassToEdit] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/classes");
      console.log("ClassesList - Resposta da API:", response.data);
      if (!response.data || !Array.isArray(response.data.classes)) {
        throw new Error("Erro ao buscar turmas: Dados inválidos");
      }
      setClasses(response.data.classes);
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Dados do erro:", error.response.data);
      }
    }
  };

  const handleRegisterOrUpdateSuccess = (updatedClass, isEditMode) => {
    console.log("ClassesList - Turma recebida:", updatedClass, "EditMode:", isEditMode);
    setSuccess(`Turma ${isEditMode ? 'atualizada' : 'cadastrada'} com sucesso!`);
    fetchClasses();
    setOpenDialog(false);
    setClassToEdit(null);
  };

  const handleEdit = (classItem) => {
    setClassToEdit(classItem);
    setOpenDialog(true);
  };

  const filteredClasses = Array.isArray(classes)
    ? classes.filter((classItem) => {
        const normalizedSearch = search
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const normalizedCourse =
          classItem.course?.name
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") || "";

        const normalizedSemester =
          classItem.semester
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") || "";

        return (
          normalizedCourse.includes(normalizedSearch) ||
          normalizedSemester.includes(normalizedSearch)
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
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ mt: 2, mb: 2, fontWeight: "bold" }}
      >
        Turmas
      </Typography>
      <SearchAndCreateBar
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        createButtonLabel="Cadastrar Turma"
        onCreateClick={() => {
          setClassToEdit(null);
          setOpenDialog(true);
        }}
      />
      <ClassesTable
        classes={filteredClasses}
        search={search}
        onEdit={handleEdit}
      />
      <ClassFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setClassToEdit(null);
        }}
        classToEdit={classToEdit}
        onSubmitSuccess={handleRegisterOrUpdateSuccess}
        isEditMode={!!classToEdit}
      />
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClassesList;