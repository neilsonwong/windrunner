'use strict';

const statSync = require('fs').statSync;
const fs = require('fs').promises;
const path = require('path');
const executor = require('../utils/executor');
const fileLibraryService = require('./fileLibraryService');

const SHARE_PATH = require('../config').SHARE_PATH;

//file should be an absolute path relative to the share
async function ls(rel) {
    // get file path
    const dirPath = path.join(SHARE_PATH, rel);
    
    // synchronously check if isDir
    if (statSync(dirPath).isDirectory()) {
        // list the directory
		try {
            const fileNames = await fs.readdir(dirPath);
            // transform the listing to a files array
            return await fileLibraryService.analyzeList(fileNames
                .map(fileNameOnly => (path.join(dirPath, fileNameOnly))));
		}
		catch(e) {
            console.error(`an error occured while listing the files for ${rel}`);
			console.error(e);
		}
    }

    //no more 'ls'ing files, screw that
    return [];
}

//find files in a dir
async function find(q){
	if (q === ''){
		console.log("no query passed");
		return [];
    }
    else {
        try {
            //find all absolute file paths
            const results = await search(q);
            return await fileLibraryService.analyzeList(results.split('\n'));
        }
        catch(e){
            console.error(`an error occured while searching all files for ${rel}`);
			console.error(e);
        }
    }
}

function search(q){
	const cmd = `find ${SHARE_PATH} -iname "*${q}*"`;
	return executor.run(cmd);
}

function pinned() {
    
}

/* similar timings
async function testLs(rel) {
    console.time('node ls');
    await ls(rel);
    console.timeEnd('node ls');

    console.time('raw ls');
    await newLs(rel);
    console.timeEnd('raw ls');
}

async function newLs(rel) {
    // get file path
    const dirPath = path.join(SHARE_PATH, rel);
    try {
        //find all absolute file paths
        const cmd = `ls -d ${dirPath}/*`;
        let results = await executor.run(cmd);
        return await analyzer.analyzeList(results.split('\n'));
    }
    catch(e){
        console.error(`an error occured while searching all files for ${rel}`);
        console.error(e);
    }
}
*/

module.exports = {
	ls: ls,
	find: find,
	pinned: pinned
};
