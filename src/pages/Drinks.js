import React, { useState, useEffect } from 'react';
import { fetchDrinksData } from '../services/googleSheets';

const Drinks = () => {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [filteredDrinks, setFilteredDrinks] = useState([]);

  useEffect(() => {
    loadDrinks();
  }, []);

  useEffect(() => {
    if (drinks.length > 0) {
      const filtered = drinks.filter(drink => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (drink['Drink Name'] && drink['Drink Name'].toLowerCase().includes(searchLower)) ||
          (drink['Category'] && drink['Category'].toLowerCase().includes(searchLower)) ||
          (drink['Supplier'] && drink['Supplier'].toLowerCase().includes(searchLower))
        );
      });
      setFilteredDrinks(filtered);
    }
  }, [searchTerm, drinks]);

  const loadDrinks = async () => {
    try {
      setLoading(true);
      const data = await fetchDrinksData();
      setDrinks(data);
      setFilteredDrinks(data);
      setError(null);
    } catch (err) {
      setError('Failed to load drinks data. Please try again later.');
      console.error('Error loading drinks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrinkSelect = (drink) => {
    setSelectedDrink(drink);
  };

  const handleRefresh = () => {
    loadDrinks();
    setSelectedDrink(null);
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
          placeholder="Search drinks, categories, or suppliers..."
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
                onClick={() => handleDrinkSelect(drink)}
              >
                <div className="drink-name">{drink['Drink Name']}</div>
                <div className="drink-meta">
                  <span className="category">{drink['Category']}</span>
                  <span className="supplier">{drink['Supplier']}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-results">No drinks found matching your search.</p>
          )}
        </div>

        {selectedDrink && (
          <div className="drink-details">
            <h2>{selectedDrink['Drink Name']}</h2>
            
            <div className="detail-section">
              <h3>Product Information</h3>
              <div className="detail-row">
                <span className="label">Category:</span>
                <span className="value">{selectedDrink['Category'] || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Unit:</span>
                <span className="value">{selectedDrink['Unit'] || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Supplier Details</h3>
              <div className="detail-row">
                <span className="label">Supplier:</span>
                <span className="value">{selectedDrink['Supplier'] || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Contact Person:</span>
                <span className="value">{selectedDrink['Contact Person'] || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span className="value">
                  {selectedDrink['Email'] ? (
                    <a href={`mailto:${selectedDrink['Email']}`}>{selectedDrink['Email']}</a>
                  ) : 'N/A'}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Phone:</span>
                <span className="value">
                  {selectedDrink['Phone'] ? (
                    <a href={`tel:${selectedDrink['Phone']}`}>{selectedDrink['Phone']}</a>
                  ) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Pricing & Orders</h3>
              <div className="detail-row">
                <span className="label">Price (JMD):</span>
                <span className="value price">
                  ${selectedDrink['Price (JMD)'] || 'N/A'}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Min Order Qty:</span>
                <span className="value">{selectedDrink['Min Order Qty'] || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Drinks;