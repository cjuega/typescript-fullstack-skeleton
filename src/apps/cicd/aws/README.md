# CI/CD pipeline in AWS

## Useful commands

* `yarn build`           compile typescript to js
* `yarn watch`           watch for changes and compile
* `yarn test`            perform the jest unit tests
* `yarn cdk deploy`      deploy this stack to your default AWS account/region
* `yarn cdk diff`        compare deployed stack with current state
* `yarn cdk synth`       emits the synthesized CloudFormation template

---
**NOTE**

AWS CDK commands require some mandatory _context parameters_. In particular, you must provide:

* **provider**: which source provider hosts the code (either `Bitbucket` or `GitHub`).
* **repository**: the repository and branch that triggers the pipeline. It's in the format `owner/repository#branch`.
* **services**: a list of services the CI/CD pipeline will have access to (separated by a commas). For instance `example-context,other-context`.

For instance:

```sh
yarn cdk deploy CICDStack -c provider=GitHub -c repository=cjuega/typescript-fullstack-skeleton#master -c services=example-context --parameters DockerhubUsername=<username> --parameters DockerhubPassword=<password>
```

---
