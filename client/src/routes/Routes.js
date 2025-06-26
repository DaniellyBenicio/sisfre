import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Login from "../pages/login/Login.js";
import UsersPage from "../pages/admin/users/UsersPage.js";
import CoursePage from "../pages/admin/courses/CoursesPage.js";
import ClassesPage from "../pages/admin/classes/ClassesPages.js";
import CalendarPage from "../pages/admin/Calendars/CalendarPage.js";
import MainScreen from "../pages/MainScreen.js";
import ForgotPassword from "../pages/password/ForgotPassword.js";
import ResetPassword from "../pages/password/ResetPassword.js";
import DisciplinePage from "../pages/disciplines/DisciplinePage.js";
import SaturdaySchoolPage from "../pages/admin/SaturdaySchool/SaturdaySchoolPage.js";
import CalendarOptionsPage from "../pages/admin/CalendarOptions/CalendarOptionsPage.js";
import ClassSchedulePage from "../pages/classSchedule/ClassSchedulePage.js";
import ClassOptionsPage from "../pages/disciplines/Teacher/ClassTeacher/ClassOptionsPage.js";
import ClassScheduleCreate from "../pages/classSchedule/Coodinator/ClassScheduleCreate.js";
import HolidayPage from "../pages/admin/Holiday/HolidayPage.js";
import ClassScheduleDetails from "../pages/classSchedule/Coodinator/ClassScheduleDetails.js";
import ClassDetailsPage from "../pages/disciplines/Teacher/ClassTeacher/ClassDetails/ClassDetailsPage.js";
import ClassScheduleEdit from "../pages/classSchedule/Coodinator/ClassScheduleEdit.js";
import ClassScheduleOptions from "../pages/classSchedule/ClassScheduleOptions.js";
import ClassScheduleListArchived from "../pages/classSchedule/Coodinator/classScheduleArchived/ClassScheduleArchivedList.js";


const AppRoutes = () => {
  const [isAuthenticated, setAuthenticated] = useState(() => {
    const token = localStorage.getItem("token");
    return !!token;
  });
  const [accessType, setAccessType] = useState(localStorage.getItem("accessType"));
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          localStorage.removeItem("token");
          localStorage.removeItem("accessType");
          setAuthenticated(false);
          setAccessType(null);
          navigate("/login");
        } else {
          const storedAccessType = localStorage.getItem("accessType");
          if (storedAccessType !== accessType) {
            setAccessType(storedAccessType);
          }
        }
      } catch (err) {
        console.error("Token error:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("accessType");
        setAuthenticated(false);
        setAccessType(null);
        alert("Erro com o token de autenticação. Faça login novamente.");
        navigate("/login");
      }
    } else {
      setAuthenticated(false);
      setAccessType(null);
      navigate("/login");
    }
  }, [navigate, accessType]);

  const handleLogin = () => {
    setAuthenticated(true);
    const access = localStorage.getItem("accessType");
    setAccessType(access);
    if (access === "Admin") {
      navigate("/calendar-options");
    } else {
      navigate("/disciplines");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessType");
    localStorage.removeItem("username");
    setAuthenticated(false);
    setAccessType(null);
    navigate("/login");
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route
        path="/forgot-password"
        element={
          !isAuthenticated ? <ForgotPassword /> : <Navigate to="/MainScreen" />
        }
      />
      <Route
        path="/resetPassword/:token"
        element={
          !isAuthenticated ? <ResetPassword /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/calendar-options"
        element={
          isAuthenticated && accessType === "Admin" ? (
            <CalendarOptionsPage setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/class-options"
        element={
          isAuthenticated && accessType === "Professor" ? (
            <ClassOptionsPage setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/classes"
        element={
          isAuthenticated ? (
            accessType === "Professor" ? (
              <ClassOptionsPage setAuthenticated={handleLogout} />
            ) : accessType === "Admin" || accessType === "Coordenador" ? (
              <ClassesPage setAuthenticated={handleLogout} />
            ) : (
              <Navigate to="/Classes" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/users"
        element={
          isAuthenticated && accessType === "Admin" ? (
            <UsersPage setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/MainScreen" />
          )
        }
      />
      <Route
        path="/courses"
        element={
          isAuthenticated ? (
            <CoursePage setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/disciplines"
        element={
          isAuthenticated ? (
            <DisciplinePage setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/calendar"
        element={
          isAuthenticated && accessType === "Admin" ? (
            <CalendarPage setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/class-schedule/options"
        element={
          isAuthenticated && accessType === "Coordenador" ? (
            <ClassScheduleOptions setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/class-schedule"
        element={
          isAuthenticated && accessType === "Coordenador" ? (
            <ClassSchedulePage setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/class-schedule/archived"
        element={
          isAuthenticated && accessType === "Coordenador" ? (
            <ClassScheduleListArchived setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/class-schedule/create"
        element={
          isAuthenticated && accessType === "Coordenador" ? (
            <ClassScheduleCreate setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/class-schedule/details/:classScheduleId"
        element={
          isAuthenticated ? (
            <ClassScheduleDetails setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/class-schedule/edit/:id"
        element={
          isAuthenticated && accessType === "Coordenador" ? (
            <ClassScheduleEdit setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/saturday"
        element={
          isAuthenticated && accessType === "Admin" ? (
            <SaturdaySchoolPage setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/MainScreen"
        element={
          isAuthenticated ? (
            <MainScreen setAuthenticated={setAuthenticated} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/holiday"
        element={
          isAuthenticated && accessType === "Admin" ? (
            <HolidayPage setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/class-details-page/:classId"
        element={
          isAuthenticated ? (
            <ClassDetailsPage setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      /> {/* Nova rota adicionada */}
    </Routes>
  );
};

export default AppRoutes;