// src/routes/StrictAuthProtected.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ForcePasswordGuard = ({ children }) => {
  const location = useLocation();
  const authUser = JSON.parse(sessionStorage.getItem("authUser"));
  const forceRedirectPath = "/ForceResetPassword";

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  const isForceChange = authUser?.user?.isForcePasswordChange;

  if (isForceChange && location.pathname !== forceRedirectPath) {
    return <Navigate to={forceRedirectPath} replace />;
  }

  return children;
};

export default ForcePasswordGuard;



