import { makeStyles } from "@mui/styles";

export default makeStyles(theme => ({
  pageTitleContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(2),
  },
  typo: {
    color: theme.palette.text.primary,
  },
  breadcrumb: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
  },
  button: {
    boxShadow: theme.customShadows.widget,
    textTransform: "none",
    "&:active": {
      boxShadow: theme.customShadows.widgetWide,
    },
  },
}));
