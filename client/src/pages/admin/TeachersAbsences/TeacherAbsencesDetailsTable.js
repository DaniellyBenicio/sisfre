import React from "react";
import { IconButton, Stack, Typography } from "@mui/material";
import { Note } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Tables from "../../../components/homeScreen/Tables";

const TeacherAbsencesDetailsTable = ({ frequencies, search, isFiltered, setAlert }) => {
  const navigate = useNavigate();

  const handleJustifyClick = (item) => {
    if (item.status?.toLowerCase() === "falta") {
      navigate("/justify", { state: { frequencyItem: item } });
    } else {
      setAlert({
        message: 'Justificativa disponível apenas para status "Falta".',
        type: "warning",
      });
    }
  };

  const headers = [
    { key: "displayDate", label: "Data" },
    { key: "class", label: "Curso/Turma" },
    { key: "turno", label: "Turno" },
    { key: "status", label: "Status" },
    { key: "justification", label: "Justificativa" },
  ];

  return (
    <Tables
      data={Array.isArray(frequencies) ? frequencies : []}
      headers={headers}
      search={search}
      isFiltered={isFiltered}
      showActions={false} // Remove the actions column
      renderMobileRow={(item) => (
        <Stack spacing={0.5}>
          {headers.map((header) => (
            <Typography
              key={header.key}
              sx={{
                color:
                  header.key === "status" && item[header.key]?.toLowerCase() === "falta"
                    ? "red"
                    : "inherit",
                fontWeight:
                  header.key === "status" && item[header.key]?.toLowerCase() === "falta"
                    ? "bold"
                    : "normal",
              }}
            >
              <strong>{header.label}:</strong>{" "}
              {header.key === "justification" ? (
                item.justification?.trim() ? (
                  <IconButton
                    onClick={() => handleJustifyClick(item)}
                    disabled={item.status?.toLowerCase() !== "falta"}
                    sx={{
                      color:
                        item.status?.toLowerCase() === "falta"
                          ? "#087619"
                          : item.status?.toLowerCase() === "abonada"
                          ? "gray"
                          : "rgba(0, 0, 0, 0.26)",
                      "&:hover": {
                        color:
                          item.status?.toLowerCase() === "falta"
                            ? "#065412"
                            : item.status?.toLowerCase() === "abonada"
                            ? "gray"
                            : "rgba(0, 0, 0, 0.26)",
                        backgroundColor: "transparent",
                      },
                      padding: 0,
                      verticalAlign: "middle",
                    }}
                  >
                    <Note />
                  </IconButton>
                ) : (
                  "N/A"
                )
              ) : (
                item[header.key] || "N/A"
              )}
            </Typography>
          ))}
        </Stack>
      )}
      renderRowCell={(item, header) => (
        header.key === "justification" ? (
          item.justification?.trim() ? (
            <IconButton
              onClick={() => handleJustifyClick(item)}
              disabled={item.status?.toLowerCase() !== "falta"}
              sx={{
                color:
                  item.status?.toLowerCase() === "falta"
                    ? "#087619"
                    : item.status?.toLowerCase() === "abonada"
                    ? "gray"
                    : "rgba(0, 0, 0, 0.26)",
                "&:hover": {
                  color:
                    item.status?.toLowerCase() === "falta"
                      ? "#065412"
                      : item.status?.toLowerCase() === "abonada"
                      ? "gray"
                      : "rgba(0, 0, 0, 0.26)",
                  backgroundColor: "transparent",
                },
              }}
            >
              <Note />
            </IconButton>
          ) : (
            "N/A"
          )
        ) : (
          <Typography
            sx={{
              color:
                header.key === "status" && item[header.key]?.toLowerCase() === "falta"
                  ? "red"
                  : header.key === "status" && item[header.key]?.toLowerCase() === "abonada"
                  ? "#FFA500"
                  : "inherit",
              fontWeight:
                header.key === "status" && item[header.key]?.toLowerCase() === "falta"
                  ? "bold"
                  : "normal",
            }}
          >
            {item[header.key] || "N/A"}
          </Typography>
        )
      )}
    />
  );
};

export default TeacherAbsencesDetailsTable;