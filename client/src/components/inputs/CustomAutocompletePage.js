import React from 'react';
import { FormControl, Autocomplete, TextField, Popper, Paper } from '@mui/material';

const CustomAutocomplete = ({
  label,
  name,
  value,
  onChange,
  options,
  getOptionLabel,
  selectSx,
  disabled,
  loading,
  isOptionEqualToValue,
  ...props
}) => {
  return (
    <FormControl fullWidth required sx={{ minWidth: 190, maxWidth: 600, ...props.sx }}>
      <Autocomplete
        options={options}
        getOptionLabel={getOptionLabel}
        value={value || null}
        onChange={onChange}
        disabled={disabled || loading}
        isOptionEqualToValue={isOptionEqualToValue}
        noOptionsText="Nenhuma opção disponível"
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            variant="outlined"
            InputLabelProps={{
              sx: {
                '&.Mui-focused': { color: '#000' },
                '&.MuiInputLabel-shrink': { color: '#000' },
              },
            }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000',
                borderWidth: '1px',
              },
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000',
                  },
                  boxShadow: 'none',
                  outline: 'none',
                },
                '& input:focus': {
                  outline: 'none',
                  boxShadow: 'none',
                },
              },
              ...selectSx,
            }}
          />
        )}
        PopperComponent={(popperProps) => (
          <Popper
            {...popperProps}
            sx={{
              width: selectSx?.width || 'auto',
              '& .MuiAutocomplete-listbox': {
                maxHeight: '200px',
                overflowY: 'auto',
                padding: 0,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#888',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: '#555',
                },
              },
            }}
          >
            <Paper
              sx={{
                margin: 0,
                border: '1px solid rgba(0, 0, 0, 0.23)',
                '& .MuiAutocomplete-option': {
                  minHeight: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    backgroundColor: '#D5FFDB !important',
                  },
                  '&[aria-selected="true"]': {
                    backgroundColor: '#D5FFDB !important',
                    '&:hover': {
                      backgroundColor: '#D5FFDB !important',
                    },
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#D5FFDB !important',
                    outline: 'none',
                  },
                },
              }}
            >
              {popperProps.children}
            </Paper>
          </Popper>
        )}
        {...props}
      />
    </FormControl>
  );
};

export default CustomAutocomplete;