import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  FormControlLabel,
  Checkbox,
  TextField,
  Paper,
  Button,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Container,
  CircularProgress,
  IconButton,
  InputAdornment,
  Fade,
  Grow,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { createTheme, ThemeProvider, alpha } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import useAppStore from '../stores/useAppStore';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0B70B6',
      light: '#3B8DC7',
      dark: '#085A92',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.5px',
    },
    subtitle1: {
      letterSpacing: '0.1px',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 0 0 2px rgba(11, 112, 182, 0.1)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(11, 112, 182, 0.2)',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(11, 112, 182, 0.2)',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
});

export default function SignInSide() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const router = useRouter();
  const { redirect } = router.query;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    showError, 
    showSuccess 
  } = useAppStore();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(redirect || '/');
    }
  }, [isAuthenticated, user, router, redirect]);

  const submitHandler = async ({ name, password }) => {
    closeSnackbar();
    try {
      const result = await login({ name, password });
      
      if (result.success) {
        showSuccess('Login successful!');
        router.push(redirect || '/');
      } else {
        const errorMessage = result.error || 'Login failed';
        showError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error || 
                          err?.message || 
                          'An error occurred during login';
      
      showError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          bgcolor: 'background.default',
          overflow: 'hidden',
        }}
      >
        <Fade in timeout={1000}>
          <Box
            sx={{
              flex: { xs: '0 0 auto', md: '0 0 50%' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: { xs: 2, sm: 4 },
              minHeight: { xs: '200px', md: '100vh' },
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                zIndex: -1,
              },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: { xs: '250px', sm: '400px', md: '500px' },
                height: { xs: '150px', sm: '250px', md: '300px' },
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <Image
                src='logo.svg'
                alt='IGSCS LOGO'
                layout="fill"
                objectFit="contain"
                priority
              />
            </Box>
          </Box>
        </Fade>

        <Grow in timeout={800}>
          <Box
            component={Paper}
            elevation={isMobile ? 0 : 8}
            sx={{
              flex: { xs: '1 1 auto', md: '0 0 50%' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 3, sm: 4, md: 8 },
              borderRadius: { 
                xs: '24px 24px 0 0', 
                md: '24px 0 0 24px' 
              },
              mt: { xs: -3, md: 0 },
              bgcolor: 'background.paper',
              position: 'relative',
              backdropFilter: 'blur(10px)',
              boxShadow: isMobile ? 'none' : theme => `0 0 40px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Container maxWidth="sm">
              <Box sx={{ mb: 5, textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography
                  component="h1"
                  variant={isMobile ? "h5" : "h4"}
                  sx={{
                    color: 'primary.main',
                    mb: 1,
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                >
                  Sign in to continue to your dashboard
                </Typography>
              </Box>

              <form onSubmit={handleSubmit(submitHandler)}>
                <Controller
                  name="name"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: true,
                  }}
                  render={({ field }) => (
                    <TextField
                      margin="normal"
                      fullWidth
                      id="name"
                      label="Username"
                      autoComplete="username"
                      autoFocus
                      error={Boolean(errors.name)}
                      helperText={errors.name ? 'Username is required' : ''}
                      disabled={isLoading}
                      sx={{ mb: 2 }}
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: true,
                    minLength: 4,
                  }}
                  render={({ field }) => (
                    <TextField
                      margin="normal"
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      error={Boolean(errors.password)}
                      helperText={
                        errors.password
                          ? errors.password.type === 'minLength'
                            ? 'Password must be at least 4 characters'
                            : 'Password is required'
                          : ''
                      }
                      disabled={isLoading}
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              disabled={isLoading}
                              sx={{
                                color: showPassword ? 'primary.main' : 'text.secondary',
                              }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      {...field}
                    />
                  )}
                />

                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3,
                  flexWrap: 'wrap',
                  gap: 1
                }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        value="remember"
                        color="primary"
                        disabled={isLoading}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        Remember me
                      </Typography>
                    }
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  startIcon={!isLoading && <LoginIcon />}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    position: 'relative',
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {isLoading ? (
                    <>
                      <CircularProgress
                        size={24}
                        sx={{
                          position: 'absolute',
                          left: '50%',
                          marginLeft: '-12px',
                          color: 'white',
                        }}
                      />
                      <Box component="span" sx={{ opacity: 0 }}>
                        Logging in...
                      </Box>
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </Container>
          </Box>
        </Grow>
      </Box>
    </ThemeProvider>
  );
}