import Papa from 'papaparse';

// Your published URL base
const PUBLISHED_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnpM334HanmWgllh_0s3iIU4kE9WiNw0pm-9KRf5YdpR4iGxnDBPA7y7DtPMILGwmbT50c1RXjdxOx/pub';

export const fetchDrinksData = async () => {
  try {
    console.log('Fetching drinks data from Google Sheets...');
    
    // To publish ALL sheets, we need to fetch each one separately
    // When you publish a Google Sheet, each tab needs its own GID parameter
    
    // Step 1: Try the main URL first (usually gets first sheet)
    const allData = [];
    
    try {
      const response = await fetch(`${PUBLISHED_BASE}?output=csv`);
      if (response.ok) {
        const text = await response.text();
        if (!text.includes('<!DOCTYPE')) {
          const result = await new Promise((resolve) => {
            Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                const filtered = results.data.filter(row => 
                  Object.values(row).some(value => value && value.toString().trim() !== '')
                );
                console.log(`Sheet 1: ${filtered.length} items found`);
                console.log('Sheet 1 headers:', results.meta.fields);
                resolve(filtered);
              },
              error: () => resolve([])
            });
          });
          allData.push(...result);
        }
      }
    } catch (e) {
      console.log('Could not fetch first sheet');
    }
    
    // Step 2: Try to fetch additional sheets with different GID parameters
    // You need to find your sheet's GID by:
    // 1. Open your Google Sheet
    // 2. Click on the second tab (where Coke is)
    // 3. Look at the URL - it will show #gid=XXXXXXX
    // 4. That number is what we need here
    
    // Common GID patterns to try for second sheets
    const secondSheetGids = [
      '1', // Sometimes it's just 1
      '2', 
      '1050511479', // Common pattern
      '269289963',  // Common pattern
      '834170036',  // Common pattern
      '1947885914', // Common pattern
      '1402044025', // Common pattern
      '1960973522', // Common pattern
      '2057072618', // Common pattern
      '1780868280', // Common pattern
      '1188287910', // Common pattern
      '790329945',  // Common pattern
    ];
    
    // Try each potential second sheet GID
    for (const gid of secondSheetGids) {
      try {
        const url = `${PUBLISHED_BASE}?output=csv&gid=${gid}`;
        console.log(`Trying GID ${gid}...`);
        
        const response = await fetch(url);
        if (response.ok) {
          const text = await response.text();
          
          // Make sure we got CSV, not HTML
          if (!text.includes('<!DOCTYPE') && text.trim() !== '') {
            const result = await new Promise((resolve) => {
              Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                  const filtered = results.data.filter(row => 
                    Object.values(row).some(value => value && value.toString().trim() !== '')
                  );
                  
                  if (filtered.length > 0) {
                    // Check if this looks like different data (not duplicate of sheet 1)
                    const firstItem = filtered[0];
                    const firstItemName = Object.values(firstItem)[0];
                    
                    // Check if this sheet has different data than what we already have
                    const isDuplicate = allData.some(item => 
                      Object.values(item)[0] === firstItemName
                    );
                    
                    if (!isDuplicate) {
                      console.log(`✓ Sheet with GID ${gid}: ${filtered.length} new items found!`);
                      console.log('Sample item from this sheet:', firstItem);
                      resolve(filtered);
                    } else {
                      console.log(`Sheet GID ${gid} appears to be duplicate data`);
                      resolve([]);
                    }
                  } else {
                    resolve([]);
                  }
                },
                error: () => resolve([])
              });
            });
            
            if (result.length > 0) {
              allData.push(...result);
              // If we found data, keep trying other GIDs in case there are more sheets
            }
          }
        }
      } catch (error) {
        // Silently continue to next GID
      }
    }
    
    console.log(`TOTAL: ${allData.length} items from all sheets`);
    
    // Log a message to help find the correct GID
    if (allData.length < 62) {
      console.log('⚠️ Not all items found. To find your sheet GID:');
      console.log('1. Open your Google Sheet');
      console.log('2. Click on the tab with Coke products');
      console.log('3. Look at the URL - it will show #gid=XXXXXXX');
      console.log('4. Tell me that number so I can add it');
    }
    
    return allData;
    
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};