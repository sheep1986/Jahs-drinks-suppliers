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
        
        // Enhanced search - partial matches for any word in the search term
        const searchWords = searchLower.split(' ').filter(word => word.length > 0);
        
        return searchWords.every(word => {
          return (
            (drink['Drink Name'] && drink['Drink Name'].toLowerCase().includes(word)) ||
            (drink['Category'] && drink['Category'].toLowerCase().includes(word)) ||
            (drink['Supplier'] && drink['Supplier'].toLowerCase().includes(word)) ||
            (drink['Brand'] && drink['Brand'].toLowerCase().includes(word))
          );
        });
      });
      setFilteredDrinks(filtered);
    }
  }, [searchTerm, drinks]);

  const loadDrinks = async () => {
    try {
      setLoading(true);
      const data = await fetchDrinksData();
      // Process data to ensure ml units
      const processedData = data.map(drink => ({
        ...drink,
        'Unit': convertToMl(drink['Unit'])
      }));
      setDrinks(processedData);
      setFilteredDrinks(processedData);
      setError(null);
    } catch (err) {
      setError('Failed to load drinks data. Please try again later.');
      console.error('Error loading drinks:', err);
    } finally {
      setLoading(false);
    }
  };

  const convertToMl = (unit) => {
    if (!unit) return 'N/A';
    
    // Convert cl to ml if present
    if (unit.toLowerCase().includes('cl')) {
      const match = unit.match(/(\d+(?:\.\d+)?)\s*cl/i);
      if (match) {
        const clValue = parseFloat(match[1]);
        const mlValue = clValue * 10;
        return unit.replace(/\d+(?:\.\d+)?\s*cl/i, `${mlValue}ml`);
      }
    }
    
    // Ensure ml is lowercase
    return unit.replace(/ML/g, 'ml').replace(/Ml/g, 'ml');
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
          placeholder="Search drinks (e.g., 'Coke' for all Coke products)..."
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
            filteredDrinks.map((drink, index) => (
              <div
                key={index}
                className={`drink-item ${selectedDrink === drink ? 'selected' : ''}`}
              >
                <div onClick={() => handleDrinkSelect(drink)} className="drink-item-content">
                  <div className="drink-name">{formatValue(drink['Drink Name'])}</div>
                  <div className="drink-meta">
                    <span className="category">{formatValue(drink['Category'])}</span>
                    <span className="supplier">{formatValue(drink['Supplier'])}</span>
                  </div>
                  <div className="drink-unit">
                    Unit: {formatValue(drink['Unit'])}
                  </div>
                </div>
                <button 
                  className="btn btn-supplier"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewSupplier(drink);
                  }}
                >
                  View Supplier
                </button>
              </div>
            ))
          ) : (
            <p className="no-results">No drinks found matching your search.</p>
          )}
        </div>

        {selectedDrink && !showSupplierModal && (
          <div className="drink-details">
            <h2>{formatValue(selectedDrink['Drink Name'])}</h2>
            
            <div className="detail-section">
              <h3>Product Information</h3>
              <div className="detail-row">
                <span className="label">Category:</span>
                <span className="value">{formatValue(selectedDrink['Category'])}</span>
              </div>
              <div className="detail-row">
                <span className="label">Brand:</span>
                <span className="value">{formatValue(selectedDrink['Brand'])}</span>
              </div>
              <div className="detail-row">
                <span className="label">Unit:</span>
                <span className="value">{formatValue(selectedDrink['Unit'])}</span>
              </div>
              <div className="detail-row">
                <span className="label">Price (JMD):</span>
                <span className="value price">
                  ${formatValue(selectedDrink['Price (JMD)'])}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Min Order Qty:</span>
                <span className="value">{formatValue(selectedDrink['Min Order Qty'])}</span>
              </div>
            </div>

            <button 
              className="btn btn-primary"
              onClick={() => setShowSupplierModal(true)}
            >
              View Supplier Details
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
            <h2>Supplier Details</h2>
            <h3>{formatValue(selectedDrink['Drink Name'])}</h3>
            
            <div className="detail-section">
              <div className="detail-row">
                <span className="label">Supplier:</span>
                <span className="value">{formatValue(selectedDrink['Supplier'])}</span>
              </div>
              <div className="detail-row">
                <span className="label">Contact Person:</span>
                <span className="value">{formatValue(selectedDrink['Contact Person'])}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span className="value">
                  {selectedDrink['Email'] ? (
                    <button 
                      className="contact-link"
                      onClick={() => handleEmailClick(selectedDrink['Email'], selectedDrink['Supplier'])}
                    >
                      {selectedDrink['Email']}
                    </button>
                  ) : 'Not available'}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Phone:</span>
                <span className="value">
                  {selectedDrink['Phone'] ? (
                    <button 
                      className="contact-link"
                      onClick={() => handlePhoneClick(selectedDrink['Phone'], selectedDrink['Supplier'])}
                    >
                      {selectedDrink['Phone']}
                    </button>
                  ) : 'Not available'}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Address:</span>
                <span className="value">{formatValue(selectedDrink['Address'])}</span>
              </div>
              <div className="detail-row">
                <span className="label">Delivery Days:</span>
                <span className="value">{formatValue(selectedDrink['Delivery Days'])}</span>
              </div>
              <div className="detail-row">
                <span className="label">Payment Terms:</span>
                <span className="value">{formatValue(selectedDrink['Payment Terms'])}</span>
              </div>
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