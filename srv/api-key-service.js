const cds = require('@sap/cds');
require('dotenv').config(); // Load environment variables

// Global Middleware for All Incoming Requests
cds.on('bootstrap', (app) => {
  app.use((req, res, next) => {
    console.log(`[DEBUG] Global Middleware - Request Path: ${req.path}`);
    console.log(`[DEBUG] Authorization Header: ${req.headers['authorization']}`);
    console.log(`[DEBUG] x-api-key Header: ${req.headers['x-api-key']}`);
    next();
  });
});

// Main service definition
module.exports = class APIKeyService extends cds.ApplicationService {
  async init() {
    const { APIKeys } = this.entities;

    // Middleware to handle Basic Authentication for specific events
    this.before(['generateAPIKey', 'validateAPIKey'], async (req) => {
      console.log(`[DEBUG] Middleware triggered for event: ${req.event}, path: ${req.path}`);

      const authHeader = req.headers['authorization'];
      console.log(`[DEBUG] Authorization Header: ${authHeader}`);

      if (!authHeader || !authHeader.startsWith('Basic ')) {
        console.log('[DEBUG] Missing or malformed Authorization Header');
        return req.reject(401, {
          error: 'Unauthorized',
          message: 'Missing or malformed Basic Authentication header',
        });
      }

      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [username, password] = credentials.split(':');

      console.log(`[DEBUG] Decoded Username: ${username}`);
      console.log(`[DEBUG] Decoded Password: ${password}`);
      console.log(`[DEBUG] Expected Username: ${process.env.TOKENIZER_USER}`);
      console.log(`[DEBUG] Expected Password: ${process.env.TOKENIZER_PASS}`);

      if (
        username.trim() !== process.env.TOKENIZER_USER?.trim() ||
        password.trim() !== process.env.TOKENIZER_PASS?.trim()
      ) {
        console.log('[DEBUG] Invalid Credentials');
        return req.reject(401, {
          error: 'Unauthorized',
          message: 'Invalid Credentials',
        });
      }

      console.log('[DEBUG] Authentication successful!');
    });

    // API-Key generation handler
    this.on('generateAPIKey', async (req) => {
      const apiKey = this._generateRandomAPIKey();

      try {
        const result = await INSERT.into(APIKeys).entries({
          ID: cds.utils.uuid(),
          apiKey: apiKey,
          createdAt: new Date(),
        });

        if (result) {
          return { message: 'API Key generated successfully', apiKey: apiKey };
        } else {
          req.error(500, 'Failed to generate API Key');
        }
      } catch (err) {
        console.error(err);
        req.error(500, 'Unexpected error while generating API Key');
      }
    });

    // API-Key validation handler
    this.on('validateAPIKey', async (req) => {
      console.log('[DEBUG] validateAPIKey handler triggered');

      const apiKey = req.headers['x-api-key']; // Expect API Key in the header
      console.log(`[DEBUG] Received API Key: ${apiKey}`);

      if (!apiKey) {
        req.error(400, 'Missing or invalid API Key in the header');
      }

      try {
        const result = await SELECT.one(['debitor', 'Textfield', 'createdAt'])
          .from(APIKeys)
          .where({ apiKey: apiKey });

        if (result) {
          console.log('[DEBUG] API Key valid');
          return {
            valid: true,
            debitor: result.debitor,
            Textfield: result.Textfield,
            createdAt: result.createdAt,
          };
        } else {
          console.log('[DEBUG] Invalid API Key');
          req.error(401, 'Invalid API Key');
        }
      } catch (err) {
        console.error('[DEBUG] Error during API Key validation:', err);
        req.error(500, 'Unexpected error while validating API Key');
      }
    });

    // Helper function: Generate a random API key
    this._generateRandomAPIKey = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let apiKey = '';
      for (let i = 0; i < 32; i++) {
        apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return apiKey;
    };

    await super.init();
  }
};
