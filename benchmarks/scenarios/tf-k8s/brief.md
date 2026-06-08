# Scenario 4 — Terraform module: a k3d/k8s cluster + namespace

A **Terraform** module built into `scenarios/tf-k8s/` on branch `bench/tf-k8s`.

> Verify is **validate-only**: TFactory's Terraform support is partial, so the
> "test" stage runs `terraform fmt -check`, `terraform init -backend=false`, and
> `terraform validate` (+ optional `tflint`/`checkov`) rather than a generated
> behavioural suite. No real cluster is created during the benchmark.

## Goal

A self-contained, **plan-clean** Terraform module that declares a local k3d
Kubernetes cluster and a namespace — exercising the plan→code→validate loop on
infrastructure-as-code.

## Scope

- `main.tf`, `variables.tf`, `outputs.tf`, `versions.tf` under the subdir.
- Use the `k3d`/`kubernetes` providers (pinned versions in `versions.tf`).
- Declare a cluster resource and a `kubernetes_namespace`, parameterised by variables.
- Sensible defaults so `terraform validate` passes with no external credentials.

## Acceptance Criteria

- AC#1: `terraform fmt -check` reports no formatting changes needed.
- AC#2: `terraform init -backend=false` succeeds (providers resolve, versions pinned in `versions.tf`).
- AC#3: `terraform validate` passes with exit 0 and no errors.
- AC#4: All variables have descriptions and types; `cluster_name` and `namespace` are configurable with defaults.
- AC#5: `outputs.tf` exposes at least `cluster_name`, `namespace`, and the kubeconfig path/context.
- AC#6: No hard-coded secrets or absolute machine-specific paths.

## Out of scope

- Actually applying/creating a cluster, remote state backends, cloud providers.

## Notes for the pipeline

- Verify lane(s): none (validate-only); the orchestrator records `verify: validate-only`.
