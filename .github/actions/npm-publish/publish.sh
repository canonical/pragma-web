#!/bin/bash

# Publishes the public packages of the checked-out release tag to npm.
# INPUTS:
# $1: version (required) - The released version number, without tag prefix.
#
# `from-package` publishes exactly the public packages whose manifest version
# the registry does not have yet. So recovery from a partial publish is to
# re-run this step: it publishes only what is missing, and a re-run after a
# full publish is a no-op. tag.yml exposes that re-run as its
# `publish_version` input.
#
# Pre-releases go to a dist-tag named after their pre-release identifier
# (e.g. 0.30.0-experimental.1 -> "experimental") so they never take over
# npm's `latest`; stable releases go to `latest`.
#
# Lerna is the repository's own, resolved from node_modules by bunx. A bare
# `lerna` only ever worked through a global the runner image preinstalled in
# its Node toolcache; ubuntu-26.04 and fresh Node downloads have none (the v0.45.0
# core and v0.46.0 web publish failures, 2026-11-13).

set -euo pipefail

VERSION="${1:-}"

if [[ -z "$VERSION" ]]; then
  echo "Error: version argument is empty; refusing to publish."
  exit 1
fi

if [[ "${GITHUB_REF:-}" != "refs/heads/main" ]]; then
  echo "Error: publishing runs from main only (got '${GITHUB_REF:-unset}')."
  exit 1
fi

if [[ "$VERSION" == *-* ]]; then
  PRERELEASE="${VERSION#*-}"
  DIST_TAG="${PRERELEASE%%.*}"
else
  DIST_TAG="latest"
fi

echo "Publishing $VERSION to dist-tag '$DIST_TAG'"
bunx lerna publish --yes --no-private --dist-tag "$DIST_TAG" from-package
