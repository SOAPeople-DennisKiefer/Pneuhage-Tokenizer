# Pneuhage Tokenizer

You can find the online documentation for the Tokenizer application here: [Tokenizer Docu](https://soapeople-denniskiefer.github.io/pneuhage-tokenizer/)

## Database Connectivity via Service Bindings

The application connects to PostgreSQL exclusively through [SAP BTP service bindings](https://cap.cloud.sap/docs/advanced/hybrid-testing#service-bindings). No database credentials are stored in the repository anymore.  This keeps the code base identical across **DEV**, **QAS**, and **PRD** while allowing each space to bind to the appropriate database instance.

### Cloud Foundry Setup

1. **Create (or identify) the PostgreSQL service instances**
   - DEV & QAS share a single instance, for example `tokenizer-shared-db`.
   - PRD uses its own instance, for example `tokenizer-prd-db`.
2. **Bind the instances to the MTA modules**
   - The `mta.yaml` declares the resource `orderbookapi-db` as an `existing-service`. By default it expects the instance name `tokenizer-db`.
   - To target the correct instance per space without touching the application code, provide MTA extension descriptors (one per landscape):

     ```yaml
     # mta.dev.mtaext (DEV space, shares DB with QAS)
     _schema-version: "3.1"
     ID: pneu-orderbook-apikey-dev
     extends: pneu-orderbook-apikey
     resources:
       - name: orderbookapi-db
         parameters:
           service-name: tokenizer-shared-db

     # mta.qas.mtaext (QAS space, same DB as DEV)
     _schema-version: "3.1"
     ID: pneu-orderbook-apikey-qas
     extends: pneu-orderbook-apikey
     resources:
       - name: orderbookapi-db
         parameters:
           service-name: tokenizer-shared-db

     # mta.prd.mtaext (PRD space, dedicated DB)
     _schema-version: "3.1"
     ID: pneu-orderbook-apikey-prd
     extends: pneu-orderbook-apikey
     resources:
       - name: orderbookapi-db
         parameters:
           service-name: tokenizer-prd-db
     ```

     Deploy with `cf deploy gen/mta.tar -e mta.dev.mtaext` (or `.qas`, `.prd` respectively). The extension files keep the versioned `mta.yaml` untouched while letting each space bind to the correct database instance.
3. **Deploy the MTA**

   ```bash
   npm run build
   npm run build:mta
   cf deploy gen/mta.tar -e mta.<landscape>.mtaext
   ```
   The CAP runtime now resolves the bound service from `VCAP_SERVICES` (label `postgresql-db`).

### Local Development

Local development can also use bindings without storing credentials in the repository:

1. Create a service key for the shared PostgreSQL instance (`tokenizer-shared-db` in the example above):
   ```bash
   cf create-service-key tokenizer-shared-db dev-key
   ```
2. Download the credentials once to your machine:
   ```bash
   cf service-key tokenizer-shared-db dev-key > local-service-key.json
   ```
3. Register the key with CAP (stored in `~/.cds-services.json`):
   ```bash
   cds bind -2 local-service-key.json --to db
   ```
4. Start the application locally:
   ```bash
   npm start
   ```

This workflow keeps secrets out of source control while still enabling local development.

## Deployment Scripts

Useful npm scripts remain unchanged and can be executed from the project root:

- `npm run start` – run the CAP service locally.
- `npm run start:watch` – run with live reload.
- `npm run db:deploy:local` – deploy the CDS model to the bound PostgreSQL instance.
- `npm run deploy:cf:all` – build the project, create the MTA, and deploy all modules including the database deployer task.
- `npm run deploy:cf:app` – deploy application modules without running database tasks.
- `npm run db:deploy:cf` – re-run the database deployer task in Cloud Foundry.

For more detailed functional information please consult the [Tokenizer documentation](https://soapeople-denniskiefer.github.io/pneuhage-tokenizer/).
