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
import {
  Menu,
  People,
  School,
  ExitToApp,
  Warning,
  Class,
  LibraryBooks,
  CalendarToday,
  Schedule,
  EventAvailable,
  EventNote,
  Group,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import LogoMenu from "../assets/LogoMenu.svg";
import { logout } from "../service/Auth.js";

const Sidebar = ({ setAuthenticated }) => {
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [accessType, setAccessType] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const name = localStorage.getItem("username");
    if (name) setUsername(name);

    const type = localStorage.getItem("accessType");
    if (type) setAccessType(type);

    const path = location.pathname;
    if (path === "/users") setSelectedItem("users");
    else if (path === "/courses") setSelectedItem("courses");
    else if (path === "/disciplines") setSelectedItem("disciplines");
    else if (path === "/calendar-options") setSelectedItem("calendar");
    else if (path === "/classes") setSelectedItem("classes");
    else if (path === "/class-schedule/options") setSelectedItem("class-schedule");
    else if (path === "/frequency") setSelectedItem("frequency");
    else if (path === "/anteposition") setSelectedItem("class-anticipation"); // Alterado de "/class-anticipation" para "/anteposition"
    else if (path === "/teachers-management/options") setSelectedItem("teachers-management/options"); // Adicionado para "Gestão de Docentes"
  }, [location.pathname]);

  const handleOpenConfirmDialog = () => setOpenConfirmDialog(true);
  const handleCloseConfirmDialog = () => setOpenConfirmDialog(false);

  const handleItemClick = (path, item) => {
    setSelectedItem(item);
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
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
    <Box
      sx={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflowY: "auto",
        paddingBottom: "20px",
      }}
    >
      <Box>
        <List textAlign="center">
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
              <ListItem
                button
                onClick={() => handleItemClick("/disciplines", "disciplines")}
                sx={getListItemStyle(selectedItem, "disciplines")}
              >
                <LibraryBooks sx={{ mr: 1 }} />
                <ListItemText primary="Disciplinas" />
              </ListItem>
              <ListItem
                button
                onClick={() => handleItemClick("/calendar-options", "calendar")}
                sx={getListItemStyle(selectedItem, "calendar")}
              >
                <CalendarToday sx={{ mr: 1 }} />
                <ListItemText primary="Controle Letivo" />
              </ListItem>
              <ListItem
                button
                onClick={() => handleItemClick("/classes", "classes")}
                sx={getListItemStyle(selectedItem, "classes")}
              >
                <Class sx={{ mr: 1 }} />
                <ListItemText primary="Turmas" />
              </ListItem>
              <ListItem
                button
                onClick={() =>
                  handleItemClick("/class-schedule/options", "class-schedule")
                }
                sx={getListItemStyle(selectedItem, "class-schedule")}
              >
                <Schedule sx={{ mr: 1 }} />
                <ListItemText primary="Grade de Turmas" />
              </ListItem>
            </>
          )}

          {accessType === "Coordenador" && (
            <>
              <ListItem
                button
                onClick={() => handleItemClick("/disciplines", "disciplines")}
                sx={getListItemStyle(selectedItem, "disciplines")}
              >
                <LibraryBooks sx={{ mr: 1 }} />
                <ListItemText primary="Disciplinas" />
              </ListItem>
              <ListItem
                button
                onClick={() =>
                  handleItemClick("/class-schedule/options", "class-schedule")
                }
                sx={getListItemStyle(selectedItem, "class-schedule")}
              >
                <Schedule sx={{ mr: 1 }} />
                <ListItemText primary="Grade de Turmas" />
              </ListItem>
              <ListItem
                button
                onClick={() => handleItemClick("/teachers-management/options", "teachers-management/options")}
                sx={getListItemStyle(selectedItem, "teachers-management/options")}
              >
                <Group sx={{ mr: 1 }} />
                <ListItemText primary="Gestão de Docentes" />
              </ListItem>
            </>
          )}

          {accessType === "Professor" && (
            <>
              <ListItem
                button
                onClick={() => handleItemClick("/disciplines", "disciplines")}
                sx={getListItemStyle(selectedItem, "disciplines")}
              >
                <LibraryBooks sx={{ mr: 1 }} />
                <ListItemText primary="Disciplinas" />
              </ListItem>
              <ListItem
                button
                onClick={() => handleItemClick("/classes", "classes")}
                sx={getListItemStyle(selectedItem, "classes")}
              >
                <Class sx={{ mr: 1 }} />
                <ListItemText primary="Horário" />
              </ListItem>
              <ListItem
                button
                onClick={() =>
                  handleItemClick("/anteposition", "class-anticipation")
                }
                sx={getListItemStyle(selectedItem, "class-anticipation")}
              >
                <EventNote sx={{ mr: 1 }} />
                <ListItemText primary="Anteposição de Aula" />
              </ListItem>
              <ListItem
                button
                onClick={() => handleItemClick("/frequency", "frequency")}
                sx={getListItemStyle(selectedItem, "frequency")}
              >
                <EventAvailable sx={{ mr: 1 }} />
                <ListItemText primary="Frequência" />
              </ListItem>
            </>
          )}
        </List>
      </Box>

      <Box sx={{ marginTop: "auto" }}>
        <ListItem
          button
          onClick={handleOpenConfirmDialog}
          sx={getListItemStyle(selectedItem, "exit")}
        >
          <ExitToApp sx={{ mr: 1 }} />
          <ListItemText primary="Sair" />
        </ListItem>
      </Box>
    </Box>
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
                top: "55px",
                height: "calc(100% - 52px)",
                overflowY: "auto",
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
            width: 240,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 240,
              backgroundColor: "#087619",
              color: "white",
              overflowY: "auto",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "9px",
            width: isMobile ? "100%" : "390px",
            mx: isMobile ? 2 : "auto",
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center" }}>
          <Box display="flex" justifyContent="center" mb={2}>
            <Warning sx={{ fontSize: 55, color: "#FFA000" }} />
          </Box>
          <Typography textAlign="center">Tem certeza que deseja sair?</Typography>
        </DialogContent>
        <DialogActions
          sx={{
            gap: 2,
            padding: isMobile ? "16px" : "23px 70px",
            marginTop: "-20px",
            justifyContent: "center",
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
              "&:hover": { backgroundColor: "#D4000F" },
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