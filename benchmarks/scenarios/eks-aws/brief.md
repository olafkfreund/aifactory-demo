# Scenario — Terraform module: an EKS cluster on AWS

A self-contained **Terraform** module built into `scenarios/eks-aws/` on branch
`bench/eks-aws`, verified with `terraform validate` + `terraform fmt -check`
(no apply — no real AWS resources are created).

## Goal

A reusable Terraform module that provisions a minimal Amazon **EKS** cluster
with a managed node group, to baseline plan/code/verify on infrastructure-as-code
targeting a real cloud (AWS). This is the IaC counterpart to the in-cluster
k3d/k8s scenario.

## Scope

- A `terraform/` module under the subdir: `main.tf`, `variables.tf`,
  `outputs.tf`, `versions.tf`.
- An `aws` provider (region from a variable) and the EKS cluster + one managed
  node group (instance type + desired/min/max size as variables).
- Sensible variables: `cluster_name`, `kubernetes_version`, `region`,
  `vpc_subnet_ids`, `node_instance_type`, `node_desired_size`.
- Outputs: `cluster_name`, `cluster_endpoint`, `cluster_oidc_issuer_url`,
  `node_group_arn`.
- Pinned `required_providers` (aws ~> 5.x) and `required_version` (>= 1.5).

## Acceptance Criteria

- AC#1: `terraform init -backend=false` succeeds (providers resolve).
- AC#2: `terraform validate` passes (the configuration is internally consistent).
- AC#3: `terraform fmt -check -recursive` reports no formatting diffs.
- AC#4: The module declares an `aws_eks_cluster` and an `aws_eks_node_group`
  wired to it (node group references the cluster name).
- AC#5: All six variables above exist with types and descriptions; the four
  outputs above are exported.
- AC#6: No hard-coded account IDs, secrets, or regions — everything
  parameterised via variables.

## Out of scope

- `terraform apply` / real AWS resources, IAM role bootstrapping beyond what the
  cluster/node group strictly need, add-ons (CNI/CSI), and remote state backends.

## Notes for the pipeline

- Verify level: `validate-only` (terraform validate + fmt; no behavioural suite).
- `terraform` lane only; no unit/api/browser lanes.
