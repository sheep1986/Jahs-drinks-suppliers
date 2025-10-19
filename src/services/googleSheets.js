import Papa from 'papaparse';

// Fixed sheet ID
const SHEET_ID = '1hjx2n06fTwONQjBsFaUXb1Pg_UOujABUXapWVYpyIes';

// Use the correct export URL for Google Sheets
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

export const fetchDrinksData = async () => {
  try {
    console.log('Fetching from Google Sheets:', SHEET_URL);
    
    const response = await fetch(SHEET_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('Data fetched successfully, parsing CSV...');
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('Parsed data:', results.data);
          
          // Filter out empty rows
          const filteredData = results.data.filter(row => {
            // Check if row has any non-empty values
            return Object.values(row).some(value => value && value.toString().trim() !== '');
          });
          
          console.log('Filtered data count:', filteredData.length);
          resolve(filteredData);
        },
        error: (error) => {
          console.error('Parse error:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw error;
  }
};