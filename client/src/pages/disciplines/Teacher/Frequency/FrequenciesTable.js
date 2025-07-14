import React from 'react';
import { Stack, Typography } from "@mui/material";
import FrequencyTable from "../../../../components/homeScreen/FrequencyTable"; 

const FrequenciesTable = ({ frequencies, onUpload, search, isFiltered, setAlert }) => {
  const capitalizeOnlyFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const formattedFrequencies = frequencies;
  console.log("Frequencies received in FrequenciesTable:", formattedFrequencies);

  const headers = [
    { key: "displayDate", label: "Data" },
    { key: "class", label: "Turma" },
    { key: "time", label: "Horário" },
    { key: "status", label: "Status" },
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
        <strong>Horário:</strong> {frequency.time || 'N/A'}
      </Typography>
      <Typography>
        <strong>Status:</strong> {frequency.status || 'N/A'}
      </Typography>
    </Stack>
  );

  return (
    <FrequencyTable
      data={formattedFrequencies}
      headers={headers}
      onUpload={onUpload}
      search={search}
      renderMobileRow={renderMobileRow}
      isFiltered={isFiltered}
      setAlert={setAlert}
    />
  );
};

export default FrequenciesTable;