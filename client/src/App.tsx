import { Routes, Route, Navigate } from "react-router-dom";
import { routes } from "./router/routes";

const App = () => {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
      />

      {routes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      <Route
        path="*"
        element={
          <h1 style={{ textAlign: "center", marginTop: "50px" }}>
            404 - Page Not Found
          </h1>
        }
      />
    </Routes>
  );
};

export default App;
