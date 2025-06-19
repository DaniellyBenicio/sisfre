import { Stack, Typography } from '@mui/material';
import DataTable from '../../../components/homeScreen/DataTable';
import PropTypes from 'prop-types';

const HolidaysTable = ({ holidays, onDelete, onUpdate, search, setAlert }) => {
  // Função para normalizar os dados, se necessário
  const normalizeString = (str) => {
    if (!str) return 'N/A';
    return str;
  };

  // Formata os dados para exibição
  const formattedHolidays = holidays.map((holidayItem) => ({
    ...holidayItem,
    date: normalizeString(holidayItem.date),
    observation: normalizeString(holidayItem.observation),
  }));

  // Define as colunas da tabela
  const headers = [
    { key: 'date', label: 'Data' },
    { key: 'observation', label: 'Observações' },
  ];

  // Renderiza a linha para visualização em dispositivos móveis
  const renderMobileRow = (holidayItem) => (
    <Stack spacing={0.5}>
      <Typography>
        <strong>Data:</strong> {normalizeString(holidayItem.date)}
      </Typography>
      <Typography>
        <strong>Observações:</strong> {normalizeString(holidayItem.observation)}
      </Typography>
    </Stack>
  );

  return (
    <DataTable
      data={formattedHolidays}
      headers={headers}
      onDelete={onDelete}
      onUpdate={onUpdate}
      search={search}
      renderMobileRow={renderMobileRow}
    />
  );
};

// Validação de props com PropTypes
HolidaysTable.propTypes = {
  holidays: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
      observation: PropTypes.string.isRequired,
    })
  ).isRequired,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  search: PropTypes.string,
  setAlert: PropTypes.func,
};

export default HolidaysTable;