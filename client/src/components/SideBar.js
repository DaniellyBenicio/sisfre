import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  IconButton,
  Toolbar,
  AppBar,
  Box,
} from "@mui/material";
import { Menu, People, School, ExitToApp, Warning } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import LogoMenu from "../assets/LogoMenu.svg";
import { logout } from "../service/Auth.js";

const Sidebar = ({ setAuthenticated, useRole }) => {
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [accessType, setAccessType] = useState("");

  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const name = localStorage.getItem("username");
    if (name) setUsername(name);

    const type = localStorage.getItem("accessType");
    if (type) setAccessType(type);
  }, []);

  const handleOpenConfirmDialog = () => setOpenConfirmDialog(true);
  const handleCloseConfirmDialog = () => setOpenConfirmDialog(false);

  const handleItemClick = (path, item) => {
    setSelectedItem(item);
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const getListItemStyle = (selectedItem, itemKey) => ({
    backgroundColor: selectedItem === itemKey ? "#4CAF50" : "transparent",
    "&:hover": {
      backgroundColor: selectedItem === itemKey ? "#4CAF50" : "#388E3C",
    },
  });

  const handleLogout = () => {
    logout(setAuthenticated);
    handleCloseConfirmDialog();
    setTimeout(() => navigate("/login"), 100);
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawerContent = (
    <List textAlign="center">
      {/* Logo */}
      <ListItem sx={{ justifyContent: "center", marginLeft: "-12px" }}>
        <Box sx={{ mb: 2 }}>
          <img
            src={LogoMenu}
            alt="logoMenu"
            style={{ width: 150, height: "auto" }}
          />
        </Box>
      </ListItem>

      <Divider sx={{ backgroundColor: "white", marginBottom: 1 }} />

      <Typography
        variant="subtitle1"
        sx={{ color: "white", marginTop: "10px", textAlign: "center" }}
      >
        Bem vindo(a), {username}!
      </Typography>

      <Divider
        sx={{ backgroundColor: "white", marginBottom: 1, marginTop: "5px" }}
      />

      {accessType === "Admin" && (
        <>
          <ListItem
            button
            onClick={() => handleItemClick("/users", "users")}
            sx={getListItemStyle(selectedItem, "users")}
          >
            <People sx={{ mr: 1 }} />
            <ListItemText primary="Usuários" />
          </ListItem>

          <ListItem
            button
            onClick={() => handleItemClick("/courses", "courses")}
            sx={getListItemStyle(selectedItem, "courses")}
          >
            <School sx={{ mr: 1 }} />
            <ListItemText primary="Cursos" />
          </ListItem>
        </>
      )}
      {/* Sair */}
      <ListItem
        button
        onClick={handleOpenConfirmDialog}
        sx={getListItemStyle(selectedItem, "exit")}
      >
        <ExitToApp sx={{ mr: 1 }} />
        <ListItemText primary="Sair" />
      </ListItem>
    </List>
  );

  return (
    <>
      {isMobile ? (
        <>
          <AppBar
            position="fixed"
            sx={{
              backgroundColor: "#087619",
              zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <Menu />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: 240,
                backgroundColor: "#087619",
                color: "white",
                top: "54px",
                zIndex: (theme) => theme.zIndex.drawer + 2,
              },
            }}
          >
            {drawerContent}
          </Drawer>
        </>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: 220,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 240,
              backgroundColor: "#087619",
              color: "white",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        PaperProps={{
          sx: { borderRadius: "9px" },
        }}
      >
        <DialogContent sx={{ textAlign: "center", width: "390px" }}>
          <Box display="flex" justifyContent="center" mb={2}>
            <Warning sx={{ fontSize: 55, color: "#FFA000" }} />
          </Box>
          <Typography sx={{ fontSize: "1rem" }}>
            Tem certeza que deseja sair?
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
            padding: "23px 70px",
            marginTop: "-20px",
          }}
        >
          <Button
            onClick={handleLogout}
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
            onClick={handleCloseConfirmDialog}
            sx={{
              color: "white",
              backgroundColor: "#F01424",
              padding: "5px 25px",
              "&:hover": { backgroundColor: "#FF170F" },
            }}
          >
            Não
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;
