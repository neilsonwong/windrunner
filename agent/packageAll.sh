#!/bin/bash
# packageAll.sh

# zips the appropriate install files and binaries

VERSION="1.1.1"

# build everything
./buildAll.sh

function setup {
	# create build folder
	rm -rf build
	mkdir build
	mkdir -p packages
}

function cleanup {
	cd build
	zip -r ../$1 *
	cd ..
	mv $1 packages/
	rm -rf build
}

function package {
	echo "packaging $1 $2"

	OS=$1
	ARCH=$2
	EXT="sh"
	EXE=""

	if [ $OS = "windows" ]; then
		EXT="bat"
		EXE=".exe"
	fi

	setup
	cp "bin/$OS/agent$EXE" "build/agent$EXE"
	cp "install/install_$OS.$EXT" "build/"
	cp "install/update_$OS.$EXT" "build/"
	cp "./config.json" "build/"

	# linux and osx use true services, so copy the files
	if [ $OS = "linux" ]; then
		cp "install/windrunnerAgent.service" "build/"
	fi

	if [ $OS = "darwin" ]; then
		cp "install/windrunnerAgent.plist" "build/"
	fi

	cleanup "windrunner$VERSION"_"$OS-$ARCH.zip"
}

# clear packages folder
rm -rf packages/*

for OSTYPE in "linux" "windows" "darwin"
do
	for ARCHITECTURE in "386" "amd64"
	do
		package $OSTYPE $ARCHITECTURE
	done
done
