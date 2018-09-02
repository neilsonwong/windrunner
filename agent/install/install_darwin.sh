#!/bin/bash
# adds agent to osx user profile startup

# AGENT="$(pwd)/../bin/agent_osx"
# uninstall old one first
# sudo launchctl remove "WindrunnerAgent"
# sudo launchctl submit -l "WindrunnerAgent" -- $AGENT 

# ^^^ is old one, plist should be easier to use
# we want a launchagent

# create installation directory
sudo mkdir -p /opt/Windrunner

#all users part of staff and not themselves :O
sudo chown $USER:staff /opt/Windrunner

rm -rf /opt/Windrunner/*

# copy binaries and configs into install dir
cp ./agent /opt/Windrunner/
cp ./config.json /opt/Windrunner/

# copy into launchAgents
# use cp command as bash one might be aliased to not replace existing plist
/bin/cp -rf ./windrunnerAgent.plist ~/Library/LaunchAgents/windrunnerAgent.plist

#fix file permission
chmod 644 ~/Library/LaunchAgents/windrunnerAgent.plist