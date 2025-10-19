import Papa from 'papaparse';
import { mapSpreadsheetData, normalizePrice } from '../config/headerMappings';

// Get sheet ID from localStorage or use default
const getSheetId = () => {
  const savedId = localStorage.getItem('spreadsheetId');
  return savedId || '1hjx2n06fTwONQjBsFaUXb1Pg_UOujABUXapWVYpyIes';
};

// Convert Google Sheets URL to CSV export URL
const getSheetUrl = () => {
  const sheetId = getSheetId();
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
};

export const fetchDrinksData = async () => {
  try {
    const response = await fetch(getSheetUrl());
    const text = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        complete: (results) => {
          // Map the raw data to standardized format
          const mappedData = mapSpreadsheetData(results.data);
          
          // Filter out empty rows (checking the mapped drinkName field)
          const filteredData = mappedData.filter(row => 
            row.drinkName && row.drinkName.trim() !== ''
          );
          
          // Normalize prices
          const processedData = filteredData.map(row => ({
            ...row,
            price: normalizePrice(row.price)
          }));
          
          console.log('Processed data sample:', processedData[0]); // Debug log
          resolve(processedData);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw error;
  }
};