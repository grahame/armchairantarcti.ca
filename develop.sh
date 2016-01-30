#!/bin/bash

DB=armchair
DOCKER_IMAGE="angrygoat/armchair"

: ${DOCKER_BUILD_OPTIONS:="--pull=true"}
: ${DOCKER_COMPOSE_BUILD_OPTIONS:="--pull"}

dockerbuild() {
    gittag=`git describe --abbrev=0 --tags 2> /dev/null`
    gitbranch=`git rev-parse --abbrev-ref HEAD 2> /dev/null`

    # only use tags when on master (release) branch
    if [ $gitbranch != "master" ]; then
        echo "Ignoring tags, not on master branch"
        gittag=$gitbranch
    fi

    # if no git tag, then use branch name
    if [ -z ${gittag+x} ]; then
        echo "No git tag set, using branch name"
        gittag=$gitbranch
    fi

    for tag in "${DOCKER_IMAGE}:${gittag}"; do
        echo "############################################################# ${DOCKER_IMAGE} ${tag}"
        set -x
        docker build ${DOCKER_BUILD_OPTIONS} --build-arg GIT_TAG=${gittag} -t ${tag} -f Dockerfile .
        docker push ${tag}
        set +x
    done
}

case "$1" in
dockerbuild)
    dockerbuild
    ;;
*)
    echo "unknown command \`$1'"
    ;;
esac

