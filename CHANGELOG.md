# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2025-01-27

### Changed
- 🏗️ **Major code refactoring** - Improved code organization and maintainability
- 📁 Restructured codebase into modular architecture with dedicated directories:
  - `types/` - Centralized type definitions
  - `utils/` - Utility functions (CLI, API, server configuration)
  - `tools/` - Tool definitions and handlers
- 📏 **Dramatically reduced main file complexity** - `index.ts` reduced from 203 to 41 lines (80% reduction)
- 🧪 **Enhanced testability** - Each module can now be tested independently
- 🔧 **Improved maintainability** - Clear separation of concerns and modular design
- 📈 **Better scalability** - Easy to extend with new tools and features

### Technical Improvements
- Separated CLI utilities into dedicated module
- Extracted API communication logic into reusable utilities
- Isolated server configuration and setup logic
- Created centralized type definitions
- Maintained 100% backward compatibility

## [0.1.1] - 2025-07-01

### Added
- Initial release of Supavec MCP Server
- `fetch-embeddings` tool for retrieving relevant content from Supavec files
- Command-line argument support (`--api-key`, `--help`)
- Environment variable support (`SUPAVEC_API_KEY`)
- Comprehensive error handling and validation
- Support for multiple AI tools (Cursor, Claude, VS Code Copilot)
- Automated npm package building with executable permissions
- Complete documentation and usage examples

### Features
- 🔍 Search and retrieve relevant embeddings from Supavec files
- 🤖 Integration with MCP-compatible AI tools
- 🔑 Flexible authentication (CLI args + env vars)
- ⚡ Easy installation via npx
- 📚 Comprehensive documentation

## [Unreleased]

### Planned
- Ability to list your documents
- Upload the documents to your supavec project
- Batch processing for multiple files
- Performance optimizations
- Additional file format support 