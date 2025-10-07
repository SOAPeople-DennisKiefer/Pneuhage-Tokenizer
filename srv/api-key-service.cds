using pneuhage.ecommerce.token.gen.app as my from '../db/data-model';

// Die explizite 'using { managed }' Anweisung wurde entfernt,
// da sie die Warnung 'unused-artefact-import' auslöste.
// Der Compiler sollte die Draft-Felder nun über die Projektion
// auf die korrigierte Entität my.APIKey finden.

service APIKeyService {

  @requires: 'tokenizer.read'
  action generateAPIKey() returns String;

  action validateAPIKey(apiKey: {
    value     : String
  })                      returns {
    valid     : Boolean;
    debitor   : String;
    Textfield : String;
    createdAt : Timestamp;
  };

  entity APIKeys @(Capabilities: {
    InsertRestrictions: {
      $Type: 'Capabilities.InsertRestrictionsType',
      Insertable
    },
    UpdateRestrictions: {
      $Type: 'Capabilities.UpdateRestrictionsType',
      Updatable
    },
    DeleteRestrictions: {
      $Type: 'Capabilities.DeleteRestrictionsType',
      Deletable
    },
  }) as projection on my.APIKey;

  // Die Draft-Annotation funktioniert jetzt, da 'my.APIKey' von 'cuid' und 'managed' erbt.
  annotate APIKeyService.APIKeys with @odata.draft.enabled;
}
