# Graphos AI Studio - API Documentation

## Overview

This is the backend API for Graphos AI Studio, a service for detecting AI-generated content, analyzing text authenticity, and providing humanization features.

## Quick Start

### Base URL
- **Production**: `https://ai-authenticator-472729326429.us-central1.run.app`
- **Development**: `http://localhost:3000`

### Authentication

Most endpoints require authentication via Bearer token:

```http
Authorization: Bearer <your-token>
```

Supported authentication methods:
1. **Firebase ID Token** - For Google OAuth users
2. **Email Auth Token** - For email/password users
3. **API Key** - For service-to-service calls (header: `X-API-Key`)

## API Documentation

### OpenAPI Specification

The full API specification is available in [openapi.yaml](./openapi.yaml).

You can view it using:
- [Swagger Editor](https://editor.swagger.io/) - Paste the YAML content
- [Redoc](https://redocly.github.io/redoc/) - For beautiful documentation
- VS Code with OpenAPI extension

### Quick Reference

#### Health Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/ready` | Readiness check |

#### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/email/register` | Register new user |
| POST | `/auth/email/verify` | Verify email with OTP |
| POST | `/auth/email/login` | Login |
| POST | `/auth/email/refresh` | Refresh token |
| POST | `/auth/email/forgot-password` | Request password reset |
| POST | `/auth/email/reset-password` | Reset password |
| POST | `/auth/email/change-password` | Change password (auth required) |
| GET | `/auth/email/sessions` | Get active sessions (auth required) |

#### Profiles
| Method | Path | Description |
|--------|------|-------------|
| GET | `/profiles` | List all profiles |
| POST | `/profiles/create` | Create new profile |
| GET | `/profiles/:id` | Get profile by ID |
| DELETE | `/profiles/:id` | Delete profile |
| POST | `/profiles/add-sample` | Add writing sample |
| POST | `/profiles/finalize` | Finalize profile |

#### Analysis
| Method | Path | Description | Credits |
|--------|------|-------------|---------|
| POST | `/analysis/authenticate` | Detect AI content | ✓ |
| POST | `/analysis/analyze` | Analyze text vs profile | ✓ |
| POST | `/analysis/rewrite` | Rewrite text | ✓ |
| POST | `/analysis/rewrite-stream` | Rewrite (streaming) | ✓ |
| POST | `/analysis/translate` | Translate text | ✓ |
| POST | `/analysis/check-humanization` | Check humanization | ✓ |
| POST | `/analysis/iterative-humanize` | Iterative humanize | ✓ |

#### Chat
| Method | Path | Description | Credits |
|--------|------|-------------|---------|
| POST | `/api/chat` | Send message | ✓ |
| POST | `/api/chat/stream` | Send message (streaming) | ✓ |
| POST | `/api/chat/humanized` | Humanized chat | ✓ |

#### Credits
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/credits/balance` | Get credit balance |
| GET | `/api/credits/packages` | List credit packages |
| GET | `/api/credits/history` | Get usage history |
| POST | `/api/credits/purchase` | Purchase credits |

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "errorId": "abc123"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `INVALID_TOKEN` | 401 | Invalid or expired token |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INSUFFICIENT_CREDITS` | 402 | Not enough credits |
| `QUOTA_EXCEEDED` | 429 | API quota exceeded |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Rate Limiting

- **Per User**: 60 requests/minute
- **Per IP**: 100 requests/minute (unauthenticated)

When rate limited, response includes:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 60
  }
}
```

## Credits System

AI-consuming operations require credits. Check balance before operations:

```bash
curl -H "Authorization: Bearer <token>" \
  https://api.example.com/api/credits/balance
```

### Credit Costs (approximate)
| Operation | Credits |
|-----------|---------|
| AI Detection | 1 |
| Text Analysis | 2 |
| Rewrite | 3 |
| Chat Message | 1 |
| Humanized Chat | 3 |
| Translation | 1 |

## Streaming Responses

Endpoints ending with `-stream` return Server-Sent Events:

```javascript
const eventSource = new EventSource('/api/chat/stream?token=<token>');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'content') {
    console.log(data.content);
  } else if (data.type === 'done') {
    eventSource.close();
  }
};
```

## Localization

The API supports multiple languages. Set via:
- Header: `Accept-Language: vi`
- Query: `?lang=vi`

Supported: en, vi, ja, ko, zh, es, fr, de, it, pt, ru, ar, th, id, ms

## Deprecated Endpoints

The following endpoints are deprecated and will be removed in v3.0:

| Deprecated | Use Instead |
|------------|-------------|
| `/create_profile` | `/profiles/create` |
| `/get_profiles` | `/profiles` |
| `/authenticate` | `/analysis/authenticate` |
| `/analyze` | `/analysis/analyze` |
| `/rewrite` | `/analysis/rewrite` |

Deprecated endpoints return headers:
```
Deprecation: true
Sunset: Wed, 01 Jan 2025 00:00:00 GMT
Link: </new/path>; rel="successor-version"
```

## Support

For API issues, contact: support@graphosai.com
