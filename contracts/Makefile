.DEFAULT_GOAL := help

.githooks.log:
	@git config core.hooksPath .githooks
	@git config --get core.hooksPath > $@
pre-reqs += .githooks.log

bin/contracts: $(wildcard contracts/*.sol)
	@rm -rf $@
	solc --overwrite -o bin/contracts/ --combined-json abi,bin --bin --abi --include-path node_modules/ --base-path . ./contracts/*.sol
pre-reqs += bin/contracts

node_modules: package.json
	@yarn
	@mkdir -p $@; touch $@
pre-reqs += node_modules

.PHONY: help
help:
	@grep '^[a-zA-Z]' $(MAKEFILE_LIST) | sort | awk -F ':.*?## ' 'NF==2 {printf "\033[36m  %-25s\033[0m %s\n", $$1, $$2}'

.PHONY: install
install: | $(pre-reqs) ## Install pre-requisites

.PHONY: pre-commit
pre-commit: lint-staged test | $(pre-reqs) ## Run all checks before checking in

.PHONY: lint-staged
lint-staged: | $(pre-reqs) ## Lint staged files
	yarn lint-staged

.PHONY: lint
lint: | $(pre-reqs) ## Lint all files
	yarn prettier --write .

.PHONY: test
test: | $(pre-reqs) ## Run docker-compose up eth before running this target. `JEST_OPTS="any jest options" make test` to pass jest options
	yarn jest $(JEST_FLAGS) --runInBand

.PHONY: test.watch
test.watch: | $(pre-reqs) ## Run tests in watch mode. This can also be done with `JEST_OPTS="--watch" make test`
	yarn jest --watch --runInBand

.PHONY: contracts.watch
contracts.watch: | $(pre-reqs) ## Continuously compile contracts
	yarn chokidar contracts/*.sol -c "$(MAKE) bin/contracts"