import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Login from "../pages/login/Login.js";
import UsersPage from "../pages/admin/users/UsersPage.js";
import CoursePage from "../pages/admin/courses/CoursesPage.js";
import MainScreen from "../pages/MainScreen.js";

const AppRoutes = () => {
  // Inicializa isAuthenticated com base no token no localStorage
  const [isAuthenticated, setAuthenticated] = useState(() => {
    const token = localStorage.getItem("token");
    return !!token; // true se existe, false se não
  });
  const accessType = localStorage.getItem("accessType");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthenticated(!!token);
  }, []);

  const handleLogin = () => {
    setAuthenticated(true);
    navigate("/users");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessType");
    setAuthenticated(false);
    navigate("/login");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={ <Navigate to="/login" /> }
      />
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Login onLogin={handleLogin} />
          ) : (
            <Navigate to="/users" />
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
