import React from 'react';
import { Link, Outlet, NavLink } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  return (
    <div className="app-layout">
      <nav className="navbar">
        <ul className="nav-links">
          <li><NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink></li>
          <li><NavLink to="/debt" className={({ isActive }) => (isActive ? 'active' : '')}>Debt</NavLink></li>
          <li><NavLink to="/tokenPair" className={({ isActive }) => (isActive ? 'active' : '')}>TokenPair</NavLink></li>
          <li><NavLink to="/pool" className={({ isActive }) => (isActive ? 'active' : '')}>Pool</NavLink></li>
          <li><NavLink to="/price" className={({ isActive }) => (isActive ? 'active' : '')}>Price</NavLink></li>
          <li><NavLink to="/configuration" className={({ isActive }) => (isActive ? 'active' : '')}>Configuration</NavLink></li>
          <li><NavLink to="/chainsInfo" className={({ isActive }) => (isActive ? 'active' : '')}>Chains Info</NavLink></li>
          <li><NavLink to="/storemanGroups" className={({ isActive }) => (isActive ? 'active' : '')}>Storeman Groups</NavLink></li>
        </ul>
      </nav>

      {/* 这里是每个页面渲染的位置 */}
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;