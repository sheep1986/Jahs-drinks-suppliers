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
      setError('Unable to load drinks data. The Google Sheet needs to be published: File → Share → Publish to web → Select CSV format → Publish');
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

  // Function to get the first non-empty value from multiple possible field names
  const getFieldValue = (drink, fieldNames) => {
    for (const fieldName of fieldNames) {
      // Check exact match
      if (drink[fieldName] && drink[fieldName].trim() !== '') {
        return drink[fieldName];
      }
      // Check case-insensitive match
      const key = Object.keys(drink).find(k => k.toLowerCase() === fieldName.toLowerCase());
      if (key && drink[key] && drink[key].trim() !== '') {
        return drink[key];
      }
    }
    return '';
  };

  // Get drink name from various possible columns
  const getDrinkName = (drink) => {
    return getFieldValue(drink, ['Drink Name', 'DRINK NAME', 'Product Name', 'Product', 'Item Name', 'Item', 'Name', 'Description', 'DrinkName']) || 
           drink['DRINK NAME'] || drink['Drink Name'] || Object.values(drink)[0] || '';
  };

  // Get category from various possible columns  
  const getCategory = (drink) => {
    return getFieldValue(drink, ['Category', 'CATEGORY', 'Type', 'Product Type', 'Product Category']) ||
           drink['CATEGORY'] || drink['Category'] || '';
  };

  // Get supplier from various possible columns
  const getSupplier = (drink) => {
    return getFieldValue(drink, ['Supplier', 'SUPPLIER', 'Vendor', 'Distributor', 'Company']) ||
           drink['SUPPLIER'] || drink['Supplier'] || '';
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
                  <div className="drink-name">{formatValue(getDrinkName(drink))}</div>
                  <div className="drink-meta">
                    <span className="category">{formatValue(getCategory(drink))}</span>
                    <span className="supplier">{formatValue(getSupplier(drink))}</span>
                  </div>
                  <div className="drink-unit">
                    Unit: {formatValue(getFieldValue(drink, ['Unit', 'Size', 'Volume', 'Package Size']))}
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
            <h2>{formatValue(getDrinkName(selectedDrink))}</h2>
            
            <div className="detail-section">
              <h3>Product Information</h3>
              <div className="detail-row">
                <span className="label">Category:</span>
                <span className="value">{formatValue(getCategory(selectedDrink))}</span>
              </div>
              <div className="detail-row">
                <span className="label">Brand:</span>
                <span className="value">{formatValue(getFieldValue(selectedDrink, ['Brand', 'Brand Name', 'Manufacturer']))}</span>
              </div>
              <div className="detail-row">
                <span className="label">Unit:</span>
                <span className="value">{formatValue(getFieldValue(selectedDrink, ['Unit', 'Size', 'Volume', 'Package Size']))}</span>
              </div>
              <div className="detail-row">
                <span className="label">Price (JMD):</span>
                <span className="value price">
                  ${formatValue(getFieldValue(selectedDrink, ['Price (JMD)', 'Price', 'Unit Price', 'Cost']))}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Min Order Qty:</span>
                <span className="value">{formatValue(getFieldValue(selectedDrink, ['Min Order Qty', 'Minimum Order', 'MOQ']))}</span>
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
            <h3>{formatValue(getDrinkName(selectedDrink))}</h3>
            
            <div className="detail-section">
              <div className="detail-row">
                <span className="label">Supplier:</span>
                <span className="value">{formatValue(getSupplier(selectedDrink))}</span>
              </div>
              <div className="detail-row">
                <span className="label">Contact Person:</span>
                <span className="value">{formatValue(getFieldValue(selectedDrink, ['Contact Person', 'Contact', 'Representative']))}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span className="value">
                  {selectedDrink['Email'] || selectedDrink['Contact Email'] ? (
                    <button 
                      className="contact-link"
                      onClick={() => handleEmailClick(
                        selectedDrink['Email'] || selectedDrink['Contact Email'],
                        getSupplier(selectedDrink)
                      )}
                    >
                      {selectedDrink['Email'] || selectedDrink['Contact Email']}
                    </button>
                  ) : 'Not available'}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Phone:</span>
                <span className="value">
                  {selectedDrink['Phone'] || selectedDrink['Contact Phone'] || selectedDrink['Tel'] ? (
                    <button 
                      className="contact-link"
                      onClick={() => handlePhoneClick(
                        selectedDrink['Phone'] || selectedDrink['Contact Phone'] || selectedDrink['Tel'],
                        getSupplier(selectedDrink)
                      )}
                    >
                      {selectedDrink['Phone'] || selectedDrink['Contact Phone'] || selectedDrink['Tel']}
                    </button>
                  ) : 'Not available'}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Address:</span>
                <span className="value">{formatValue(getFieldValue(selectedDrink, ['Address', 'Location', 'Supplier Address']))}</span>
              </div>
              <div className="detail-row">
                <span className="label">Delivery Days:</span>
                <span className="value">{formatValue(getFieldValue(selectedDrink, ['Delivery Days', 'Delivery', 'Lead Time']))}</span>
              </div>
              <div className="detail-row">
                <span className="label">Payment Terms:</span>
                <span className="value">{formatValue(getFieldValue(selectedDrink, ['Payment Terms', 'Terms', 'Payment']))}</span>
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