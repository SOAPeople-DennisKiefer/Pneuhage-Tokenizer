namespace pneuhage.ecommerce.token.gen.app;

// WICHTIG: Ersetzen von 'Drafts' durch 'cuid' und 'managed',
// da 'Drafts' in manchen Umgebungen nicht aufgelöst wird.
using {
    cuid,
    managed
} from '@sap/cds/common';

// Die Entität erbt nun von 'cuid' (für ID) und 'managed' (für Zeitstempel/User)
entity APIKey : cuid, managed {
    apiKey    : String(32); // 32 Zeichen für den API Key
    debitor   : String(255) @Updatability: #ReadWrite;
    Textfield : String(255) @Updatability: #ReadWrite;
}
