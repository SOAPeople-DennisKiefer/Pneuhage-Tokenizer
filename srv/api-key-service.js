const cds = require('@sap/cds');
require('dotenv').config(); // Load environment variables

module.exports = class APIKeyService extends cds.ApplicationService {
  async init() {
    const { APIKeys } = this.entities;

    // Hook vor dem Anlegen eines neuen Eintrags, um API-Key zu generieren
    this.before('CREATE', APIKeys, async (req) => {
      req.data.ID = cds.utils.uuid(); // Eindeutige ID setzen
      req.data.apiKey = this._generateRandomAPIKey(); // Direkt API Key generieren
      req.data.createdAt = new Date(); // Timestamp setzen
    });

    // API-Key generation handler (manuelles Anlegen über Event)
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

    // API-Key validation handler (JWT-geschützt)
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
