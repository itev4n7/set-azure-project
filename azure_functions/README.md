### How to create azure function using func fast and easy:

- `func init HttpTriggerFunction --typescript`
- `func new --name HttpTriggerFunctionApp --template "HTTP trigger" --authlevel "anonymous"`
- `npm install`

Run locally( Make sure you set variables in `local.settings.json`)

- `npm start`

### Deploy to azure function app service 
- `npm run build`
- `func azure functionapp publish <FUNCTION_APP_NAME>`

----