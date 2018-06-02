# hudhomes-alerts
Lambda function that scrapes HUD listings for new homes and emails an alert. 

## Usage

```bash
# install serverless
npm i -g serverless

# invoke the function locally
serverless invoke --local -f gethudhomes -l

# deploy
serverless deploy -v
```
