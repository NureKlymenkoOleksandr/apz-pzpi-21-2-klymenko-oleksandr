import "@mantine/core/styles.css";

import { Button, MantineProvider, createTheme } from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { router } from "./utils/router";
import styles from "./App.module.scss";
import { AuthProvider } from "./contexts/Auth";

const queryClient = new QueryClient();

const theme = createTheme({
  components: {
    Button: Button.extend({
      classNames: styles,
    }),
  },
});

function App() {
  return (
    <AuthProvider>
      <MantineProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </MantineProvider>
    </AuthProvider>
  );
}

export default App;
