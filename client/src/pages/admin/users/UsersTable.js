import React from "react";
import { Stack, Typography } from "@mui/material";
import ArchiveDataTable from "../../../components/homeScreen/ArchiveDataTable"; 

const UsersTable = ({ users, onArchive, onUpdate, search }) => {
  const headers = [
    { key: "acronym", label: "Sigla" },
    { key: "username", label: "Nome" },
    { key: "accessType", label: "Tipo" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
  ];

  const renderMobileRow = (user) => (
    <Stack spacing={0.5}>
      <Typography>
        <strong>Sigla:</strong> {user.acronym}
      </Typography>
      <Typography>
        <strong>Nome:</strong> {user.username}
      </Typography>
      <Typography>
        <strong>Tipo:</strong> {user.accessType}
      </Typography>
      <Typography>
        <strong>Email:</strong> {user.email}
      </Typography>
      <Typography>
        <strong>Status:</strong> {user.isActive ? "Ativo" : "Inativo"}
      </Typography>
    </Stack>
  );

  return (
    <ArchiveDataTable
      data={users.map(user => ({
        ...user,
        status: user.isActive ? "Ativo" : "Inativo"
      }))}
      headers={headers}
      onArchive={onArchive}
      onUpdate={(user) => user.isActive && onUpdate(user)} 
      search={search}
      renderMobileRow={renderMobileRow}
    />
  );
};

export default UsersTable;