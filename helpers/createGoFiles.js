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
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	r := chi.NewRouter()
	log.Println("Starting server on http://localhost:3333")
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		response := map[string]string{"message": "hello world"}

		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(response)
	})

	http.ListenAndServe(":3333", r)
}
`; 
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
 */
function initSQLX(projectPath){
    let dbContent;
    dbContent=`package database

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq" // Import the PostgreSQL driver
)

type Dbinstance struct {
	Db *sqlx.DB
}

var DB Dbinstance

func Connect() {
	p := utils.Config("DB_PORT")
	port, err := strconv.Atoi(p)
	if err != nil {
		fmt.Println("Error parsing str to int")
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=require TimeZone=Asia/Shanghai", utils.Config("DB_HOST"), utils.Config("DB_USER"), utils.Config("DB_PASSWORD"), utils.Config("DB_NAME"), port)

	db, err := sqlx.Open("postgres", dsn)
	if err != nil {
		log.Fatal(err.Error())
		log.Fatal("Failed to connect to database. \\n", err)
		os.Exit(2)
	}

	if err := db.Ping(); err != nil {
		log.Fatal(err.Error())
		log.Fatal("Failed to ping the database. \\n", err)
		os.Exit(2)
	}

	log.Println("Connected")

	runMigrations(db)

	DB = Dbinstance{
		Db: db,
	}
}

func runMigrations(db *sqlx.DB) {
	_, err := db.Exec(\`
		CREATE TABLE test (test VARCHAR(255));
	\`)

	if err != nil {
		log.Fatal("Failed to run migrations. \\n", err)
		os.Exit(2)
	}

	log.Println("Migrations completed")
}`
    const internal=path.join(projectPath, 'internal');
    if(!fs.existsSync(internal)){
        fs.mkdirSync(internal)
    }

    const dbDir=path.join(internal, 'database');
    if(!fs.existsSync(dbDir)){
        fs.mkdirSync(dbDir);
    }
    const dbPath=path.join(dbDir, 'db.go');
    fs.writeFileSync(dbPath, dbContent);
    vscode.window.showInformationMessage(`db file created. Edit inside db.Exec to create respective tables. Do ctrl+s once to import utils`);
    goModTidy(projectPath);
}


/**
 * Initializes the Go module with the provided module name.
 * @param {string} projectPath - Path to the project directory.
 */
function createENVConfig(projectPath){
    let utilsContent;
    utilsContent=`package utils

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

func Config(key string) string {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Print("Error loading .env file")
	}
	return os.Getenv(key)
}
`
    const internal=path.join(projectPath, 'internal');
    if(!fs.existsSync(internal)){
        fs.mkdirSync(internal)
    }

    const utilsDir=path.join(internal, 'utils');
    if(!fs.existsSync(utilsDir)){
        fs.mkdirSync(utilsDir);
    }
    const utilsPath=path.join(utilsDir, 'envConfig.go');
    fs.writeFileSync(utilsPath, utilsContent);
    vscode.window.showInformationMessage(`utils file created.`);
    goModTidy(projectPath);
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
    runGo,
    initSQLX,
    createENVConfig
};
