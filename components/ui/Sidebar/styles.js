import { makeStyles } from "@mui/styles";

const drawerWidth = 240;
const collapsedWidth = 64;

export default makeStyles(theme => ({
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: collapsedWidth,
    [theme.breakpoints.down("sm")]: {
      width: 0,
    },
    "& $sidebarList": {
      alignItems: "center",
      padding: 0,
    },
    "& .MuiListItemIcon-root": {
      minWidth: 'unset',
      marginRight: 0,
      justifyContent: 'center',
      width: collapsedWidth,
    },
    "& .MuiListItem-root": {
      justifyContent: 'center',
      padding: theme.spacing(1.5, 0),
      minWidth: collapsedWidth,
    },
    "& .MuiDivider-root": {
      margin: theme.spacing(1, 0),
    }
  },
  toolbar: {
    ...theme.mixins.toolbar,
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  sidebarList: {
    marginTop: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    padding: 0,
    width: '100%',
    "& > a": {
      textDecoration: 'none',
      color: 'inherit',
    },
    "& .MuiDivider-root": {
      margin: theme.spacing(1, 2),
    }
  },
  mobileBackButton: {
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(3),
    [theme.breakpoints.only("sm")]: {
      marginTop: theme.spacing(0.625),
    },
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
}));
