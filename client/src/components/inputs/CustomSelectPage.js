import { FormControl, InputLabel, Select, MenuItem, Box, CircularProgress } from "@mui/material";

const CustomSelect = ({ label, name, value, onChange, children, selectSx, disabled, loading, ...props }) => {
  return (
    <FormControl fullWidth required sx={{ minWidth: 190, maxWidth: 600, ...props.sx }}>
      <InputLabel
        id={`${name}-label`}
        sx={{
          "&.Mui-focused": { color: "#000" },
          "&.MuiInputLabel-shrink": { color: "#000" },
        }}
      >
        {label}
      </InputLabel>
      <Select
        labelId={`${name}-label`}
        name={name}
        value={value || ""}
        onChange={onChange}
        label={label}
        displayEmpty={false}
        disabled={disabled || loading}
        sx={{
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.23)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#000", },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#000", },
          ...selectSx,
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: "200px",
              overflowY: "auto",
              width: "auto",
              "& .MuiMenuItem-root": {
                minHeight: "36px",
                display: "flex",
                alignItems: "center",
              },
              "& .MuiMenuItem-root.Mui-selected": {
                backgroundColor: "#D5FFDB",
                "&:hover": { backgroundColor: "#D5FFDB" },
              },
              "& .MuiMenuItem-root:hover": {
                backgroundColor: "#D5FFDB",
              },
            },
          },
        }}
        {...props}
      >
        {loading ? (
          <MenuItem disabled>
            <Box display="flex" alignItems="center" justifyContent="center" width="100%">
              <CircularProgress size={20} />
            </Box>
          </MenuItem>
        ) : (
          children
        )}
      </Select>
    </FormControl>
  );
};

export default CustomSelect;