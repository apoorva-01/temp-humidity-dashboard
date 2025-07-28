import React from "react";
import { Breadcrumbs, Link, Typography as MuiTypography } from "@mui/material";
import NextLink from 'next/link';

// styles
import useStyles from "./styles";

// components
import { Typography } from "../Wrappers";

export default function PageTitle(props) {
  var classes = useStyles();

  return (
    <div className={classes.pageTitleContainer}>
      <div>
        <Typography className={classes.typo} variant="h1" size="sm">
          {props.title}
        </Typography>
        <Breadcrumbs aria-label="breadcrumb" className={classes.breadcrumb}>
          <NextLink href="/" passHref>
            <Link underline="hover" color="inherit">
              Home
            </Link>
          </NextLink>
          {props.breadcrumbs?.map((crumb, index) => {
            const isLast = index === props.breadcrumbs.length - 1;

            if (isLast) {
              return (
                <MuiTypography key={index} color="textPrimary">
                  {crumb.label}
                </MuiTypography>
              );
            }

            return (
              <NextLink href={crumb.path} passHref key={index}>
                <Link underline="hover" color="inherit">
                  {crumb.label}
                </Link>
              </NextLink>
            );
          })}
        </Breadcrumbs>
      </div>
      {props.button && props.button}
    </div>
  );
}
