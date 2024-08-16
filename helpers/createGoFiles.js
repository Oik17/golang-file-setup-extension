const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

/**
 * Creates the main.go file based on the selected framework.
 * @param {string} projectPath - Path to the project directory.
 * @param {string} framework - Framework choice (e.g., 'gin' or 'echo').
 */
function createMainGoFile(projectPath, framework) {
    let mainGoContent;
    switch (framework) {
        case 'gin':
            mainGoContent = `package main

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
            mainGoContent = `package main

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

/**
 * Initializes the Go module with the provided module name.
 * @param {string} projectPath - Path to the project directory.
**/
function goModTidy(projectPath) {
    exec(`go mod tidy`, { cwd: projectPath }, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Error getting modules: ${stderr}`);
            return;
        }
        vscode.window.showInformationMessage(`Successfully imported all modules.`);
    });
}

/**
 * Initializes the Go module with the provided module name.
 * @param {string} projectPath - Path to the project directory.
**/
function createEnv(projectPath){
    let envContent;
    envContent=`DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=abc
DB_NAME=abc
`
const envPath=path.join(projectPath, '.env');
fs.writeFileSync(envPath, envContent);
}

/**
 * Initializes the Go module with the provided module name.
 * @param {string} projectPath - Path to the project directory.
**/
function createExampleEnv(projectPath){
    let envContent;
    envContent=`DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=abc
DB_NAME=abc
`
const envPath=path.join(projectPath, '.example.env');
fs.writeFileSync(envPath, envContent);
}

/**
 * Initializes the Go module with the provided module name.
 * @param {string} projectPath - Path to the project directory.
**/
function creategitIgnore(projectPath){
    let gitIgnoreContent;
    gitIgnoreContent=`.env
`
const gitIgnorePath=path.join(projectPath, '.gitignore');
fs.writeFileSync(gitIgnorePath, gitIgnoreContent);
}



module.exports = {
    createMainGoFile,
    initializeGoModule,
    goModTidy,
    createEnv,
    createExampleEnv,
    creategitIgnore
};
