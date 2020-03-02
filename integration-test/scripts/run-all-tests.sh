#!/usr/bin/env bash
DIR=`realpath \`dirname $0\``

set -ex

# run build and get dependencies into mobx-shim before running integration tests.
yarn build
cd "$DIR/../mobx-shim"
yarn

# Run satcheljs ignoring undo tests, because we don't do writes to satchel
# until a listener has been registered. This means the undo tests can
# never pass, because they don't register listeners before performing
# their relevant mutations.
#
# More broadly, this means that the satchel legacy undo function will never
# work with the mobx shim.
REPO="https://github.com/microsoft/satcheljs.git" \
  HEAD="208bfd75e2f47cb371b47b14f3fa1d3e0ec0eff9" \
  "$DIR/run-mobx-test.sh" \
    yarn jest --testPathIgnorePatterns "createUndo"

