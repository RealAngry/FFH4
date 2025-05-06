// Debug endpoint to help diagnose module path issues
const express = require('express');
const fs = require('fs');
const path = require('path');

// Create Express app for debugging
const app = express();

// List available directories and files
const listProjectFiles = (dir, relativePath = '') => {
  try {
    const files = fs.readdirSync(dir);
    return files.reduce((result, file) => {
      const fullPath = path.join(dir, file);
      const currentRelativePath = path.join(relativePath, file);
      
      try {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          result.directories.push(currentRelativePath);
          const subResults = listProjectFiles(fullPath, currentRelativePath);
          result.directories = [...result.directories, ...subResults.directories];
          result.files = [...result.files, ...subResults.files];
        } else {
          result.files.push(currentRelativePath);
        }
      } catch (err) {
        result.errors.push({path: currentRelativePath, error: err.message});
      }
      
      return result;
    }, {directories: [], files: [], errors: []});
  } catch (err) {
    return {
      directories: [],
      files: [],
      errors: [{path: relativePath, error: err.message}]
    };
  }
};

// Debug route to check file system and modules
app.get('/api/debug', (req, res) => {
  // Get project root directory
  const rootDir = path.resolve(__dirname, '..');
  
  // Collect debugging information
  const debugInfo = {
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
      execPath: process.execPath
    },
    paths: {
      __dirname,
      rootDir,
      moduleSearchPaths: module.paths
    },
    request: {
      path: req.path,
      originalUrl: req.originalUrl,
      host: req.get('host'),
      headers: req.headers
    },
    projectStructure: {}
  };
  
  // Try to list project files
  try {
    debugInfo.projectStructure = listProjectFiles(rootDir);
  } catch (error) {
    debugInfo.projectStructure = {
      error: error.message,
      stack: error.stack
    };
  }
  
  // Try to check for config/db.js existence
  try {
    const dbFilePath = path.join(rootDir, 'config', 'db.js');
    debugInfo.configDbFileExists = fs.existsSync(dbFilePath);
    if (debugInfo.configDbFileExists) {
      debugInfo.configDbFileContent = fs.readFileSync(dbFilePath, 'utf8').slice(0, 500) + '...';
    }
  } catch (error) {
    debugInfo.configDbFileError = error.message;
  }
  
  // Check for required modules
  try {
    const requiredModules = ['express', 'mongoose', 'dotenv', 'cors'];
    debugInfo.modules = {};
    
    for (const moduleName of requiredModules) {
      try {
        const moduleInfo = require(moduleName);
        debugInfo.modules[moduleName] = {
          loaded: true,
          version: moduleInfo.version || 'unknown'
        };
      } catch (err) {
        debugInfo.modules[moduleName] = {
          loaded: false,
          error: err.message
        };
      }
    }
  } catch (error) {
    debugInfo.modulesError = error.message;
  }
  
  res.status(200).json(debugInfo);
});

// Export the Express app
module.exports = app; 
