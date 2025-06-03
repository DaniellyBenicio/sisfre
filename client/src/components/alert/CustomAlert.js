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
  }, [onClose]);

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
    success: "#A9E4B2",
    info: "#2196f3",
    warning: "#ff9800",
    error: "#F2C5C5",
  }[alertType];

  return (
    <Alert
      variant="outlined"
      severity={alertType}
      icon={getAlertIcon()}
      sx={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "auto",
        minWidth: "200px",
        maxWidth: "300px",
        height: "50px",
        margin: "5px auto",
        padding: "5px 10px",
        borderRadius: "8px",
        boxShadow: 1,
        backgroundColor: borderColor,
        borderColor: borderColor,
        borderWidth: "1px",
        color: "#000",
        display: "flex",
        alignItems: "center",
        boxSizing: "border-box",
        "& .MuiAlert-icon": {
          marginRight: "6px",
        },
        transition: "all 0.3s ease-in-out",
        zIndex: 1300,
        fontSize: "0.875rem",
        "@media (max-width: 600px)": {
          left: "50%",
          transform: "translateX(-50%)",
          width: "auto",
          maxWidth: "calc(100% - 20px)",
          marginRight: "0",
        },
      }}
    >
      {message}
    </Alert>
  );
};

export default CustomAlert;