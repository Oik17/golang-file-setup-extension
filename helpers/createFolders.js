const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

/**
 * Initializes the Go module with the provided module name.
 * @param {string} projectPath - Path to the project directory.
**/
function createFolders(projectPath){
    const internalDir = path.join(projectPath, 'internal');
    if (!fs.existsSync(internalDir)) {
        fs.mkdirSync(internalDir);
    }
    const databaseDir=path.join(internalDir, `database`);
    if(!fs.existsSync(databaseDir)){
        fs.mkdirSync(databaseDir);
    }
    const utilsDir=path.join(internalDir, `utils`);
    if(!fs.existsSync(utilsDir)){
        fs.mkdirSync(utilsDir);
    }
    const servicesDir=path.join(internalDir, `services`);
    if(!fs.existsSync(servicesDir)){
        fs.mkdirSync(servicesDir);
    }
    const modelsDir=path.join(internalDir, `models`);
    if(!fs.existsSync(modelsDir)){
        fs.mkdirSync(modelsDir);
    }
    const middlewareDir=path.join(internalDir, `middleware`);
    if(!fs.existsSync(middlewareDir)){
        fs.mkdirSync(middlewareDir);
    }
    
    const controllersDir=path.join(internalDir, `controllers`);
    if(!fs.existsSync(controllersDir)){
        fs.mkdirSync(controllersDir);
    }

}

module.exports = {
    createFolders
};

