TEST_COMPOSE_PATH=./unit-tests-compose.yml

test:
	docker compose -f ${TEST_COMPOSE_PATH} build
	-docker compose -f ${TEST_COMPOSE_PATH} up --abort-on-container-exit
	docker compose -f ${TEST_COMPOSE_PATH} down
