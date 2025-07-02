// 1. Import the extendTheme function
import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { theme } from "../theme";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const publicUrl = import.meta.env.BASE_URL;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register(`${publicUrl}firebase-messaging-sw.js`)
    .then((registration) => {
      console.log("Service Worker registered:", registration);
    })
    .catch((err) => {
      console.error("Service Worker registration failed:", err);
    });
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 150000,
    },
  },
});

const rootElement = document.getElementById("root");
ReactDOM.createRoot(rootElement).render(
  
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/admin">
        <ChakraProvider theme={theme}>
          {" "}
          <App />
        </ChakraProvider>
      </BrowserRouter>
    </QueryClientProvider>
   
);
