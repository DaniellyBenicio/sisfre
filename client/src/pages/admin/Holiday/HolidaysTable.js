import React from 'react';
import { Stack, Typography, Box, CircularProgress } from '@mui/material';
import DataTable from "../../../components/homeScreen/DataTable";
import PropTypes from 'prop-types';

const HolidaysTable = ({ holidays, onDelete, onUpdate, search, setAlert, loading }) => {
    const normalizeString = (str) => str || 'N/A';

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const [year, month, day] = dateString.split('-');
        if (year && month && day) {
            return `${day}-${month}-${year}`;
        }
        return dateString; 
    };

    const formattedHolidays = holidays.map((holidayItem) => ({
        id: holidayItem.id,
        name: normalizeString(holidayItem.name),
        date: formatDate(holidayItem.date), 
        type: normalizeString(holidayItem.type),
    }));

    const headers = [
        { key: 'date', label: 'Data' },
        { key: 'name', label: 'Nome' },
        { key: 'type', label: 'Tipo' },
    ];

    const renderMobileRow = (holidayItem) => (
        <Stack spacing={0.5}>
            <Typography>
                <strong>Data:</strong> {holidayItem.date} {/* This will now use the formatted date */}
            </Typography>
            <Typography>
                <strong>Nome:</strong> {normalizeString(holidayItem.name)}
            </Typography>
            <Typography>
                <strong>Tipo:</strong> {normalizeString(holidayItem.type)}
            </Typography>
        </Stack>
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

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

HolidaysTable.propTypes = {
    holidays: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired, 
            type: PropTypes.string.isRequired,
        })
    ).isRequired,
    onDelete: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    search: PropTypes.string,
    setAlert: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
};

export default HolidaysTable;