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