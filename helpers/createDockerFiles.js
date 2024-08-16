const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');


/**
 * Initializes the Go module with the provided module name.
 * @param {string} projectPath - Path to the project directory.
**/
function createDockerFile(projectPath){
    let dockerFile;
    dockerFile=`
# Start from a more recent Go image
FROM golang:1.21-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies
RUN go mod download

# Copy the source code into the container
COPY . .

# Build the application
RUN go build -o main ./cmd/main.go

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the executable
CMD ["./main"]`
const dockerFilePath=path.join(projectPath, 'Dockerfile');
fs.writeFileSync(dockerFilePath, dockerFile);
}


/**
 * Initializes the Go module with the provided module name.
 * @param {string} projectPath - Path to the project directory.
**/
function createDockerComposeFile(projectPath){
    let dockerComposeFile;
    const DB_USER = process.env.DB_USER || 'postgres';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'your_password';
    const DB_NAME = process.env.DB_NAME || 'your_database';

    dockerComposeFile=`version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - db
    env_file:
      - .env

  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
`
const dockerFilePath=path.join(projectPath, 'docker-compose.yml');
fs.writeFileSync(dockerFilePath, dockerComposeFile);
}

module.exports = {
    createDockerFile,
    createDockerComposeFile,
};
