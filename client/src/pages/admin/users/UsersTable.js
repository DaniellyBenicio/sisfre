import React from "react";
import { Stack, Typography } from "@mui/material";
import DataTable from "../../../components/homeScreen/DataTable"; 

const UsersTable = ({ users, onDelete, onUpdate, search }) => {
  const headers = [
    { key: "acronym", label: "Sigla" },
    { key: "username", label: "Nome" },
    { key: "accessType", label: "Tipo" },
    { key: "email", label: "Email" },
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
    </Stack>
  );

  return (
    <DataTable
      data={users}
      headers={headers}
      onDelete={onDelete}
      onUpdate={onUpdate}
      search={search}
      renderMobileRow={renderMobileRow}
    />
  );
};

export default UsersTable;