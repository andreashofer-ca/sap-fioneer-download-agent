const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * SAP Fioneer Download Agent
 * 
 * A secure web application for downloading files from Artifactory with:
 * - JWT token-based authentication
 * - Real-time progress tracking for large files
 * - User-selectable save locations via File System Access API
 * - Streaming downloads to handle large file sizes efficiently
 * 
 * @author SAP Fioneer Team
 * @version 1.0.0
 * @license MIT
 */

// Add CORS headers to allow requests from file:// origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Serve static files from public directory
app.use(express.static('public'));

// Serve node_modules for frontend libraries
app.use('/node_modules', express.static('node_modules'));

// Route to serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to serve the download page
/**
 * Serves the download page with injected token and filepath
 * 
 * This endpoint serves the download.html page with the access token and
 * file path injected into the HTML for secure client-side handling.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.token - JWT token for authentication
 * @param {string} req.query.filepath - Path of the file to download
 * @param {Object} res - Express response object
 * @returns {void} Sends the modified HTML page or error response
 * 
 * @example
 * GET /download-page?token=jwt_token&filepath=path/to/file.sar
 */
app.get('/download-page', (req, res) => {
    const token = req.query.token;
    const filePath = req.query.filepath;
    
    console.log('Download page requested with token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    console.log('Download page requested with filepath:', filePath || 'NO FILEPATH');
    
    if (!token) {
        console.log('ERROR: No token provided to download page');
        return res.status(400).send('<h1>Error: No access token provided</h1><p>Please launch from the test harness with a valid token.</p>');
    }
    
    if (!filePath) {
        console.log('ERROR: No filepath provided to download page');
        return res.status(400).send('<h1>Error: No file path provided</h1><p>Please launch from the test harness with a valid file path.</p>');
    }
    
    // Read the download.html template and inject the token and filepath
    const fs = require('fs');
    const downloadPagePath = path.join(__dirname, 'public', 'download.html');
    
    fs.readFile(downloadPagePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading download page:', err);
            return res.status(500).send('Error loading download page');
        }
        
        // Inject the token and filepath into the page
        let modifiedHtml = data.replace(
            'const accessToken = urlParams.get(\'token\');',
            `const accessToken = '${token.replace(/'/g, "\\'")}';`
        );
        
        // Also inject the filepath
        modifiedHtml = modifiedHtml.replace(
            'const filename = \'Fioneer AI Agent/REL/1.0.0/K-100COINFAA.SAR\';',
            `const filename = '${filePath.replace(/'/g, "\\'")}';`
        );
        
        console.log('Token and filepath injected into download page successfully');
        
        res.setHeader('Content-Type', 'text/html');
        res.send(modifiedHtml);
    });
});

// Download endpoint
/**
 * Downloads a file from Artifactory and streams it to the client
 * 
 * This endpoint proxies file downloads from Artifactory with proper authentication
 * and streams the response to handle large files efficiently without loading
 * them entirely into memory.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.filename - The filename/path to download from Artifactory
 * @param {string} req.query.token - JWT token for Artifactory authentication
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Streams the file or sends error response
 * 
 * @example
 * GET /download?filename=path/to/file.sar&token=jwt_token_here
 */
app.get('/download', async (req, res) => {
    try {
        // Get custom filename from query parameter or use default
        const customFilename = req.query.filename || 'Fioneer AI Agent/REL/1.0.0/K-100COINFAA.SAR';
        
        // Construct Artifactory URL with the custom filename
        const artifactoryUrl = `${process.env.ARTIFACTORY_URL}download/${customFilename}`;
        
        // Use ONLY the custom token from query parameter - no fallback to environment
        const token = req.query.token;

        console.log('Download request received with token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        console.log('Download request for file:', customFilename);
        console.log('Artifactory URL:', artifactoryUrl);

        if (!token) {
            console.log('ERROR: No token provided in download request');
            return res.status(400).json({ error: 'Access token must be provided in request' });
        }

        console.log('Starting download from Artifactory...');
        console.log('Using custom token from request');

        // Make request to Artifactory with authentication
        const response = await axios({
            method: 'GET',
            url: artifactoryUrl,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': '*/*'
            },
            responseType: 'stream'
        });

        // Extract just the filename from the path for download headers
        const pathParts = customFilename.split('/');
        const actualFilename = pathParts[pathParts.length - 1];
        const sanitizedFilename = actualFilename.replace(/[<>:"/\\|?*]/g, '_');
        
        console.log('Using filename:', sanitizedFilename);

        // Set proper headers for file download BEFORE piping
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(sanitizedFilename)}; filename="${sanitizedFilename}"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        // Add CORS headers for the download endpoint too
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Type');

        // If Artifactory provides content-length, forward it
        if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
        }

        console.log('Streaming file to client...');

        // Pipe the response stream to the client
        response.data.pipe(res);

        // Handle stream errors
        response.data.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Download failed' });
            }
        });

        // Log when download completes
        response.data.on('end', () => {
            console.log('Download completed successfully');
        });

    } catch (error) {
        console.error('Download error:', error.message);
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }

        if (!res.headersSent) {
            if (error.response && error.response.status === 401) {
                res.status(401).json({ 
                    error: 'Authentication failed', 
                    message: 'The access token is invalid or expired. Please check your token and try again.',
                    code: 'INVALID_TOKEN'
                });
            } else if (error.response && error.response.status === 403) {
                res.status(403).json({ 
                    error: 'Access denied', 
                    message: 'Your token does not have permission to access this file.',
                    code: 'ACCESS_DENIED'
                });
            } else if (error.response && error.response.status === 404) {
                res.status(404).json({ 
                    error: 'File not found', 
                    message: 'The requested file was not found in Artifactory.',
                    code: 'FILE_NOT_FOUND'
                });
            } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                res.status(503).json({ 
                    error: 'Service unavailable', 
                    message: 'Unable to connect to Artifactory. Please check your network connection.',
                    code: 'CONNECTION_ERROR'
                });
            } else {
                res.status(500).json({ 
                    error: 'Download failed', 
                    message: 'An unexpected error occurred while downloading the file. Please try again.',
                    code: 'UNKNOWN_ERROR'
                });
            }
        }
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Token endpoint - provides the .env token for initial loading
app.get('/token', (req, res) => {
    const token = process.env.ARTIFACTORY_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'No token configured in .env file' });
    }
    res.json({ token: token });
});

// Token attributes endpoint - proxy to Artifactory tokens API
/**
 * Proxies token attributes request to Artifactory
 * 
 * This endpoint forwards token validation and attribute requests to Artifactory's
 * token API, allowing the client to verify token validity and permissions.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Bearer token for authentication
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns token attributes or error response
 * 
 * @example
 * GET /token-attributes
 * Authorization: Bearer jwt_token_here
 */
app.get('/token-attributes', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({ error: 'Authorization header required' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        console.log('=== TOKEN ATTRIBUTES REQUEST ===');
        console.log('Fetching token attributes from Artifactory...');
        
        const response = await axios({
            method: 'GET',
            url: 'https://fioneer1.jfrog.io/access/api/v1/tokens',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        console.log('=== TOKEN ATTRIBUTES RESPONSE ===');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.length > 0) {
            console.log('=== TOKEN DETAILS ===');
            response.data.forEach((tokenInfo, index) => {
                console.log(`Token ${index + 1}:`);
                console.log(`  Subject: ${tokenInfo.subject || 'N/A'}`);
                console.log(`  Scope: ${tokenInfo.scope || 'N/A'}`);
                console.log(`  Issued: ${tokenInfo.issued_at ? new Date(tokenInfo.issued_at * 1000).toLocaleString() : 'N/A'}`);
                console.log(`  Expires: ${tokenInfo.expires_in ? new Date((tokenInfo.issued_at + tokenInfo.expires_in) * 1000).toLocaleString() : 'N/A'}`);
                console.log(`  Token ID: ${tokenInfo.token_id || 'N/A'}`);
                console.log('---');
            });
        }
        console.log('=== END TOKEN ATTRIBUTES ===');

        res.json(response.data);
        
    } catch (error) {
        console.error('=== TOKEN ATTRIBUTES ERROR ===');
        console.error('Error message:', error.message);
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            res.status(error.response.status).json({ 
                error: 'Token attributes request failed',
                message: error.response.data || error.message,
                status: error.response.status
            });
        } else {
            console.error('Network or other error:', error);
            res.status(500).json({ 
                error: 'Token attributes request failed',
                message: error.message
            });
        }
        console.error('=== END TOKEN ATTRIBUTES ERROR ===');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Artifactory token configured:', !!process.env.ARTIFACTORY_TOKEN);
});
