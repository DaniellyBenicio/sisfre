import React, { useEffect } from "react";
import Alert from "@mui/material/Alert";
import { CheckCircle, Info, Warning, Error } from "@mui/icons-material";

export const CustomAlert = ({ message, type, onClose }) => {
  const validTypes = ["success", "info", "warning", "error"];
  const alertType = validTypes.includes(type) ? type : "info";

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 3000);

    return () => clearTimeout(timer);
  },
    [onClose]);

  const getAlertIcon = () => {
    switch (alertType) {
      case "success":
        return <CheckCircle style={{ color: "#4caf50" }} fontSize="small" />;
      case "info":
        return <Info style={{ color: "#2196f3" }} fontSize="small" />;
      case "warning":
        return <Warning style={{ color: "#ff9800" }} fontSize="small" />;
      case "error":
        return <Error style={{ color: "#f44336" }} fontSize="small" />;
      default:
        return <Info style={{ color: "#2196f3" }} fontSize="small" />;
    }
  };

  const borderColor = {
    success: "#4caf50",
    info: "#2196f3",
    warning: "#ff9800",
    error: "#f44336",
  }
  [alertType];

  return (
    <Alert
      variant="outlined"
      severity={alertType}
      icon={getAlertIcon()}
      sx={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "auto",
        minWidth: "200px",
        maxWidth: "300px",
        height: "50px",
        margin: "5px 0",
        marginRight: "45px",
        padding: "5px 10px",
        borderRadius: "8px",
        boxShadow: 1,
        backgroundColor: "transparent",
        borderColor: borderColor,
        borderWidth: "1px",
        color: borderColor,
        display: "flex",
        alignItems: "center",
        "& .MuiAlert-icon": {
          marginRight: "6px",
        },
        transition: "all 0.3s ease-in-out",
        zIndex: 1000,
        fontSize: "0.875rem",
        "@media (max-width: 600px)": {
          right: "10px",
          width: "90%",
        },
      }}
    >
      {message}
    </Alert>
  );
};

export default CustomAlert;