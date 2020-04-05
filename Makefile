PACTICIPANT := "pactflow-example-consumer"
GITHUB_WEBHOOK_UUID := "04510dc1-7f0a-4ed2-997d-114bfa86f8ad"

all: test

## ====================
## CI tasks
## ====================

ci: docker_pull setup_pactflow test
	@if [ "${TRAVIS_BRANCH}" == "master" ]; then echo "Attempting to deploy" && make deploy; else echo "Not deploying as not on master branch"; fi

## =====================
## Pactflow set up tasks
## =====================

setup_pactflow: create_or_update_github_webhook

# Pulling before running just makes the output a bit cleaner
docker_pull:
	@docker pull pactfoundation/pact-cli:latest >/dev/null 2>&1

# This webhook will update the Github commit status for this commit
# so that any PRs will get a status that shows what the status of
# the pact is.
create_or_update_github_webhook:
	@docker run --rm \
	 -e PACT_BROKER_BASE_URL \
	 -e PACT_BROKER_USERNAME \
	 -e PACT_BROKER_PASSWORD \
	 -v ${PWD}:${PWD} \
	  pactfoundation/pact-cli:latest \
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

## =====================
## Build/test tasks
## =====================

test:
	npm run test:pact

## =====================
## Deploy tasks
## =====================

deploy: can_i_deploy deploy_app tag_as_prod

can_i_deploy:
	@docker run --rm \
	 -e PACT_BROKER_BASE_URL \
	 -e PACT_BROKER_USERNAME \
	 -e PACT_BROKER_PASSWORD \
	  pactfoundation/pact-cli:latest \
	  broker can-i-deploy \
	  --pacticipant ${PACTICIPANT} \
	  --version ${TRAVIS_COMMIT} \
	  --to prod \
	  --retry-while-unknown 12 \
	  --retry-interval 10

deploy_app:
	@echo "Deploying to prod"

tag_as_prod:
	@docker run --rm \
	 -e PACT_BROKER_BASE_URL \
	 -e PACT_BROKER_USERNAME \
	 -e PACT_BROKER_PASSWORD \
	  pactfoundation/pact-cli:latest \
	  broker create-version-tag \
	  --pacticipant ${PACTICIPANT} \
	  --version ${TRAVIS_COMMIT} \
	  --tag prod


## =====================
## Manual tasks
## =====================

test_github_webhook:
	@curl -v -X POST ${PACT_BROKER_BASE_URL}/webhooks/${GITHUB_WEBHOOK_UUID}/execute -u ${PACT_BROKER_USERNAME}:${PACT_BROKER_PASSWORD}

# This should be called once before creating the webhook
# with the environment variable GITHUB_TOKEN set
create_github_token_secret:
	@curl -v -X POST ${PACT_BROKER_BASE_URL}/secrets \
	-u ${PACT_BROKER_USERNAME}:${PACT_BROKER_PASSWORD} \
	-H "Content-Type: application/json" \
	-H "Accept: application/hal+json" \
	-d  "{\"name\":\"githubCommitStatusToken\",\"description\":\"Github token for updating commit statuses\",\"value\":\"${GITHUB_TOKEN}\"}"
