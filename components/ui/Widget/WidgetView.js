import React from "react";
import {
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { MoreVert as MoreIcon } from "@mui/icons-material";
import classnames from "classnames";
import { withStyles } from "@mui/styles";

const Widget = ({
  classes,
  children,
  title,
  noBodyPadding,
  bodyClass,
  className,
  disableWidgetMenu,
  ...props
}) => (
  <div className={classes.widgetWrapper}>
    <Paper className={classes.paper} classes={{ root: classes.widgetRoot }}>
      <div className={classes.widgetHeader}>
        {props.header ? (
          props.header
        ) : (
          <React.Fragment>
            <Typography variant="h5" color="textSecondary">
              {title}
            </Typography>
            {!disableWidgetMenu && (
              <IconButton
                color="primary"
                classes={{ root: classes.moreButton }}
                aria-owns="widget-menu"
                aria-haspopup="true"
                onClick={() => props.setMoreMenuOpen(true)}
                buttonRef={props.setMoreButtonRef}
              >
                <MoreIcon />
              </IconButton>
            )}
          </React.Fragment>
        )}
      </div>
      <div
        className={classnames(classes.widgetBody, {
          [classes.noPadding]: noBodyPadding,
          [bodyClass]: bodyClass
        })}
      >
        {children}
      </div>
    </Paper>
    <Menu
      id="widget-menu"
      open={props.isMoreMenuOpen}
      anchorEl={props.moreButtonRef}
      onClose={() => props.setMoreMenuOpen(false)}
      disableAutoFocusItem
    >
      <MenuItem>
        <Typography>Edit</Typography>
      </MenuItem>
      <MenuItem>
        <Typography>Copy</Typography>
      </MenuItem>
      <MenuItem>
        <Typography>Delete</Typography>
      </MenuItem>
      <MenuItem>
        <Typography>Print</Typography>
      </MenuItem>
    </Menu>
  </div>
);

const styles = theme => ({
  widgetWrapper: {
    display: "flex",
    minHeight: "100%"
  },
  widgetHeader: {
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(1),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  widgetRoot: {
    boxShadow: theme.customShadows.widget
  },
  widgetBody: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3)
  },
  noPadding: {
    padding: 0
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    overflow: "hidden"
  },
  moreButton: {
    margin: -theme.spacing(1),
    padding: 0,
    width: 40,
    height: 40,
    color: theme.palette.text.hint,
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: "rgba(255, 255, 255, 0.35)"
    }
  }
});

export default withStyles(styles, { withTheme: true })(Widget);
