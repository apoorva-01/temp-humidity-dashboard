import React, { useState, useContext } from "react";
import Link from 'next/link';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery,
  Stack,
  Switch,
  Tooltip,
  ListItemIcon,
  Divider
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import classNames from "classnames";
import { useRouter } from 'next/router';
import useStyles from "./styles";
import { Typography } from "../Wrappers";
import useAppStore from '../../../stores/useAppStore';
import {
  useLayoutState,
  useLayoutDispatch,
  toggleSidebar,
} from "../../../utils/LayoutContext";
import Image from 'next/image';
import logo from '../../../public/logo.svg';
import jsCookie from 'js-cookie';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import { styled } from '@mui/material/styles';

const ThemeSwitch = styled('button')(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  height: theme.spacing(3.5),
  width: theme.spacing(6),
  padding: 0,
  border: 'none',
  borderRadius: theme.spacing(2),
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.primary.dark,
  },
  '&:focus-visible': {
    outline: 'none',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${theme.palette.primary.main}`,
  },
}));

const SwitchKnob = styled('span')(({ theme }) => ({
  position: 'absolute',
  height: theme.spacing(2.5),
  width: theme.spacing(2.5),
  backgroundColor: theme.palette.common.white,
  borderRadius: '50%',
  transition: 'transform 0.2s, background-color 0.2s',
  transform: theme.palette.mode === 'dark' ? `translateX(${theme.spacing(3)})` : 'translateX(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  '& svg': {
    fontSize: theme.spacing(1.5),
    color: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.primary.main,
    transition: 'color 0.2s',
  },
}));

export default function Header() {
  const { user, logout, theme, toggleTheme } = useAppStore();
  const classes = useStyles();
  const router = useRouter();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('lg'));
  
  const layoutState = useLayoutState();
  const layoutDispatch = useLayoutDispatch();
  const [profileMenu, setProfileMenu] = useState(null);

  const darkModeChangeHandler = () => {
    toggleTheme();
  };

  const logoutClickHandler = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  const handleProfileMenuClose = () => {
    setProfileMenu(null);
  };
  
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: muiTheme.palette.primaryLight.light,
        boxShadow: 2,
      }}
    >
      <Toolbar sx={{ 
        minHeight: { xs: '64px', sm: '70px' },
        justifyContent: 'space-between',
        px: { xs: 1, sm: 2, md: 3 }
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton
            color="inherit"
            onClick={() => toggleSidebar(layoutDispatch)}
            sx={{
              color: '#214181',
              display: { xs: 'flex', lg: layoutState.isSidebarOpened ? 'none' : 'flex' }
            }}
          >
            {layoutState.isSidebarOpened ? (
              <ArrowBackIcon />
            ) : (
              <MenuIcon />
            )}
          </IconButton>

          {/* <Link href='/' passHref legacyBehavior>
            <Box 
              component="a" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <img
                src="/logo.svg"
                alt="Logo"
                style={{ 
                  width: isMobile ? '35px' : '45px',
                  height: isMobile ? '35px' : '45px'
                }}
              />
            </Box>
          </Link> */}
        </Stack>

        <Box sx={{ 
          flex: 1,
          mx: 2,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Typography
            variant={isMobile ? "subtitle1" : isTablet ? "h6" : "h4"}
            align="center"
            sx={{
              color: muiTheme.palette.primary.contrastText,
              fontWeight: 900,
              display: { xs: 'none', sm: 'block' },
              fontSize: {
                xs: '0.9rem',
                sm: '1rem',
                md: '1.2rem',
                lg: '1.5rem'
              }
            }}
          >
            {isMobile ? <strong>SMART T&H MONITORING</strong> : <strong>SMART TEMPERATURE & HUMIDITY MONITORING SYSTEM</strong>}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <ThemeSwitch
              onClick={darkModeChangeHandler}
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label="Toggle theme"
            >
              <SwitchKnob>
                {theme === 'dark' ? <DarkModeIcon /> : <WbSunnyOutlinedIcon />}
              </SwitchKnob>
            </ThemeSwitch>
          </Tooltip>
          <IconButton
            onClick={e => setProfileMenu(e.currentTarget)}
            sx={{
              padding: { xs: 1, sm: 1.5 },
              '&:hover': { backgroundColor: 'rgba(33, 65, 129, 0.1)' }
            }}
          >
            {isMobile ? (
              <AccountCircleIcon sx={{ color: '#214181', fontSize: '2rem' }} />
            ) : (
              // <video 
              //   loop 
              //   autoPlay 
              //   muted
              //   playsInline
              //   style={{ 
              //     width: isTablet ? '50px' : '100px',
              //     height: 'auto'
              //   }}
              //   src="logo.mp4"
              // />
              <Image 
                className={classes.logotypeIcon} 
                src={logo} 
                alt="logo" 
                width={isTablet ? 50 : 100}
                height={isTablet ? 5 : 30}
              />
            )}
          </IconButton>
        </Box>

        <Menu
          id="profile-menu"
          anchorEl={profileMenu}
          open={Boolean(profileMenu)}
          onClose={handleProfileMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: 3,
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Role: {user?.role || 'User'}
            </Typography>
          </Box>

          <MenuItem 
            onClick={() => {
              handleProfileMenuClose();
              router.push('/profile');
            }}
            sx={{ 
              py: 1.5,
              gap: 2,
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <PersonIcon color="primary" />
            <Typography>View Profile</Typography>
          </MenuItem>

          <MenuItem 
            onClick={() => {
              handleProfileMenuClose();
              logoutClickHandler();
            }}
            sx={{ 
              py: 1.5,
              gap: 2,
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <LogoutIcon color="error" />
            <Typography color="error">Sign Out</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
