import React, { useState, useEffect } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import DeleteConfirmationDialog from "../../../components/DeleteConfirmationDialog";
import api from "../../../service/api";
import SearchAndCreateBar from "../../../components/homeScreen/SearchAndCreateBar";
import CourseModal from "../../../components/CourseModal";
import CoursesTable from "./CoursesTable";
import { CustomAlert } from "../../../components/alert/CustomAlert";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const isLargeScreen = useMediaQuery("(min-width:1400px)");
  const isUltraWideScreen = useMediaQuery("(min-width:1920px)");
  const accessType = localStorage.getItem("accessType");

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const [coursesResponse, usersResponse] = await Promise.all([
          api.get("/courses?limit=1000"),
          api.get("/users?limit=1000"),
        ]);

        let courses = Array.isArray(coursesResponse.data)
          ? coursesResponse.data
          : coursesResponse.data.courses || coursesResponse.data.data || [];
        let users = Array.isArray(usersResponse.data)
          ? usersResponse.data
          : usersResponse.data.users || usersResponse.data.data || [];

        const coursesWithCoordinators = courses
          .map((course) => ({
            ...course,
            name: course.name || "",
            acronym: course.acronym || "",
            type: course.type || "",
            coordinatorName:
              users.find((user) => user.id === course.coordinatorId)?.username ||
              "N/A",
          }))
          .filter((course) => course.id)
          .sort((a, b) => a.name.localeCompare(b.name));

        setCourses(coursesWithCoordinators);
      } catch (error) {
        console.error("Erro ao buscar cursos:", error);
        setAlert({ message: "Erro ao carregar cursos.", type: "error" });
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = Array.isArray(courses)
    ? courses.filter(
        (course) =>
          course.name?.toLowerCase().includes(search.trim().toLowerCase()) ||
          course.type?.toLowerCase().includes(search.trim().toLowerCase()) ||
          course.acronym?.toLowerCase().includes(search.trim().toLowerCase())
      )
    : [];

  const handleSaveCourse = (data) => {
    const { course, isEditMode } = data;
    console.log("CourseList - Dados recebidos para salvar:", data);

    try {
      if (isEditMode) {
        setCourses(
          courses.map((c) =>
            c.id === course.id ? { ...c, ...course } : c
          ).sort((a, b) => a.name.localeCompare(b.name))
        );
      } else {
        const updatedCourses = [...courses, course].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setCourses(updatedCourses);
      }
      setAlert({
        message: isEditMode
          ? `Curso "${course.name}" atualizado com sucesso!`
          : `Curso "${course.name}" cadastrado com sucesso!`,
        type: "success",
      });
    } catch (error) {
      console.error(
        `Erro ao ${isEditMode ? "atualizar" : "cadastrar"} curso no estado:`,
        error
      );
      setAlert({
        message: `Erro ao ${isEditMode ? "atualizar" : "cadastrar"} curso.`,
        type: "error",
      });
    } finally {
      setOpenDialog(false);
      setCourseToEdit(null);
    }
  };

  const handleEditCourse = (course) => {
    console.log("CourseList - Curso para editar:", course);
    setCourseToEdit(course);
    setOpenDialog(true);
  };

  const handleDeleteClick = (courseId) => {
    console.log("CourseList - ID do curso para exclusão:", courseId);
    console.log("Lista de cursos atual:", courses);
    const course = courses.find((c) => String(c.id) === String(courseId));
    console.log("Curso encontrado para exclusão:", course);
    if (!course) {
      setAlert({
        message: `Curso com ID ${courseId} não encontrado.`,
        type: "error",
      });
      return;
    }
    setCourseToDelete(course);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/courses/${courseToDelete.id}`);
      setCourses(courses.filter((c) => c.id !== courseToDelete.id));
      setAlert({
        message: `Curso "${courseToDelete.name}" excluído com sucesso!`,
        type: "success",
      });
    } catch (error) {
      console.error("Erro ao excluir curso:", error);
      setAlert({
        message: error.response?.data?.mensagem || "Erro ao excluir curso.",
        type: "error",
      });
    } finally {
      setOpenDeleteDialog(false);
      setCourseToDelete(null);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        maxWidth: isUltraWideScreen ? "95vw" : isLargeScreen ? "90vw" : "1200px",
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
        Cursos
      </Typography>

      {/* Barra de pesquisa e botão de cadastro */}
      <SearchAndCreateBar
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        {...(accessType === "Admin" && {
          createButtonLabel: "Cadastrar Curso",
          onCreateClick: () => {
            setCourseToEdit(null);
            setOpenDialog(true);
          },
        })}
      />

      <CoursesTable
        key={courses.length}
        courses={filteredCourses}
        onDelete={handleDeleteClick}
        onUpdate={handleEditCourse}
        search={search}
        setAlert={setAlert}
      />

      <CourseModal
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setCourseToEdit(null);
        }}
        onUpdate={handleSaveCourse}
        courseToEdit={courseToEdit}
      />

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setCourseToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        message={
          courseToDelete
            ? `Deseja realmente excluir o curso "${courseToDelete.name}"?`
            : "Deseja realmente excluir este curso?"
        }
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

export default CourseList;