import Papa from 'papaparse';

// Fixed sheet ID
const SHEET_ID = '1hjx2n06fTwONQjBsFaUXb1Pg_UOujABUXapWVYpyIes';

// Your published URL base
const PUBLISHED_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnpM334HanmWgllh_0s3iIU4kE9WiNw0pm-9KRf5YdpR4iGxnDBPA7y7DtPMILGwmbT50c1RXjdxOx/pub';

// Sheet GIDs for different tabs (you may need to check these in your spreadsheet)
// GID 0 is usually the first sheet, GID for other sheets can be found in the URL when you click on them
const SHEET_GIDS = [
  { gid: '0', name: 'Sheet1' },
  { gid: '269289963', name: 'Sheet2' },  // Update these GIDs based on your actual sheets
  { gid: '1234567890', name: 'Sheet3' }, // You'll need to find the actual GIDs
];

// Function to fetch data from a single sheet
const fetchSheetData = async (gid) => {
  const url = `${PUBLISHED_BASE}?output=csv&gid=${gid}`;
  
  try {
    console.log(`Fetching sheet with GID ${gid} from:`, url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch sheet ${gid}: ${response.status}`);
      return [];
    }
    
    const text = await response.text();
    
    // Check if we got HTML instead of CSV
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      console.error(`Received HTML instead of CSV for sheet ${gid}`);
      return [];
    }
    
    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log(`Parsed ${results.data.length} rows from sheet ${gid}`);
          
          // Filter out empty rows and add supplier field if missing
          const filteredData = results.data.filter(row => {
            // Check if row has any non-empty values
            const hasData = Object.values(row).some(value => value && value.toString().trim() !== '');
            return hasData;
          }).map(row => {
            // Ensure each row has a supplier field from sheet name or column
            if (!row.Supplier && !row.SUPPLIER) {
              // Try to extract supplier from other fields or use sheet name
              row.Supplier = row.Vendor || row.Distributor || row.Company || 'Various';
            }
            return row;
          });
          
          resolve(filteredData);
        },
        error: (error) => {
          console.error(`Parse error for sheet ${gid}:`, error);
          resolve([]);
        }
      });
    });
  } catch (error) {
    console.error(`Error fetching sheet ${gid}:`, error);
    return [];
  }
};

export const fetchDrinksData = async () => {
  try {
    // First, try to fetch from the main published URL (all sheets combined)
    const mainUrl = `${PUBLISHED_BASE}?output=csv`;
    console.log('Attempting to fetch all sheets from:', mainUrl);
    
    const response = await fetch(mainUrl);
    
    if (response.ok) {
      const text = await response.text();
      
      if (!text.includes('<!DOCTYPE') && !text.includes('<html')) {
        return new Promise((resolve) => {
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              console.log('Parsed all data:', results.data.length, 'rows');
              console.log('Sample row:', results.data[0]);
              console.log('Headers:', results.meta.fields);
              
              // Process and filter the data
              const processedData = results.data
                .filter(row => {
                  // Check if row has any non-empty values
                  return Object.values(row).some(value => value && value.toString().trim() !== '');
                })
                .map(row => {
                  // Normalize field names - handle case variations
                  const normalizedRow = {};
                  
                  Object.keys(row).forEach(key => {
                    // Keep original key and also create normalized versions
                    normalizedRow[key] = row[key];
                    
                    // Create lowercase version for easier access
                    const lowerKey = key.toLowerCase().trim();
                    
                    // Map common variations to standard fields
                    if (lowerKey.includes('drink') || lowerKey.includes('product') || lowerKey.includes('item')) {
                      normalizedRow['DrinkName'] = normalizedRow['DrinkName'] || row[key];
                    }
                    if (lowerKey.includes('supplier') || lowerKey.includes('vendor')) {
                      normalizedRow['Supplier'] = normalizedRow['Supplier'] || row[key];
                    }
                    if (lowerKey.includes('category') || lowerKey.includes('type')) {
                      normalizedRow['Category'] = normalizedRow['Category'] || row[key];
                    }
                    if (lowerKey.includes('price')) {
                      normalizedRow['Price'] = normalizedRow['Price'] || row[key];
                    }
                    if (lowerKey.includes('unit') || lowerKey.includes('size')) {
                      normalizedRow['Unit'] = normalizedRow['Unit'] || row[key];
                    }
                  });
                  
                  return normalizedRow;
                });
              
              console.log('Final processed data count:', processedData.length);
              console.log('Sample processed row:', processedData[0]);
              resolve(processedData);
            },
            error: (error) => {
              console.error('Parse error:', error);
              resolve([]);
            }
          });
        });
      }
    }
    
    // If the combined fetch didn't work, try fetching individual sheets
    console.log('Main fetch failed, trying individual sheets...');
    
    // Fetch from multiple sheet GIDs and combine the results
    const allData = [];
    
    // Try common GID values (you may need to update these based on your actual sheet)
    const gidsToTry = ['0', '269289963', '1050511479', '834170036']; // Common second, third, fourth sheet GIDs
    
    for (const gid of gidsToTry) {
      const sheetData = await fetchSheetData(gid);
      if (sheetData.length > 0) {
        allData.push(...sheetData);
        console.log(`Added ${sheetData.length} rows from sheet GID ${gid}`);
      }
    }
    
    if (allData.length === 0) {
      throw new Error('No data found in any sheets');
    }
    
    console.log(`Total combined data: ${allData.length} rows`);
    return allData;
    
  } catch (error) {
    console.error('Failed to fetch drinks data:', error);
    throw new Error('Unable to load spreadsheet data. Please ensure the Google Sheet is published to web.');
  }
};