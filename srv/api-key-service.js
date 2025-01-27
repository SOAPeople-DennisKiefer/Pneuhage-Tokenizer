const cds = require('@sap/cds');
require('dotenv').config(); // Load environment variables

// Global Middleware for All Incoming Requests
cds.on('bootstrap', (app) => {
  app.use((req, res, next) => {
    // DEBUG Logs for local usage.
    if (process.env.PLATFORM === 'LOCAL') {
      console.log(req.headers);
      console.log(`[DEBUG] Global Middleware - Request Path: ${req.path}`);
      console.log(`[DEBUG] Authorization Header: ${req.headers['authorization']}`);
      console.log(`[DEBUG] x-api-key Header: ${req.headers['x-api-key']}`);
    }
    next();
  });
});

// Main service definition
module.exports = class APIKeyService extends cds.ApplicationService {
  async init() {
    const { APIKeys } = this.entities;

    this.before(['generateAPIKey', 'validateAPIKey'], async (req) => {
      if (process.env.PLATFORM === 'LOCAL') {
        console.log(`[DEBUG] Middleware triggered for event: ${req.event}, path: ${req.path}`);
      }

      // Prüfe, ob ein User-Objekt vorhanden ist (=> JWT erfolgreich validiert).
      if (!req.user) {
        if (process.env.PLATFORM === 'LOCAL') {
          console.log('[DEBUG] No JWT user found -> rejecting');
        }
        return req.reject(401, {
          error: 'Unauthorized',
          message: 'Missing or invalid JWT token',
        });
      }
      if (process.env.PLATFORM === 'LOCAL') {
        console.log('[DEBUG] JWT authentication successful!');
      }
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

    // API-Key validation handler (jetzt JWT-geschützt)
    this.on('validateAPIKey', async (req) => {
      if (process.env.PLATFORM === 'LOCAL') {
        console.log('[DEBUG] validateAPIKey handler triggered');
      }

      const apiKey = req.headers['x-api-key'];
      if (process.env.PLATFORM === 'LOCAL') {
        console.log(`[DEBUG] Received API Key: ${apiKey}`);
      }

      if (!apiKey) {
        req.error(400, 'Missing or invalid API Key in the header');
      }

      try {
        const result = await SELECT.one(['debitor', 'Textfield', 'createdAt'])
          .from(APIKeys)
          .where({ apiKey: apiKey });

        if (result) {
          if (process.env.PLATFORM === 'LOCAL') {
            console.log('[DEBUG] API Key valid');
          }
          return {
            valid: true,
            debitor: result.debitor,
            Textfield: result.Textfield,
            createdAt: result.createdAt,
          };
        } else {
          if (process.env.PLATFORM === 'LOCAL') {
            console.log('[DEBUG] Invalid API Key');
          }
          req.error(401, 'Invalid API Key');
        }
      } catch (err) {
        if (process.env.PLATFORM === 'LOCAL') {
          console.error('[DEBUG] Error during API Key validation:', err);
        }
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
