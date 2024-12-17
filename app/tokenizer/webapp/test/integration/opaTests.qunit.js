sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'tokenizer/test/integration/FirstJourney',
		'tokenizer/test/integration/pages/APIKeysList',
		'tokenizer/test/integration/pages/APIKeysObjectPage'
    ],
    function(JourneyRunner, opaJourney, APIKeysList, APIKeysObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('tokenizer') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheAPIKeysList: APIKeysList,
					onTheAPIKeysObjectPage: APIKeysObjectPage
                }
            },
            opaJourney.run
        );
    }
);