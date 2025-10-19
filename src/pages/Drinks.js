import React, { useState, useEffect } from 'react';
import { fetchDrinksData } from '../services/googleSheets';

const Drinks = () => {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [filteredDrinks, setFilteredDrinks] = useState([]);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  useEffect(() => {
    loadDrinks();
  }, []);

  useEffect(() => {
    if (drinks.length > 0) {
      const filtered = drinks.filter(drink => {
        const searchLower = searchTerm.toLowerCase().trim();
        
        // Search across all fields
        return Object.values(drink).some(value => {
          if (value && typeof value === 'string') {
            return value.toLowerCase().includes(searchLower);
          }
          return false;
        });
      });
      setFilteredDrinks(filtered);
    }
  }, [searchTerm, drinks]);

  const loadDrinks = async () => {
    try {
      setLoading(true);
      const data = await fetchDrinksData();
      console.log('Loaded drinks data:', data);
      setDrinks(data);
      setFilteredDrinks(data);
      setError(null);
    } catch (err) {
      setError('Unable to load drinks data.');
      console.error('Error loading drinks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrinkSelect = (drink) => {
    setSelectedDrink(drink);
    setShowSupplierModal(false);
  };

  const handleViewSupplier = (drink) => {
    setSelectedDrink(drink);
    setShowSupplierModal(true);
  };

  const handleRefresh = () => {
    loadDrinks();
    setSelectedDrink(null);
    setShowSupplierModal(false);
  };

  const handleEmailClick = (email, supplierName) => {
    if (window.confirm(`Would you like to email ${supplierName || 'this supplier'}?`)) {
      window.location.href = `mailto:${email}`;
    }
  };

  const handlePhoneClick = (phone, supplierName) => {
    if (window.confirm(`Would you like to call ${supplierName || 'this supplier'}?`)) {
      window.location.href = `tel:${phone}`;
    }
  };

  const formatValue = (value) => {
    return value && value !== '' ? value : 'Not available';
  };

  // Get the actual first column as drink name (whatever the header is)
  const getDrinkName = (drink) => {
    const keys = Object.keys(drink);
    return drink[keys[0]] || 'Not available';
  };

  // Get the actual second column as category (whatever the header is)
  const getCategory = (drink) => {
    const keys = Object.keys(drink);
    return keys[1] ? drink[keys[1]] : 'Not available';
  };

  // Get the actual third column as supplier (whatever the header is)
  const getSupplier = (drink) => {
    const keys = Object.keys(drink);
    return keys[2] ? drink[keys[2]] : 'Not available';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading drinks data from spreadsheet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleRefresh} className="btn btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="drinks-header">
        <h1>Drinks & Suppliers Database</h1>
        <button onClick={handleRefresh} className="btn btn-refresh">
          Refresh Data
        </button>
      </div>

      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="Search drinks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <p className="results-count">
          Showing {filteredDrinks.length} of {drinks.length} drinks
        </p>
      </div>

      <div className="drinks-layout">
        <div className="drinks-list">
          {filteredDrinks.length > 0 ? (
            filteredDrinks.map((drink, index) => {
              const drinkName = getDrinkName(drink);
              const category = getCategory(drink);
              const supplier = getSupplier(drink);
              
              return (
                <div
                  key={index}
                  className={`drink-item ${selectedDrink === drink ? 'selected' : ''}`}
                >
                  <div onClick={() => handleDrinkSelect(drink)} className="drink-item-content">
                    <div className="drink-name">{formatValue(drinkName)}</div>
                    <div className="drink-meta">
                      <span className="category">{formatValue(category)}</span>
                      <span className="supplier">{formatValue(supplier)}</span>
                    </div>
                  </div>
                  <button 
                    className="btn btn-supplier"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewSupplier(drink);
                    }}
                  >
                    View Details
                  </button>
                </div>
              );
            })
          ) : (
            <p className="no-results">No drinks found matching your search.</p>
          )}
        </div>

        {selectedDrink && !showSupplierModal && (
          <div className="drink-details">
            <h2>{formatValue(getDrinkName(selectedDrink))}</h2>
            
            <div className="detail-section">
              <h3>All Information</h3>
              {Object.entries(selectedDrink).map(([key, value]) => (
                <div key={key} className="detail-row">
                  <span className="label">{key}:</span>
                  <span className="value">{formatValue(value)}</span>
                </div>
              ))}
            </div>

            <button 
              className="btn btn-primary"
              onClick={() => setShowSupplierModal(true)}
            >
              View All Details
            </button>
          </div>
        )}

        {selectedDrink && showSupplierModal && (
          <div className="drink-details supplier-modal">
            <button 
              className="close-button"
              onClick={() => setShowSupplierModal(false)}
            >
              ✕
            </button>
            <h2>Full Details</h2>
            <h3>{formatValue(getDrinkName(selectedDrink))}</h3>
            
            <div className="detail-section">
              {Object.entries(selectedDrink).map(([key, value]) => {
                // Check if this might be an email field
                if (key.toLowerCase().includes('email') && value && value.includes('@')) {
                  return (
                    <div key={key} className="detail-row">
                      <span className="label">{key}:</span>
                      <span className="value">
                        <button 
                          className="contact-link"
                          onClick={() => handleEmailClick(value, getSupplier(selectedDrink))}
                        >
                          {value}
                        </button>
                      </span>
                    </div>
                  );
                }
                // Check if this might be a phone field
                else if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('tel')) {
                  return (
                    <div key={key} className="detail-row">
                      <span className="label">{key}:</span>
                      <span className="value">
                        {value ? (
                          <button 
                            className="contact-link"
                            onClick={() => handlePhoneClick(value, getSupplier(selectedDrink))}
                          >
                            {value}
                          </button>
                        ) : 'Not available'}
                      </span>
                    </div>
                  );
                }
                // Regular field
                return (
                  <div key={key} className="detail-row">
                    <span className="label">{key}:</span>
                    <span className="value">{formatValue(value)}</span>
                  </div>
                );
              })}
            </div>

            <button 
              className="btn btn-primary"
              onClick={() => setShowSupplierModal(false)}
            >
              Back to Product Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Drinks;