import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import PrivateRoute from './PrivateRoute'
import Home from '../pages/Home'
import Layout from '../components/layout'
import Group from '../pages/Group'

const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute />}>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/groups/:id" element={<Group />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default Router
