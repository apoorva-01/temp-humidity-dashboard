import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import Layout from '../Layout/Layout';
import useAppStore from '../stores/useAppStore';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SaveIcon from '@mui/icons-material/Save';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha } from '@mui/material/styles';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import db from '../utils/db';
import User from '../models/User';
import jwt from 'jsonwebtoken';

export default function Profile({ user: initialUser }) {
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();
  
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { 
    user, 
    isAuthenticated, 
    isLoading,
    updateProfile,
    showError,
    showSuccess 
  } = useAppStore();

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (initialUser) {
      useAppStore.setState({ user: initialUser, isAuthenticated: true });
    }
  }, [initialUser]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (!isAuthenticated && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      setValue('name', user.name || '');
      setValue('email', user.email || '');
    }
  }, [isAuthenticated, user, router, setValue]);

  const submitHandler = async ({ name, email, password }) => {
    closeSnackbar();
    try {
      const profileData = { name, email };
      if (password) {
        profileData.password = password;
      }

      const result = await updateProfile(profileData);
      
      if (result.success) {
        showSuccess('Profile updated successfully!');
        enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
      } else {
        const errorMessage = result.error || 'Failed to update profile';
        showError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error || 
                          err?.message || 
                          'An error occurred while updating profile';
      
      showError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  if (!user) {
    return (
      <Layout>
        <Box 
          sx={{ 
            minHeight: '80vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box 
        sx={{ 
          width: '100%', 
          p: isMobile ? 2 : 3,
          minHeight: '80vh',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`
        }}
      >
        <Fade in timeout={800}>
          <Grid container spacing={3} justifyContent="center">
            {/* User Info Card */}
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  height: '100%',
                  boxShadow: theme.customShadows.widget
                }}
              >
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      mb: 3
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        bgcolor: theme.palette.primary.main,
                        mb: 2,
                        fontSize: '3rem'
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h5" gutterBottom>
                      {user.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="textSecondary"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      <AdminPanelSettingsIcon fontSize="small" />
                      {user.isAdmin ? 'Administrator' : 'User'}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Account Information
                  </Typography>
                  {/* <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Last updated: {new Date().toLocaleDateString()}
                    </Typography>
                  </Box> */}
                </CardContent>
              </Card>
            </Grid>

            {/* Edit Profile Form */}
            <Grid item xs={12} md={8}>
              <Card sx={{ boxShadow: theme.customShadows.widget }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                    Edit Profile
                  </Typography>
                  
                  <form onSubmit={handleSubmit(submitHandler)}>
                    <Grid container spacing={3}>
                      {/* Name Field */}
                      <Grid item xs={12}>
                        <Controller
                          name="name"
                          control={control}
                          defaultValue=""
                          rules={{ required: true }}
                          render={({ field }) => (
                            <TextField
                              variant="outlined"
                              fullWidth
                              id="name"
                              label="Name"
                              error={Boolean(errors.name)}
                              helperText={errors.name ? 'Name is required' : ''}
                              disabled={isLoading}
                              InputProps={{
                                startAdornment: (
                                  <PersonIcon 
                                    sx={{ 
                                      mr: 1, 
                                      color: theme.palette.text.secondary 
                                    }} 
                                  />
                                ),
                              }}
                              {...field}
                            />
                          )}
                        />
                      </Grid>

                      {/* Email Field */}
                      <Grid item xs={12}>
                        <Controller
                          name="email"
                          control={control}
                          defaultValue=""
                          rules={{
                            required: true,
                            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                          }}
                          render={({ field }) => (
                            <TextField
                              variant="outlined"
                              fullWidth
                              id="email"
                              label="Email"
                              type="email"
                              error={Boolean(errors.email)}
                              helperText={
                                errors.email
                                  ? errors.email.type === 'pattern'
                                    ? 'Invalid email format'
                                    : 'Email is required'
                                  : ''
                              }
                              disabled={isLoading}
                              InputProps={{
                                startAdornment: (
                                  <EmailIcon 
                                    sx={{ 
                                      mr: 1, 
                                      color: theme.palette.text.secondary 
                                    }} 
                                  />
                                ),
                              }}
                              {...field}
                            />
                          )}
                        />
                      </Grid>

                      {/* Password Field */}
                      <Grid item xs={12}>
                        <Controller
                          name="password"
                          control={control}
                          defaultValue=""
                          rules={{
                            minLength: 4,
                          }}
                          render={({ field }) => (
                            <TextField
                              variant="outlined"
                              fullWidth
                              id="password"
                              label="New Password"
                              type={showPassword ? 'text' : 'password'}
                              error={Boolean(errors.password)}
                              helperText={
                                errors.password
                                  ? 'Password must be at least 4 characters'
                                  : 'Leave blank to keep current password'
                              }
                              disabled={isLoading}
                              InputProps={{
                                startAdornment: (
                                  <LockIcon 
                                    sx={{ 
                                      mr: 1, 
                                      color: theme.palette.text.secondary 
                                    }} 
                                  />
                                ),
                                endAdornment: (
                                  <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    size="large"
                                    sx={{ 
                                      color: theme.palette.text.secondary,
                                      '&:hover': {
                                        color: theme.palette.text.primary
                                      }
                                    }}
                                  >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                ),
                              }}
                              {...field}
                            />
                          )}
                        />
                      </Grid>

                      {/* Submit Button */}
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          disabled={isLoading}
                          startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                          sx={{ 
                            mt: 2,
                            py: 1.2,
                            color: '#fff',
                            bgcolor: theme.palette.primary.main,
                            '&:hover': {
                              bgcolor: theme.palette.primary.dark,
                            }
                          }}
                        >
                          {isLoading ? 'Updating...' : 'Save Changes'}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      </Box>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;
  const { token } = req.cookies;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    await db.connect();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).lean();
    await db.disconnect();

    if (!user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    const userWithToken = {
      ...db.convertDocToObj(user),
      token,
    };

    return {
      props: {
        user: userWithToken,
      },
    };
  } catch (error) {
    console.error('Profile SSR error:', error);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}
