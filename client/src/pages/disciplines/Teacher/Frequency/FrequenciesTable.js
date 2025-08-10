import React from 'react';
import { Stack, Typography, IconButton } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';
import FrequencyTable from "../../../../components/homeScreen/FrequencyTable"; 

const FrequenciesTable = ({ frequencies, search, isFiltered, setAlert, onRegisterAbsenceWithCredit }) => {
  const navigate = useNavigate();

  const capitalizeOnlyFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const formattedFrequencies = frequencies.map(freq => ({
    ...freq,
    class: freq.courseId ? `Curso ${freq.courseId}` : "N/A", // Substituir por nome real do curso
    discipline: freq.disciplineId ? `Disciplina ${freq.disciplineId}` : "N/A", // Substituir por nome real da disciplina
  }));

  console.log("Frequencies received in FrequenciesTable:", formattedFrequencies);

  const headers = [
    { key: "displayDate", label: "Data" },
    { key: "class", label: "Turma" },
    { key: "discipline", label: "Disciplina" },
    { key: "time", label: "Horário" },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Ações",
      render: (frequency) => (
        <Stack direction="row" spacing={1}>
          {frequency.status === "Falta" && (
            <IconButton
              onClick={() => navigate('/justification', { state: { frequencyItem: frequency } })}
              title="Justificar Falta"
            >
              <Edit />
            </IconButton>
          )}
          <IconButton
            onClick={() => onRegisterAbsenceWithCredit(frequency)}
            title="Registrar Falta com Crédito"
          >
            <Edit />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const renderMobileRow = (frequency) => (
    <Stack spacing={0.5}>
      <Typography>
        <strong>Data:</strong> {frequency.displayDate || 'N/A'}
      </Typography>
      <Typography>
        <strong>Turma:</strong> {frequency.class || 'N/A'}
      </Typography>
      <Typography>
        <strong>Disciplina:</strong> {frequency.discipline || 'N/A'}
      </Typography>
      <Typography>
        <strong>Horário:</strong> {frequency.time || 'N/A'}
      </Typography>
      <Typography>
        <strong>Status:</strong> {frequency.status || 'N/A'}
      </Typography>
      <Stack direction="row" spacing={1}>
        {frequency.status === "Falta" && (
          <IconButton
            onClick={() => navigate('/justification', { state: { frequencyItem: frequency } })}
            title="Justificar Falta"
          >
            <Edit />
          </IconButton>
        )}
        <IconButton
          onClick={() => onRegisterAbsenceWithCredit(frequency)}
          title="Registrar Falta com Crédito"
        >
          <Edit />
        </IconButton>
      </Stack>
    </Stack>
  );

  return (
    <FrequencyTable
      data={formattedFrequencies}
      headers={headers}
      search={search}
      renderMobileRow={renderMobileRow}
      isFiltered={isFiltered}
      setAlert={setAlert}
    />
  );
};

export default FrequenciesTable;