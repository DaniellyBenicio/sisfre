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
import Paginate from "../paginate/Paginate";

const Tables = ({
  data,
  headers,
  onDelete,
  onUpdate,
  search,
  renderMobileRow,
  renderActions,
  showActions = true,
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const visibleData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, page, rowsPerPage]);

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
        {visibleData.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" fontStyle="italic">
              {data.length === 0
                ? "Nenhum item encontrado"
                : search
                ? "Nenhum item encontrado com a busca atual"
                : "Nenhum item encontrado com os filtros aplicados"}
            </Typography>
          </Paper>
        ) : (
          visibleData.map((item) =>
            renderMobileRow ? (
              <Paper key={item.id} sx={{ p: 1 }}>
                {renderMobileRow(item)}
                {showActions && (
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {renderActions ? (
                      renderActions(item)
                    ) : (
                      <>
                        <IconButton
                          onClick={() => onUpdate(item)}
                          sx={{ color: "#087619", "&:hover": { color: "#065412" } }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton color="error" onClick={() => onDelete(item.id)}>
                          <Delete />
                        </IconButton>
                      </>
                    )}
                  </Stack>
                )}
              </Paper>
            ) : (
              <Paper key={item.id} sx={{ p: 1 }}>
                <Stack spacing={0.5}>
                  {headers.map((header) => (
                    <Typography key={header.key}>
                      <strong>{header.label}:</strong> {item[header.key]}
                    </Typography>
                  ))}
                  {showActions && (
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        onClick={() => onUpdate(item)}
                        sx={{
                          color: "#087619",
                          "&:hover": { color: "#065412" },
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => onDelete(item.id)}>
                        <Delete />
                      </IconButton>
                    </Stack>
                  )}
                </Stack>
              </Paper>
            )
          )
        )}
        {data.length > rowsPerPage && (
          <Paginate
            count={Math.ceil((Array.isArray(data) ? data.length : 0) / rowsPerPage)}
            page={page}
            onChange={(event, newPage) => {
              handleChangePage(newPage);
            }}
          />
        )}
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
              {headers.map((header) => (
                <TableCell key={header.key} align="center" sx={tableHeadStyle}>
                  {header.label}
                </TableCell>
              ))}
              {showActions && (
                <TableCell align="center" sx={tableHeadStyle}>
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={headers.length + (showActions ? 1 : 0)}
                  align="center"
                  sx={tableBodyCellStyle}
                >
                  {data.length === 0
                    ? "Nenhum item encontrado"
                    : search
                    ? "Nenhum item encontrado com a busca atual"
                    : "Nenhum item encontrado com os filtros aplicados"}
                </TableCell>
              </TableRow>
            ) : (
              visibleData.map((item) => (
                <TableRow key={item.id}>
                  {headers.map((header) => (
                    <TableCell
                      key={header.key}
                      align="center"
                      sx={tableBodyCellStyle}
                    >
                      {item[header.key]}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell align="center" sx={tableBodyCellStyle}>
                      {renderActions ? (
                        renderActions(item)
                      ) : (
                        <>
                          <IconButton
                            onClick={() => onUpdate(item)}
                            sx={{ color: "#087619", "&:hover": { color: "#065412" } }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton color="error" onClick={() => onDelete(item.id)}>
                            <Delete />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {data.length > rowsPerPage && (
        <Paginate
          count={Math.ceil((Array.isArray(data) ? data.length : 0) / rowsPerPage)}
          page={page}
          onChange={(event, newPage) => {
            handleChangePage(newPage);
          }}
        />
      )}
    </>
  );
};

export default Tables;