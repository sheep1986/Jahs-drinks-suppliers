import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/">
          <img 
            src="https://i.ibb.co/XkYJgkQ/jahs-logo.png" 
            alt="Jah's Jamaican Cuisine" 
            className="navbar-logo"
          />
        </NavLink>
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/drinks" className={({ isActive }) => isActive ? 'active' : ''}>
            Drinks & Suppliers
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>
            Contact
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;