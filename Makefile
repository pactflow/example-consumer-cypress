# Default to the read only token - the read/write token will be present on GitHub Actions.
# It's set as a secure environment variable in the .travis.yml file
PACTICIPANT := "pactflow-example-consumer-cypress"
GITHUB_WEBHOOK_UUID := "04510dc1-7f0a-4ed2-997d-114bfa86f8ad"
CYPRESSRUNCMD=npx cypress run
CYPRESSGUICMD=npx cypress open
PACT_BROKER_BASE_URL?=https://test.pactflow.io
PACT_BROKER_USERNAME?=dXfltyFMgNOFZAxr8io9wJ37iUpY42M
PACT_BROKER_PASSWORD?=O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1
REACT_APP_API_BASE_URL?=${PACT_BROKER_BASE_URL}/pacts/provider/pactflow-example-provider/consumer/pactflow-example-consumer-cypress/latest/stub
PACT_CLI="docker run --rm -v ${PWD}:${PWD} -e PACT_BROKER_BASE_URL -e PACT_BROKER_TOKEN pactfoundation/pact-cli:latest"

# Only deploy from master
ifeq ($(GIT_BRANCH),master)
	DEPLOY_TARGET=deploy
else
	DEPLOY_TARGET=no_deploy
endif

all: test

## ====================
## CI tasks
## ====================

ci: test publish_pacts can_i_deploy $(DEPLOY_TARGET)

# Run the ci target from a developer machine with the environment variables
# set as if it was on GitHub Actions.
# Use this for quick feedback when playing around with your workflows.
fake_ci: .env
	CI=true \
	GIT_COMMIT=`git rev-parse --short HEAD`+`date +%s` \
	GIT_BRANCH=`git rev-parse --abbrev-ref HEAD` \
	REACT_APP_API_BASE_URL=http://localhost:3001 \
	make ci

publish_pacts: .env
	echo "publishing pacts"
	@"${PACT_CLI}" publish ${PWD}/pacts --consumer-app-version ${GIT_COMMIT} --tag ${GIT_BRANCH}

## =====================
## Build/test tasks
## =====================

test: .env
	npm run start:and:test
	
test-gui:
	$(CYPRESSGUICMD)

mocked: .env
	( REACT_APP_API_BASE_URL=$(REACT_APP_API_BASE_URL) npm run start )

## =====================
## Deploy tasks
## =====================

deploy: deploy_app tag_as_prod record_deployment

no_deploy:
	@echo "Not deploying as not on master branch"

can_i_deploy: .env
	echo "can_i_deploy"
	@"${PACT_CLI}" broker can-i-deploy \
	  --pacticipant ${PACTICIPANT} \
	  --version ${GIT_COMMIT} \
	  --to-environment production \
	  --retry-while-unknown 0 \
	  --retry-interval 10

deploy_app:
	@echo "Deploying to prod"

tag_as_prod: .env
	@"${PACT_CLI}" broker create-version-tag --pacticipant ${PACTICIPANT} --version ${GIT_COMMIT} --tag prod

record_deployment: .env
	@"${PACT_CLI}" broker record-deployment --pacticipant ${PACTICIPANT} --version ${GIT_COMMIT} --environment production

## =====================
## PactFlow set up tasks
## =====================

# This should be called once before creating the webhook
# with the environment variable GITHUB_TOKEN set
create_github_token_secret:
	@curl -v -X POST ${PACT_BROKER_BASE_URL}/secrets \
	-H "Authorization: Bearer ${PACT_BROKER_TOKEN}" \
	-H "Content-Type: application/json" \
	-H "Accept: application/hal+json" \
	-d  "{\"name\":\"githubCommitStatusToken\",\"description\":\"Github token for updating commit statuses\",\"value\":\"${GITHUB_TOKEN}\"}"

# This webhook will update the Github commit status for this commit
# so that any PRs will get a status that shows what the status of
# the pact is.
create_or_update_github_webhook:
	@"${PACT_CLI}" \
	  broker create-or-update-webhook \
	  'https://api.github.com/repos/pactflow/example-consumer/statuses/$${pactbroker.consumerVersionNumber}' \
	  --header 'Content-Type: application/json' 'Accept: application/vnd.github.v3+json' 'Authorization: token $${user.githubCommitStatusToken}' \
	  --request POST \
	  --data @${PWD}/pactflow/github-commit-status-webhook.json \
	  --uuid ${GITHUB_WEBHOOK_UUID} \
	  --consumer ${PACTICIPANT} \
	  --contract-published \
	  --provider-verification-published \
	  --description "Github commit status webhook for ${PACTICIPANT}"

test_github_webhook:
	@curl -v -X POST ${PACT_BROKER_BASE_URL}/webhooks/${GITHUB_WEBHOOK_UUID}/execute -H "Authorization: Bearer ${PACT_BROKER_TOKEN}"

## ======================
## Misc
## ======================

.env:
	touch .env
