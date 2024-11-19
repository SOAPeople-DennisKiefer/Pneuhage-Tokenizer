var approuter = require('@sap/approuter');
var ar = approuter();

ar.beforeRequestHandler.use('/mytest', function (req, res, next) {
    console.log("Accessing mytest");
    next();
});

ar.start();