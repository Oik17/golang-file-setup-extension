const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

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

            // Prompt user for framework choice
            const framework = await vscode.window.showInputBox({
                prompt: 'Enter the framework (gin/echo)',
                placeHolder: 'gin or echo'
            });

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
	e.GET("/", func(c echo.Context){
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

            vscode.window.showInformationMessage(`Golang project setup with ${framework} framework completed!`);
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
