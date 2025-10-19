import Papa from 'papaparse';

// Your published URL base
const PUBLISHED_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnpM334HanmWgllh_0s3iIU4kE9WiNw0pm-9KRf5YdpR4iGxnDBPA7y7DtPMILGwmbT50c1RXjdxOx/pub';

// Function to fetch a single sheet by GID
const fetchSheetByGid = async (gid) => {
  const url = `${PUBLISHED_BASE}?output=csv&single=true&gid=${gid}`;
  
  try {
    console.log(`Fetching sheet GID ${gid}...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`Sheet GID ${gid} not accessible`);
      return [];
    }
    
    const text = await response.text();
    
    // Check if we got HTML instead of CSV
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      console.log(`Sheet GID ${gid} returned HTML, skipping`);
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
          console.log(`Sheet GID ${gid}: found ${filtered.length} rows`);
          resolve(filtered);
        },
        error: () => {
          console.log(`Failed to parse sheet GID ${gid}`);
          resolve([]);
        }
      });
    });
  } catch (error) {
    console.log(`Error fetching sheet GID ${gid}:`, error.message);
    return [];
  }
};

export const fetchDrinksData = async () => {
  try {
    console.log('Fetching all sheets from Google Spreadsheet...');
    
    // Common sheet GIDs to try
    // GID 0 is always the first sheet
    // Other common GIDs for additional sheets
    const gidsToTry = [
      0,           // First sheet (always)
      // Common patterns for additional sheets
      1, 2, 3, 4, 5,  // Sequential numbering
      269289963,   // Common second sheet GID
      1050511479,  // Common third sheet GID  
      834170036,   // Common fourth sheet GID
      1947885914,  // Another common pattern
      395898872,   // Another common pattern
      1608280577,  // Another common pattern
      // Try some random high numbers that Google often uses
      692969420,
      1544974466,
      2146372070,
      1096694984,
      737503663,
      1735530889
    ];
    
    const allData = [];
    let foundSheets = 0;
    
    // Try to fetch from each GID
    for (const gid of gidsToTry) {
      const sheetData = await fetchSheetByGid(gid);
      if (sheetData.length > 0) {
        allData.push(...sheetData);
        foundSheets++;
        console.log(`✓ Added ${sheetData.length} items from sheet GID ${gid}`);
      }
    }
    
    console.log(`Total: Found ${foundSheets} sheets with ${allData.length} total items`);
    
    if (allData.length === 0) {
      // If no data found with GIDs, try the basic URL
      console.log('Trying basic published URL...');
      const response = await fetch(`${PUBLISHED_BASE}?output=csv`);
      if (response.ok) {
        const text = await response.text();
        if (!text.includes('<!DOCTYPE')) {
          return new Promise((resolve) => {
            Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                const filtered = results.data.filter(row => 
                  Object.values(row).some(value => value && value.toString().trim() !== '')
                );
                console.log(`Found ${filtered.length} items from basic URL`);
                resolve(filtered);
              },
              error: () => resolve([])
            });
          });
        }
      }
      throw new Error('No data found in spreadsheet');
    }
    
    return allData;
    
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};