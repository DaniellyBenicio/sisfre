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
import ClassOptionsPage from "../pages/admin/ClassOptions/ClassOptionsPage.js";
import ClassScheduleCreate from "../pages/classSchedule/Coodinator/ClassScheduleCreate.js";
import HolidayPage from "../pages/admin/Holiday/HolidayPage.js";
import ClassScheduleDetails from "../pages/classSchedule/Coodinator/ClassScheduleDetails.js";

const AppRoutes = () => {
  const [isAuthenticated, setAuthenticated] = useState(() => {
    const token = localStorage.getItem("token");
    console.log("Initial isAuthenticated:", !!token); // Depuração
    return !!token;
  });
  const accessType = localStorage.getItem("accessType");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Checking token:", token); // Depuração
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        console.log("Token decoded, exp:", decoded.exp, "currentTime:", currentTime);
        if (decoded.exp < currentTime) {
          localStorage.removeItem("token");
          localStorage.removeItem("accessType");
          setAuthenticated(false);
          navigate("/login");
        }
      } catch (err) {
        console.error("Token error:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("accessType");
        setAuthenticated(false);
        alert("Erro com o token de autenticação. Faça login novamente.");
        navigate("/login");
      }
    }
  }, [navigate]);

  const handleLogin = () => {
    console.log("Handle login called");
    setAuthenticated(true);
    const access = localStorage.getItem("accessType");
    console.log("Access type after login:", access);
    if (access === "Admin") {
      navigate("/calendar-options");
    } else {
      navigate("/disciplines");
    }
  };

  const handleLogout = () => {
    console.log("Handle logout called");
    localStorage.removeItem("token");
    localStorage.removeItem("accessType");
    localStorage.removeItem("username");
    setAuthenticated(false);
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
          isAuthenticated && (accessType === "Admin" || accessType === "Coordenador") ? (
            <ClassOptionsPage setAuthenticated={handleLogout} />
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
        path="/classes"
        element={
          isAuthenticated ? (
            <ClassesPage setAuthenticated={handleLogout} />
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
        path="/class-schedule"
        element={
          isAuthenticated ? (
            <ClassSchedulePage setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/class-schedule-create"
        element={
          isAuthenticated ? (
            <ClassScheduleCreate setAuthenticated={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/class-schedule-details/:disciplineId"
        element={
          isAuthenticated ? (
            <ClassScheduleDetails setAuthenticated={handleLogout} />
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
            <HolidayPage setAuthenticated={handleLogout} /> // Substituí o placeholder
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;