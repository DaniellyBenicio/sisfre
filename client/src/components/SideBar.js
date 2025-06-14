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
  ListItemIcon,
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
  ArrowRight,
  ArrowDropDown,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import LogoMenu from "../assets/LogoMenu.svg";
import { logout } from "../service/Auth.js";

const Sidebar = ({ setAuthenticated, useRole }) => {
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [accessType, setAccessType] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");
  const [isClassesHovered, setIsClassesHovered] = useState(false);
  const [isClassesExpanded, setIsClassesExpanded] = useState(false);
  const [isCalendarHovered, setIsCalendarHovered] = useState(false);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("username");
    if (name) setUsername(name);

    const type = localStorage.getItem("accessType");
    if (type) setAccessType(type);

    const path = location.pathname;
    if (path === "/users") setSelectedItem("users");
    else if (path === "/courses") setSelectedItem("courses");
    else if (path === "/disciplines") setSelectedItem("disciplines");
    else if (path === "/calendar") setSelectedItem("manage-calendar");
    else if (path === "/classes") setSelectedItem("manage-classes");
    else if (path === "/class-schedule") setSelectedItem("class-schedule");
    else if (path === "/saturday") setSelectedItem("saturday");
    else if (path === "/holiday") setSelectedItem("holiday");
  }, [location.pathname]);

  const handleOpenConfirmDialog = () => setOpenConfirmDialog(true);
  const handleCloseConfirmDialog = () => setOpenConfirmDialog(false);

  const handleItemClick = (path, item) => {
    console.log(`Navigating to: ${path}, Item: ${item}`);
    setSelectedItem(item);
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
      setIsClassesExpanded(false);
      setIsCalendarExpanded(false);
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

  const handleClassesToggle = (e) => {
    e.stopPropagation();
    if (isMobile) {
      setIsClassesExpanded(!isClassesExpanded);
    }
  };

  const handleCalendarToggle = (e) => {
    e.stopPropagation();
    if (isMobile) {
      setIsCalendarExpanded(!isCalendarExpanded);
    }
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawerContent = (
    <Box sx={{ minHeight: "100%", overflowY: "auto", paddingBottom: "20px" }}>
      <List textAlign="center">
        <ListItem sx={{ justifyContent: "center", marginLeft: "-12px" }}>
          <Box sx={{ mb: 2 }}>
            <img src={LogoMenu} alt="logoMenu" style={{ width: 150, height: "auto" }} />
          </Box>
        </ListItem>

        <Divider sx={{ backgroundColor: "white", marginBottom: 1 }} />

        <Typography variant="subtitle1" sx={{ color: "white", marginTop: "10px", textAlign: "center" }}>
          Bem vindo(a), {username}!
        </Typography>

        <Divider sx={{ backgroundColor: "white", marginBottom: 1, marginTop: "5px" }} />

        {accessType === "Admin" && (
          <>
            <ListItem button onClick={() => handleItemClick("/users", "users")} sx={getListItemStyle(selectedItem, "users")}>
              <People sx={{ mr: 1 }} />
              <ListItemText primary="Usuários" />
            </ListItem>
            <ListItem button onClick={() => handleItemClick("/courses", "courses")} sx={getListItemStyle(selectedItem, "courses")}>
              <School sx={{ mr: 1 }} />
              <ListItemText primary="Cursos" />
            </ListItem>
            <ListItem button onClick={() => handleItemClick("/disciplines", "disciplines")} sx={getListItemStyle(selectedItem, "disciplines")}>
              <LibraryBooks sx={{ mr: 1 }} />
              <ListItemText primary="Disciplinas" />
            </ListItem>
            <Box
              onMouseEnter={() => !isMobile && setIsCalendarHovered(true)}
              onMouseLeave={() => !isMobile && setIsCalendarHovered(false)}
            >
              <ListItem
                button
                onClick={handleCalendarToggle}
                sx={getListItemStyle(selectedItem, "calendar")}
                aria-expanded={isMobile ? isCalendarExpanded : isCalendarHovered}
              >
                <CalendarToday sx={{ mr: 1 }} />
                <ListItemText primary="Calendário" />
                <ListItemIcon sx={{ minWidth: "auto", color: "white" }}>
                  {isMobile ? (
                    isCalendarExpanded ? <ArrowDropDown /> : <ArrowRight />
                  ) : (
                    null
                  )}
                </ListItemIcon>
              </ListItem>
              {(isMobile ? isCalendarExpanded : isCalendarHovered) && (
                <>
                  <ListItem
                    button
                    onClick={() => handleItemClick("/calendar", "manage-calendar")}
                    sx={{
                      pl: 6,
                      "&:hover": { backgroundColor: "#388E3C" },
                      backgroundColor: selectedItem === "manage-calendar" ? "#4CAF50" : "transparent",
                    }}
                  >
                    <ListItemText primary="Gerenciar Calendário" sx={{ color: "white" }} />
                  </ListItem>
                  <ListItem
                    button
                    onClick={() => handleItemClick("/saturday", "saturday")}
                    sx={{
                      pl: 6,
                      "&:hover": { backgroundColor: "#388E3C" },
                      backgroundColor: selectedItem === "saturday" ? "#4CAF50" : "transparent",
                    }}
                  >
                    <ListItemText primary="Sábado Letivo" sx={{ color: "white" }} />
                  </ListItem>
                  <ListItem
                    button
                    onClick={() => handleItemClick("/holiday", "holiday")}
                    sx={{
                      pl: 6,
                      "&:hover": { backgroundColor: "#388E3C" },
                      backgroundColor: selectedItem === "holiday" ? "#4CAF50" : "transparent",
                    }}
                  >
                    <ListItemText primary="Feriado" sx={{ color: "white" }} />
                  </ListItem>
                </>
              )}
            </Box>
            <ListItem button onClick={() => handleItemClick("/classes", "classes")} sx={getListItemStyle(selectedItem, "classes")}>
              <Class sx={{ mr: 1 }} />
              <ListItemText primary="Turmas" />
            </ListItem>
          </>
        )}

        {accessType === "Coordenador" && (
          <>
            <ListItem button onClick={() => handleItemClick("/disciplines", "disciplines")} sx={getListItemStyle(selectedItem, "disciplines")}>
              <LibraryBooks sx={{ mr: 1 }} />
              <ListItemText primary="Disciplinas" />
            </ListItem>
            <Box
              onMouseEnter={() => !isMobile && setIsClassesHovered(true)}
              onMouseLeave={() => !isMobile && setIsClassesHovered(false)}
            >
              <ListItem
                button
                onClick={handleClassesToggle}
                sx={getListItemStyle(selectedItem, "classes")}
                aria-expanded={isMobile ? isClassesExpanded : isClassesHovered}
              >
                <Class sx={{ mr: 1 }} />
                <ListItemText primary="Turmas" />
                <ListItemIcon sx={{ minWidth: "auto", color: "white" }}>
                  {isMobile ? (
                    isClassesExpanded ? <ArrowDropDown /> : <ArrowRight />
                  ) : (
                    null
                  )}
                </ListItemIcon>
              </ListItem>
              {(isMobile ? isClassesExpanded : isClassesHovered) && (
                <>
                  <ListItem
                    button
                    onClick={() => handleItemClick("/classes", "manage-classes")}
                    sx={{
                      pl: 6,
                      "&:hover": { backgroundColor: "#388E3C" },
                      backgroundColor: selectedItem === "manage-classes" ? "#4CAF50" : "transparent",
                    }}
                  >
                    <ListItemText primary="Visualizar Turmas" sx={{ color: "white" }} />
                  </ListItem>
                  <ListItem
                    button
                    onClick={() => handleItemClick("/class-schedule", "class-schedule")}
                    sx={{
                      pl: 6,
                      "&:hover": { backgroundColor: "#388E3C" },
                      backgroundColor: selectedItem === "class-schedule" ? "#4CAF50" : "transparent",
                    }}
                  >
                    <ListItemText primary="Grade de Turma" sx={{ color: "white" }} />
                  </ListItem>
                </>
              )}
            </Box>
          </>
        )}

        {accessType === "Professor" && (
          <>
            <ListItem button onClick={() => handleItemClick("/disciplines", "disciplines")} sx={getListItemStyle(selectedItem, "disciplines")}>
              <LibraryBooks sx={{ mr: 1 }} />
              <ListItemText primary="Disciplinas" />
            </ListItem>
          </>
        )}
      </List>

      <Box sx={{ width: "100%" }}>
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
          <AppBar position="fixed" sx={{ backgroundColor: "#087619", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle}>
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
                height: "calc(100% - 54px)",
                overflowY: "auto",
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