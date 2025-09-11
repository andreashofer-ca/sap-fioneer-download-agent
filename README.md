# SAP Fioneer Download Agent

A secure, modern web application for downloading files from Artifactory with user-selectable save locations using the HTML5 File System Access API.

## Features

- 🔐 **Secure Authentication**: JWT token-based authentication with Artifactory
- 📁 **User-Selectable Locations**: Modern File System Access API for choosing download locations
- 🎯 **Dynamic File Paths**: Support for complex repository structures and file paths
- 🔍 **Token Validation**: Real-time token attribute checking with detailed logging
- 🌐 **Cross-Browser Support**: Fallback to traditional downloads for older browsers
- 📱 **Responsive Design**: Clean, professional UI that works on all devices
- 🚀 **Professional Architecture**: Clean separation between test harness and download agent

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Test Harness  │    │   Node.js Server │    │   Artifactory   │
│  (filelist.html)│────│   (server.js)    │────│     API         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                       ┌──────────────────┐
                       │  Download Agent  │
                       │ (download.html)  │
                       └──────────────────┘
```

### Components

1. **Test Harness** (`filelist.html`): Main interface for configuring downloads
2. **Node.js Server** (`server.js`): Backend API with CORS handling and token validation
3. **Download Agent** (`public/download.html`): Popup interface for file downloads
4. **Environment Config** (`.env`): Secure configuration for Artifactory credentials

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Valid Artifactory access token
- Modern web browser (Chrome 86+, Edge 86+, or equivalent)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/sap-fioneer-download-agent.git
   cd sap-fioneer-download-agent
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

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Open the application**:
   ```
   http://localhost:3000/filelist.html
   ```

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

1. **Launch Test Harness**: Open `http://localhost:3000/filelist.html`
2. **Configure Download**:
   - Enter the file path (e.g., `download/Fioneer AI Agent/REL/1.0.0/file.sar`)
   - Paste your Artifactory access token
3. **Launch Download Agent**: Click "Launch Download Agent"
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
| `/download-page` | GET | Serves download agent with injected tokens |
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
├── filelist.html          # Test harness interface
├── public/
│   └── download.html       # Download agent popup
├── package.json           # Node.js dependencies
├── .env                   # Environment configuration
└── README.md              # This file
```

### Key Technologies
- **Backend**: Node.js, Express.js, Axios
- **Frontend**: Vanilla JavaScript, HTML5 File System Access API
- **Authentication**: JWT tokens
- **Styling**: Modern CSS with professional design

### Code Quality Features
- Comprehensive error handling
- Detailed logging and debugging
- Clean separation of concerns
- Professional UI/UX design
- Cross-browser compatibility
- Security best practices

## Security Considerations

- ✅ **Token Security**: Tokens passed via server-side injection, not URL parameters
- ✅ **CORS Protection**: Proper CORS configuration for cross-origin requests
- ✅ **Input Validation**: File path and token validation
- ✅ **Error Handling**: Secure error messages without information leakage
- ✅ **Environment Variables**: Sensitive data in environment configuration

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

### v1.0.0
- Initial release
- File System Access API integration
- Token validation system
- Professional UI design
- Comprehensive error handling
- Cross-browser compatibility
