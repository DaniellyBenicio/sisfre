import React, { useState, useMemo } from "react";
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import Paginate from "../../../components/paginate/Paginate";

const UsersTable = ({ users, onDelete, onUpdate }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const generateCode = (username) => {
    if (!username) return "";
    const parts = username.trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts[1] || "";
    if (lastName) {
      return (firstName[0] || "") + (lastName[0] || "").toUpperCase();
    }
    return (firstName.slice(0, 2) || "").toUpperCase();
  };

  const visibleUsers = useMemo(() => {
    
    if (!Array.isArray(users)) return [];
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return users.slice(startIndex, endIndex);
  }, [users, page, rowsPerPage]);

  const tableHeadStyle = {
    fontWeight: "bold",
    backgroundColor: "#087619",
    color: "#fff",
    borderRight: "1px solid #fff",
    padding: { xs: "4px", sm: "6px" },
    height: "30px",
    lineHeight: "30px",
  };

  const tableBodyCellStyle = {
    borderRight: "1px solid #e0e0e0",
    padding: { xs: "4px", sm: "6px" },
    height: "30px",
    lineHeight: "30px",
  };

  if (isMobile) {
    return (
      <Stack spacing={1} sx={{ width: "100%" }}>
        {visibleUsers.map((user) => (
          <Paper key={user.id} sx={{ p: 1 }}>
            <Stack spacing={0.5}>
              <Typography>
                <strong>Sigla:</strong> {generateCode(user.username)}
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
              <Stack direction="row" spacing={1} justifyContent="center">
                <IconButton
                  onClick={() => onUpdate(user)}
                  sx={{
                    color: '#087619',
                    '&:hover': { color: '#065412' },
                  }}
                >
                  <Edit />
                </IconButton>
                <IconButton color="error" onClick={() => onDelete(user.id)}>
                  <Delete />
                </IconButton>
              </Stack>
            </Stack>
          </Paper>
        ))}
        <Paginate
          count={Math.ceil((Array.isArray(users) ? users.length : 0) / rowsPerPage)}
          page={page}
          onChange={(event, newPage) => {
            handleChangePage(newPage);
          }}
        />
      </Stack>
    );
  }

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={tableHeadStyle}>
                Sigla
              </TableCell>
              <TableCell align="center" sx={tableHeadStyle}>
                Nome
              </TableCell>
              <TableCell align="center" sx={tableHeadStyle}>
                Tipo
              </TableCell>
              <TableCell align="center" sx={tableHeadStyle}>
                Email
              </TableCell>
              <TableCell align="center" sx={tableHeadStyle}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell align="center" sx={tableBodyCellStyle}>
                  {generateCode(user.username)}
                </TableCell>
                <TableCell align="center" sx={tableBodyCellStyle}>
                  {user.username}
                </TableCell>
                <TableCell align="center" sx={tableBodyCellStyle}>
                  {user.accessType}
                </TableCell>
                <TableCell align="center" sx={tableBodyCellStyle}>
                  {user.email}
                </TableCell>
                <TableCell align="center" sx={tableBodyCellStyle}>
                  <IconButton
                    onClick={() => onUpdate(user)}
                    sx={{
                      color: '#087619',
                      '&:hover': { color: '#065412' },
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => onDelete(user.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Paginate
        count={Math.ceil((Array.isArray(users) ? users.length : 0) / rowsPerPage)}
        page={page}
        onChange={(event, newPage) => {
          handleChangePage(newPage);
        }}
      />
    </>
  );
};

export default UsersTable;