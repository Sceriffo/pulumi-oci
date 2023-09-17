import * as oci from "@pulumi/oci";
import { Instance } from "@pulumi/oci/core";
import * as pulumi from "@pulumi/pulumi";


async function bootstrap () {

  // configuration
  const config = new pulumi.Config();
  const compartmentId = config.requireSecret('compartmentOcid');

  console.log(config);

  const vcn = new oci.core.Vcn("vcn-pulumi", {
    displayName: "vcn-pulumi",
    cidrBlock: "10.0.0.0/16",
    compartmentId: compartmentId
  })

  const subnet = new oci.core.Subnet("public-pulumi-subnet-00", {
    displayName: "public-pulumi-subnet-00",
    vcnId: vcn.id,
    cidrBlock: "10.0.0.0/24",
    compartmentId: compartmentId
  })
  
  const instance = new oci.core.Instance("pulumi-prova", {
    compartmentId: compartmentId,
    displayName: "pulumi-prova",
    createVnicDetails: {
      subnetId: subnet.id
    },
    availabilityDomain: "AD-1",
    shape: "VM.Standard.A1.Flex",
  });
}

bootstrap();