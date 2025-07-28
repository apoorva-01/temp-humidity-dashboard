import { makeStyles } from "@mui/styles";

export default makeStyles(theme => ({
  link: {
    textDecoration: "none",
    "&:hover, &:focus": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-selected": {
      backgroundColor: theme.palette.action.selected,
    }
  },
  linkActive: {
    backgroundColor: theme.palette.action.selected,
  },
  linkNested: {
    paddingLeft: 0,
    "&:hover, &:focus": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  linkIcon: {
    minWidth: 'unset !important',
    width: 22,
    height: 22,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing(2),
    color: theme.palette.text.secondary,
    transition: theme.transitions.create("color"),
    "& svg": {
      width: '100%',
      height: '100%',
      fontSize: 'inherit',
    }
  },
  linkIconActive: {
    color: theme.palette.primary.main,
  },
  linkText: {
    padding: theme.spacing(0.5),
    color: theme.palette.text.primary,
    transition: theme.transitions.create(["opacity", "color"]),
    fontSize: 14,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  linkTextActive: {
    color: theme.palette.primary.main,
  },
  linkTextHidden: {
    opacity: 0,
    transition: theme.transitions.create("opacity", {
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: 0,
    padding: 0,
  },
  sectionTitle: {
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary,
    opacity: "1 !important",
    fontSize: "0.75rem",
    fontWeight: 500,
    textTransform: "uppercase",
    transition: theme.transitions.create("opacity", {
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.divider,
  },
  nestedList: {
    paddingLeft: theme.spacing(2) + 30,
  },
  linkRoot: {
    fontWeight: 400,
    padding: theme.spacing(1.5, 2),
    width: "100%",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: "relative",
    textTransform: "none",
    transition: theme.transitions.create(["padding", "background-color"]),
    "&:before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      backgroundColor: theme.palette.primary.main,
      opacity: 0,
      transition: theme.transitions.create("opacity"),
    },
    "&:hover:before": {
      opacity: 0.5,
    },
    "&$linkActive:before": {
      opacity: 1,
    }
  }
}));
