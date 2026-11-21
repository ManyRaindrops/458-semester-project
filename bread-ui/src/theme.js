import { createTheme } from "@mui/material/styles";

// Material-style theme for Bread.
// Warm "toasted crust" primary, teal secondary, light + dark schemes that
// follow the device setting (the toggle in the app bar can override it).
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#8B5000", contrastText: "#FFFFFF" },
        secondary: { main: "#0F6E56", contrastText: "#FFFFFF" },
        // Tonal "container" colours (Material 3 idea) for pills and badges
        primaryContainer: { main: "#FFDDB8", contrastText: "#2C1600" },
        secondaryContainer: { main: "#CDEFE3", contrastText: "#04342C" },
        background: { default: "#FFF8F3", paper: "#FFFFFF" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#FFB95C", contrastText: "#4A2800" },
        secondary: { main: "#5DCAA5", contrastText: "#04342C" },
        primaryContainer: { main: "#6A3C00", contrastText: "#FFDDB8" },
        secondaryContainer: { main: "#085041", contrastText: "#CDEFE3" },
        background: { default: "#19120C", paper: "#221A13" },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "Roboto, system-ui, 'Segoe UI', sans-serif",
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: { textTransform: "none", fontWeight: 500 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 20, paddingInline: 20 } },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: 16 } },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 28 } },
    },
  },
});

export default theme;
