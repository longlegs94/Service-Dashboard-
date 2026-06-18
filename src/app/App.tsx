import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { router } from "@/app/routes";
import { useAuthBootstrap } from "@/features/auth/useAuth";

export function App() {
  // Load and subscribe to the auth session for the whole app.
  useAuthBootstrap();

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
