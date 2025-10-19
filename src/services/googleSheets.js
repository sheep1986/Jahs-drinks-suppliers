import Papa from 'papaparse';

// Your published URL base
const PUBLISHED_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnpM334HanmWgllh_0s3iIU4kE9WiNw0pm-9KRf5YdpR4iGxnDBPA7y7DtPMILGwmbT50c1RXjdxOx/pub';

// Function to fetch with timeout
const fetchWithTimeout = async (url, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Function to fetch a single sheet by GID
const fetchSheetByGid = async (gid) => {
  const url = `${PUBLISHED_BASE}?output=csv&single=true&gid=${gid}`;
  
  try {
    console.log(`Trying sheet GID ${gid}...`);
    const response = await fetchWithTimeout(url, 3000);
    
    if (!response.ok) {
      return [];
    }
    
    const text = await response.text();
    
    // Check if we got HTML instead of CSV
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      return [];
    }
    
    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const filtered = results.data.filter(row => 
            Object.values(row).some(value => value && value.toString().trim() !== '')
          );
          if (filtered.length > 0) {
            console.log(`✓ Sheet GID ${gid}: ${filtered.length} items`);
          }
          resolve(filtered);
        },
        error: () => resolve([])
      });
    });
  } catch (error) {
    // Silently fail for individual sheets
    return [];
  }
};

export const fetchDrinksData = async () => {
  try {
    console.log('Starting to fetch drinks data...');
    
    // First try the main published URL
    try {
      const mainResponse = await fetchWithTimeout(`${PUBLISHED_BASE}?output=csv`, 5000);
      
      if (mainResponse.ok) {
        const text = await mainResponse.text();
        
        if (!text.includes('<!DOCTYPE') && !text.includes('<html')) {
          return new Promise((resolve) => {
            Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                const filtered = results.data.filter(row => 
                  Object.values(row).some(value => value && value.toString().trim() !== '')
                );
                console.log(`Found ${filtered.length} items from main URL`);
                console.log('Headers:', results.meta.fields);
                console.log('Sample data:', filtered[0]);
                resolve(filtered);
              },
              error: (error) => {
                console.error('Parse error:', error);
                resolve([]);
              }
            });
          });
        }
      }
    } catch (mainError) {
      console.log('Main URL failed, trying individual sheets...');
    }
    
    // If main URL fails, try specific GIDs
    const gidsToTry = [0, 1, 2, 269289963, 1050511479, 834170036];
    const allData = [];
    
    // Try fetching sheets in parallel with Promise.all
    const promises = gidsToTry.map(gid => fetchSheetByGid(gid));
    const results = await Promise.all(promises);
    
    for (const sheetData of results) {
      if (sheetData.length > 0) {
        allData.push(...sheetData);
      }
    }
    
    if (allData.length > 0) {
      console.log(`Total items found: ${allData.length}`);
      return allData;
    }
    
    // If still no data, return empty array instead of throwing
    console.log('No data found, returning empty array');
    return [];
    
  } catch (error) {
    console.error('Error in fetchDrinksData:', error);
    // Return empty array instead of throwing to prevent infinite loading
    return [];
  }
};