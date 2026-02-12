# Integración de Instagram en FLOWMIX

## Estado Actual

✅ La sección "Social Pulse" ya está mostrando 6 posts simulados de Instagram con:

- Imágenes de alta calidad
- Texto de contenido relevante
- Likes, comentarios y shares
- Timestamps realistas
- Diseño responsive en masonry grid

## Opción 1: Usar Posts Simulados (Actual - Recomendado para desarrollo)

El sistema actualmente usa datos mock que parecen posts reales de Instagram. Esto es perfecto para:

- Desarrollo y testing
- Demo sin dependencias externas
- Prototipado rápido

**Ubicación:** `src/app/features/social-pulse/infrastructure/api-social-pulse.adapter.ts`

---

## Opción 2: Integrar Instagram Graph API (Posts Reales)

### Requisitos:

1. **Cuenta de Instagram Business** (necesaria para API)
2. **App de Facebook Developer** (para generar tokens)
3. **Access Token** de Instagram Graph API

### Pasos de Configuración:

#### Paso 1: Obtener Access Token

1. Ve a https://developers.facebook.com/
2. Crea una app (o usa una existente)
3. Agrega Instagram Graph API
4. En Settings > Basic, obtén el App ID y App Secret
5. En Instagram > Basic Display, obtén el User Token
6. Genera un Access Token (90 días de validez)

#### Paso 2: Obtener Instagram Business Account ID

```bash
# Comando CURL para obtener el Business Account ID:
curl "https://graph.instagram.com/me/ig_business_account?access_token=YOUR_TOKEN"
```

#### Paso 3: Configurar el Adapter

En `src/app/features/social-pulse/infrastructure/api-social-pulse.adapter.ts`:

```typescript
export class ApiSocialPulseAdapter extends SocialPulseRepository {
  private readonly instagramAccessToken = "TU_TOKEN_AQUI";
  private readonly instagramBusinessAccountId = "TU_BUSINESS_ACCOUNT_ID";

  // Luego descomenta el código commented en syncFeed()
}
```

#### Paso 4: Descomenta el código de API Real

En la función `syncFeed()`:

```typescript
async syncFeed(): Promise<SocialPulseResponse> {
  if (this.instagramAccessToken && this.instagramBusinessAccountId) {
    return this.fetchInstagramPosts();  // Usa API real
  }
  return { posts: this.mockInstagramPosts };  // Fallback a mock
}
```

---

## Opción 3: Usar Hashtags Públicos (Sin Autenticación)

Puedes hacer un scraping básico de posts públicos de un hashtag:

```typescript
async syncFeedByHashtag(hashtag: string): Promise<SocialPulseResponse> {
  try {
    const url = `https://www.instagram.com/explore/tags/${hashtag}/?__a=1`;
    const response = await fetch(url);
    const data = await response.json();

    // Procesar datos del hashtag
    // Nota: Instagram bloquea esta API públicamente, requiere workarounds
  } catch (error) {
    console.error('Error fetching hashtag posts:', error);
    throw error;
  }
}
```

**Limitaciones:**

- Instagram bloquea web scraping
- Se necesitarían librerías como `instagram-scraper`
- No es recomendado para producción

---

## Opción 4: Backend Proxy (Recomendado para Producción)

Crear un backend Node.js que:

1. Gestione tokens de forma segura
2. Haga requests a Instagram API
3. Devuelva los datos al frontend

**Ventajas:**

- Credenciales no expuestas en el cliente
- Rate limiting controlado
- Caché de posts

**Implementación:**

```typescript
// En el adapter
async syncFeed(): Promise<SocialPulseResponse> {
  const response = await fetch('/api/instagram/posts');
  return response.json();
}
```

---

## Posts Incluidos (Actual)

El adapter incluye 6 posts simulados de `@flowmix_official`:

1. **"Testing the new low-latency neural engine"** - 1.2K likes
2. **"Real-time audio processing powered by open-source innovation"** - 2.1K likes
3. **"Join our community of audio engineers and producers"** - 890 likes
4. **"Beyond Audio Engine - Now available for beta testing"** - 3.4K likes
5. **"Introducing Hall of Fame - Recognizing our core contributors"** - 1.5K likes
6. **"Premium membership tiers now live"** - 2.2K likes

Todos con imágenes de Unsplash relacionadas con audio/música.

---

## Próximos Pasos

**Para implementar API real:**

1. ¿Tienes una cuenta de Instagram Business de FLOWMIX?
2. ¿Acceso a Facebook Developer Console?
3. ¿Quieres usar hashtag `#flowmix` o posts de cuenta oficial?

Una vez confirmes, actualizaré el adapter con tus credenciales.

---

## Notas de Seguridad

⚠️ **IMPORTANTE:**

- **NUNCA** commits tokens en Git
- Usa variables de entorno para credenciales
- Implementar backend proxy para producción
- Rotar tokens regularmente

Configúralos en `environment.ts`:

```typescript
export const environment = {
  instagram: {
    accessToken: import.meta.env["NG_APP_INSTAGRAM_TOKEN"],
    businessAccountId: import.meta.env["NG_APP_INSTAGRAM_ACCOUNT_ID"],
  },
};
```
