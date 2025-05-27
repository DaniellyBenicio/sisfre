import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Warning } from "@mui/icons-material";

const DeleteConfirmationDialog = ({
  open,
  onClose,
  title,
  message,
  onConfirm,
  userName,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // sm = 600px

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "9px",
          width: isSmallScreen ? "100%" : "390px",
          mx: isSmallScreen ? 2 : "auto", // margem horizontal para evitar colar nas bordas pequenas
        },
      }}
    >
      <DialogContent sx={{ textAlign: "center" }}>
        <Box display="flex" justifyContent="center" mb={2}>
          <Warning sx={{ fontSize: 55, color: "#FFA000" }} />
        </Box>
        <Typography textAlign="center">
          {message} <strong>{userName}</strong>
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          gap: 2,
          padding: isSmallScreen ? "16px" : "23px 70px",
          marginTop: "-20px",
          justifyContent: "center",
        }}
      >
        <Button
          onClick={onConfirm}
          sx={{
            color: "white",
            backgroundColor: "#087619",
            padding: "5px 25px",
            "&:hover": { backgroundColor: "#066915" },
          }}
        >
          Sim
        </Button>
        <Button
          onClick={onClose}
          sx={{
            color: "white",
            backgroundColor: "#F01424",
            padding: "5px 25px",
            "&:hover": { backgroundColor: "#D4000F" },
          }}
        >
          Não
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
