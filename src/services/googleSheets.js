import Papa from 'papaparse';

// Fixed sheet ID
const SHEET_ID = '1hjx2n06fTwONQjBsFaUXb1Pg_UOujABUXapWVYpyIes';

// Using a CORS proxy to fetch Google Sheets data
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

// Alternative: Use the published web URL if available
const PUBLISHED_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQZKqH3QbZTmjqH1bZ6ZTGfZ1RQZKqH3QbZTmjqH1bZ6ZTGfZ1RQZKqH3QbZTmjqH1bZ6ZTGfZ1RQ/pub?output=csv`;

export const fetchDrinksData = async () => {
  // Try different methods to fetch the data
  const urls = [
    SHEET_URL,  // Direct export URL (might be blocked by CORS)
    `${CORS_PROXY}${SHEET_URL}`,  // With CORS proxy
    PUBLISHED_URL  // Published web URL if sheet is published
  ];

  let lastError = null;
  
  for (const url of urls) {
    try {
      console.log('Attempting to fetch from:', url);
      
      const response = await fetch(url, {
        mode: 'cors',
        headers: {
          'Accept': 'text/csv,text/plain,*/*'
        }
      });
      
      if (!response.ok) {
        console.log(`Failed with status ${response.status}, trying next URL...`);
        continue;
      }
      
      const text = await response.text();
      
      // Check if we got HTML instead of CSV (common error)
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        console.log('Received HTML instead of CSV, trying next URL...');
        continue;
      }
      
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
      console.error(`Error with URL ${url}:`, error);
      lastError = error;
      continue;
    }
  }
  
  // If all methods fail, provide instructions
  console.error('Could not fetch data. The spreadsheet needs to be published to the web.');
  throw new Error('Unable to fetch spreadsheet data. Please ensure the Google Sheet is published to the web (File → Share → Publish to web).');
};