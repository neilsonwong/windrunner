#!/bin/bash

# create installation directory
sudo mkdir /opt/Windrunner
sudo chown $USER:$USER /opt/Windrunner

rm -rf /opt/Windrunner/*

# create service directory
mkdir -p ~/.local/share/systemd/user

# copy executable
cp ../bin/agent_linux /opt/Windrunner/agent

# copy config
cp ../config.json /opt/Windrunner/config.json

#add service
cp windrunnerAgent.service ~/.local/share/systemd/user/

#start service
systemctl --user enable windrunnerAgent.service

#start service
systemctl --user start windrunnerAgent.service