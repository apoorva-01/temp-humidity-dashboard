import tinycolor from "tinycolor2";
const primary = "#0B70B6";
const primaryLight = "#B8DCEA";
const secondary = "#607d8b";
const warning = "#FFC260";
const success = "#4caf50";
const info = "#4A5568";
const error = "#d32f2f";

const lightenRate = 7.5;
const darkenRate = 15;

const darkTheme = {
  palette: {
    mode: 'dark',
    primary: {
      main: primary,
      light: tinycolor(primary)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(primary)
        .darken(darkenRate)
        .toHexString(),
      contrastText:primary,
    },
    primaryLight: {
      main: primary,
      light: tinycolor(primaryLight)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(primaryLight)
        .darken(darkenRate)
        .toHexString(),
      contrastText: primary,
    },
    secondary: {
      main: secondary,
      light: tinycolor(secondary)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(secondary)
        .darken(darkenRate)
        .toHexString(),
      contrastText: "#FFFFFF",
    },
    warning: {
      main: warning,
      light: tinycolor(warning)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(warning)
        .darken(darkenRate)
        .toHexString(),
    },
    success: {
      main: success,
      light: tinycolor(success)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(success)
        .darken(darkenRate)
        .toHexString(),
    },
    info: {
      main: info,
      light: tinycolor(info)
        .lighten(lightenRate)
        .toHexString(),
      dark: tinycolor(info)
        .darken(darkenRate)
        .toHexString(),
    },
    error: {
        main: error,
        light: tinycolor(error)
            .lighten(lightenRate)
            .toHexString(),
        dark: tinycolor(error)
            .darken(darkenRate)
            .toHexString(),
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#b3b3b3",
      disabled: "#666666",
    },
    background: {
      default: "#1e1e1e",
      paper: "#2a2a2a",
    },
    divider: "rgba(255, 255, 255, 0.12)",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#1e1e1e",
          color: "#FFFFFF",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#2a2a2a",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#2a2a2a",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#2a2a2a",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
          margin: 8,
        },
        switchBase: {
          padding: 1,
          '&$checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + $track': {
              backgroundColor: '#1976d2',
              opacity: 1,
              border: 'none',
            },
          },
          '&$focusVisible $thumb': {
            color: '#1976d2',
            border: '6px solid #fff',
          },
        },
        thumb: {
          width: 24,
          height: 24,
        },
        track: {
          borderRadius: 26 / 2,
          border: `1px solid #2a2a2a`,
          backgroundColor: '#2a2a2a',
          opacity: 1,
        },
      },
    },
  },
  customShadows: {
    widget: "0px 3px 11px 0px #0000004D, 0 3px 3px -2px #0000001A, 0 1px 8px 0 #00000014",
    widgetDark: "0px 3px 18px 0px #0000004D, 0 3px 3px -2px #0000001A, 0 1px 8px 0 #00000014",
    widgetWide: "0px 12px 33px 0px #0000004D, 0 3px 3px -2px #0000001A, 0 1px 8px 0 #00000014"
  },
  overrides: {
    MuiBackdrop: {
      root: {
        backgroundColor: "#4A4A4A1A",
      },
    },
    MuiMenu: {
      paper: {
        boxShadow:
          "0px 3px 11px 0px #E8EAFC, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A",
      },
    },
    MuiSelect: {
      icon: {
        color: "#B9B9B9",
      },
    },
    MuiListItem: {
      root: {
        "&$selected": {
          backgroundColor: "#2a2a2a !important",
          "&:focus": {
            backgroundColor: "#2a2a2a",
          },
        },
      },
      button: {
        "&:hover, &:focus": {
          backgroundColor: "#2a2a2a",
        },
      },
    },
    MuiTouchRipple: {
      child: {
        backgroundColor: "white",
      },
    },
    MuiTableRow: {
      root: {
        height: 56,
      },
    },
    PrivateSwitchBase: {
      root: {
        marginLeft: 10
      }
    }
  },
};

export default darkTheme; 