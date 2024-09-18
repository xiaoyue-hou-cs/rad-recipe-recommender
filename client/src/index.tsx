import ReactDOM from "react-dom/client";
import SearchPage from "./pages/Search";
import { createHashRouter, RouterProvider } from "react-router-dom";
import "./styles/index.css";

import App from "./App";
import AuthRoute from "./firebase/AuthRoute";
import Login from "./pages/Login";
import { IndividualGallery, GalleryHome } from "./pages/Gallery";
import FriendsPage from "./pages/FriendsPage";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const router = createHashRouter([
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "/",
    element: <AuthRoute page={<App />} />,
  },
  {
    path: "search",
    element: <AuthRoute page={<SearchPage />} />,
  },
  {
    path: "gallery",
    element: <AuthRoute page={<GalleryHome />} />,
  },
  {
    path: "gallery/:id",
    element: <AuthRoute page={<IndividualGallery />} />,
  },
  {
    path: "friends",
    element: <AuthRoute page={<FriendsPage />} />,
  },
]);

root.render(<RouterProvider router={router} />);
