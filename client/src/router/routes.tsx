import Dashboard from "../pages/Dashboard";
import Board from "../pages/Board";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Documents from "../pages/Documents";
import Settings from "../pages/Settings";
import PrivateRoute from "./PrivateRoute";
import type { JSX } from "react";
import WorkInProgress from "../utils/WorkInProgress";

export interface AppRoute {
  path: string;
  element: JSX.Element;
  private?: boolean;
}

export const routes: AppRoute[] = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/home",
    element: (
      <PrivateRoute>
        <Home />
      </PrivateRoute>
    ),
    private: true,
  },
  {
    path: "/documents",
    element: (
      <PrivateRoute>
        <Documents />
      </PrivateRoute>
    ),
    private: true,
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
    private: true,
  },
  {
    path: "/board/:id",
    element: (
      <PrivateRoute>
        <Board />
      </PrivateRoute>
    ),
    private: true,
  },
  {
    path: "/settings",
    element: (
      <PrivateRoute>
        <Settings />
      </PrivateRoute>
    ),
    private: true,
  },
  {
    path: "/workinprogress",
    element: (
      <PrivateRoute>
        <WorkInProgress />
      </PrivateRoute>
    ),
    private: true,
  },
];
