import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

function PrivateRoute() {
  if (localStorage.getItem('token')) {
    return <Outlet />
  }else{
    return <Navigate to="/login" replace={true} />
  }
}

export default PrivateRoute;
