import { Stack, Typography } from "@mui/material";
import DataTable from "../../../components/homeScreen/DataTable";

const DisciplinesTable = ({ disciplines, onDelete, onUpdate, search, setAlert }) => {
  const headers = [
    { key: "acronym", label: "Sigla" },
    { key: "name", label: "Nome" },
  ];

  const renderMobileRow = (discipline) => (
    <Stack spacing={0.5}>
      <Typography>
        <strong>Sigla:</strong> {discipline.acronym}
      </Typography>
      <Typography>
        <strong>Nome:</strong> {discipline.name}
      </Typography>
    </Stack>
  );

  return (
    <DataTable
      data={disciplines}
      headers={headers}
      onDelete={onDelete} 
      onUpdate={onUpdate}
      search={search}
      renderMobileRow={renderMobileRow}
      setAlert={setAlert} 
    />
  );
};

export default DisciplinesTable;