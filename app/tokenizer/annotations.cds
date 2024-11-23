using APIKeyService as service from '../../srv/api-key-service';
annotate service.APIKeys with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Details',
            ID : 'Details',
            Target : '@UI.FieldGroup#Details',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : '{@i18n>apiKey}',
            Value : apiKey,
            ![@UI.Importance] : #High,
        },
        {
            $Type : 'UI.DataField',
            Label : '{@i18n>createdAt}',
            Value : createdAt,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Label : 'Debitor',
            Value : debitor,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Label : '{@i18n>FreeText}',
            Value : Textfield,
            ![@UI.Importance] : #High    // Wichtigkeit für die dritte Spalte
        }
    ],
    UI.HeaderInfo : {
        TypeImageUrl : 'sap-icon://key',
        TypeName : '',
        TypeNamePlural : '',
        Title : {
            $Type : 'UI.DataField',
            Value : Textfield,
        },
    },
    UI.FieldGroup #Details : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : '{@i18n>apiKey}',
                Value : apiKey,
            },
            {
                $Type : 'UI.DataField',
                Label : '{@i18n>createdAt}',
                Value : createdAt,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Debitor',
                Value : debitor,
            },
            {
                $Type : 'UI.DataField',
                Label : '{@i18n>FreeText}',
                Value : Textfield,
            },
        ],
    },
);

annotate service.APIKeys with {
    apiKey @Common.FieldControl : #ReadOnly
};

annotate service.APIKeys with {
    createdAt @Common.FieldControl : #ReadOnly
};

annotate service.APIKeys with {
    Textfield @Common.FieldControl : #Mandatory
              @UI.Placeholder : 'Firma / Ansprechpartner eingeben'
};

annotate service.APIKeys with {
    debitor @Common.FieldControl : #Mandatory
            @UI.Placeholder : 'SAP Debitor eingaben'
};

