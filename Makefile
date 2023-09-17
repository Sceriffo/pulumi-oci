ifneq (,$(wildcard ./.env))
    include .env
    export
endif

start:
	docker-compose up -d

up:
	pulumi up

code:
	code .

connect:
	./script/connect.sh

ansible-run:
	ansible-playbook ansible/machine_setup.yaml -u ubuntu -i ./ansible/ansible_hosts --private-key $(OCI_INSTANCES_PRIVATE_KEY_PATH)
