import React, { useState, useEffect } from "react";
import { Drawer, IconButton, List, Box } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CompareIcon from '@mui/icons-material/Compare';
import DevicesIcon from '@mui/icons-material/Devices';
import RouterIcon from '@mui/icons-material/Router';
import StorageIcon from '@mui/icons-material/Storage';
import SendIcon from '@mui/icons-material/Send';
import classNames from "classnames";
// styles
import useStyles from "./styles";
// components
import SidebarLink from "./components/SidebarLink/SidebarLink";
import {
  useLayoutState,
  useLayoutDispatch,
  toggleSidebar,
} from "../../../utils/LayoutContext";

const structure = [
  // { id: 0, type: "title", label: "DASHBOARDS" },
  { id: 1, label: "Live Dashboard", link: "/", icon: <DashboardIcon /> },
  { id: 2, label: "Device Compare", link: "/devices-compare", icon: <CompareIcon /> },
  { id: 3, type: "divider" },
  // { id: 4, type: "title", label: "MANAGEMENT" },
  { id: 5, label: "Devices", link: "/devices", icon: <DevicesIcon /> },
  { id: 6, label: "Gateways", link: "/gateways", icon: <RouterIcon /> },
  { id: 7, label: "All Data", link: "/data", icon: <StorageIcon /> },
  { id: 8, label: "Payload Command", link: "/buzzer-command", icon: <SendIcon /> },
];

function Sidebar({ location }) {
  var classes = useStyles();
  var theme = useTheme();

  // global
  var { isSidebarOpened } = useLayoutState();
  var layoutDispatch = useLayoutDispatch();

  // local
  var [isPermanent, setPermanent] = useState(true);

  useEffect(function() {
    window.addEventListener("resize", handleWindowWidthChange);
    handleWindowWidthChange();
    return function cleanup() {
      window.removeEventListener("resize", handleWindowWidthChange);
    };
  });

  return (
    <Drawer
      variant={isPermanent ? "permanent" : "temporary"}
      className={classNames(classes.drawer, {
        [classes.drawerOpen]: isSidebarOpened,
        [classes.drawerClose]: !isSidebarOpened,
      })}
      classes={{
        paper: classNames({
          [classes.drawerOpen]: isSidebarOpened,
          [classes.drawerClose]: !isSidebarOpened,
        }),
      }}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRight: `1px solid ${theme.palette.divider}`
        }
      }}
      open={isSidebarOpened}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isSidebarOpened ? 'flex-end' : 'center',
          padding: theme.spacing(1),
          minHeight: 64,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <IconButton 
          onClick={() => toggleSidebar(layoutDispatch)}
          sx={{ 
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            }
          }}
        >
          {isSidebarOpened ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>
      <List className={classes.sidebarList}>
        {structure.map(link => (
          <SidebarLink
            key={link.id}
            location={location}
            isSidebarOpened={isSidebarOpened}
            {...link}
          />
        ))}
      </List>
    </Drawer>
  );

  // ##################################################################
  function handleWindowWidthChange() {
    var windowWidth = window.innerWidth;
    var breakpointWidth = theme.breakpoints.values.md;
    var isSmallScreen = windowWidth < breakpointWidth;

    if (isSmallScreen && isPermanent) {
      setPermanent(false);
    } else if (!isSmallScreen && !isPermanent) {
      setPermanent(true);
    }
  }
}

export default Sidebar;
