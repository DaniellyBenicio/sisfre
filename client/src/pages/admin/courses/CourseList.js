import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
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
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [courseToEdit, setCourseToEdit] = useState(null);

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const [coursesResponse, usersResponse] = await Promise.all([
          api.get("/courses"),
          api.get("/users"),
        ]);
        console.log("Resposta da API /courses:", coursesResponse.data);
        console.log("Resposta da API /users:", usersResponse.data);

        let courses = coursesResponse.data;
        if (!Array.isArray(courses)) {
          console.warn("coursesResponse.data não é um array:", courses);
          courses = courses.courses || courses.data || [];
        }

        let users = usersResponse.data;
        if (!Array.isArray(users)) {
          console.warn("usersResponse.data não é um array:", users);
          users = users.users || users.data || [];
        }

        const coursesWithCoordinators = courses.map((course) => ({
          ...course,
          coordinatorName:
            users.find((user) => user.id === course.coordinatorId)?.username ||
            "N/A",
        }));

        setCourses(coursesWithCoordinators);
      } catch (error) {
        console.error(
          "Erro ao buscar cursos:",
          error.message,
          error.response?.data
        );
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
          course.type?.toLowerCase().includes(search.trim().toLowerCase())
      )
    : [];

  const handleRegister = async (newCourse) => {
    console.log("Novo curso registrado:", newCourse);
    try {
      const [coursesResponse, usersResponse] = await Promise.all([
        api.get("/courses"),
        api.get("/users"),
      ]);
      console.log(
        "Resposta da API /courses após registro:",
        coursesResponse.data
      );
      console.log("Resposta da API /users após registro:", usersResponse.data);

      let courses = coursesResponse.data;
      if (!Array.isArray(courses)) {
        console.warn("coursesResponse.data não é um array:", courses);
        courses = courses.courses || courses.data || [];
      }

      let users = usersResponse.data;
      if (!Array.isArray(users)) {
        console.warn("usersResponse.data não é um array:", users);
        users = users.users || users.data || [];
      }

      const coursesWithCoordinators = courses.map((course) => ({
        ...course,
        coordinatorName:
          users.find((user) => user.id === course.coordinatorId)?.username ||
          "N/A",
      }));
      setCourses(coursesWithCoordinators);
    } catch (error) {
      console.error(
        "Erro ao refetch cursos após registro:",
        error.message,
        error.response?.data
      );
      setCourses((prev) => [
        ...prev,
        {
          ...newCourse,
          coordinatorName: newCourse.coordinatorId
            ? prev.find((c) => c.coordinatorId === newCourse.coordinatorId)
                ?.coordinatorName || "N/A"
            : "N/A",
        },
      ]);
    }
  };

  const handleUpdate = async (updatedCourse) => {
    try {
      const response = await api.get(`/courses/${updatedCourse.id}`);
      const freshCourse = response.data.course;

      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          String(course.id) === String(freshCourse.id) ? freshCourse : course
        )
      );
      setOpenDialog(false);
      setCourseToEdit(null);
    } catch (error) {
      console.error("Erro ao buscar curso atualizado:", error);
    }
  };

  const handleEditCourse = (course) => {
    setCourseToEdit(course);
    setOpenDialog(true);
  };

  const handleDeleteClick = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    console.log("Curso recebido para exclusão:", course);
    console.log("ID do curso a ser excluído:", courseId);
    setCourseToDelete(course);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/courses/${courseToDelete.id}`);
      setCourses(courses.filter((c) => c.id !== courseToDelete.id));
      setAlert({
        message: `Curso ${courseToDelete.name} excluído com sucesso!`,
        type: "success",
      });
    } catch (error) {
      console.error("Erro ao excluir curso:", error);
      setAlert({
        message: "Erro ao excluir curso.",
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
        Cursos
      </Typography>

      {/* Barra de pesquisa e botão de cadastro */}
      <SearchAndCreateBar
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        createButtonLabel="Cadastrar Curso"
        onCreateClick={() => {
          setCourseToEdit(null);
          setOpenDialog(true);
        }}
      />

      <CoursesTable
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
        onUpdate={handleRegister}
        courseToEdit={courseToEdit}
      />

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        message={`Deseja realmente excluir o curso "${courseToDelete?.name}"?`}
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
