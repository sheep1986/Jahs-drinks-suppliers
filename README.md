# Jah's Jamaican Cuisine - Drinks & Suppliers App

A web application for managing and searching drinks inventory and supplier information for Jah's Jamaican Cuisine.

## Features

- **Real-time Google Sheets Integration**: Data syncs directly from your Google Spreadsheet
- **Search Functionality**: Search drinks by name, category, or supplier
- **Supplier Details**: View complete supplier contact information and pricing
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Beautiful UI**: Modern, gradient-based design with smooth animations

## Tech Stack

- React 18
- React Router v6
- Google Sheets (as database)
- PapaParse (CSV parsing)
- Netlify (deployment)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd jahs-drinks-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at http://localhost:3000

## Deployment to Netlify

### Method 1: Using Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build the project:
```bash
npm run build
```

3. Deploy to Netlify:
```bash
netlify deploy --prod --dir=build
```

### Method 2: Using Git

1. Push your code to GitHub/GitLab/Bitbucket
2. Log in to Netlify (https://app.netlify.com)
3. Click "New site from Git"
4. Connect your repository
5. Deploy settings will be auto-detected

## Google Sheets Setup

The app fetches data from the Google Spreadsheet at:
https://docs.google.com/spreadsheets/d/1hjx2n06fTwONQjBsFaUXb1Pg_UOujABUXapWVYpyIes

Make sure the spreadsheet is set to "Anyone with the link can view" for the app to access it.

### Expected Column Headers:
- Drink Name
- Category
- Supplier
- Contact Person
- Email
- Phone
- Price (JMD)
- Unit
- Min Order Qty

## Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests

## License

© 2024 Jah's Jamaican Cuisine. All rights reserved.