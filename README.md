# SAP Fioneer Download Manager

## Security & Compliance Status

[![JFrog SAST Scan](https://github.com/Fioneer-Corporate/sap-fioneer-download-manager/actions/workflows/jfrog-sast.yml/badge.svg)](https://github.com/Fioneer-Corporate/sap-fioneer-download-manager/blob/main/.github/workflows/jfrog-sast.yml)
[![FOSSA Status](https://app.fossa.com/api/projects/custom%2B41201%2Fgithub.com%2Fandreashofer-ca%2Fsap-fioneer-download-agent.svg?type=shield)](https://app.fossa.com/projects/custom%2B41201%2Fgithub.com%2Fandreashofer-ca%2Fsap-fioneer-download-agent)

A secure, modern web application for downloading large files from Artifactory with real-time progress tracking and user-selectable save locations using XMLHttpRequest streaming and the HTML5 File System Access API.

## Features

- 🚀 **Large File Support**: Efficient streaming downloads handle files of any size without memory issues
- 📊 **Real-time Progress**: Live progress bars with MB/GB tracking during downloads
- 🔐 **Secure Authentication**: JWT token-based authentication with Artifactory
- 📁 **User-Selectable Locations**: Modern File System Access API for choosing download locations
- 🎯 **Dynamic File Paths**: Support for complex repository structures and file paths
- 🔍 **Token Validation**: Real-time token attribute checking with detailed logging
- 🌐 **Cross-Browser Support**: Fallback to traditional downloads for older browsers
- 📱 **Responsive Design**: Clean, professional UI that works on all devices
- ⚡ **Streaming Architecture**: XMLHttpRequest streaming for optimal performance
- 🛡️ **Error Recovery**: Comprehensive error handling with user-friendly messages
- 🗂️ **Repository Browser**: Browse Artifactory repositories with intuitive folder navigation
- 🎯 **One-Click Downloads**: Click files to instantly initiate downloads

## Architecture

```
┌─────────────────┐
│   ServiceNow    │  (Production)
│  Web Interface  │───┐
└─────────────────┘   │
                      │
┌─────────────────┐   │   ┌──────────────────┐    ┌─────────────────┐
│   Test Harness  │   │   │   Node.js Server │    │   Artifactory   │
│   (test.html)   │───┼───│   (server.js)    │────│     API         │
└─────────────────┘   │   └──────────────────┘    └─────────────────┘
                      │           │
┌─────────────────┐   │           │
│   Repo Browser  │───┘           │
│  (browse.html)  │               │
│   API Proxy     │               │
└─────────────────┘               │
                                  │
                         ┌──────────────────┐
                         │ Download Manager │
                         │ (download.html)  │
                         │  XMLHttpRequest  │
                         │    Streaming     │
                         └──────────────────┘
```

### Components

1. **ServiceNow** (Production): Customer-facing web interface that calls the Node.js server for downloads
2. **Repository Browser** (`browse.html`): Standalone interface for browsing Artifactory repositories
3. **Test Harness** (`test.html`): Development/testing interface for configuring downloads with specific file paths
4. **Node.js Server** (`server.js`): Backend API with streaming proxy and token validation
5. **Download Manager** (`views/download.html`): Popup interface with XMLHttpRequest streaming
6. **Environment Config** (`.env`): Secure configuration for Artifactory credentials

### Streaming Architecture

- **Server**: Uses `axios` with `responseType: 'stream'` to proxy large files efficiently
- **Client**: XMLHttpRequest with `responseType: 'blob'` for streaming downloads
- **Progress**: Real-time progress events with accurate MB/GB tracking
- **Memory**: Minimal memory footprint regardless of file size

## Security Features

### ️ Comprehensive Protection Stack

- **Rate Limiting**: 4-tier protection against DoS and brute force attacks
- **CORS Security**: Restricted origins with whitelist validation
- **SSRF Protection**: Repository allow-lists prevent unauthorized access
- **Input Validation**: ReDoS-optimized regex patterns and sanitization
- **Token Security**: Authorization header preference with fallback handling
- **Error Handling**: Secure error messages without information disclosure

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

4. **Configure test harness** (optional for development):
   ```bash
   cp test.html.example test.html
   # Edit test.html and add your token if needed
   # Note: test.html is gitignored to prevent token exposure
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

6. **Access the application**:
   - **Production**: https://sap-fioneer-download-manager.cfapps.eu10-005.hana.ondemand.com
   - **Local development**: http://localhost:3000

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

### Repository Browser

The repository browser provides an intuitive interface for exploring and downloading files from Artifactory:

#### Setup (First Time Only)

1. **Copy the Template**:
   ```bash
   cp browse.html.example browse.html
   ```

2. **Add Your Tokens**:
   - Open `browse.html` in a text editor
   - Find the "ADD YOUR TOKENS HERE" section
   - Add your tokens to the dropdown, for example:
   ```html
   <option value="cmVmdGtuOjAxOjAwMDAwMDAwMDA6...">My Token Name</option>
   ```
   - Save the file (it's gitignored to protect your secrets)

#### Using the Browser

1. **Open the Browser**: 
   - Open `browse.html` in your web browser (standalone file)
   - Ensure the production server is accessible or run locally with `npm start`

2. **Configure Access**:
   - Select your Access Token from dropdown (or choose "Custom Token" and paste one)
   - Optionally enter your User ID for download tracking
   - Enter Repository name (default: "download")
   - The Artifactory URL is pre-configured

3. **Browse Repository**:
   - Click "Browse" to load the root directory
   - Click on any folder name in the breadcrumb to navigate directly to it
   - Click on folders (�) to navigate into them
   - Click on files (📄) to start download immediately

4. **Download Files**:
   - Simply click on any file to launch the download manager
   - The download manager opens in a popup window
   - Files are downloaded with progress tracking
   - User ID (if provided) is passed to the download service for tracking

**Features**:
- Interactive breadcrumb navigation with clickable path segments
- File sizes and modification dates
- Microsoft Fluent UI folder/file icons for easy identification
- Automatic path reset when token changes
- User ID tracking for download attribution
- CORS-free API calls via production proxy
- Responsive design with SAP Fioneer branding

### Basic Download Flow (Test Harness)

1. **Access the Application**: 
   - **Production**: Visit https://sap-fioneer-download-manager.cfapps.eu10-005.hana.ondemand.com
   - **Development**: Open `http://localhost:3000` or use the test harness at `test.html`
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
| `/` | GET | Service status and information |
| `/health` | GET | Server health check |
| `/download-page` | GET | Serves download manager with injected token and filepath |
| `/download` | GET | Proxies file downloads from Artifactory with streaming |
| `/api/storage` | GET | Proxies JFrog API requests for repository browsing |

### Request Examples

#### Download a File via Download Page
```bash
# Using query parameter (for popup compatibility)
curl "http://localhost:3000/download-page?filepath=download/folder/file.sar&token=your_token_here"

# Using Authorization header
curl -H "Authorization: Bearer your_token_here" \
     "http://localhost:3000/download-page?filepath=download/folder/file.sar"
```

#### Stream Download a File
```bash
curl -H "Authorization: Bearer your_token_here" \
     "http://localhost:3000/download?filename=folder/file.sar" \
     --output file.sar
```

#### Browse Repository via API Proxy
```bash
curl -H "Authorization: Bearer your_token_here" \
     "http://localhost:3000/api/storage?repository=download&path=/folder/subfolder"
```

#### Check Server Health
```bash
curl "http://localhost:3000/health"
```

## Deployment

### Cloud Foundry Deployment

The application is deployed to SAP BTP Cloud Foundry and can be accessed at:
**https://sap-fioneer-download-manager.cfapps.eu10-005.hana.ondemand.com**

#### Prerequisites
- Cloud Foundry CLI installed
- Access to a Cloud Foundry environment
- Artifactory access token configured as environment variable

#### Deployment Steps

1. **Login to Cloud Foundry**:
   ```bash
   cf login --sso
   # Follow the browser authentication flow for SAP BTP
   ```

2. **Set Environment Variables** (if not using services):
   ```bash
   cf set-env sap-fioneer-download-manager ARTIFACTORY_TOKEN "your_token_here"
   cf set-env sap-fioneer-download-manager ARTIFACTORY_URL "https://your-instance.jfrog.io/artifactory/"
   ```

3. **Deploy the Application**:
   ```bash
   cf push -f manifest.yml
   ```

4. **Check Application Status**:
   ```bash
   cf apps
   cf logs sap-fioneer-download-manager --recent
   ```

#### Current Deployment
- **URL**: https://sap-fioneer-download-manager.cfapps.eu10-005.hana.ondemand.com
- **Status**: ✅ Running (last deployed: September 22, 2025)
- **Health Check**: https://sap-fioneer-download-manager.cfapps.eu10-005.hana.ondemand.com/health
- **Platform**: SAP BTP Cloud Foundry (eu10-005 region)

#### Manifest Configuration

The `manifest.yml` file includes:
- **Memory**: 512MB allocation
- **Disk**: 1GB quota
- **Buildpack**: Node.js buildpack
- **Health Check**: HTTP endpoint at `/health`
- **Environment**: Production mode

#### Customizing Deployment

Edit `manifest.yml` to customize:
- Application name
- Memory/disk allocation
- Number of instances
- Environment variables
- Service bindings
- Custom routes

### Local Development

For local development, follow the Quick Start section above.

### Project Structure
```
├── server.js              # Express server with API endpoints
├── browse.html.example    # Repository browser template
├── browse.html            # Standalone repository browser (gitignored - contains tokens)
├── test.html.example      # Test harness template (copy to test.html)
├── test.html              # Test harness (gitignored - contains tokens)
├── manifest.yml           # Cloud Foundry deployment configuration
├── views/
│   └── download.html      # Download manager popup
├── package.json           # Node.js dependencies
├── .env.example           # Environment template
├── .env                   # Environment variables (gitignored)
└── README.md              # This file
```

**Template Files**:
- `browse.html.example`: Copy to `browse.html` and add your access tokens
- `test.html.example`: Copy to `test.html` and configure as needed
- `.env.example`: Copy to `.env` and add your Artifactory credentials

All `.example` files are tracked in git and contain no sensitive information. The actual configuration files (`browse.html`, `test.html`, `.env`) are gitignored to protect your secrets.

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

- ✅ **Rate Limiting**: Comprehensive DoS and abuse protection with configurable limits
- ✅ **Token Security**: Multiple authentication methods supported (Authorization headers, query parameters)
- ✅ **CORS Protection**: Restricted to specific allowed origins including production deployment
- ✅ **Input Validation**: File path and token validation with regex optimization
- ✅ **Error Handling**: Secure error messages without information leakage
- ✅ **Environment Variables**: Sensitive data in environment configuration
- ✅ **Template Files**: Sensitive files (.gitignored) with .example templates
- ✅ **Production Deployment**: Sanitized public pages without internal server details

### Security Notes for Customer-Facing Applications

**Current Implementation**: The application passes tokens via query parameters for popup window compatibility. This approach is suitable for internal use but has some considerations for customer-facing deployments:

**Query Parameter Method**:
- Tokens appear in server access logs
- Browser history may contain tokens
- Referrer headers could leak tokens
- URLs with tokens might be inadvertently shared
- Security warnings are logged for audit trails

**Current Mitigations**:
- HTTPS-only transmission in production
- Restricted CORS origins
- Console warnings when tokens passed via URL
- gitignored configuration files prevent token exposure
- Rate limiting protects against brute force attacks

**Alternative Approaches for Future Enhancement**:
- Session-based authentication with HTTP-only cookies
- JWT tokens with shorter expiration times
- Signed URLs with time-limited access
- OAuth 2.0 flow integration
- PostMessage-based token transmission (requires architecture changes)

### Security Features

#### Rate Limiting Protection (v1.3.0) 🆕
Enterprise-grade rate limiting to prevent abuse and DoS attacks:

- **General Endpoints**: 100 requests per 15 minutes per IP
  - Applies to all endpoints for baseline protection
  - Prevents general DoS attacks and resource exhaustion

- **Authentication Endpoints**: 20 requests per 15 minutes per IP
  - Applied to `/download-page` endpoint
  - Prevents brute force attacks against JWT validation
  - Stricter limits for security-critical operations

- **Download Endpoints**: 10 downloads per minute per IP
  - Applied to `/download` endpoint
  - Prevents bandwidth abuse and download flooding
  - Protects against resource-intensive operations

- **API Endpoints**: 30 requests per minute per IP
  - Applied to `/api/storage` endpoint
  - Prevents upstream service abuse (Artifactory)
  - Protects against API reconnaissance attacks

**Rate Limit Headers**: All responses include standard `RateLimit-*` headers for client awareness:
- `RateLimit-Policy`: Window and limit configuration
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining in current window
- `RateLimit-Reset`: Seconds until window resets

#### CORS Security (v1.2.0)
- **Restricted Origins**: Only allows requests from trusted domains
- **Allowed Origins**:
  - `http://localhost:3000` (development server)
  - `http://127.0.0.1:3000` (IPv4 localhost)
  - `https://sap-fioneer-download-manager.cfapps.eu10-005.hana.ondemand.com` (production deployment)
  - `null` (for file:// protocol support in development)
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

### v2.1.0 (2025-01-18) - Code Cleanup and Documentation Update
- 🗑️ **Removed Secure Download Endpoint**: Removed `/secure-download` endpoint (PostMessage-based) to simplify architecture
- 📝 **Updated Documentation**: Comprehensive README update to reflect current implementation
- 🔒 **Security Warnings**: Added console warnings when tokens passed via URL parameters
- 🧹 **Simplified Codebase**: Focused on single token transmission method (URL query parameters)
- 📚 **Enhanced API Documentation**: Updated endpoint documentation with accurate examples
- ✅ **Documentation Accuracy**: Removed references to unused endpoints and features

### v2.0.0 (2025-01-XX) - Repository Browser
- 🗂️ **Repository Browser**: Added standalone `browse.html` with intuitive folder navigation
- 🎯 **One-Click Downloads**: Files now download instantly on click (no separate button needed)
- 🔌 **API Proxy**: Added `/api/storage` endpoint to bypass CORS restrictions
- 🍞 **Breadcrumb Navigation**: Visual path display showing current location
- 🔄 **Smart Token Switching**: Path automatically resets to "/" when changing tokens
- 📚 **Documentation**: Comprehensive JSDoc comments throughout browse.html
- 🎨 **UI Consistency**: Rounded buttons (24px border-radius) matching SAP Fioneer style
- 🧹 **Simplified Interface**: Removed on-screen status messages (console-only logging)
- ❌ **Removed Features**: Copy-to-clipboard, separate download buttons (consolidated to click)
- 🗑️ **Code Cleanup**: Removed unused endpoints (`/token`, `/token-attributes`, `/test`, `/browse`)
- 🔧 **API Fix**: Corrected JFrog path from `/ui/native` to `/artifactory`
- 🛡️ **CORS Solution**: Implemented proxy pattern for reliable browser-based API access

### v1.3.0 (2025-09-24) - UI/UX Enhancement
- 🎨 **SAP Fioneer Branding**: Added complete SAP Fioneer logo integration to download interface
- 📐 **Compact Layout**: Optimized container sizing (280px) for focused, professional appearance
- 🔘 **Button Styling**: Updated buttons to match SAP Fioneer design system specifications
  - Font: BentonSans Medium, .875rem size, 400 weight
  - Padding: .5rem 1rem with 2rem border radius
  - Auto-sizing based on content
- 📄 **Interface Text**: Updated "Download Manager" → "Download now", "Start Download" → "Start"
- 📏 **Spacing Optimization**: Reduced line spacing and margins for tighter, more compact layout
- 📱 **Scrollable File Paths**: Long file paths now scroll horizontally instead of wrapping
- 🎯 **User Experience**: Removed unnecessary close button for cleaner interface
- 🌟 **Design Consistency**: Achieved visual consistency between test harness and download interface
- 🏷️ **Professional Styling**: Complete SAP Fioneer color scheme (yellow/black) implementation

### v1.2.0 (2025-09-22) - Production Deployment
- 🚀 **Cloud Foundry Deployment**: Successfully deployed to SAP BTP Cloud Foundry
- 🌐 **Production URLs**: Updated all hardcoded localhost URLs to production domain
- 🔒 **Enhanced CORS**: Added production domain to allowed origins
- 🧹 **Code Cleanup**: Removed test.html from git tracking to prevent token exposure
- 📄 **Public Pages**: Sanitized landing page to remove internal server details
- 🔐 **Security Documentation**: Added comprehensive security considerations for customer-facing use
- 📝 **Documentation**: Updated README with deployment information and current URLs
- ✅ **End-to-End Verification**: Confirmed full download flow functionality in production

### v1.1.0 (2025-01-18)
- 🧹 **Code Cleanup**: Removed unused dependencies and cleaned up redundant code
- 📚 **Documentation**: Enhanced inline comments and API documentation
- 🔐 **Security**: Improved token handling and removed hardcoded credentials
- 🏗️ **Architecture**: Simplified URL construction and configuration
- 📦 **Dependencies**: Updated package.json and removed unused packages

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
