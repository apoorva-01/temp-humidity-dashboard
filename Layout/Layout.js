import React, { useEffect } from "react";
import classnames from "classnames";
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
// styles
import useStyles from "./styles";
// components
import Header from "../components/ui/Header";
import Sidebar from "../components/ui/Sidebar";
// context
import { useLayoutState } from "../utils/LayoutContext";
import useAppStore from '../stores/useAppStore';
import { useRouter } from 'next/router';

function Layout(props) {
  const { user, isAuthenticated } = useAppStore();
  const router = useRouter();
  const theme = useTheme();
  
  useEffect(() => {
    if (!isAuthenticated && !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);
  
  var classes = useStyles();
  // global
  var layoutState = useLayoutState();

  return (
    <Box 
      className={classes.root}
      sx={{ 
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary
      }}
    >
      <>
        <Header history={props.history} />
        <Sidebar />
        <div
          className={classnames(classes.content, {
            [classes.contentShift]: layoutState.isSidebarOpened,
          })}
        >
          <div className={classes.fakeToolbar} />
          {props.children}
        </div>
      </>
    </Box>
  );
}

export default Layout;
