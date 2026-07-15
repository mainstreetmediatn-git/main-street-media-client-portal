# AI-Powered Tax Service Platform Blueprint

Status: Archive

Archived draft dated `2026-07-11`.

## Purpose

This document captures a production-grade blueprint for a tax service platform built around secure document intake, OCR, extraction, human review, payments, e-sign, and compliance-aware workflow controls.

## Core Positioning

- Document-centric, not autonomous filing
- Human-reviewed at every filing/signature decision point
- Security-first and compliance-aware by design
- Flask/Python as the primary implementation reference
- Express/Node.js included as a viable alternate API pattern

## Regulatory Anchors

- PTIN requirements for compensated federal return preparation
- EFIN and IRS e-file provider workflow
- IRS Publication 3112 for e-file website registration and update obligations
- FTC Safeguards Rule and IRS Publication 4557 for security planning

## Recommended MVP

- Secure client onboarding
- Document upload
- OCR and extraction queue
- Review queues and accountant dashboards
- Payment collection
- E-signature requests
- AI-assisted summarization and checklist generation
- Human approval before filing or signature completion

## Architecture Summary

- Browser client
- Flask API
- PostgreSQL
- Redis
- Celery workers
- Object storage
- Pluggable OCR adapter
- Extraction layer using regex, spaCy, and Hugging Face
- AI agent layer for assistive tasks only
- Integrations for QuickBooks, Plaid, Stripe, and DocuSign
- Prometheus and Grafana for observability

## Repository Shape

- `api/` for Flask application code
- `node-alt/` for Node.js equivalents
- `sql/` for schema
- `tests/` for Python and Node tests
- `deploy/` for Docker and Compose assets
- `.github/workflows/` for CI

## Key Implementation Themes

- Enforce upload validation with MIME sniffing and allowlists
- Run OCR and extraction asynchronously
- Persist workflow state in PostgreSQL
- Use short-lived JWT access tokens and OAuth2 for vendors
- Keep secrets in a secrets manager, not in client code
- Encrypt sensitive fields such as PII, tokens, and extracted text
- Use webhook-driven state updates for payments and integrations
- Keep the agent layer constrained to assistive, non-final actions

## OCR Strategy

- Start with Tesseract for local control and privacy
- Support Google Cloud Vision for dense text and handwriting
- Support Amazon Textract for structured document analysis
- Support Azure Document Intelligence for structured extraction

## NLP and Extraction Strategy

- Regex for IDs, years, and money patterns
- spaCy for local rule-based and entity extraction
- Hugging Face token classification for custom field extraction
- Store masked display values separately from encrypted raw values

## Security Themes

- TLS everywhere
- MFA for staff access
- Role-based authorization
- Audit logging
- Short-lived tokens
- Secret manager and KMS for credential handling
- Isolated object storage
- Written incident response and safeguards planning

## Deployment Direction

- Local development: Docker Compose
- AWS: ECS/Fargate, RDS, ElastiCache, S3, KMS, Secrets Manager
- GCP: Cloud Run, Cloud SQL, Memorystore, Cloud Storage, Secret Manager, Cloud KMS

## Roadmap

1. Foundation and repo setup
2. Identity and access
3. Intake and storage
4. OCR and extraction
5. Review workflow
6. Payments and signatures
7. Financial integrations
8. Agent assist
9. Hardening and launch

## Status

Archived as a reference blueprint. Not yet converted into an implementation repo or production spec.
