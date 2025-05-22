import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import SearchAndCreateBar from "../../../components/homeScreen/SearchAndCreateBar"; 
import UserRegistrationPopup from "./UserResgistrationPopup";
import UserDelete from "./UserDelete";
import UserUpdatePopup from "./UserUpdatePopup";
import api from "../../../service/api";
import UsersTable from "./UsersTable";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users/all");
      console.log("UserList - Resposta da API:", response.data);
      if (!response.data || !Array.isArray(response.data.users)) {
        throw new Error("Erro ao buscar usuários: Dados inválidos");
      }
      setUsers(response.data.users);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Dados do erro:", error.response.data);
      }
      setUsers([]);
    }
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        const normalizedSearch = search
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const normalizedUsername =
          user.username
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") || "";

        const normalizedAccessType =
          user.accessType
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") || "";

        return (
          normalizedUsername.includes(normalizedSearch) ||
          normalizedAccessType.includes(normalizedSearch)
        );
      })
    : [];

  const handleRegister = async () => {
    await fetchUsers();
  };

  const handleEdit = (user) => {
    console.log("UserList - Usuário para edição:", user);
    setUserToEdit(user);
    setOpenUpdateDialog(true);
  };

  const handleUpdate = async (updatedUser) => {
    try {
      const response = await api.get(`/users/${updatedUser.id}`);
      const freshUser = response.data.user;

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          String(user.id) === String(freshUser.id) ? freshUser : user
        )
      );
      setOpenUpdateDialog(false);
      setUserToEdit(null);
    } catch (error) {
      console.error("Erro ao buscar usuário atualizado:", error);
    }
  };

  const handleDelete = (userId) => {
    console.log("UserList - Usuário para deleção:", userId);
    setUserToDelete(users.find((u) => u.id === userId));
    setOpenDeleteDialog(true);
  };

  const handleDeleteSuccess = (userId) => {
    console.log("UserList - Usuário deletado:", userId);
    fetchUsers();
  };

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
        Usuários
      </Typography>
      <SearchAndCreateBar
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        createButtonLabel="Cadastrar Usuário"
        onCreateClick={() => setOpenDialog(true)}
      />
      <UsersTable
        users={filteredUsers}
        onDelete={handleDelete}
        onUpdate={handleEdit}
        search={search}
      />
      <UserRegistrationPopup
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onRegister={handleRegister}
      />
      <UserUpdatePopup
        open={openUpdateDialog}
        onClose={() => {
          setOpenUpdateDialog(false);
          setUserToEdit(null);
        }}
        user={userToEdit}
        onUpdate={handleUpdate}
      />
      <UserDelete
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setUserToDelete(null);
        }}
        userId={userToDelete ? userToDelete.id : null}
        userName={userToDelete ? userToDelete.username : ""}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </Box>
  );
};

export default UserList;