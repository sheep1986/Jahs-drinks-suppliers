import Papa from 'papaparse';
import { mapSpreadsheetData, normalizePrice } from '../config/headerMappings';

// Fixed sheet ID - no admin controls needed
const SHEET_ID = '1hjx2n06fTwONQjBsFaUXb1Pg_UOujABUXapWVYpyIes';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

export const fetchDrinksData = async () => {
  try {
    const response = await fetch(SHEET_URL);
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