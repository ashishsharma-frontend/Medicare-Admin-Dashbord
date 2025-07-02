import { extendTheme } from "@chakra-ui/react";


export const theme = extendTheme({
  initialColorMode: "light", // 'dark' | 'light'
  useSystemColorMode: false,
  styles: {
    global: {
      "::-webkit-scrollbar": {
        width: "4px",
        height: "4px", // Set the height for the horizontal scrollbar
      },
      "::-webkit-scrollbar-thumb": {
        backgroundColor: "gray.600",
        borderRadius: "4px",
      },
      "::-webkit-scrollbar-track": {
        backgroundColor: "gray.100",
      },
      "::-webkit-scrollbar-thumb:horizontal": {
        backgroundColor: "gray.600",
        borderRadius: "4px",
      },
      "::-webkit-scrollbar-track:horizontal": {
        backgroundColor: "gray.100",
      },
    },
  },
  fonts: {
    body: "Inter, sans-serif",
    heading: "Inter, sans-serif",
    mono: "Inter, monospace",
  },
  colors: {
    main: {
      50: "#e7f1ff",
      100: "#d3e6ff",
      200: "#b0ceff",
      300: "#81adff",
      400: "#507aff",
      500: "#2949ff",
      600: "#0515ff",
      700: "#0011ff",
      800: "#0110df",
      900: "#041150",
      950: "#070c5f",
      default: "#041150",
    },
  },

  components: {
    Button: {
      variants: {
        blackButton: {
          color: "white",
          bg: "#000",
          _hover: {
            bg: "#000",
          },
        },
        gray: {
          color: "#000",
          bg: "gray.100",
          _hover: {
            bg: "gray.100",
          },
        },
      },
    },
    FormLabel: {
      baseStyle: {
        fontSize: "15px", // Adjust the font size as needed
      },
    },
  },
});
