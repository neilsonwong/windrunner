#!/bin/bash
# update windrunner on linux

# ------------------------------------------------------------------------------
# set the windrunner root dir
# ------------------------------------------------------------------------------
WINDRUNNER_ROOT=$PWD

# ------------------------------------------------------------------------------
# extract the zip in the update dir
# ------------------------------------------------------------------------------
unzip "$WINDRUNNER_ROOT/updates/*.zip"

# ------------------------------------------------------------------------------
# stop windrunner agent
# ------------------------------------------------------------------------------
systemctl --user stop windrunnerAgent.service

# ------------------------------------------------------------------------------
# copy binaries and configs into install dir
# ------------------------------------------------------------------------------
echo "remove windrunner agent"
rm "$WINDRUNNER_ROOT/agent"
echo "backup config"
mv "$WINDRUNNER_ROOT/config.json" "$WINDRUNNER_ROOT/config.json.old"
echo "copying new files"
cp "$WINDRUNNER_ROOT/updates/agent" "$WINDRUNNER_ROOT/agent"
cp "$WINDRUNNER_ROOT/updates/config.json" "$WINDRUNNER_ROOT/config.json"
#merge is handled by windrunner internally

# ------------------------------------------------------------------------------
# clear out update dir
# ------------------------------------------------------------------------------
rm -rf "$WINDRUNNER_ROOT/updates/*"

# ------------------------------------------------------------------------------
#start windrunner agent
# ------------------------------------------------------------------------------
systemctl --user start windrunnerAgent.service