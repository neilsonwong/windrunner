#!/bin/bash

# create installation directory
sudo mkdir -p /opt/Windrunner
sudo chown $USER:$USER /opt/Windrunner

rm -rf /opt/Windrunner/*

# create service directory
mkdir -p ~/.local/share/systemd/user

# copy executable
cp ./agent /opt/Windrunner/agent

# copy config
cp ./config.json /opt/Windrunner/config.json

# copy update script
cp ./update_linux.sh /opt/Windrunner/

#add service
cp ./windrunnerAgent.service ~/.local/share/systemd/user/

#start service
systemctl --user enable windrunnerAgent.service

#start service
systemctl --user start windrunnerAgent.service