namespace pneuhage.ecommerce.token.gen.app;

entity APIKey {
        key ID      : UUID;         
        apiKey      : String(32);  // 32 Zeichen für den API Key
        createdAt   : Timestamp;
        debitor     : String(255) @Updatability : #ReadWrite;  
        Textfield   : String(255) @Updatability : #ReadWrite;
    }
