import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
const client = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={client}>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#151b26",
            color: "#f4efe7",
            border: "1px solid rgba(255,255,255,.1)",
          },
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
);
