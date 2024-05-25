ifneq (,$(wildcard ./.env))
    include .env
    export
endif

.PHONY: help start up code connect ansible-run

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^#@' [Mm]akefile | sed -E 's/^#@ ([a-zA-Z_-]+): (.*)/\x1b[34m\1\x1b[0m:\t\2/'

#@ start: Start the services using docker-compose
start:
	docker-compose up -d

#@ up: Run Pulumi to set up infrastructure
up:
	pulumi up

#@ destroy: Run Pulumi to destroy infrastructure
destroy:
	pulumi destroy

#@ code: Open the project in Visual Studio Code
code:
	code .

#@ connect: Run the connect script
connect:
	./script/connect.sh

#@ ansible-run: Run Ansible playbook to set up machines
ansible-run:
	ansible-playbook ansible/machine_setup.yaml -u ubuntu -i ./ansible/ansible_hosts --private-key $(OCI_INSTANCES_PRIVATE_KEY_PATH)
