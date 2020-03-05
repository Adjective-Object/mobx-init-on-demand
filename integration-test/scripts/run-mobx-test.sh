#!/usr/bin/env bash

set -e

if [[ "$REPO" == "" ]]; then
    echo "set REPO in env before running this script"
    exit 1
fi

if [[ "$HEAD" == "" ]]; then
    HEAD="master"
fi

REPODIR=`realpath \`dirname $0\`/../..`

TEMPDIR=`mktemp -d`
LINKDIR=`mktemp -d`

echo
echo "=================================="
echo " LINKING $REPODIR to $LINKDIR"
echo "=================================="
set -x

cd $REPODIR
yarn link --link-folder=$LINKDIR

set +x
echo
echo "=================================="
echo " LINKING $REPODIR to shim"
echo "=================================="
set -x

cd $REPODIR/integration-test/mobx-shim
yarn link --link-folder=$LINKDIR `basename $REPODIR`

set +x
echo
echo "=================================="
echo " LINKING MOBX SHIM IN $TEMPDIR"
echo "=================================="
set -x

cd "$REPODIR/integration-test/mobx-shim"
yarn link --link-folder=$LINKDIR

set +x
echo
echo "=================================="
echo " CLONING `basename $REPO`"
echo "=================================="
set -x

git clone $REPO $TEMPDIR
cd $TEMPDIR

set +x
echo
echo "=================================="
echo " CHECKING OUT $HEAD"
echo "=================================="
set -x

git checkout $HEAD

set +x
echo
echo "=================================="
echo " FETCHING DEPENDENCIES"
echo "=================================="
set -x

NODE_ENV="development" yarn install
yarn link --link-folder=$LINKDIR mobx

set +x
echo
echo "=================================="
echo " RUNNING REPO TESTS"
echo "=================================="
set -x

$@

set +x
rm -rf "$TEMPDIR"
rm -rf "$LINKDIR"
