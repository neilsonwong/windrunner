'use strict';

function sleep(ms) {
	return new Promise(r => setTimeout(r,ms));
}

const isVideoRegExp = new RegExp(/(\.(avi|mkv|ogm|mp4|flv|ogg|wmv|rm|mpeg|mpg)$)/);
function isVideo(filePath) {
    return isVideoRegExp.test(filePath);
}

module.exports = {
    isVideo: isVideo,
    sleep: sleep,
}
