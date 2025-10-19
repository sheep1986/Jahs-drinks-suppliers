import Papa from 'papaparse';

// Your published URL base
const PUBLISHED_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnpM334HanmWgllh_0s3iIU4kE9WiNw0pm-9KRf5YdpR4iGxnDBPA7y7DtPMILGwmbT50c1RXjdxOx/pub';

// Your actual sheet GIDs
const SHEET_GIDS = [
  { gid: '1661705792', name: 'Sheet 1' },
  { gid: '232382027', name: 'Sheet 2 (Coke products)' }
];

export const fetchDrinksData = async () => {
  try {
    console.log('Fetching all sheets from Google Spreadsheet...');
    
    const allData = [];
    
    // Fetch each sheet by its GID
    for (const sheet of SHEET_GIDS) {
      try {
        const url = `${PUBLISHED_BASE}?output=csv&gid=${sheet.gid}`;
        console.log(`Fetching ${sheet.name} (GID: ${sheet.gid})...`);
        
        const response = await fetch(url);
        
        if (response.ok) {
          const text = await response.text();
          
          // Make sure we got CSV, not HTML
          if (!text.includes('<!DOCTYPE') && !text.includes('<html') && text.trim() !== '') {
            const result = await new Promise((resolve) => {
              Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                  const filtered = results.data.filter(row => 
                    Object.values(row).some(value => value && value.toString().trim() !== '')
                  );
                  
                  console.log(`✓ ${sheet.name}: Found ${filtered.length} items`);
                  if (filtered.length > 0) {
                    console.log(`Sample from ${sheet.name}:`, filtered[0]);
                  }
                  
                  resolve(filtered);
                },
                error: (error) => {
                  console.error(`Error parsing ${sheet.name}:`, error);
                  resolve([]);
                }
              });
            });
            
            allData.push(...result);
          } else {
            console.log(`${sheet.name} returned HTML or empty data`);
          }
        } else {
          console.log(`Failed to fetch ${sheet.name}: ${response.status}`);
        }
      } catch (error) {
        console.error(`Error fetching ${sheet.name}:`, error);
      }
    }
    
    console.log(`✅ TOTAL: ${allData.length} items from all sheets`);
    
    // Check if we have Coke products
    const hasCoke = allData.some(item => {
      const values = Object.values(item).join(' ').toLowerCase();
      return values.includes('coke') || values.includes('coca');
    });
    
    if (hasCoke) {
      console.log('✓ Successfully loaded Coke products from Sheet 2!');
    }
    
    return allData;
    
  } catch (error) {
    console.error('Error in fetchDrinksData:', error);
    return [];
  }
};