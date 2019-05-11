#!/bin/bash
# update windrunner on osx

# ------------------------------------------------------------------------------
# set the windrunner root dir
# ------------------------------------------------------------------------------
WINDRUNNER_ROOT=$PWD

# ------------------------------------------------------------------------------
# extract the zip in the update dir
# ------------------------------------------------------------------------------
unzip -o "$WINDRUNNER_ROOT/updates/*.zip" -d "$WINDRUNNER_ROOT/updates/"

# ------------------------------------------------------------------------------
# stop windrunner agent
# ------------------------------------------------------------------------------
launchctl stop windrunner.agent

# ------------------------------------------------------------------------------
# copy binaries and configs into install dir
# ------------------------------------------------------------------------------
echo "remove windrunner agent"
rm "$WINDRUNNER_ROOT/agent"
echo "backup config"
mv "$WINDRUNNER_ROOT/config.json" "$WINDRUNNER_ROOT/config.json.old"
echo "copying new files"
cp "$WINDRUNNER_ROOT/update/agent" "$WINDRUNNER_ROOT/agent"
cp "$WINDRUNNER_ROOT/update/config.json" "$WINDRUNNER_ROOT/config.json"
#merge is handled by windrunner internally

# ------------------------------------------------------------------------------
# clear out update dir
# ------------------------------------------------------------------------------
rm -rf "$WINDRUNNER_ROOT/updates/*"

# ------------------------------------------------------------------------------
#start windrunner agent
# ------------------------------------------------------------------------------
launchctl start windrunner.agent