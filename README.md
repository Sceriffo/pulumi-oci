## Description
This project serves as an illustration of provisioning infrastructure on Oracle Cloud Infrastructure (OCI) using Pulumi. It establishes a free-tier infrastructure featuring a solitary instance of `VM.Standard.E2.1.Micro`. Additionally, it includes an Ansible playbook for configuring the machine to support a Docker environment.

## Setup
- install [Pulumi](https://www.pulumi.com/docs/install/)
- install [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html#installing-and-upgrading-ansible-with-pip)

Setup the pulumi stack or env vars as specified in [Pulumi Oci Configuration](https://github.com/pulumi/pulumi-oci?tab=readme-ov-file#configuration) and in [OCI Comfiguration](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm#Required_Keys_and_OCIDs):

| Option                 | Environment Variable          | Description                                                                                      |
|------------------------|-------------------------------|--------------------------------------------------------------------------------------------------|
| `oci:tenancyOcid`      | `TF_VAR_tenancy_ocid`         | OCID of your tenancy.                                                                            |
| `oci:userOcid`         | `TF_VAR_user_ocid`            | OCID of the user calling the API.                                                                |
| `oci:privateKey`       | `TF_VAR_private_key`          | The contents of the private key file. Required if privateKeyPath is not defined and takes precedence if both are defined. |
| `oci:privateKeyPath`   | `TF_VAR_private_key_path`     | The path (including filename) of the private key stored on your computer. Required if privateKey is not defined. |
| `oci:privateKeyPassword` | `TF_VAR_private_key_password` | Passphrase used for the key, if it is encrypted.                                                  |
| `oci:fingerprint`      | `TF_VAR_fingerprint`          | Fingerprint for the key pair being used.                                                          |
| `oci:region`           | `TF_VAR_region`               | An OCI region.                                                                                   |
| `oci:configFileProfile`| `TF_VAR_config_file_profile`  | The custom profile to use instead of the DEFAULT profile in .oci/config.                          |

