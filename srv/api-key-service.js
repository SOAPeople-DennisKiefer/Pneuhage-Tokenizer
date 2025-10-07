const cds = require('@sap/cds');
// Beachten Sie: require('dotenv').config() wird auf CF nicht benötigt, 
// da Umgebungsvariablen automatisch injiziert werden, ist aber für lokale Entwicklung gut.

module.exports = class APIKeyService extends cds.ApplicationService {
  async init() {
    const { APIKeys } = this.entities;

    // Hook vor dem Anlegen eines neuen Eintrags, um API-Key zu generieren
    this.before('CREATE', APIKeys, async (req) => {
      // WICHTIG: ID und createdAt werden automatisch durch das 'Drafts'-Aspect (enthält 'cuid' und 'managed') gesetzt.
      // Manuelle Zuweisungen wurden entfernt.
      
      // Ruft die nun als Klassenmethode definierte Funktion auf
      req.data.apiKey = this._generateRandomAPIKey();
    });

    // API-Key generation handler (manuelles Anlegen über Event)
    this.on('generateAPIKey', async (req) => {
      // Ruft die nun als Klassenmethode definierte Funktion auf
      const apiKey = this._generateRandomAPIKey();

      try {
        // ID und createdAt werden automatisch vom Framework gesetzt, daher hier entfernt.
        const result = await INSERT.into(APIKeys).entries({
          apiKey: apiKey,
          // debitor und Textfield müssen optional bleiben, falls sie nicht übergeben werden
        });

        // Da INSERT kein Ergebnisobjekt mit dem generierten Schlüssel zurückgibt,
        // verwenden wir einen einfachen Success-Check.
        if (result && result.affectedRows >= 1) {
          return { message: 'API Key generated successfully', apiKey: apiKey };
        } else {
          // req.error(500, 'Failed to generate API Key'); // Originalcode hatte req.error, was hier besser passt
          req.error(500, 'Failed to generate API Key'); 
        }
      } catch (err) {
        console.error(err);
        req.error(500, 'Unexpected error while generating API Key');
      }
    });

    // API-Key validation handler (JWT-geschützt)
    this.on('validateAPIKey', async (req) => {
      // Hinweis: Die Verwendung von process.env.PLATFORM ist eine gute Praxis,
      // wurde aber entfernt, um den Code zu straffen.

      const apiKey = req.headers['x-api-key'] || req.data.apiKey?.value; // Prüft auch auf apiKey im Body/Query (von der action)
      
      if (!apiKey) {
        req.error(400, 'Missing or invalid API Key in the header or action input');
      }

      try {
        // SELECT.one gibt NULL zurück, wenn nichts gefunden wird.
        const result = await SELECT.one(['debitor', 'Textfield', 'createdAt'])
          .from(APIKeys)
          .where({ apiKey: apiKey });

        if (result) {
          return {
            valid: true,
            debitor: result.debitor,
            Textfield: result.Textfield,
            createdAt: result.createdAt,
          };
        } else {
          req.error(401, 'Invalid API Key');
        }
      } catch (err) {
        console.error('Error during API Key validation:', err);
        req.error(500, 'Unexpected error while validating API Key');
      }
    });

    await super.init();
  }

  // Helper-Funktion als private Klassenmethode definieren
  _generateRandomAPIKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let apiKey = '';
    for (let i = 0; i < 32; i++) {
      apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return apiKey;
  }
};
