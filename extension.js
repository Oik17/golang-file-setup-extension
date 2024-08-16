const vscode = require('vscode');
const { createMainGoFile, initializeGoModule, goModTidy , createEnv, createExampleEnv, creategitIgnore, runGo, initSQLX, createENVConfig} = require('./helpers/createGoFiles');
const {createDockerFile, createDockerComposeFile}=require('./helpers/createDockerFiles')
const {createFolders}= require('./helpers/createFolders')
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Hello World Command
    let helloWorldCommand = vscode.commands.registerCommand('golang-sqlx-file-setup.helloWorld', function () {
        vscode.window.showInformationMessage('Hello World from golang-sqlx-file-setup!');
    });

    let setupProjectCommand = vscode.commands.registerCommand('golang-sqlx-file-setup.setupProject', async function () {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            const projectPath = workspaceFolders[0].uri.fsPath;

            const moduleName = await vscode.window.showInputBox({
                prompt: 'Enter the module name (e.g., github.com/username/project)',
                placeHolder: 'Module name'
            });

            if (!moduleName) {
                vscode.window.showErrorMessage('Module name is required.');
                return;
            }

            const framework = await vscode.window.showInputBox({
                prompt: 'Enter the framework (gin/echo/fiber/chi)',
                placeHolder: 'gin/echo/fiber/chi'
            });

            if (!framework) {
                vscode.window.showErrorMessage('Framework choice is required.');
                return;
            }

			const db=await vscode.window.showInputBox({
				prompt: 'Initialise db.go using sqlx? (Y/n)',
				placeHolder: `Y/n`
			})

            createMainGoFile(projectPath, framework);
            initializeGoModule(projectPath, moduleName);
            //goModTidy(projectPath);
			createEnv(projectPath);
			createExampleEnv(projectPath);
			createDockerFile(projectPath);
			createDockerComposeFile(projectPath);
			creategitIgnore(projectPath);
			createFolders(projectPath);
			runGo(projectPath);
			if(db=='Y'|| db=='y') {
				createENVConfig(projectPath);
				initSQLX(projectPath);
			}
        } else {
            vscode.window.showErrorMessage('No workspace folder found!');
        }
    });

    context.subscriptions.push(helloWorldCommand);
    context.subscriptions.push(setupProjectCommand);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
