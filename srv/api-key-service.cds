using pneuhage.ecommerce.token.gen.app as my from '../db/data-model';

service APIKeyService {
  
  @requires: 'tokenizer.read'
  action generateAPIKey () returns String;
  action validateAPIKey (apiKey: {value: String}) returns {
    valid:      Boolean;
    debitor:    String;
    Textfield:  String;
    createdAt:  Timestamp;
  };
  
  entity APIKeys @(
        Capabilities : {
          InsertRestrictions : {
              $Type : 'Capabilities.InsertRestrictionsType',
              Insertable,
          },
          UpdateRestrictions : {
              $Type : 'Capabilities.UpdateRestrictionsType',
              Updatable
          },
          DeleteRestrictions : {
              $Type : 'Capabilities.DeleteRestrictionsType',
              Deletable
          },
        }
  ) as projection on my.APIKey;
  annotate APIKeyService.APIKeys with @odata.draft.enabled;
  
  
}  