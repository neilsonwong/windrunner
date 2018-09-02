#!/bin/bash
# packageAll.sh

# zips the appropriate install files and binaries

# build everything
./buildAll.sh

function setup {
	# create build folder
	rm -rf build
	mkdir build
}

function cleanup {
	cd build
	zip -r ../$1 *
	cd ..
	mv $1 packages/
	rm -rf build
}

# clear packages folder
rm -rf packages/*

#package linux 32
setup
cp bin/linux/agent build/agent
cp install/install_linux.sh build/
cp install/windrunnerAgent.service build/
cp ./config.json build/
cleanup windrunner_linux.zip

#package linux 64
setup
cp bin/linux/agent64 build/agent
cp install/install_linux.sh build/
cp install/windrunnerAgent.service build/
cp ./config.json build/
cleanup windrunner_linux_amd64.zip

#package darwin 32
setup
cp bin/darwin/agent build/agent
cp install/install_darwin.sh build/
cp install/windrunnerAgent.plist build/
cp ./config.json build/
cleanup windrunner_darwin.zip

#package darwin 64
setup
cp bin/darwin/agent64 build/agent
cp install/install_darwin.sh build/
cp install/windrunnerAgent.plist build/
cp ./config.json build/
cleanup windrunner_darwin_amd64.zip

#package windows 32
setup
cp bin/windows/agent.exe build/agent.exe
cp install/install.bat build/
cp ./config.json build/
cleanup windrunner_windows.zip

#package windows 64
setup
cp bin/windows/agent64.exe build/agent.exe
cp install/install.bat build/
cp ./config.json build/
cleanup windrunner_windows_amd64.zip