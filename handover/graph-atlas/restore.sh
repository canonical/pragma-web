#!/usr/bin/env bash
# Restores the graph atlas into a fresh container.
#   SITE  where the static site goes (default /home/user/graph-atlas, the path the scripts write to)
#   WORK  where the build and test scripts go (default /home/user/graph-atlas-work)
# The scripts were written in a session scratch directory with absolute paths; this rewrites them to WORK.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
SITE=${SITE:-/home/user/graph-atlas}
WORK=${WORK:-/home/user/graph-atlas-work}
OLD=/tmp/claude-0/-home-user/06a72397-f574-54f4-af6d-d59fdfba2a1a/scratchpad
mkdir -p "$SITE/data" "$WORK"
cp -r "$HERE/site/." "$SITE/"
cp -r "$HERE/scripts/." "$WORK/"
grep -rl "$OLD" "$WORK" | xargs -r sed -i "s#$OLD#$WORK#g"
if [ "$SITE" != /home/user/graph-atlas ]; then
  grep -rl /home/user/graph-atlas "$WORK" | xargs -r sed -i "s#/home/user/graph-atlas#$SITE#g"
fi
(cd "$WORK/extract" && bun install)
(cd "$WORK/render" && bun install && rm -rf node_modules/@canonical/*/node_modules/react node_modules/@canonical/*/node_modules/react-dom)
echo "Site in $SITE (data/ is empty: regenerate it or fetch it from the published artifact). Scripts in $WORK."
