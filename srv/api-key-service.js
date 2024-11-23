const cds = require('@sap/cds');

module.exports = class APIKeyService extends cds.ApplicationService {
  async init() {
    const { APIKeys } = this.entities;

    // API-Key generieren
    this.on('generateAPIKey', async (req) => {
      const apiKey = this._generateRandomAPIKey();

      try {
        const result = await INSERT.into(APIKeys).entries({
          ID: cds.utils.uuid(),
          apiKey: apiKey,
          createdAt: new Date()
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

    // API-Key validieren
    this.on('validateAPIKey', async (req) => {
      const { apiKey } = req.data;

      if (!apiKey || !apiKey.value) {
        req.error(400, 'Missing or invalid API Key in the request');
      }

      try {
        const result = await SELECT.one(['debitor', 'Textfield', 'createdAt'])
          .from(APIKeys)
          .where({ apiKey: apiKey.value });

        if (result) {
          return {
            valid: true,
            debitor: result.debitor,
            Textfield: result.Textfield,
            createdAt: result.createdAt
          };
        } else {
          req.error(401, 'Invalid API Key');
        }
      } catch (err) {
        console.error(err);
        req.error(500, 'Unexpected error while validating API Key');
      }
    });

    // Hilfsfunktion: Zufälligen API-Key generieren
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
