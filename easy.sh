#!/bin/bash
#easy.sh

echo "easy run for easy fun"

PIDS=();
CMD=();

#start pi server
CMD1="ssh pi@192.168.0.159 -t 'source ~/.nvm/nvm.sh; cd /home/pi/Projects/windrunner/server && npm start'"

#start agent
CMD2="cd /home/rin/Projects/windrunner/agent && go run *.go"

#start ui
CMD3="cd /home/rin/Projects/windrunner/ui && npm start"

#fire everything
parallel --will-cite ::: "$CMD1" "$CMD2" "$CMD3"