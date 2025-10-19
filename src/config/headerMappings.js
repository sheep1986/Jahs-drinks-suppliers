// Header mapping configuration for different spreadsheet formats
// This maps various possible column names to our standard fields

export const headerMappings = {
  // Product Name variations
  drinkName: [
    'Drink Name',
    'Product Name',
    'Product',
    'Item Name',
    'Item',
    'Beverage Name',
    'Beverage',
    'Name',
    'Description',
    'Product Description'
  ],
  
  // Category variations
  category: [
    'Category',
    'Product Category',
    'Type',
    'Product Type',
    'Beverage Type',
    'Classification',
    'Group',
    'Product Group'
  ],
  
  // Brand variations
  brand: [
    'Brand',
    'Brand Name',
    'Manufacturer',
    'Make',
    'Label'
  ],
  
  // Supplier variations
  supplier: [
    'Supplier',
    'Supplier Name',
    'Vendor',
    'Vendor Name',
    'Distributor',
    'Company',
    'Provider',
    'Source'
  ],
  
  // Contact Person variations
  contactPerson: [
    'Contact Person',
    'Contact Name',
    'Contact',
    'Representative',
    'Rep',
    'Account Manager',
    'Sales Rep',
    'Sales Contact'
  ],
  
  // Email variations
  email: [
    'Email',
    'Email Address',
    'E-mail',
    'Contact Email',
    'Supplier Email',
    'Vendor Email',
    'Email Contact'
  ],
  
  // Phone variations
  phone: [
    'Phone',
    'Phone Number',
    'Telephone',
    'Tel',
    'Contact Number',
    'Contact Phone',
    'Mobile',
    'Cell',
    'Supplier Phone',
    'Vendor Phone'
  ],
  
  // Price variations (will look for JMD, USD, $ symbols)
  price: [
    'Price (JMD)',
    'Price',
    'Unit Price',
    'Cost',
    'Unit Cost',
    'Price per Unit',
    'Rate',
    'Price (USD)',
    'Price ($)',
    'JMD Price',
    'USD Price'
  ],
  
  // Unit/Size variations
  unit: [
    'Unit',
    'Size',
    'Package Size',
    'Volume',
    'Quantity',
    'Pack Size',
    'Container Size',
    'Bottle Size',
    'Can Size',
    'Unit Size',
    'Packaging'
  ],
  
  // Minimum Order Quantity variations
  minOrder: [
    'Min Order Qty',
    'Minimum Order Quantity',
    'Min Order',
    'MOQ',
    'Minimum Order',
    'Min Qty',
    'Minimum Qty',
    'Min Order Quantity',
    'Minimum Purchase'
  ],
  
  // Address variations
  address: [
    'Address',
    'Supplier Address',
    'Vendor Address',
    'Location',
    'Street Address',
    'Company Address',
    'Business Address'
  ],
  
  // Delivery variations
  deliveryDays: [
    'Delivery Days',
    'Delivery Schedule',
    'Delivery',
    'Lead Time',
    'Delivery Time',
    'Shipping Days',
    'Available Days',
    'Delivery Period'
  ],
  
  // Payment Terms variations
  paymentTerms: [
    'Payment Terms',
    'Terms',
    'Payment',
    'Credit Terms',
    'Payment Method',
    'Payment Options',
    'Terms of Payment'
  ],
  
  // Stock/Availability variations
  stock: [
    'Stock',
    'In Stock',
    'Availability',
    'Stock Status',
    'Inventory',
    'Stock Level',
    'Available',
    'Quantity Available'
  ],
  
  // Notes/Comments variations
  notes: [
    'Notes',
    'Comments',
    'Remarks',
    'Additional Info',
    'Description',
    'Special Notes',
    'Other'
  ]
};

// Function to find the matching standard field for a given header
export const findStandardField = (header) => {
  if (!header) return null;
  
  const normalizedHeader = header.trim().toLowerCase();
  
  for (const [standardField, variations] of Object.entries(headerMappings)) {
    for (const variation of variations) {
      if (variation.toLowerCase() === normalizedHeader) {
        return standardField;
      }
    }
  }
  
  // If no exact match, try partial matching for common patterns
  if (normalizedHeader.includes('price') || normalizedHeader.includes('cost')) {
    return 'price';
  }
  if (normalizedHeader.includes('email') || normalizedHeader.includes('e-mail')) {
    return 'email';
  }
  if (normalizedHeader.includes('phone') || normalizedHeader.includes('tel')) {
    return 'phone';
  }
  if (normalizedHeader.includes('supplier') || normalizedHeader.includes('vendor')) {
    return 'supplier';
  }
  if (normalizedHeader.includes('name') && !normalizedHeader.includes('contact')) {
    return 'drinkName';
  }
  
  return null;
};

// Function to map raw spreadsheet data to standardized format
export const mapSpreadsheetData = (rawData) => {
  return rawData.map(row => {
    const mappedRow = {};
    
    // First, try to map all fields using the standard mappings
    for (const [columnHeader, value] of Object.entries(row)) {
      const standardField = findStandardField(columnHeader);
      
      if (standardField) {
        // If we haven't set this field yet, or if this value is not empty
        if (!mappedRow[standardField] || (value && value.trim() !== '')) {
          mappedRow[standardField] = value;
        }
      } else {
        // Keep original field if no mapping found (for custom fields)
        mappedRow[columnHeader] = value;
      }
    }
    
    // Ensure critical fields exist even if empty
    const criticalFields = ['drinkName', 'category', 'supplier', 'price', 'unit'];
    for (const field of criticalFields) {
      if (!(field in mappedRow)) {
        mappedRow[field] = '';
      }
    }
    
    return mappedRow;
  });
};

// Function to detect currency and convert prices if needed
export const normalizePrice = (priceValue) => {
  if (!priceValue) return '';
  
  const priceString = priceValue.toString();
  
  // Remove currency symbols and clean up
  const cleanPrice = priceString
    .replace(/[^\d.,]/g, '')
    .replace(',', '');
  
  // Check if it's a valid number
  const numericPrice = parseFloat(cleanPrice);
  if (isNaN(numericPrice)) return priceValue;
  
  // If the original contains USD, you might want to convert to JMD
  // (1 USD ≈ 155 JMD as of 2024, but you should update this rate)
  if (priceString.toLowerCase().includes('usd') || priceString.includes('US$')) {
    const jmdPrice = numericPrice * 155; // Update this conversion rate as needed
    return jmdPrice.toFixed(2);
  }
  
  return numericPrice.toFixed(2);
};