# MLStocks Frontend

This directory contains the source code to the frontend of the `MLStocks` application.

## File Layout

📦frontend \
 ┣ 📂public \
 ┃ ┣ 📜electron.js \
 ┃ ┣ 📜index.html \
 ┃ ┣ 📜manifest.json \
 ┃ ┣ 📜preload.js \
 ┣ 📂src \
 ┃ ┣ 📂components \
 ┃ ┣ 📂containers \
 ┃ ┣ 📂images \
 ┃ ┣ 📂redux \
 ┃ ┃ ┣ 📂reducers \
 ┃ ┣ 📂styles \
 ┃ ┣ 📂test \
 ┃ ┣ 📂types \
 ┃ ┣ 📜App.css \
 ┃ ┣ 📜App.tsx \
 ┃ ┣ 📜index.css \
 ┃ ┣ 📜index.tsx \
 ┃ ┗ 📜supported_stocks.ts \
 ┣ 📜README.md \
 ┣ 📜package.json

- `Frontend` : root directory of project
- `public` : directory containing main electron proccess 
- `src` : directory containing react app (`app.tsx`), along with UI components, containers, and reducers

## Setting Up the Frontend

### Pre Requisites
1. Setup the backend of this application.

### Frontend Initialization
Run the following steps to set up all dependencies for the frontend

1. Download Node JS and NPM <a href="https://nodejs.org/en/download/">here</a>
2. From `Frontend` directory, run `npm install --legacy-peer-deps`
     - `--legacy-peer-deps` needs to be used due to conflicting package versions (bug)
3. From `Frontend` directory, run `yarn install --ignore-engines`
     - `--ignore-engines` needs to be used to get past `incompatible node engine` errors
4. Run `yarn add -D --ignore-engines concurrently cross-env electron electron-builder electronmon wait-on`

This should install and configure all required node packages.

## Available Scripts

From the root of the project, the following scripts are available and should be used in development.

### `yarn start-electron`

Runs the app in the development mode with electron.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.

### `yarn build`
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn electron-builder`

Uses the built react app (assumes `yarn build` has already been run), and builds electron into the app.  This generates output binaries that vary based on the platform used for building.

## Platform Specific Scripts

### `yarn electron:package:mac`
Builds the react/electron application for macOS.
**NOTE: This only works when building on a macOS, cannot build for mac on other platforms**

### `yarn electron:package:win`
Builds the react/electron application for Windows (can be built in linux as well).

### `yarn electron:package:linux`
Builds the react/electron application for Linux.


## Making Changes

Simply change as you develop and utilze the `yarn start-electron` script to preview the application as you develop.

### Developing with backend running locally

By default, the application is configured to grab data from an external server. If you setup the backend locally,
please make the following edits.

1. `App.tsx` constructor
```diff
+ const windowVal = getWindowVals(window);
+ const TOKEN = windowVal.token;
+ const ORG = windowVal.org;

- const TOKEN = "OqBpM6l039-pfImQwMyik-fVvUFwKPszSn39gfboG-infVM-dTODlMWf72eXgjM9SaT6r2gJnGQjH_glZTdIxQ==";
- const ORG = "alexkaiser";
```
This will parse in your local environment token and organization to your influx database.

2. `QueryHelper.ts` @ `const Query_API` (in `components` directory)
```diff
+ const url = 'http://localhost:8086';

- const url = 'http://mlstocks-kaiserale.pitunnel.com';
```
This will point the url the influxdb is being hosted at to your local environment.

3. When developing locally, a `.env` file needs to be created.
        - This should be located at the following directory `public/../../../`        
        - This is due to the way electron builds for production, adjust this path in `public/electron.js`

4. Template for the env file.
```
ORG="<myorg>"
API_KEY="<myApiKey>"
BUCKET="stock_data"
TOKEN="<myToken>"
```
The `ORG` variable should be filled in with the influxdb organization. \
The `API_KEY` variable should contain your finnhub API key. \
The `BUCKET` variable should contain the name of your stock data bucket in influx db. \
The `TOKEN` variable should contain the token to your influx db.

**NOTE** : This env file is created during the installation of the backend.



