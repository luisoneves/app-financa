# Google OAuth Setup - app-financa

## Visão Geral

O app-financa suporta login via Google OAuth 2.0 além do login tradicional com senha.

## Configuração no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Vá em **APIs & Services > Credentials**
4. Clique em **Create Credentials > OAuth client ID**
5. Configure **OAuth consent screen**:
   - User Type: External
   - App name: app-financa
   - Support email: seu-email@gmail.com
   - Scopes: `email`, `profile`, `openid`

6. Crie **OAuth Client ID**:
   - Application type: Web application
   - Name: app-financa
   - Authorized JavaScript origins:
     ```
     https://app-financa.pages.dev
     https://bdb567b2.app-financa.pages.dev
     http://localhost:5173
     ```
   - Authorized redirect URIs:
     ```
     https://app-financa.pages.dev/api/auth/google/callback
     https://bdb567b2.app-financa.pages.dev/api/auth/google/callback
     http://localhost:8787/api/auth/google/callback
     ```

7. Anote o **Client ID** e **Client Secret**

## Configuração no app-financa

### Backend (.dev.vars)

Crie o arquivo `backend/.dev.vars` (não commite!) baseado no `.dev.vars.example`:

```bash
cp .dev.vars.example backend/.dev.vars
```

Edite `backend/.dev.vars` com suas credenciais:

```
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdef123456
GOOGLE_REDIRECT_URI=https://app-financa.pages.dev/api/auth/google/callback
```

### Wrangler.toml

Adicione as variáveis no `backend/wrangler.toml`:

```toml
[vars]
GOOGLE_CLIENT_ID = "123456789-abc.apps.googleusercontent.com"
GOOGLE_REDIRECT_URI = "https://app-financa.pages.dev/api/auth/google/callback"

[secrets]
GOOGLE_CLIENT_SECRET = "GOCSPX-abcdef123456"
```

Ou via CLI:

```bash
cd backend
wrangler secret put GOOGLE_CLIENT_SECRET
```

## Fluxo de Autenticação

1. Usuário clica em "Entrar com Google" no frontend
2. Frontend redireciona para `/api/auth/google`
3. Backend redireciona para Google OAuth consent screen
4. Google redireciona para `/api/auth/google/callback?code=...`
5. Backend troca `code` por `access_token` no Google
6. Backend busca dados do usuário (`/oauth2/v3/userinfo`)
7. Backend gera JWT com os dados do usuário
8. Backend seta cookie `auth_token` e redireciona para `/`

## Estrutura do JWT (Google)

```json
{
  "sub": "usuario@gmail.com",
  "name": "Nome do Usuário",
  "role": "user",
  "mustChangePassword": false,
  "provider": "google"
}
```

## Usuários Existentes

Se o email do Google coincidir com um `VALID_USERS` existente, as informações do usuário (role, mustChangePassword) serão preservadas.

Se for um novo usuário (não listado em `VALID_USERS`), será criado automaticamente com:
- `role: "user"`
- `mustChangePassword: false`

## Segurança

- O `GOOGLE_CLIENT_SECRET` deve ser tratado como secret (usar wrangler secrets)
- O JWT é assinado com `JWT_SECRET`
- Cookie `auth_token` é `httpOnly`, `secure`, `sameSite: Lax`
- State parameter é gerado para prevenir CSRF (pode ser melhorado com armazenamento em sessão)

## Troubleshooting

### Erro: "Google OAuth não configurado"
- Verifique se as variáveis `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` estão definidas

### Erro: "redirect_uri_mismatch"
- Verifique se a URI no Google Cloud Console coincide exatamente com `GOOGLE_REDIRECT_URI`

### Erro: "Falha ao obter token"
- Verifique se o `GOOGLE_CLIENT_SECRET` está correto
- Verifique se o `code` não expirou (é de uso único)

## Referências

- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Using OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
