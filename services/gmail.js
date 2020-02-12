const { base64decode } = require('nodejs-base64');
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const logger = require('pino')({
  useLevelLabels: true,
  timestamp: () => `,"time":"${new Date()}"`,
});

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return logger.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        logger.info('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function getMessages(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  gmail.users.messages.list({
    userId: 'me',
  }, async (err, res) => {
    if (err) return logger.error(`The API returned an error: ${err}`);
    const msgs = res.data;
    if (msgs.messages.length) {
      /** 
        * WIP - do something with email body
        * below is an example of getting the latset message sent to the user's email
        * a for loop can be used on the msgs.messages array to go thru the  latest cronolgical income order of the newest 100 emails
        */

      // example to get details of latest email
      const msgDetails = await gmail.users.messages.get({
        userId: 'me',
        id: msgs.messages[0].id,
      });
      
      
        /**
         * Retrieve the email sender, date of when the email entered inbox and decode body message of the email
         * @param {from} string The name and email of the sender.
         * @param {date} string The date when the email came in.
         * @param {decodedMessage} string The body of the email message.
         */
      let from, date; 
      from = msgDetails.data.payload.headers.find(data=> data.name == 'From' ).value;
      date = msgDetails.data.payload.headers.find(data=> data.name == 'Date' ).value;
      const decodeMessage = base64decode(msgDetails.data.payload.parts[0].body.data);

    } else {
      logger.warn('No messages found');
    }
  });
}


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(clientId, clientSecret, redirectUris, callback) {
  const oAuth2Client = new google.auth.OAuth2(
    clientId, clientSecret, redirectUris,
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}


module.exports = {
  authorize,
  getMessages,
};
