# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-07-01

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