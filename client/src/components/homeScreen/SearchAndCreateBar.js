import React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import { Search } from "@mui/icons-material";

const SearchAndCreateBar = ({
  searchValue,
  onSearchChange,
  createButtonLabel,
  onCreateClick,
}) => {
  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      marginBottom={0.5}
      gap={2}
      sx={{
        width: "100%",
        maxWidth: "1200px",
        "& > *": {
          flexShrink: 0,
        },
      }}
    >
      <TextField
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Buscar..."
        variant="outlined"
        sx={{
          width: { xs: "100%", sm: "50%", md: "400px" },
          maxWidth: "100%",
          "& .MuiInputBase-root": {
            height: "36px",
          },
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": {
              borderColor: "#087619",
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      <Button
        variant="contained"
        onClick={onCreateClick}
        sx={{
          backgroundColor: "#087619",
          "&:hover": { backgroundColor: "#065412" },
          textTransform: "none",
          width: { xs: "100%", sm: "auto" },
          fontWeight: "bold",
        }}
      >
        {createButtonLabel}
      </Button>
    </Box>
  );
};

export default SearchAndCreateBar;