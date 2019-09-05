TODO:

<!-- get running on osx -->
<!-- split web server into own module -->

<!-- refactor command queue -->
<!-- split up models + cmd portions -->
<!-- refactor cli portions into function based services -->
<!-- hide stupid ffmpeg messages -->
<!-- figure out how to compress thumbs -->
<!-- refactor db portion -->
<!-- integrate samba monitor with leveldb -->
<!-- test the changes -->
<!-- fix background worker -->
<!-- folder structure (logs + high low level services) -->
<!-- scheduler service -->
<!-- add other routers -->
<!-- implement proper thumbnail getting -->
<!-- refactor index (init function) -->
<!-- add gzip -->
<!-- multiple thumbnails -->
<!-- fix logging levels + console use -->
<!-- ssh executor: tried it, DON'T USE, WAY TOO SLOW compared with native -->
<!-- Adhere to SRP -->
<!-- Fix circular dependencies -->
<!-- update logging to have verbose (things i want to see sometimes), debug (only during debug), trace (there just in case) -->
<!-- README - what to install (deps for linux server) -->
<!-- fix error logging -->
<!-- background worker for documenting the files -->
nice imports / barrels / root references
profiling
<!-- add linter -->
convert to ES6 modules
startup check with config / deps
add tests

thumbnail issues
<!-- thumbnail trying to generate for non videos, check that out! -->
img min not always minifying

add streaming images
add eviction if images don't load / reporting broken img links

add smb heart beat instead of long running function

cache recents, then upon rehit, reload them then dynamically change the list using streaming
priority execution

new UI


error: undefined
(node:18956) UnhandledPromiseRejectionWarning: TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. Received type undefined
    at validateString (internal/validators.js:112:11)
    at Object.basename (path.js:1157:5)
    at new File (/mnt/c/Users/Neilson/Projects/windrunner/server/src/models/File.js:12:28)
    at analyzeFromFs (/mnt/c/Users/Neilson/Projects/windrunner/server/src/services/helper/fileLibraryService.js:76:12)
(node:18956) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 48)
verbose: analyzing file data for undefined
error: there was an error analyzing the file data for undefined
TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be one of type string, Buffer, or URL. Received type undefined
    at Object.stat (internal/fs/promises.js:352:10)
    at analyzeFromFs (/mnt/c/Users/Neilson/Projects/windrunner/server/src/services/helper/fileLibraryService.js:60:26)
    at analyzeFile (/mnt/c/Users/Neilson/Projects/windrunner/server/src/services/helper/fileLibraryService.js:40:24)
    at async Object.getById (/mnt/c/Users/Neilson/Projects/windrunner/server/src/services/helper/fileLibraryService.js:18:10)
    at async Object.makeThumbnails (/mnt/c/Users/Neilson/Projects/windrunner/server/src/services/key/thumbnailService.js:8:19) {
  level: 'error',
  [Symbol(level)]: 'error'
}