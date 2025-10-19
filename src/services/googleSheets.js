import Papa from 'papaparse';

// Your published URL
const PUBLISHED_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnpM334HanmWgllh_0s3iIU4kE9WiNw0pm-9KRf5YdpR4iGxnDBPA7y7DtPMILGwmbT50c1RXjdxOx/pub?output=csv';

export const fetchDrinksData = async () => {
  try {
    console.log('Fetching from:', PUBLISHED_URL);
    
    const response = await fetch(PUBLISHED_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('Raw CSV data received');
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('Parsed data:', results.data);
          console.log('Headers found:', results.meta.fields);
          console.log('Total rows:', results.data.length);
          
          // Don't modify the data - just filter out completely empty rows
          const filteredData = results.data.filter(row => {
            // Check if row has at least one non-empty value
            return Object.values(row).some(value => value && value.toString().trim() !== '');
          });
          
          console.log('Filtered data count:', filteredData.length);
          console.log('Sample row:', filteredData[0]);
          
          resolve(filteredData);
        },
        error: (error) => {
          console.error('Parse error:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};