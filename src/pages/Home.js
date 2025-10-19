import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container">
      <div className="home-hero">
        <h1>Welcome to Jah's Jamaican Cuisine</h1>
        <p className="tagline">Authentic Flavors, Premium Beverages</p>
      </div>
      
      <div className="home-content">
        <div className="feature-card">
          <h2>Drinks & Suppliers Database</h2>
          <p>
            Access our comprehensive database of beverages and supplier information. 
            Search through our curated selection of authentic Jamaican drinks and spirits.
          </p>
          <Link to="/drinks" className="btn btn-primary">
            Browse Drinks & Suppliers
          </Link>
        </div>
        
        <div className="info-grid">
          <div className="info-card">
            <h3>Real-Time Updates</h3>
            <p>Our database syncs directly with our inventory spreadsheet, ensuring you always have the latest information.</p>
          </div>
          <div className="info-card">
            <h3>Supplier Details</h3>
            <p>Get complete contact information, pricing, and minimum order quantities for all our suppliers.</p>
          </div>
          <div className="info-card">
            <h3>Easy Search</h3>
            <p>Find exactly what you need with our powerful search functionality across drinks and suppliers.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;