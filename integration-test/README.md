# integration-test

scripts for testing this observable wrapper against
a public git repo

Works by cloning the repo, linking your source tree against the [mobx-shim package](./mobx-shim) in this folder, then linking the cloned repo against the shim as `mobx`.

## Usage

In a separate terminal, run `yarn build --watch`.

define REPO and then pass a bash command to execute.

```
REPO="https://github.com/microsoft/satcheljs.git" ./integration-test/scripts/run-mobx-test.sh yarn jest --watch
```
