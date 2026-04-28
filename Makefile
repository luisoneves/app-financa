.PHONY: install build build-backend build-frontend dev test clean

# Install all dependencies
install:
	pnpm install

# Build everything (backend + frontend)
build: build-backend build-frontend

# Build backend (compile TS + wrangler dry-run)
build-backend:
	cd backend && pnpm build

# Build frontend (vite build with adapter-cloudflare)
build-frontend:
	cd frontend && pnpm build

# Run dev servers (backend + frontend)
dev:
	@echo "Starting backend (wrangler dev)..."
	@cd backend && wrangler dev &
	@echo "Starting frontend (vite dev)..."
	@cd frontend && pnpm dev

# Run tests
test: test-backend test-frontend

# Test backend
test-backend:
	@echo "Running backend tests..."
	@bash scripts/test-backend.sh

# Test frontend build
test-frontend:
	@echo "Running frontend build tests..."
	@bash scripts/test-frontend.sh

# Clean build artifacts
clean:
	rm -rf backend/dist
	rm -rf frontend/.svelte-kit
	rm -rf frontend/build
	rm -rf node_modules
	pnpm install

# Deploy backend to Cloudflare Workers
deploy-backend:
	cd backend && wrangler deploy

# Deploy frontend to Cloudflare Pages
deploy-frontend:
	cd frontend && wrangler pages deploy .svelte-kit/cloudflare --project-name=app-financa

help:
	@echo "Available commands:"
	@echo "  make install        - Install dependencies"
	@echo "  make build          - Build all (backend + frontend)"
	@echo "  make build-backend  - Build backend only"
	@echo "  make build-frontend - Build frontend only"
	@echo "  make dev            - Run dev servers"
	@echo "  make test           - Run all tests"
	@echo "  make deploy-backend - Deploy backend to Cloudflare"
	@echo "  make deploy-frontend - Deploy frontend to Cloudflare"
	@echo "  make clean          - Clean artifacts and reinstall"
