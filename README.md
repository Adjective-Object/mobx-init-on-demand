# mobx-init-on-demand

[npm](https://www.npmjs.com/package/mobx-init-on-demand), [github](https://github.com/Adjective-Object/mobx-init-on-demand)

Initialize large mobx objects on read, instead of on creation. For extremely large objects, this defers the performance cost of wrapping objects in mobx containers until they are actually needed.

## Usage

`yarn add mobx-init-on-demand`

```js
import { observableOnDemand } from 'mobx-init-on-demand';

const myObservable = observableOnDemand({
    ... // your large object here
})

// use the observable as normal
autorun(() => {
  console.log(myObservable.some.deep.nested.prop)
})
```

## Development

```sh
yarn # install dependencies
yarn build # build.             Can also use `rollup -c`
yarn watch # build with watch.  Can also use `rollup -cw`
yarn test # run all tests
yarn jest # run local tests
yarn test:integration # run open-source repo tests
```

run an integration test against an open-source repo. see [`./integration-test`](./integration-test/README.md) for more details.

```sh
REPO="https://github.com/microsoft/satcheljs.git" ./integration-test/scripts/run-mobx-test.sh yarn jest

# or for testing failing tests

REPO="https://github.com/microsoft/satcheljs.git" ./integration-test/scripts/run-mobx-test.sh yarn jest --watch

```
