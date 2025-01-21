function mytrigger(e) {
  const sheet = e.source.getActiveSheet();
  const editedRange = e.range;
  const lastRow = sheet.getLastRow();
  
  // Capture data from the entire sheet
  const sheetData = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();

  const payload = {
    range: {
      startRow: editedRange.getRow(),
      endRow: editedRange.getLastRow(),
    },
    sheetData: sheetData,
  };

  Logger.log("Payload: " + JSON.stringify(payload));  // Log the payload

  const url = 'https://7b47-152-58-204-217.ngrok-free.app/api/sheets/sheet-trigger';
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    Logger.log("Response Code: " + response.getResponseCode());  // Log the HTTP response code
    Logger.log("Response Body: " + response.getContentText());   // Log the response body
  } catch (error) {
    Logger.log("Error: " + error.message);  // Log any errors that occur during the request
  }
}
