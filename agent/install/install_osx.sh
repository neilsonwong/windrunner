#!/bin/bash
# adds agent to osx user profile startup

AGENT="$(pwd)/agent"
sudo launchctl submit -l "WindrunnerAgent" -- $AGENT 