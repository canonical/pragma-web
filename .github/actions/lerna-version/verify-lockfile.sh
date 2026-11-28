#!/bin/bash

# Proves that the bumped tree's bun.lock is the lockfile a clean install produces.
#
# A warm `bun install` can leave workspace-sibling ranges in bun.lock at the
# previous version: Bun resolves a workspace sibling by path, so a range whose
# sibling has just been bumped can compare equal and be left untouched. The
# install still exits 0 and reports "no changes", while the publish job installs
# the tag on a fresh checkout, where the same ranges are rewritten, and fails its
# `git diff --exit-code bun.lock` before publishing anything.
#
# The bump is uncommitted, so this recreates it in a fresh worktree with no
# node_modules, installs there, and fails if the install rewrites bun.lock. That
# is the same clean state the publish job installs in. The warm install stays in
# the working tree; this only proves its result.

set -euo pipefail

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

verify_dir=$(mktemp -d "${RUNNER_TEMP:-/tmp}/verify-lockfile.XXXXXX")
cleanup() {
  git worktree remove --force "$verify_dir" >/dev/null 2>&1 || {
    rm -rf "$verify_dir"
    git worktree prune >/dev/null 2>&1 || true
  }
}
trap cleanup EXIT

# Recreate the uncommitted bump on the same HEAD in a clean worktree. Untracked
# files are changelogs and the like; the install reads only manifests and the
# lockfile, all of which are tracked.
git worktree add --detach "$verify_dir" HEAD >/dev/null
if ! git diff --quiet HEAD; then
  git diff --binary HEAD | git -C "$verify_dir" apply -
fi

cp "$verify_dir/bun.lock" "$verify_dir/bun.lock.expected"

if ! (cd "$verify_dir" && bun install --ignore-scripts); then
  echo "::error::a clean install failed in the verification worktree"
  exit 1
fi

if ! cmp -s "$verify_dir/bun.lock.expected" "$verify_dir/bun.lock"; then
  echo "::error::bun.lock is stale after the version bump: a clean install rewrote it. The version job would tag a tree the publish job cannot install."
  diff -u "$verify_dir/bun.lock.expected" "$verify_dir/bun.lock" || true
  exit 1
fi

echo "Verified: a clean install leaves bun.lock unchanged."
