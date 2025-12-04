import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';

const ProtectedRoute = ({ component: Component }) => {
  const { userId } = useUser();

  return userId ? <Component /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
