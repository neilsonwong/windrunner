#!/usr/bin/env bash

for i in {1..200}; do
  echo CURLING
  curl --location --request GET 'http://localhost:9876/api/v2/details/anime%2FAmagami%20SS%2F%5BEclipse%5D%20Amagami%20SS%20-%2002%20(1280x720%20h264)%20%5B409F0F7F%5D.mkv' &
done