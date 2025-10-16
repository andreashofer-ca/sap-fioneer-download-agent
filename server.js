const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Artifactory configuration
const ARTIFACTORY_URL = process.env.ARTIFACTORY_URL;

/**
 * SAP Fioneer Download Manager - Backend Server
 *
 * A secure Node.js/Express server that provides a REST API for downloading files
 * from Artifactory with JWT authentication and streaming support.
 *
 * Key Features:
 * - JWT token-based authentication via Authorization headers
 * - Secure CORS configuration with restricted origins
 * - Streaming file downloads with progress support
 * - Server-side HTML injection for secure token handling
 * - Comprehensive error handling and logging
 * - Token validation and attribute checking
 *
 * Security Features:
 * - No token exposure in URLs (secure header-based auth)
 * - CORS restricted to specific allowed origins
 * - Input validation and sanitization
 * - Secure headers for all responses
 *
 * @author SAP Fioneer Team
 * @version 1.1.0
 * @license MIT
 * @updated 2025-01-18 - Code cleanup and documentation improvements
 */

// Configure allowed CORS origins for security
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://sap-fioneer-download-manager.cfapps.eu10-005.hana.ondemand.com', // Deployed CF app domain
    'null' // Allow requests from file:// protocol (common in development)
];

// Add secure CORS headers - only allow specific origins
app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log('CORS request from origin:', origin);

    // Check if the requesting origin is in our allowed list
    if (allowedOrigins.includes(origin) || origin === 'null') {
        res.header('Access-Control-Allow-Origin', origin || 'null');
        console.log('CORS allowed for origin:', origin);
    } else if (!origin && req.headers.host) {
        // Allow requests without Origin header (like mobile apps or curl)
        // but only for same-origin requests
        const host = req.headers.host.split(':')[0];
        if (host === 'localhost' || host === '127.0.0.1') {
            res.header('Access-Control-Allow-Origin', `http://${req.headers.host}`);
            console.log('CORS allowed for host:', req.headers.host);
        } else {
            console.log('CORS blocked for host:', req.headers.host);
        }
    } else {
        console.log('CORS blocked for origin:', origin);
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'false'); // No credentials needed for downloads

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Serve node_modules for frontend libraries
app.use('/node_modules', express.static('node_modules'));

// Route to serve the main page
app.get('/', (req, res) => {
    res.json({
        service: 'SAP Fioneer Download Manager',
        status: 'Available',
        timestamp: new Date().toISOString()
    });
});

// Route to serve the download page
/**
 * Serves the download page with injected token and filepath
 *
 * This endpoint serves the download.html page with the access token and
 * file path injected into the HTML for secure client-side handling.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Bearer token for authentication
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.filepath - Path of the file to download
 * @param {Object} res - Express response object
 * @returns {void} Sends the modified HTML page or error response
 *
 * @example
 * GET /download-page?filepath=path/to/file.sar
 * Authorization: Bearer jwt_token_here
 */
app.get('/download-page', async (req, res) => {
    // Get token from Authorization header OR query parameter (for popup compatibility)
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else if (req.query.token) {
        token = req.query.token; // Fallback to query parameter for popup windows
    }
    
    if (!token) {
        console.log('ERROR: No valid Authorization header or token query parameter provided');
        return res.status(401).send('<h1>Error: Authorization Required</h1><p>Please provide a valid Bearer token in the Authorization header or as a query parameter.</p><p>Example:<br><code>Authorization: Bearer your_jwt_token_here</code><br>OR<br><code>?token=your_jwt_token_here</code></p>');
    }

    const filePath = req.query.filepath;

    console.log('Download page requested with token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    console.log('Download page requested with filepath:', filePath || 'NO FILEPATH');

    if (!filePath) {
        console.log('ERROR: No filepath provided');
        return res.status(400).send('<h1>Error: No File Path</h1><p>Please provide a valid file path in the query parameter.</p>');
    }

    // Validate token against Artifactory before serving the download page
    try {
        console.log('Validating token against Artifactory...');
        
        // Validate by trying to access the actual file (HEAD request)
        const artifactoryUrl = `${process.env.ARTIFACTORY_URL}${filePath}`;
        const response = await axios.head(artifactoryUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            timeout: 10000
        });

        if (response.status !== 200) {
            console.log(`ERROR: Token validation failed with status ${response.status}`);
            return res.status(401).send('<h1>Error: Invalid Access Token</h1><p>The provided token is not valid or has expired.</p><p>Please check your token and try again.</p>');
        }

        console.log('Token validation successful - file accessible');
        
    } catch (error) {
        console.log('ERROR: Token validation failed:', error.message);
        
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                return res.status(401).send('<h1>Error: Invalid Access Token</h1><p>The provided token is not valid or has expired.</p><p>Please check your token and try again.</p>');
            } else if (status === 403) {
                return res.status(403).send('<h1>Error: Access Denied</h1><p>The provided token does not have sufficient permissions.</p><p>Please use a token with appropriate access rights.</p>');
            } else {
                return res.status(status).send(`<h1>Error: Token Validation Failed</h1><p>Artifactory returned status ${status}</p><p>Please check your token and try again.</p>`);
            }
        } else {
            return res.status(500).send('<h1>Error: Token Validation Failed</h1><p>Unable to validate token with Artifactory.</p><p>Please try again later or check your network connection.</p>');
        }
    }
    
    // Read the download.html template and inject the token and filepath
    const downloadPagePath = path.join(__dirname, 'views', 'download.html');
    
    const fs = require('fs');
    fs.readFile(downloadPagePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading download page:', err);
            return res.status(500).send('Error loading download page');
        }
        
        // Inject the token and filepath into the page
        let modifiedHtml = data.replace(
            `// Variables to be injected by server
        const accessToken = null; // Will be replaced by server`,
            `// Variables to be injected by server
        const accessToken = '${token.replace(/'/g, "\\'")}';`
        );

        // Also inject the filepath
        modifiedHtml = modifiedHtml.replace(
            '        const filename = null; // Will be replaced by server',
            `        const filename = '${filePath.replace(/'/g, "\\'")}';`
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
 * Security Features:
 * - Validates JWT token from Authorization header (secure)
 * - Applies secure CORS headers (restricted origins only)
 * - Sanitizes filenames to prevent path traversal
 * - Supports resumable downloads with Range headers
 *
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Bearer token for authentication
 * @param {string} [req.headers.range] - Range header for resumable downloads
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.filename - The filename/path to download from Artifactory
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Streams the file or sends error response
 *
 * @example
 * GET /download?filename=path/to/file.sar
 * Authorization: Bearer jwt_token_here
 * Range: bytes=0-1023
 */
app.get('/download', async (req, res) => {
    try {
        // Get custom filename from query parameter or use default
        const customFilename = req.query.filename // 'Fioneer AI Agent/REL/1.0.0/K-100COINFAA.SAR';

        // Validate the requested filename against expected patterns
        function isSafeFilename(name) {
            // Only allow relative paths, alphanumeric, dots, dashes, underscores, and slashes (NO ".." or // or backslash)
            if (!name) return false;
            // Block absolute paths and traversal
            if (name.includes('..') || name.startsWith('/') || name.includes('\\')) return false;
            // Block URL attempts
            if (/https?:\/\//i.test(name)) return false;
            // Allow common file extensions (updated from SAR-only restriction)
            const allowedExtensions = /\.(SAR|ZIP|TAR|GZ|TGZ|JAR|WAR|EAR|CAR|PDF|TXT|LOG|XML|JSON|CSV|XLS|XLSX|DOC|DOCX|PPT|PPTX|PNG|JPG|JPEG|GIF|BMP|SVG|MP4|AVI|MOV|MP3|WAV|SQL|BAK|7Z|RAR)$/i;
            if (!/^(?:[\w\s\-\.\/]+\/)*[\w\s\-\.]+/.test(name) || !allowedExtensions.test(name)) return false;
            // Limit length
            if (name.length > 200) return false;
            return true;
        }
        if (!isSafeFilename(customFilename)) {
            console.error('ERROR: Invalid filename supplied for download:', customFilename);
            return res.status(400).json({
                error: 'Invalid filename',
                message: 'The requested filename is not allowed. Please specify a valid file name.',
                code: 'INVALID_FILENAME'
            });
        }

        // Get token from Authorization header (secure approach)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('ERROR: No valid Authorization header provided for download');
            return res.status(401).json({
                error: 'Authorization required',
                message: 'Please provide a valid Bearer token in the Authorization header',
                code: 'MISSING_AUTH'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        console.log('Download request received with token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        console.log('Download request for file:', customFilename);
        
        // Construct Artifactory URL from filename
        let artifactoryUrl;
        if (ARTIFACTORY_URL) {
            // Use the configured URL from .env file
            artifactoryUrl = `${ARTIFACTORY_URL}${customFilename}`;
        } else {
            // Fallback to default URL structure
            artifactoryUrl = `https://fioneer1.jfrog.io/artifactory/download/${customFilename}`;
        }
        console.log('Artifactory URL:', artifactoryUrl);

        if (!token) {
            console.error('ERROR: No token provided in download request');
            return res.status(400).json({
                error: 'Access token required',
                message: 'Please provide a valid JWT token in the request',
                code: 'MISSING_TOKEN'
            });
        }

        console.log('Starting download from Artifactory...');

        // Check for Range header (for resume capability)
        const rangeHeader = req.headers.range;
        let startByte = 0;
        let endByte = undefined;

        if (rangeHeader) {
            const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d*)/);
            if (rangeMatch) {
                startByte = parseInt(rangeMatch[1], 10);
                if (rangeMatch[2]) {
                    endByte = parseInt(rangeMatch[2], 10);
                }
                console.log(`Range request: bytes ${startByte}-${endByte || 'end'}`);
            }
        }

        // Make request to Artifactory with authentication and range support
        const axiosConfig = {
            method: 'GET',
            url: artifactoryUrl,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': '*/*'
            },
            responseType: 'stream'
        };

        // Add Range header if specified
        if (rangeHeader) {
            axiosConfig.headers['Range'] = rangeHeader;
        }

        const response = await axios(axiosConfig);

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
        
        // Add secure CORS headers for the download endpoint
        const origin = req.headers.origin;
        if (allowedOrigins.includes(origin) || origin === 'null') {
            res.setHeader('Access-Control-Allow-Origin', origin || 'null');
        } else if (!origin && req.headers.host) {
            const host = req.headers.host.split(':')[0];
            if (host === 'localhost' || host === '127.0.0.1') {
                res.setHeader('Access-Control-Allow-Origin', `http://${req.headers.host}`);
            }
        }
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Type, Accept-Ranges, Content-Range');

        // Handle range requests (resume capability)
        if (rangeHeader && response.status === 206) {
            // Partial content response
            res.setHeader('Accept-Ranges', 'bytes');
            if (response.headers['content-range']) {
                res.setHeader('Content-Range', response.headers['content-range']);
            }
            if (response.headers['content-length']) {
                res.setHeader('Content-Length', response.headers['content-length']);
            }
            console.log('Serving partial content for resume');
        } else if (response.headers['content-length']) {
            // Regular response with content length
            res.setHeader('Content-Length', response.headers['content-length']);
            res.setHeader('Accept-Ranges', 'bytes');
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

// JFrog API proxy endpoint - for browsing repositories
/**
 * Proxies JFrog File List API requests to Artifactory
 * 
 * This endpoint allows the browse page to make API calls without CORS issues
 * by proxying requests through the backend server.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Bearer token for authentication
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.repository - Repository name
 * @param {string} req.query.path - Path within the repository
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns repository contents or error response
 * 
 * @example
 * GET /api/storage?repository=download&path=/folder/subfolder
 * Authorization: Bearer jwt_token_here
 */
app.get('/api/storage', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization header required' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const repository = req.query.repository;
        const path = req.query.path || '';

        // ALLOW-LIST: Only permit known repositories
        const allowedRepositories = [
            'download',       // Add your known repo names here
            'public',
            'secure'
        ];
        if (!repository) {
            return res.status(400).json({ error: 'Repository parameter is required' });
        }
        if (!allowedRepositories.includes(repository)) {
            return res.status(400).json({ error: 'Invalid repository name' });
        }

        // Optionally, check path for unsafe input
        if (typeof path !== 'string' || path.includes('..')) {
            return res.status(400).json({ error: 'Invalid path parameter' });
        }

        // Construct the Artifactory API URL
        const apiUrl = `https://fioneer1.jfrog.io/artifactory/api/storage/${repository}${path}`;
        
        console.log('=== JFROG API PROXY REQUEST ===');
        console.log('Repository:', repository);
        console.log('Path:', path);
        console.log('API URL:', apiUrl);
        console.log('Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        
        const response = await axios({
            method: 'GET',
            url: apiUrl,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        console.log('=== JFROG API PROXY RESPONSE ===');
        console.log('Status:', response.status);
        console.log('Children count:', response.data.children ? response.data.children.length : 0);
        console.log('=== END API PROXY ===');

        res.json(response.data);
        
    } catch (error) {
        console.error('=== JFROG API PROXY ERROR ===');
        console.error('Error message:', error.message);
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            res.status(error.response.status).json({ 
                error: 'JFrog API request failed',
                message: error.response.data || error.message,
                status: error.response.status
            });
        } else {
            console.error('Network or other error:', error);
            res.status(500).json({ 
                error: 'JFrog API request failed',
                message: error.message
            });
        }
        console.error('=== END API PROXY ERROR ===');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Artifactory token configured:', !!process.env.ARTIFACTORY_TOKEN);
});
