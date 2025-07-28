import React, { useState } from "react";
import {
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
  Box,
} from "@mui/material";
import { useRouter } from 'next/router'
import classnames from "classnames";
import NextLink from 'next/link';
// styles
import useStyles from "./styles";

export default function SidebarLink({
  link,
  icon,
  label,
  children,
  isSidebarOpened,
  nested,
  type,
}) {
  const router = useRouter()
  var classes = useStyles();

  // local
  var [isOpen, setIsOpen] = useState(false);
  var isLinkActive = (link === router.pathname);

  if (type === "title")
    return (
      <Typography
        className={classnames(classes.linkText, classes.sectionTitle, {
          [classes.linkTextHidden]: !isSidebarOpened,
        })}
      >
        {label}
      </Typography>
    );

  if (type === "divider") return <Divider className={classes.divider} />;
  
  const linkContent = (
    <ListItem
      button
      className={classes.link}
      classes={{
        root: classnames(classes.linkRoot, {
          [classes.linkActive]: isLinkActive && !nested,
          [classes.linkNested]: nested,
        }),
      }}
      disableRipple
    >
      {icon && (
        <ListItemIcon 
          className={classnames(classes.linkIcon, {
            [classes.linkIconActive]: isLinkActive,
          })}
        >
          {icon}
        </ListItemIcon>
      )}
      <ListItemText
        classes={{
          primary: classnames(classes.linkText, {
            [classes.linkTextActive]: isLinkActive,
            [classes.linkTextHidden]: !isSidebarOpened,
          }),
        }}
        primary={label}
      />
    </ListItem>
  );

  if (!children) {
    return (
      <NextLink href={link} passHref>
        {!isSidebarOpened ? (
          <Tooltip title={label} placement="right">
            {linkContent}
          </Tooltip>
        ) : (
          linkContent
        )}
      </NextLink>
    );
  }

  return (
    <>
      <ListItem
        button
        onClick={toggleCollapse}
        className={classes.link}
        disableRipple
      >
        {icon && (
          <ListItemIcon 
            className={classnames(classes.linkIcon, {
              [classes.linkIconActive]: isLinkActive,
            })}
          >
            {icon}
          </ListItemIcon>
        )}
        <ListItemText
          classes={{
            primary: classnames(classes.linkText, {
              [classes.linkTextActive]: isLinkActive,
              [classes.linkTextHidden]: !isSidebarOpened,
            }),
          }}
          primary={label}
        />
      </ListItem>
      {children && (
        <Collapse
          in={isOpen && isSidebarOpened}
          timeout="auto"
          unmountOnExit
          className={classes.nestedList}
        >
          <List component="div" disablePadding>
            {children.map(childrenLink => (
              <SidebarLink
                key={childrenLink && childrenLink.link}
                isSidebarOpened={isSidebarOpened}
                classes={classes}
                nested
                {...childrenLink}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );

  // ###########################################################

  function toggleCollapse(e) {
    if (isSidebarOpened) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  }
}
