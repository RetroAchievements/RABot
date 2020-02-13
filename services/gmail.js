require('dotenv').config({ path: '../.env' });

const {
  CLIENT_ID, CLIENT_SECRET, REDIRECT_URIS, CHANNEL_RADMIN, RA_GUILD_ID, ROLE_ADMIN,
} = process.env;

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
      if (err) logger.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (error) => {
        if (err) logger.error(error);
        logger.info('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function getMessages(auth) {
  return new Promise((resolve, reject) => {
    const gmail = google.gmail({ version: 'v1', auth });
    return gmail.users.messages.list({
      userId: 'me',
      labelIds: ['INBOX', 'CATEGORY_PERSONAL'],
    }, async (err, res) => {
      if (err) {
        logger.error(`The API returned an error: ${err}`);
        return reject(err);
      }
      const msgs = res.data;
      if (msgs.messages.length) {
        return resolve({ gmail, emails: msgs.messages });
      }
      logger.warn('No messages found');
      return resolve('No messages found');
    });
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

async function gmailService(client) {
  authorize(CLIENT_ID, CLIENT_SECRET, REDIRECT_URIS[0], async (auth) => {
    const { gmail, emails } = await getMessages(auth);
    const RAdmin = await client.channels.get(CHANNEL_RADMIN);
    const fetchMsgs = await RAdmin.fetchMessages();
    const adminRole = await client.guilds.get(RA_GUILD_ID).roles.get(ROLE_ADMIN);

    emails.forEach(async (email) => {
      const emailOptions = {
        userId: 'me',
        id: email.id,
        format: 'full',
      };

      const emailDetails = await gmail.users.messages.get(emailOptions);

      let from = ''; let to = ''; let date = ''; let subject = ''; let decodeMessage = ''; let mimeType = '';
      to = emailDetails.data.payload.headers.find((data) => data.name === 'To').value;
      from = emailDetails.data.payload.headers.find((data) => data.name === 'From').value;
      date = emailDetails.data.payload.headers.find((data) => data.name === 'Date').value;
      subject = emailDetails.data.payload.headers.find((data) => data.name === 'Subject').value;
      mimeType = emailDetails.data.payload.mimeType;
      if (!mimeType.includes('application/octet-stream')) {
        if (mimeType.includes('text/html')) {
          decodeMessage = base64decode(emailDetails.data.payload.body.data);
        } else if (mimeType.includes('multipart/mixed')) {
          decodeMessage = base64decode(emailDetails.data.payload.parts[0].parts[0].body.data);
        } else if (mimeType.includes('multipart/alternative')) {
          decodeMessage = base64decode(emailDetails.data.payload.parts[0].body.data);
        }
      }
      if (fetchMsgs.size > 1) {
        fetchMsgs.forEach(async (fetch) => {
          const msgSubject = fetch.content.substring(fetch.content.indexOf('Subject') + 11, fetch.content.indexOf('\n\n'));
          if (msgSubject !== subject) {
            await RAdmin.send(`--- START ---\n **From**: ${from}\n **To**: ${to} - ${adminRole} \n **Date/Time**: ${date}\n **Subject**: ${subject}\n\n ${decodeMessage} \n--- END ---`);
          }
        });
      } else {
        await RAdmin.send(`--- START ---\n **From**: ${from}\n **To**: ${to} - ${adminRole} \n **Date/Time**: ${date}\n **Subject**: ${subject}\n\n ${decodeMessage} \n--- END ---`);
      }
    });
  });
}

module.exports = {
  gmailService,
};
