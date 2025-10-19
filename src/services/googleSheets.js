import Papa from 'papaparse';

// Convert Google Sheets URL to CSV export URL
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
          // Filter out empty rows
          const filteredData = results.data.filter(row => 
            row['Drink Name'] && row['Drink Name'].trim() !== ''
          );
          resolve(filteredData);
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