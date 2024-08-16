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
        
        case 'fiber':
            mainGoContent=`package main

import (
    "log"
    
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
    app := fiber.New()

    app.Use(cors.New())

    app.Get("/", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{
            "message": "Hello World",
        })
    })

    log.Fatal(app.Listen(":3000"))
}`;
        break;
        case 'chi':
            mainGoContent=`package main

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	r := chi.NewRouter()
    log.Println("Starting server on :3333")
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hello world"))
	})

	http.ListenAndServe(":3333", r)
}`; 
        break;
        default:
            vscode.window.showErrorMessage('Unsupported framework. Please enter "gin", "echo", "fiber" or "chi"');
            return;
    }

    const internalDir = path.join(projectPath, 'cmd');
    if (!fs.existsSync(internalDir)) {
        fs.mkdirSync(internalDir);
    }

    const mainGoPath = path.join(internalDir, 'main.go');
    fs.writeFileSync(mainGoPath, mainGoContent);

    vscode.window.showInformationMessage(`main.go file created inside 'cmd' directory with ${framework} framework.`);
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


/**
 * Runs `go mod tidy` and then `go run cmd/main.go`.
 * @param {string} projectPath - Path to the project directory.
 */
async function runGo(projectPath) {
    try {
        // Run go mod tidy using exec
        await runCommand(`go mod tidy`, projectPath);
        vscode.window.showInformationMessage('Successfully imported all modules.');

        // Run go run cmd/main.go using VSCode terminal
        const terminal = vscode.window.createTerminal({ name: "Go Run" });
        terminal.show();
        terminal.sendText(`cd "${projectPath}"`);
        terminal.sendText(`go run cmd/main.go`);

        vscode.window.showInformationMessage('Program is running.');
    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
}

/**
 * Executes a shell command in a given directory.
 * @param {string} command - The command to run.
 * @param {string} cwd - The directory to run the command in.
 * @returns {Promise<void>} - A promise that resolves when the command completes.
 */
function runCommand(command, cwd) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(stderr || error.message));
                return;
            }
            resolve(); 
        });
    });
}

module.exports = {
    createMainGoFile,
    initializeGoModule,
    goModTidy,
    createEnv,
    createExampleEnv,
    creategitIgnore,
    runGo
};
