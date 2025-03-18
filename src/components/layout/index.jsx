import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import Header from "../Header";

function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content-wrapper">
        <Header />
        <div className="content">
          <div className="container-fluid">
            <Outlet /> 
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;