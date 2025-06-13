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
import ClassSchedulePage from "../pages/classSchedule/ClassSchedulePage.js";

const AppRoutes = () => {
  const [isAuthenticated, setAuthenticated] = useState(() => {
    const token = localStorage.getItem("token");
    return !!token; // true if token exists, false otherwise
  });
  const accessType = localStorage.getItem("accessType");
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
          navigate("/login");
        }
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("accessType");
        setAuthenticated(false);
        alert("Erro com o token de autenticação. Faça login novamente.");
        navigate("/login");
      }
    }
  }, [navigate]);

  const handleLogin = () => {
    setAuthenticated(true);
    const access = localStorage.getItem("accessType");

    if (access === "Admin") {
      navigate("/users");
    } else {
      navigate("/disciplines");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessType");
    setAuthenticated(false);
    navigate("/login");
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route
        path="/login"
        element={<Login onLogin={handleLogin} />}
      />
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
          isAuthenticated ? (
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
        path="/MainScreen"
        element={
          isAuthenticated ? (
            <MainScreen setAuthenticated={setAuthenticated} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;