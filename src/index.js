import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { LightProvider } from "./context/easyMode";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <LightProvider>
      <RouterProvider router={router}></RouterProvider>
    </LightProvider>
  </React.StrictMode>,
);
