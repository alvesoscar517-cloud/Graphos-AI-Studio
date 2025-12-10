# Changelog

All notable changes to Graphos AI Studio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2024-12-11

### Added
- Production-ready logger utility with conditional logging
- Pre-release check script for automated validation
- Comprehensive production release checklist

### Changed
- CORS configuration now properly restricts localhost in production
- Console statements replaced with production-safe logger
- Environment example files updated with secure placeholder values

### Security
- Removed sample API keys from .env.example files
- CORS middleware now checks NODE_ENV before allowing localhost origins
- Enhanced security documentation

### Fixed
- Console logs no longer appear in production builds

## [1.0.0] - 2024-12-01

### Added
- Initial release of Graphos AI Studio Chrome Extension
- AI content detection and analysis
- Voice profile management
- Multi-language support (15 languages)
- Credit-based usage system
- Admin panel for management
- Real-time notifications via SSE
- Google OAuth authentication
- Lemon Squeezy payment integration

### Features
- AI Detection: Analyze text for AI-generated content
- Text Analysis: Deep analysis of writing patterns
- Text Rewrite: Humanize AI-generated content
- Voice Profiles: Create and manage writing style profiles
- Chat Interface: Interactive AI assistant
- Export: Export analysis results

### Supported Languages
- English (en)
- Vietnamese (vi)
- Chinese Simplified (zh-CN)
- Japanese (ja)
- Korean (ko)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Arabic (ar)
- Thai (th)
- Indonesian (id)
- Hindi (hi)

---

## Release Notes Format

### Types of changes
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes
