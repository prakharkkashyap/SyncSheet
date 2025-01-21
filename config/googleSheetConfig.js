import { google } from 'googleapis';

// Path to the service account key file
const KEY_FILE = 'credentials.json'; // Update with your service account JSON key file
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Create a GoogleAuth instance using the service account credentials
const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE,
  scopes: SCOPES,
});

// Get the authenticated client
const getClient = async () => {
  return await auth.getClient();
};

// Create a Sheets API client
const createSheetsClient = async () => {
  const client = await getClient();
  return google.sheets({ version: 'v4', auth: client });
};

export default createSheetsClient;
