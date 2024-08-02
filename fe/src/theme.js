// frontend/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000000', // Deep black background
      paper: '#121212', // Slightly lighter black for paper
    },
    text: {
      primary: '#e0e0e0', // Light gray text
      secondary: '#b0b0b0', // Slightly darker gray text
    },
    primary: {
      main: '#d500f9', // Neon purple
    },
    secondary: {
      main: '#00e676', // Neon green
    },
    link: {
      main: '#d500f9', // Neon purple for links
    },
    divider: '#333333', // Dark divider lines
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#121212', // Dark paper background
          color: '#e0e0e0', // Light text color
          borderColor: '#333333', // Dark border color
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#e0e0e0', // Light text color
          a: {
            color: '#d500f9', // Neon purple link color
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
              color: '#bb86fc', // Slightly lighter purple on hover
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#e0e0e0',
          backgroundColor: '#333333', // Dark button background
          borderColor: '#555555', // Slightly lighter button border
          '&:hover': {
            backgroundColor: '#444444', // Slightly lighter background on hover
          },
        },
        containedPrimary: {
          backgroundColor: '#d500f9', // Neon purple for primary buttons
          '&:hover': {
            backgroundColor: '#bb86fc', // Slightly lighter purple on hover
          },
        },
        containedSecondary: {
          backgroundColor: '#00e676', // Neon green for secondary buttons
          '&:hover': {
            backgroundColor: '#00c853', // Slightly darker green on hover
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e', // Dark card background
          color: '#e0e0e0', // Light card text color
          borderColor: '#333333', // Dark card border
          borderRadius: 8,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', // Subtle shadow for cards
          '&:hover': {
            backgroundColor: '#333333', // Darker background on hover
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e', // Dark accordion background
          color: '#e0e0e0', // Light text color
        },
        expanded: {
          backgroundColor: '#333333', // Darker background when expanded
        },
      },
    },
  },
});

export default theme;
