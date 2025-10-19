import React, { useState, useEffect } from 'react';
import { headerMappings } from '../config/headerMappings';

const Settings = () => {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [customMappings, setCustomMappings] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  
  useEffect(() => {
    // Load saved settings from localStorage
    const savedUrl = localStorage.getItem('spreadsheetUrl');
    const savedMappings = localStorage.getItem('customMappings');
    
    if (savedUrl) setSpreadsheetUrl(savedUrl);
    if (savedMappings) setCustomMappings(JSON.parse(savedMappings));
  }, []);
  
  const handleSaveSettings = () => {
    // Extract sheet ID from the URL
    const sheetIdMatch = spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (sheetIdMatch) {
      const sheetId = sheetIdMatch[1];
      localStorage.setItem('spreadsheetId', sheetId);
      localStorage.setItem('spreadsheetUrl', spreadsheetUrl);
    }
    
    localStorage.setItem('customMappings', JSON.stringify(customMappings));
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    
    // Reload the page to apply new settings
    setTimeout(() => window.location.reload(), 1000);
  };
  
  const handleMappingChange = (standardField, value) => {
    setCustomMappings({
      ...customMappings,
      [standardField]: value
    });
  };
  
  return (
    <div className="container">
      <h1>Settings & Configuration</h1>
      
      <div className="settings-section">
        <h2>Spreadsheet Configuration</h2>
        <div className="form-group">
          <label htmlFor="spreadsheetUrl">Google Spreadsheet URL:</label>
          <input
            type="url"
            id="spreadsheetUrl"
            value={spreadsheetUrl}
            onChange={(e) => setSpreadsheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"
            className="settings-input"
          />
          <p className="help-text">
            Paste the full URL of your Google Spreadsheet. Make sure it's set to "Anyone with link can view".
          </p>
        </div>
      </div>
      
      <div className="settings-section">
        <h2>Column Mapping Helper</h2>
        <p className="help-text">
          If your spreadsheet uses different column names, you can specify custom mappings here.
          Leave blank to use automatic detection.
        </p>
        
        <div className="mappings-grid">
          <div className="mapping-item">
            <label>Product/Drink Name Column:</label>
            <input
              type="text"
              value={customMappings.drinkName || ''}
              onChange={(e) => handleMappingChange('drinkName', e.target.value)}
              placeholder="Auto-detect"
              className="mapping-input"
            />
          </div>
          
          <div className="mapping-item">
            <label>Category Column:</label>
            <input
              type="text"
              value={customMappings.category || ''}
              onChange={(e) => handleMappingChange('category', e.target.value)}
              placeholder="Auto-detect"
              className="mapping-input"
            />
          </div>
          
          <div className="mapping-item">
            <label>Supplier Column:</label>
            <input
              type="text"
              value={customMappings.supplier || ''}
              onChange={(e) => handleMappingChange('supplier', e.target.value)}
              placeholder="Auto-detect"
              className="mapping-input"
            />
          </div>
          
          <div className="mapping-item">
            <label>Price Column:</label>
            <input
              type="text"
              value={customMappings.price || ''}
              onChange={(e) => handleMappingChange('price', e.target.value)}
              placeholder="Auto-detect"
              className="mapping-input"
            />
          </div>
          
          <div className="mapping-item">
            <label>Email Column:</label>
            <input
              type="text"
              value={customMappings.email || ''}
              onChange={(e) => handleMappingChange('email', e.target.value)}
              placeholder="Auto-detect"
              className="mapping-input"
            />
          </div>
          
          <div className="mapping-item">
            <label>Phone Column:</label>
            <input
              type="text"
              value={customMappings.phone || ''}
              onChange={(e) => handleMappingChange('phone', e.target.value)}
              placeholder="Auto-detect"
              className="mapping-input"
            />
          </div>
        </div>
      </div>
      
      <div className="settings-section">
        <h2>Supported Column Names</h2>
        <p className="help-text">
          The app automatically recognizes these column name variations:
        </p>
        <div className="supported-columns">
          <div className="column-group">
            <strong>Product Names:</strong> {headerMappings.drinkName.slice(0, 5).join(', ')}...
          </div>
          <div className="column-group">
            <strong>Categories:</strong> {headerMappings.category.slice(0, 5).join(', ')}...
          </div>
          <div className="column-group">
            <strong>Suppliers:</strong> {headerMappings.supplier.slice(0, 5).join(', ')}...
          </div>
          <div className="column-group">
            <strong>Prices:</strong> {headerMappings.price.slice(0, 5).join(', ')}...
          </div>
        </div>
      </div>
      
      <div className="settings-actions">
        <button onClick={handleSaveSettings} className="btn btn-primary">
          Save Settings
        </button>
        
        {showSuccess && (
          <div className="success-message">
            Settings saved successfully! Reloading...
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;