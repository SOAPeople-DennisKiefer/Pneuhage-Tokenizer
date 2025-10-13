## You can find the online-documentation for the Tokenizer app here: here 📖[Tokenizer Docu](https://soapeople-denniskiefer.github.io/pneuhage-tokenizer/)



# Deploying an SAP CAP Backend with Fiori UI to SAP BTP Cloud Foundry

## Introduction
We want to deploy a SAP CAP application with its Fiori UI as a standalone application to SAP BTP.
For this, we need
- a dedicated SAP Approuter
    - with route configurations for the service and the UI app
- the deployed CAP backend service
- the Fiori UI app
    - hosted in a HTML5 Repository Service on BTP
    - An index.html as container for the UI5 app's component

## Local PostgreSQL Setup

To initialize the local PostgreSQL schema that is used during development, make sure the `@cap-js/postgres` package is installed (`npm install` from the project root) and run:

```bash
npm run db:init:local
```

The command deploys the CDS model to the PostgreSQL instance configured in `package.json` (default: `localhost:5432`, database `localdb`). Adjust the credentials there or provide them via environment variables before executing the command.

## Architecture Overview
![External image from SAP - Architecture Overview](https://user-images.githubusercontent.com/7225881/199363555-10de43ac-80c9-493f-b849-b7675b7c1df3.png)
(Source: https://github.com/SAP-samples/ui5-deployments/blob/main/README.md)

## Explanation of mta.yaml Parameters
### 1. build-result (in HTML5 Modules):

- Specifies the output directory created by the build command where the app’s static files are generated.
- In your mta.yaml, each HTML5 module (bookshopadminbooks and bookshopbrowse) has build-result: dist, meaning the dist folder will contain the built HTML5 app files (like index.html, JavaScript, and CSS).
- The deployer module (bookshop-app-deployer) references this dist directory when it packages the HTML5 app into .zip archives (admin-books.zip and browse.zip).

### 2. target-path (in the Deployer Module):

- Specifies the location within the HTML5 repository where the deployer should place each app after uploading.
- In your configuration, both admin-books.zip and browse.zip will be deployed to the apps/ directory under target-path: apps/.
- The target-path helps determine the final URL path you’ll use to access these apps within the HTML5 repository.

### 3. name (in the Deployer Module):

- This name identifies the HTML5 app in the repository and serves as a prefix in the URL for your AppRouter routes.
- In your configuration, bookshopadminbooks and bookshopbrowse are used as app identifiers, and they will appear as part of the path in AppRouter’s xs-app.json routes.

## Configuring Routes in xs-app.json
To serve each app as a standalone app with its own route, your AppRouter’s xs-app.json configuration should look like this:

**Example xs-app.json**`

For bookshopbrowse:

```json
{
  "source": "^/bookshopbrowse/(.*)$",
  "target": "/bookshopbrowse/$1",
  "service": "html5-apps-repo-rt",
  "authenticationType": "xsuaa"
}
```
For bookshopadminbooks:

```json
{
  "source": "^/bookshopadminbooks/(.*)$",
  "target": "/bookshopadminbooks/$1",
  "service": "html5-apps-repo-rt",
  "authenticationType": "xsuaa"
}
```

- source: Defines the path your users will use to access the app, e.g., /bookshopbrowse or /bookshopadminbooks. The (.*) part allows for forwarding all subsequent paths (like /index.html or /other.html).
- target: Specifies the route in the HTML5 repository. /bookshopbrowse/$1 directs requests to the bookshopbrowse app's content in the HTML5 repository.
- service: html5-apps-repo-rt is the HTML5 repository runtime service, allowing AppRouter to retrieve the app’s content.

## Deployment
A full build and deployment cycle from the MTA descriptor can be done by running the script deploy:mta from the overall project's descriptor package.json. This will deploy the AppRouter and the two frontend apps.

```bash
npm run deploy:mta
```

## Accessing the App
After deployment, the routes in xs-app.json will let users access the apps by going to URLs like:
- ```https://<your-approuter-domain>/browse/index.html```
- ```https://<your-approuter-domain>/bookshopadminbooks/index.html```

Each route points to the respective HTML5 app’s content in the HTML5 repository as configured by the name and target-path in the mta.yaml deployer module.

### Standalone App
The index.html (in the browse app) is a standalone app container that manages loading the required libs using the script from ./utils/locate-reuse-libs.js and then loads the component into the content area.

### Fiori Launchpad Sandbox
There is also a Fiori Launchpad Sandbox available. For this, open the flpsandbox.html. Configuration for the FLP is managed in the browse project's ./appconfig folder. Access to this file is enabled in a dedicated Approuter route.

Link to Launchpad: ```https://<your-approuter-domain>/browse/flpsandbox.html```

### SSH (WSL) to PosgreSQL database
bash for ssh cf: cf ssh ob-apikey-srv -L 15432:postgres-f646c894-8763-4040-979e-35e87114b71a.ce4jcviyvogb.eu-central-1.rds.amazonaws.com:8582
bash for psql: PGPASSWORD='0582bfc6e1580207b040972fb3' psql \
  "host=localhost port=15432 dbname=ezjXDyIiacts user=ab1f5e7d2bcf sslmode=require"


  // --- Lokal entwickeln ---
  "start": "cds run",
  "start:watch": "cds watch",

  // DB nur lokal aktualisieren (verbindet auf Postgres, NICHT sqlite)
  "db:deploy:local": "cds deploy --to postgres",

  // --- Cloud Foundry / BTP ---
  // Voller Deploy (inkl. Tasks; führt den DB-Deployer-Task aus -> Schema/Data in PG)
  "build": "cds build --production",
  "build:mta": "mbt build -t gen --mtar mta.tar",
  "deploy:cf:all": "npm run build && npm run build:mta && cf deploy gen/mta.tar",

  // App deployen OHNE DB anzufassen (überspringt alle im MTA definierten Tasks)
  "deploy:cf:app": "npm run build && npm run build:mta && cf deploy gen/mta.tar --skip-tasks",

  // Nur DB auf CF neu deployen (ohne App neu zu bauen/pushen)
  // Triggert den Deployer noch einmal als CF-Task; 'cds-deploy' ist dein Startkommando
  "db:deploy:cf": "cf run-task ob-apikey-db \"cds-deploy\" -k 256M -m 256M"