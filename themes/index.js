import defaultTheme from "./default";
import darkTheme from "./dark";
import { createTheme } from "@mui/material/styles";

const typography = {
  fontFamily: [
    'Roboto',
    'sans-serif'
  ].join(','),
  h1: {
    fontSize: "3rem",
    fontWeight: 600,
  },
  h2: {
    fontSize: "2rem",
    fontWeight: 600,
  },
  h3: {
    fontSize: "1.64rem",
    fontWeight: 600,
  },
  h4: {
    fontSize: "1.5rem",
    fontWeight: 500,
  },
  h5: {
    fontSize: "1.285rem",
    fontWeight: 500,
  },
  h6: {
    fontSize: "1.142rem",
    fontWeight: 500,
  },
  body1: {
    fontSize: "1rem",
    fontWeight: 400,
  },
  body2: {
    fontSize: "0.875rem",
    fontWeight: 400,
  },
};

const shape = {
  borderRadius: 8,
};

export default {
  default: createTheme({
    ...defaultTheme,
    typography,
    shape,
  }),
  dark: createTheme({
    ...darkTheme,
    typography,
    shape,
  }),
};
