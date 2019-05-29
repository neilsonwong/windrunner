#!/bin/bash
# update windrunner on osx

# ------------------------------------------------------------------------------
# set the windrunner root dir
# ------------------------------------------------------------------------------
WINDRUNNER_ROOT=$PWD

# ------------------------------------------------------------------------------
# set the update logging
# ------------------------------------------------------------------------------
LOGFILE=$WINDRUNNER_ROOT/update.log
echo "starting to update" >> $LOGFILE

# ------------------------------------------------------------------------------
# extract the zip in the update dir
# ------------------------------------------------------------------------------
echo "extracting windrunner update $WINDRUNNER_ROOT" >> $LOGFILE
unzip -o "$WINDRUNNER_ROOT/updates/*.zip" -d "$WINDRUNNER_ROOT/updates/"

# ------------------------------------------------------------------------------
# stop windrunner agent
# ------------------------------------------------------------------------------
echo "stopping windunnner service" >> $LOGFILE
launchctl stop windrunner.agent

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
echo "clearing directory $WINDRUNNER_ROOT" >> $LOGFILE
rm -rf $WINDRUNNER_ROOT/updates/*

# ------------------------------------------------------------------------------
#start windrunner agent
# ------------------------------------------------------------------------------
echo "restarting windunnner service" >> $LOGFILE
launchctl start windrunner.agent



