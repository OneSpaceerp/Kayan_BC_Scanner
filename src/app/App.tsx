import { RouterProvider } from "react-router-dom";
import { Providers } from "./providers";
import { router } from "./router";
import { ToastContainer } from "@/shared/components/Toast";

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
      <ToastContainer />
    </Providers>
  );
}
