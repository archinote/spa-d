eq = $(and $(findstring x$(1),x$(2)), $(findstring x$(2),x$(1)))

APP?=spa
PROJECT=gitlab.com/dantser/frontend/spa
REGISTRY?=registry.gitlab.com/dantser/frontend

# Will pick the last version tag
RELEASE?=$(shell git describe --abbrev=0 --tags --match 'v[0-9]*' HEAD | cut -c 2-)

# Enviroment variables
APP_BASE_URL?='/'
API_BASE_URL?='/api'
APP_ASSETS_PATH?='/'

NAMESPACE?=prod

# Infrastructure: dev, stable, test ...
INFRASTRUCTURE?=stable
VALUES?=values-${INFRASTRUCTURE}

CONTAINER_IMAGE?=${REGISTRY}/${APP}
CONTAINER_TAG?=$(if $(or $(call eq,${NAMESPACE},prod),$(call eq,${NAMESPACE},staging)),${RELEASE},review-${NAMESPACE})
CONTAINER_NAME?=${APP}-frontend-${NAMESPACE}
CERT_ENV?=letsencrypt-$(if $(call eq,${NAMESPACE},prod),prod,staging)

# Repository information 
REPO_INFO=$(shell git config --get remote.origin.url)

ifndef CI_COMMIT_SHA
CI_COMMIT_SHA := git-$(shell git rev-parse HEAD)
endif

BUILDTAGS=

# -----
.PHONY: all vendor build build-image push deploy delete info

# Действие поумолчанию
all: build build-image


# Установка зависимостей
vendor:
	npm install


# Сборка
build: vendor
	@echo "+ $@"
	@APP_BASE_URL=$(APP_BASE_URL) \
		API_BASE_URL=$(API_BASE_URL) \
		APP_ASSETS_PATH=$(APP_ASSETS_PATH) \
		npm run build


# Отправка Docker image в репозиторий (со сборкой)
build-image: info
	docker build --pull -t $(CONTAINER_IMAGE):$(CONTAINER_TAG) -f ./Dockerfile ./dist

push: build-image
	@echo "+ $@"
	@docker push $(CONTAINER_IMAGE):$(CONTAINER_TAG)


# Выгрузка в kebernetes
deploy:
	sed -i -e "s/\(version:\)\(\s*\).*/\1 ${RELEASE}/" charts/Chart.yaml
	helm upgrade ${CONTAINER_NAME} \
		-f charts/${VALUES}.yaml \
		--set ingress.annotations{certmanager.k8s.io/cluster-issuer}=${CERT_ENV} \
		--set forceImageTag=${CONTAINER_TAG} \
		charts --namespace ${NAMESPACE} \
		--version=${RELEASE} -i --wait


# Удаление сервиса из kubernetes
delete:
	helm delete --purge ${CONTAINER_NAME}


# -----
.PHONY: full-deploy run


# Деплой с пересборкой
full-deploy: build push deploy
	@echo "+ $@"


# Запуск контейнера
run: build build-image
	@echo "+ $@"
	@docker run --name ${CONTAINER_NAME} -p 8080:80 \
		-e "APP_BASE_URL=$(APP_BASE_URL)" \
		-e "API_BASE_URL=$(API_BASE_URL)" \
		-e "APP_ASSETS_PATH=$(APP_ASSETS_PATH)" \
		-d $(CONTAINER_IMAGE):$(CONTAINER_TAG)
	@sleep 1
	@docker logs ${CONTAINER_NAME}

info:
	@echo "Date: $(shell date)" > "dist/info.txt"
	@echo "Repository: ${REPO_INFO}" >> "dist/info.txt"
	@echo "Commit: ${CI_COMMIT_SHA}" >> "dist/info.txt"
	@echo "Branch: $(shell git branch | grep \* | cut -d ' ' -f2)" >> "dist/info.txt"
