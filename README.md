# SAP Fioneer Download Manager

A secure, modern web application for downloading large files from Artifactory with real-time progress tracking and user-selectable save locations using XMLHttpRequest streaming and the HTML5 File System Access API.

## Features

- � **Large File Support**: Efficient streaming downloads handle files of any size without memory issues
- 📊 **Real-time Progress**: Live progress bars with MB/GB tracking during downloads
- �🔐 **Secure Authentication**: JWT token-based authentication with Artifactory
- 📁 **User-Selectable Locations**: Modern File System Access API for choosing download locations
- 🎯 **Dynamic File Paths**: Support for complex repository structures and file paths
- 🔍 **Token Validation**: Real-time token attribute checking with detailed logging
- 🌐 **Cross-Browser Support**: Fallback to traditional downloads for older browsers
- 📱 **Responsive Design**: Clean, professional UI that works on all devices
- ⚡ **Streaming Architecture**: XMLHttpRequest streaming for optimal performance
- 🛡️ **Error Recovery**: Comprehensive error handling with user-friendly messages

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Test Harness  │    │   Node.js Server │    │   Artifactory   │
│   (test.html)   │────│   (server.js)    │────│     API         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                       ┌──────────────────┐
                       │ Download Manager │
                       │ (download.html)  │
                       │  XMLHttpRequest  │
                       │    Streaming     │
                       └──────────────────┘
```

### Components

1. **Test Harness** (`test.html`): Main interface for configuring downloads
2. **Node.js Server** (`server.js`): Backend API with streaming proxy and token validation
3. **Download Manager** (`public/download.html`): Popup interface with XMLHttpRequest streaming
4. **Environment Config** (`.env`): Secure configuration for Artifactory credentials

### Streaming Architecture

- **Server**: Uses `axios` with `responseType: 'stream'` to proxy large files efficiently
- **Client**: XMLHttpRequest with `responseType: 'blob'` for streaming downloads
- **Progress**: Real-time progress events with accurate MB/GB tracking
- **Memory**: Minimal memory footprint regardless of file size

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Valid Artifactory access token
- Modern web browser (Chrome 86+, Edge 86+, or equivalent)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/sap-fioneer-download-manager.git
   cd sap-fioneer-download-manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Artifactory details
   ```

4. **Configure test harness**:
   ```bash
   cp test.html.example test.html
   # Edit test.html and add your token if needed
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

5. **Open the test harness**:
   Open the `test.html` file locally with appropriately configured token.

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
ARTIFACTORY_TOKEN=your_artifactory_token_here
ARTIFACTORY_URL=https://your-instance.jfrog.io/artifactory/
PORT=3000
```

### Artifactory Setup

1. **Generate Access Token**:
   - Log into your Artifactory instance
   - Go to User Profile → Generate Access Token
   - Set appropriate scopes (usually `applied-permissions/admin`)

2. **Repository Structure**:
   The application supports complex file paths like:
   ```
   repository-name/folder/subfolder/filename.ext
   ```

## Usage

### Basic Download Flow

1. **Launch Test Harness**: Open `http://localhost:3000/test.html`
2. **Configure Download**:
   - Enter the file path (e.g., `download/Fioneer AI Agent/REL/1.0.0/file.sar`)
   - Paste your Artifactory access token
3. **Launch Download Manager**: Click "Launch Download Manager"
4. **Download File**: Click "Download File" in the popup
5. **Choose Location**: Select where to save the file (modern browsers)

### Advanced Features

#### Token Validation
The application automatically validates tokens and logs detailed information:
- Token subject and scope
- Expiration dates
- Last used timestamps
- Permission levels

#### Error Handling
Comprehensive error messages for common issues:
- Authentication failures (401)
- Permission denied (403)
- File not found (404)
- Network connectivity issues
- Invalid file paths

#### Browser Compatibility
- **Modern browsers**: Use File System Access API for user-selectable locations
- **Older browsers**: Automatic fallback to traditional download behavior

## API Endpoints

### Server Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/download-page` | GET | Serves download manager with injected tokens |
| `/download` | GET | Proxies file downloads from Artifactory |
| `/token` | GET | Returns environment token (fallback) |
| `/token-attributes` | GET | Validates token and returns attributes |

### Request Examples

#### Download File
```bash
curl "http://localhost:3000/download?filename=path/to/file.ext&token=your_token"
```

#### Check Token Attributes
```bash
curl -H "Authorization: Bearer your_token" http://localhost:3000/token-attributes
```

## Development

### Project Structure
```
├── server.js              # Express server with API endpoints
├── test.html.example   # Test harness template (copy to test.html)
├── public/
│   └── download.html       # Download manager popup
├── package.json           # Node.js dependencies
├── .env.example           # Environment template
└── README.md              # This file
```

### Key Technologies
- **Backend**: Node.js, Express.js, Axios with streaming support
- **Frontend**: Vanilla JavaScript, XMLHttpRequest streaming, HTML5 File System Access API
- **Authentication**: JWT tokens with Artifactory integration
- **Styling**: Modern CSS with professional design
- **Streaming**: Efficient file transfer without memory constraints

### Performance Features
- **Large File Support**: Handle files of any size through streaming
- **Real-time Progress**: Live updates with accurate size tracking
- **Memory Efficient**: Minimal memory usage regardless of file size
- **Network Optimized**: Direct streaming without intermediate storage
- **Timeout Management**: Configurable timeouts for long downloads

### Code Quality Features
- Comprehensive error handling
- Detailed logging and debugging
- Clean separation of concerns
- Professional UI/UX design
- Cross-browser compatibility
- Security best practices

## Security Considerations

- ✅ **Token Security**: Tokens passed via server-side injection, not URL parameters
- ✅ **CORS Protection**: Restricted to specific allowed origins only (not wildcard *)
- ✅ **Input Validation**: File path and token validation
- ✅ **Error Handling**: Secure error messages without information leakage
- ✅ **Environment Variables**: Sensitive data in environment configuration
- ✅ **Template Files**: Sensitive files (.gitignored) with .example templates

### Security Features

#### CORS Security (v1.1.0)
- **Restricted Origins**: Only allows requests from trusted domains
- **Allowed Origins**:
  - `http://localhost:3000` (main server)
  - `http://127.0.0.1:3000` (IPv4 localhost)
  - `null` (for file:// protocol support)
- **Request Logging**: All CORS requests are logged for security monitoring
- **Automatic Blocking**: Requests from unauthorized origins are blocked

#### Authentication Security
- JWT token validation with Artifactory
- Token attributes verification
- Secure token injection (server-side)
- No token exposure in URLs

#### Input Security
- File path sanitization
- Token format validation
- SQL injection prevention
- XSS protection through proper encoding

## Browser Support

### File System Access API Support
- ✅ Chrome 86+
- ✅ Edge 86+
- ✅ Opera 72+
- ⚠️ Firefox: Fallback to traditional download
- ⚠️ Safari: Fallback to traditional download

### Fallback Behavior
For browsers without File System Access API support, the application automatically falls back to traditional download behavior where files are saved to the default Downloads folder.

## Troubleshooting

### Common Issues

#### Server Won't Start
```bash
# Check if port is in use
lsof -i :3000
# Kill existing processes
pkill -f "node server.js"
```

#### Download Fails with 404
- Verify the file path is correct
- Check repository name in the path
- Confirm file exists in Artifactory

#### Token Issues
- Check token expiration date
- Verify token has correct permissions
- Ensure token is valid for your Artifactory instance

#### CORS Errors
- Ensure you're accessing via the server (localhost:3000)
- Don't open HTML files directly in browser
- Check server CORS configuration

### Debug Mode

Enable detailed logging by checking the browser console and server terminal output. The application provides comprehensive logging for:
- Token validation results
- API request/response details
- File download progress
- Error diagnostics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review server logs for detailed error information

## Changelog

### v1.1.0 (2025-01-18)
- 🧹 **Code Cleanup**: Removed unused dependencies and cleaned up redundant code
- � **Documentation**: Enhanced inline comments and API documentation
- � **Security**: Improved token handling and removed hardcoded credentials
- 🏗️ **Architecture**: Simplified URL construction and configuration
- � **Dependencies**: Updated package.json and removed unused packages

### v1.0.0
- Initial release with streaming download support
- Real-time progress tracking with MB/GB display
- XMLHttpRequest streaming for large file handling
- File System Access API integration
- Token validation system
- Professional UI design
- Comprehensive error handling
- Cross-browser compatibility
- Memory-efficient streaming architecture
