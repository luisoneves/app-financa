terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API Token"
  sensitive   = true
}

variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare Account ID"
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
  account_id = var.cloudflare_account_id
}

# Cloudflare Pages Project
resource "cloudflare_pages_project" "app_financa" {
  account_id        = var.cloudflare_account_id
  name              = "app-financa"
  production_branch = "main"

  deployment_configs {
    production {
      environment = {
        "NODE_VERSION" = "22"
        "FRONTEND_URL" = "https://app-financa.pages.dev"
      }
    }
    preview {
      environment = {
        "NODE_VERSION" = "22"
        "FRONTEND_URL" = "https://app-financa.pages.dev"
      }
    }
  }

  source {
    type = "github"
    config {
      owner = "luisoneves"
      repo  = "app-financa"
      path  = "frontend"
      deployments_enabled = true
      production_branch = "main"
      build_command     = "pnpm run build"
      destination_dir  = ".svelte-kit/cloudflare"
      root_dir         = "frontend"
    }
  }
}

# Backend Worker (separate)
resource "cloudflare_worker_script" "app_financa_backend" {
  account_id  = var.cloudflare_account_id
  name        = "app-financa-backend"
  content     = file("${path.module}/../backend/dist/index.js")
  
  module = true
  compatibility_date = "2024-01-01"
  compatibility_flags = ["nodejs_compat"]
}

output "pages_url" {
  value = "https://${cloudflare_pages_project.app_financa.name}.pages.dev"
}

output "worker_url" {
  value = "https://${cloudflare_worker_script.app_financa_backend.name}.${var.cloudflare_account_id}.workers.dev"
}
