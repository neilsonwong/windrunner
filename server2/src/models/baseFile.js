class BaseFile {
    constructor(name, filePath) {
        this.type = 'BASE';
        this.filePath = filePath;
        this.name = name;
    }
}

module.exports = BaseFile;