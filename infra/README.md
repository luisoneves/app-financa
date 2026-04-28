# Infra — app-financa (Terraform/OpenTofu)

## Pré-requisitos

1. Conta Cloudflare
2. API Token com permissões:
   - `Account - Cloudflare Pages: Edit`
   - `Account - Workers Scripts: Edit`
3. Account ID da Cloudflare

## Configuração

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# Edite terraform.tfvars com seus dados
```

## Deploy

### Usando Terraform:
```bash
terraform init
terraform plan
terraform apply
```

### Usando OpenTofu:
```bash
tofu init
tofu plan
tofu apply
```

## O que será criado

1. **Cloudflare Pages Project** (`app-financa`)
   - Build command: `pnpm run build`
   - Output dir: `.svelte-kit/cloudflare`
   - Root dir: `/`
   - Conectado ao GitHub: `luisoneves/app-financa`

2. **Cloudflare Worker** (`app-financa-backend`)
   - Deploy do backend Hono + Drizzle + D1

## Variáveis de Ambiente

Para adicionar env vars (como `JWT_SECRET`, `DATABASE_URL`), edite o bloco `deployment_configs` no `main.tf`.

## URLs após deploy

- Frontend: `https://app-financa.pages.dev`
- Backend: `https://app-financa-backend.<account>.workers.dev`
