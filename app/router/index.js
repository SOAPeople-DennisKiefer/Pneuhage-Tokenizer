var approuter = require('@sap/approuter');
var ar = approuter();

ar.beforeRequestHandler.use('/browse/odata', function (req, res, next) {
    console.log("Accessing odata endpoint for app 'browse'");
    next();
});

ar.beforeRequestHandler.use('/odata', function (req, res, next) {
    console.log("Accessing odata endpoint");
    next();
});

ar.beforeRequestHandler.use('/mytest', function (req, res, next) {
    console.log("Accessing mytest");
    next();
});

ar.start();