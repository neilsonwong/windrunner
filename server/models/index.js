'use strict';

const File = require('./File');
const Folder = require('./Folder');
const LockedFile = require('./LockedFile');
const Video = require('./Video');
const Command = require('./Command');

module.exports = {
	File: File,
	Folder: Folder,
	LockedFile: LockedFile,
	Video: Video,
	Command: Command
};
