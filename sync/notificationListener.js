import pool from "../config/dbConfig.js";
import { syncPostgresData } from '../services/googleSheetServices.js'; 

export const listenToNotifications = async () => {
  const client = await pool.connect();
  try {
    client.on('notification', async (msg) => {
      if (!msg.payload) {
        console.error('Received empty payload');
        return;
      }

      let payload;
      try {
        payload = JSON.parse(msg.payload);
        console.log('Data change detected:', payload);
      } catch (error) {
        console.error('Error parsing JSON payload:', error);
        console.error('Received payload:', msg.payload); // Log the raw payload for debugging
        return; // Exit the function if JSON parsing fails
      }

      // Call your sync function here
      try {
        await syncPostgresData(payload);
        console.log('Data synchronized successfully');
      } catch (error) {
        console.error('Error synchronizing data:', error);
      }
    });

    await client.query('LISTEN user_change');
    console.log('Listening for database notifications...');
  } catch (error) {
    console.error('Error setting up notification listener:', error);
  }
};