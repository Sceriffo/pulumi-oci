import * as oci from "@pulumi/oci";
import * as pulumi from "@pulumi/pulumi";
import * as command from "@pulumi/command";
import { env } from "process";

async function bootstrap() {
  // configuration
  const config = new pulumi.Config();
  const compartmentId = config.require("compartmentOcid");
  const publicKey = config.requireSecret("instancePublicKey");

  // VCN
  const vcn = new oci.core.Vcn("vcn-pulumi", {
    displayName: "vcn-pulumi",
    cidrBlock: "10.0.0.0/16",
    dnsLabel: "sceriffo",
    compartmentId: compartmentId,
  });

  // SUBNET
  const securityGroup = new oci.core.SecurityList("sg-subnet-00", {
    displayName: "sg-subnet-00",
    ingressSecurityRules: [
      {
        protocol: "6", // TCP
        tcpOptions: {
          min: 80,
          max: 80,
        },
        source: "0.0.0.0/0",
      },
      {
        protocol: "6", // TCP
        tcpOptions: {
          min: 443,
          max: 443,
        },
        source: "0.0.0.0/0",
      },
      {
        protocol: "6", // TCP
        tcpOptions: {
          min: 22,
          max: 22,
        },
        source: "0.0.0.0/0",
      },
    ],
    egressSecurityRules: [
      {
        protocol: "6", // TCP
        destination: "0.0.0.0/0",
      },
    ],
    vcnId: vcn.id,
    compartmentId: compartmentId,
  });

  const subnet = new oci.core.Subnet("public-pulumi-subnet-00", {
    displayName: "public-pulumi-subnet-00",
    vcnId: vcn.id,
    cidrBlock: "10.0.0.0/24",
    compartmentId: compartmentId,
    securityListIds: [securityGroup.id],
  });

  // IG
  const internetGatway = new oci.core.InternetGateway("internet-gatway", {
    displayName: "ig-sceriffo-pulumi",
    vcnId: vcn.id,
    compartmentId: compartmentId,
  });

  const routeToIG = new oci.core.RouteTable("rt-ig", {
    displayName: "rt-ig",
    vcnId: vcn.id,
    compartmentId: compartmentId,
    routeRules: [
      {
        destination: "0.0.0.0/0",
        destinationType: "CIDR_BLOCK",
        networkEntityId: internetGatway.id,
      },
    ],
  });

  // attach route table to subnet
  new oci.core.RouteTableAttachment("rt-ig-subnet", {
    routeTableId: routeToIG.id,
    subnetId: subnet.id,
  });

  // INSTANCE
  const ads = await oci.identity.getAvailabilityDomains({
    compartmentId: compartmentId,
  });

  const instance = new oci.core.Instance("pulumi-instance-00", {
    displayName: "pulumi-instance-0",
    compartmentId: compartmentId,
    createVnicDetails: {
      subnetId: subnet.id,
      assignPublicIp: "true",
    },
    metadata: {
      ssh_authorized_keys: pulumi.interpolate`${publicKey}`,
    },
    sourceDetails: {
      bootVolumeSizeInGbs: "50",
      sourceType: "image",
      sourceId:
        "ocid1.image.oc1.eu-milan-1.aaaaaaaa3hqr3gms4j24r5g5hovipg367g5ld7ixie727p6li34p3qndivvq",
    },
    availabilityDomain: ads.availabilityDomains[0].name,
    shape: "VM.Standard.E2.1.Micro",
  });

  // WRITE PUBLIC IP
  new command.local.Command("write public ip list", {
    create: pulumi.interpolate`echo ${instance.publicIp} > script/ip_list.txt`,
    triggers: [pulumi.interpolate`${instance.publicIp}`]
  });

  new command.local.Command("write ansible_hosts", {
    create: pulumi.interpolate`echo "[webservers]\n${instance.publicIp}" > ansible/ansible_hosts`,
    triggers: [pulumi.interpolate`${instance.publicIp}`]
  });

  // RUN ANSIBLE
  const ansible = new command.local.Command("playAnsiblePlaybookCmd", {
    create: pulumi.interpolate`ansible-playbook \
            -u ubuntu -i ansible/ansible_hosts \
            --private-key ${process.env.OCI_INSTANCES_PRIVATE_KEY_PATH} \
            ansible/machine_setup.yaml`,
    triggers: [pulumi.interpolate`${instance.publicIp}`],
  });
  ansible.stderr.apply(console.error);
  ansible.stdout.apply(console.log);

  return {
    publicIp: instance.publicIp,
  };
}

export const results = bootstrap();
