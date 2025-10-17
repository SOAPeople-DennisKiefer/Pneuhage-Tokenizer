# Pneuhage Tokenizer

## Overview
The Pneuhage Tokenizer is a microservice within the Pneuhage eCommerce API landscape. Every external request that reaches the eCommerce API must include an API key. The API forwards this key to the Tokenizer, which validates the credential and returns the debitor number that is authorized for the call. The API can then continue processing the request with full knowledge of the responsible debitor.

Besides runtime validation, the Tokenizer provides maintenance capabilities for API credentials. Authorized users can create, edit, and delete API keys and assign each key to exactly one debitor number. Any changes are persisted in the PostgreSQL database so that the next validation cycle reflects the latest assignments.

## Key Capabilities
- **API key validation** for every eCommerce API request, including a debitor lookup to route downstream processing.
- **Credential lifecycle management** allowing administrators to manage the pool of valid API keys and their one-to-one debitor assignments.
- **Secure PostgreSQL integration** using service bindings to keep credentials out of source control.
- **Cloud Foundry ready** multi-target application (MTA) deployment that aligns with Pneuhage delivery processes.

## Application Structure
The repository follows the standard SAP Cloud Application Programming Model (CAP) layout:

```text
├── app/                  # SAPUI5 application for maintaining API keys
├── db/                   # CDS data model and database artefacts
├── docs/                 # Generated documentation for the project
├── srv/                  # CAP service handlers (API key validation logic)
├── top/                  # Deployment assets (e.g., multitarget application setup)
├── development.env       # Local environment variable template
├── mta.yaml              # Base MTA descriptor
├── package.json          # Project metadata and NPM scripts
└── xs-security.json      # XSUAA security descriptor
```

Additional helper files (e.g. `tests.http`) are available for manual testing of the service endpoints.

## Working with the Database
Database connectivity relies on SAP BTP service bindings for PostgreSQL. DEV and QAS share a single instance that is referenced by the `tokenizer-db` resource, while PRD is wired to its own dedicated instance via the corresponding extension descriptor. No credentials are checked into the repository, which means the same code runs across all landscapes without code changes.

Local development is currently out of scope. All interaction with the Tokenizer happens in the Cloud Foundry landscapes described above.

## Deployment
All deployments start with the scripts defined in `package.json`. Use the combinations below depending on the desired outcome:

| Goal | Script sequence | Result |
| --- | --- | --- |
| **Create `ob-apikey-db` and deploy the schema for the first time** | `npm run build` → `npm run build:mta` → `cf deploy gen/mta.tar -m ob-apikey-db` | Generates the deployer module, pushes the `ob-apikey-db` application, and runs `cds-deploy` to create the initial PostgreSQL schema. |
| **Deploy the HTML5 and service applications without touching the database** | `npm run deploy:cf:app` | Packages the MTA and deploys the approuter, HTML5 content deployer, and CAP service while skipping the `ob-apikey-db` module. |
| **Deploy the full application including database and UI together** | `npm run deploy:cf:all` | Builds the project, creates the MTA archive, and deploys every module so that the latest database model and application artefacts reach the target landscape in one run. |
| **Re-run the database deployer after the app already exists** | `npm run db:deploy:cf` | Executes `cf run-task ob-apikey-db "cds-deploy"` to apply CDS model changes to PostgreSQL without re-deploying the UI or service modules. |

During each deployment, provide the correct extension descriptor (e.g., `mta.dev.mtaext`, `mta.qas.mtaext`, or `mta.prd.mtaext`) so that the `tokenizer-db` resource binds to the appropriate PostgreSQL instance.

## Relation to the Pneuhage eCommerce API
The Tokenizer acts as the trust anchor for the Pneuhage eCommerce API. The API delegates API-key validation to this service, which, in turn, manages the list of valid keys and their one-to-one mapping to debitor numbers. Upon successful validation, the Tokenizer returns the debitor number to the API so that the request can be executed in the correct business context.

## Additional Resources
- Project documentation: <https://soapeople-denniskiefer.github.io/pneuhage-tokenizer/>
- CAP documentation: <https://cap.cloud.sap>
- PostgreSQL service bindings: <https://cap.cloud.sap/docs/advanced/hybrid-testing#service-bindings>

