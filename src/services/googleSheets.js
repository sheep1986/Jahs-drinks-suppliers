import Papa from 'papaparse';

// Your spreadsheet ID
const SHEET_ID = '1hjx2n06fTwONQjBsFaUXb1Pg_UOujABUXapWVYpyIes';

// Your published URL
const PUBLISHED_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnpM334HanmWgllh_0s3iIU4kE9WiNw0pm-9KRf5YdpR4iGxnDBPA7y7DtPMILGwmbT50c1RXjdxOx/pub';

export const fetchDrinksData = async () => {
  try {
    console.log('Fetching drinks data...');
    
    // IMPORTANT: For Google Sheets to publish ALL tabs, you need to:
    // 1. Go to File > Share > Publish to web
    // 2. In the dropdown, change from "Entire Document" to "Sheet2" (or whatever your second sheet is named)
    // 3. Click Publish
    // 4. Get that URL and use it here
    
    // For now, let's try to fetch both sheets directly
    const allData = [];
    
    // Fetch Sheet 1 (default, no GID needed)
    try {
      console.log('Fetching Sheet 1...');
      const response1 = await fetch(`${PUBLISHED_BASE}?output=csv`);
      
      if (response1.ok) {
        const text1 = await response1.text();
        if (!text1.includes('<!DOCTYPE')) {
          const result1 = await new Promise((resolve) => {
            Papa.parse(text1, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                const filtered = results.data.filter(row => 
                  Object.values(row).some(value => value && value.toString().trim() !== '')
                );
                console.log(`Sheet 1: Found ${filtered.length} items`);
                if (filtered.length > 0) {
                  console.log('Sheet 1 sample:', filtered[0]);
                }
                resolve(filtered);
              },
              error: () => resolve([])
            });
          });
          allData.push(...result1);
        }
      }
    } catch (e) {
      console.error('Error fetching Sheet 1:', e);
    }
    
    // Try alternative URLs for the second sheet
    // You may need to publish Sheet2 separately and get its URL
    const sheet2Urls = [
      `${PUBLISHED_BASE}?output=csv&gid=1`, // Try GID 1
      `${PUBLISHED_BASE}?output=csv&single=true&gid=1`,
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1`,
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&id=${SHEET_ID}&gid=1`,
      // Add the published URL for Sheet2 if you have it
    ];
    
    console.log('Attempting to fetch Sheet 2...');
    for (const url of sheet2Urls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const text = await response.text();
          
          // Check if it's CSV and not HTML
          if (!text.includes('<!DOCTYPE') && !text.includes('<html') && text.trim() !== '') {
            const result = await new Promise((resolve) => {
              Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                  const filtered = results.data.filter(row => 
                    Object.values(row).some(value => value && value.toString().trim() !== '')
                  );
                  
                  if (filtered.length > 0) {
                    // Check if this is different data (has Coke products)
                    const hasCoke = filtered.some(row => {
                      const values = Object.values(row).join(' ').toLowerCase();
                      return values.includes('coke') || values.includes('coca');
                    });
                    
                    if (hasCoke) {
                      console.log(`✓ Sheet 2: Found ${filtered.length} items (includes Coke products!)`);
                      console.log('Sheet 2 sample:', filtered[0]);
                      resolve(filtered);
                      return;
                    }
                  }
                  resolve([]);
                },
                error: () => resolve([])
              });
            });
            
            if (result.length > 0) {
              allData.push(...result);
              break; // Found Sheet 2, stop trying other URLs
            }
          }
        }
      } catch (error) {
        // Continue to next URL
      }
    }
    
    console.log(`TOTAL: ${allData.length} items loaded`);
    
    if (allData.length < 62) {
      console.log('⚠️ Not all data loaded. To fix this:');
      console.log('OPTION 1 - Find the GID:');
      console.log('1. Open your spreadsheet');
      console.log('2. Click on Sheet2 tab at the bottom');
      console.log('3. Look at the URL - find the number after #gid=');
      console.log('4. Tell me that number');
      console.log('');
      console.log('OPTION 2 - Publish Sheet2 separately:');
      console.log('1. In your spreadsheet, go to File > Share > Publish to web');
      console.log('2. In the first dropdown, select "Sheet2" instead of "Entire Document"');
      console.log('3. Click Publish');
      console.log('4. Copy the new URL it gives you');
      console.log('5. Tell me that URL');
    }
    
    return allData;
    
  } catch (error) {
    console.error('Error in fetchDrinksData:', error);
    return [];
  }
};