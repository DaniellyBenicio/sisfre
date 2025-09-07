import { styled } from '@mui/material/styles';
import { Select, TextField } from '@mui/material';

export const StyledSelect = styled(Select)(({ theme }) => ({
  height: '50px',
  fontSize: '0.875rem',
  '& .MuiSelect-select': {
    padding: '8px 14px',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#000000',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#000000 !important',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    transform: 'translate(14px, 10px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -6px) scale(0.75)',
      fontWeight: 'bold',
      color: '#000000',
    },
    '&.Mui-focused': {
      color: '#000000',
    },
  },
}));

export const StyledTextField = styled(TextField)({
  '& .MuiInputLabel-root': {
    top: '50%',
    transform: 'translate(14px, -50%)', 
    color: 'text.secondary',
    fontSize: { xs: '0.9rem', md: '1rem' },
    transition: 'color 0.3s ease, transform 0.3s ease',
  },
  '& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-root.MuiInputLabel-shrink': {
    color: '#000000',
  },
  '& .MuiOutlinedInput-root': {
    height: '56px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    '& input': {
      backgroundColor: 'transparent !important',
      WebkitBoxShadow: '0 0 0 1000px transparent inset',
      WebkitTextFillColor: '#000',
      transition: 'background-color 5000s ease-in-out 0s',
    },
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#000000',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#000000',
      borderWidth: '2px',
    },
  },
});

export const StyledDateFilter = styled(TextField)({
  '& .MuiInputLabel-root': {
    top: 0,
    transform: 'translate(14px, -6px) scale(0.75)',
    color: '#000000',
    fontSize: '0.875rem',
    transition: 'color 0.3s ease',
    backgroundColor: 'white',
    padding: '0 4px',
    marginLeft: '-4px',
    '&.Mui-focused': {
      color: '#000000',
    },
  },
  '& .MuiOutlinedInput-root': {
    height: '56px',
    borderRadius: '5px',
    backgroundColor: 'transparent',
    '& input': {
      backgroundColor: 'transparent !important',
      WebkitBoxShadow: '0 0 0 1000px transparent inset',
      WebkitTextFillColor: '#000',
      transition: 'background-color 5000s ease-in-out 0s',
      padding: '16.5px 14px',
      fontSize: '0.875rem',
      '&[type="date"]::-webkit-calendar-picker-indicator': {
        cursor: 'pointer',
        filter: 'invert(0)',
      },
      '&[type="date"]::-webkit-datetime-edit-fields-wrapper': {
        padding: 0,
      },
      '&[type="date"]:not(:focus):placeholder-shown::-webkit-datetime-edit': {
        opacity: 0,
      },
      '&[type="date"]:not(:focus):placeholder-shown::before': {
        content: '"dd/mm/aaaa"',
        color: '#757575',
        position: 'absolute',
        left: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
      },
    },
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#000000',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#000000',
      borderWidth: '2px',
    },
  },
  '& .MuiOutlinedInput-root:has(input[type="date"]:focus) input::before': {
    content: 'none',
  },
});