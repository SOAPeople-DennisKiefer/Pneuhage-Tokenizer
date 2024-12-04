var approuter = require('@sap/approuter');
var ar = approuter();

ar.beforeRequestHandler.use('/tokenizer/odata', function (req, res, next) {
    console.log("Accessing odata endpoint for app 'tokenizer'");
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