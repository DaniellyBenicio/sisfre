import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Box,
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
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: "9px" },
      }}
    >
      <DialogContent sx={{ textAlign: "center", width: "390px" }}>
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
          padding: "23px 70px",
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
