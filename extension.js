const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Hello World Command
    let helloWorldCommand = vscode.commands.registerCommand('golang-sqlx-file-setup.helloWorld', function () {
        vscode.window.showInformationMessage('Hello World from golang-sqlx-file-setup!');
    });

    // Setup Project Command
    let setupProjectCommand = vscode.commands.registerCommand('golang-sqlx-file-setup.setupProject', async function () {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            const projectPath = workspaceFolders[0].uri.fsPath;

            // Prompt user for module name
            const moduleName = await vscode.window.showInputBox({
                prompt: 'Enter the module name (e.g., github.com/username/project)',
                placeHolder: 'Module name'
            });

            if (!moduleName) {
                vscode.window.showErrorMessage('Module name is required.');
                return;
            }

            // Prompt user for framework choice
            const framework = await vscode.window.showInputBox({
                prompt: 'Enter the framework (gin/echo)',
                placeHolder: 'gin or echo'
            });

            if (!framework) {
                vscode.window.showErrorMessage('Framework choice is required.');
                return;
            }

            // Call separate functions to handle tasks
            createMainGoFile(projectPath, framework);
            initializeGoModule(projectPath, moduleName);
        } else {
            vscode.window.showErrorMessage('No workspace folder found!');
        }
    });

    context.subscriptions.push(helloWorldCommand);
    context.subscriptions.push(setupProjectCommand);
}

/**
 * Creates the main.go file based on the selected framework.
 * @param {string} projectPath - Path to the project directory.
 * @param {string} framework - Framework choice (e.g., 'gin' or 'echo').
 */
function createMainGoFile(projectPath, framework) {
    let mainGoContent;
    switch (framework) {
        case 'gin':
            mainGoContent = `
package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello, Gin!",
		})
	})
	r.Run(":8080")
}
            `;
            break;
        case 'echo':
            mainGoContent = `
package main

import (
	"github.com/labstack/echo/v4"
	"net/http"
)

func main() {
	e := echo.New()
	e.GET("/", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"message": "Hello, Echo!"})
	})
	e.Start(":8080")
}
            `;
            break;
        default:
            vscode.window.showErrorMessage('Unsupported framework. Please enter "gin" or "echo".');
            return;
    }

    // Create the main.go file
    const mainGoPath = path.join(projectPath, 'main.go');
    fs.writeFileSync(mainGoPath, mainGoContent);

    vscode.window.showInformationMessage(`main.go file created with ${framework} framework.`);
}

/**
 * Initializes the Go module with the provided module name.
 * @param {string} projectPath - Path to the project directory.
 * @param {string} moduleName - Module name for the Go module.
 */
function initializeGoModule(projectPath, moduleName) {
    exec(`go mod init ${moduleName}`, { cwd: projectPath }, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Error initializing Go module: ${stderr}`);
            return;
        }
        vscode.window.showInformationMessage(`Go module initialized with name ${moduleName}.`);
    });
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
