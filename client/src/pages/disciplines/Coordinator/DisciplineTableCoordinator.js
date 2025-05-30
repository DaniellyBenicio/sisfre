import { Stack, Typography } from "@mui/material";
import Tables from "../../../components/homeScreen/Tables";

const DisciplinesTableCoordinator = ({ disciplines, onDelete, onUpdate, search, renderActions, showActions }) => {
  const headers = [
    { key: "acronym", label: "Sigla" },
    { key: "name", label: "Nome" },
    { key: "workload", label: "Carga Horária" },
  ];

  const renderMobileRow = (discipline) => (
    <Stack spacing={0.5}>
      <Typography>
        <strong>Sigla:</strong> {discipline.acronym}
      </Typography>
      <Typography>
        <strong>Nome:</strong> {discipline.name}
      </Typography>
      <Typography>
        <strong>Carga Horária:</strong> {discipline.workload}
      </Typography>
    </Stack>
  );

  return (
    <Tables
      data={disciplines}
      headers={headers}
      onDelete={onDelete}
      onUpdate={onUpdate}
      search={search}
      renderMobileRow={renderMobileRow}
      renderActions={renderActions}
      showActions={showActions}
    />
  );
};

export default DisciplinesTableCoordinator;