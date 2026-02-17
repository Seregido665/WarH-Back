# Tienda Online MVP

## Descripción del producto

Plataforma de comercio electrónico que permite a los usuarios registrarse, verificar su cuenta, publicar productos con imágenes, navegar el catálogo, realizar compras, gestionar pedidos, dejar reseñas y marcar productos como favoritos.  

Incluye autenticación segura, manejo de estados en pedidos, envío de correos transaccionales y almacenamiento de imágenes en la nube.

## Modelo de datos

Se utilizan seis colecciones principales con las siguientes relaciones:

- **User**  
  - Campos principales: nombre, email, password (hash), isVerified, avatar (Cloudinary)

- **Product** (recurso principal)  
  - Campos principales: título, descripción, precio, stock, estado (draft/published), imágenes (array Cloudinary), owner (ref User)

- **Category**  
  - Campos principales: nombre, slug

- **Order**  
  - Campos principales: buyer (ref User), products (array con ref Product + cantidad), total, status (pending → paid → shipped → delivered/cancelled), createdAt

- **Review**  
  - Campos principales: product (ref Product), author (ref User), rating, comentario, createdAt

- **Favorite**  
  - Campos principales: user (ref User), product (ref Product), createdAt

**Relaciones principales**

- User → 1:N Products (como propietario)  
- User → 1:N Orders (como comprador)  
- User → 1:N Reviews  
- User → 1:N Favorites  
- Product → 1:N Reviews  
- Product → 1:N Favorites  
- Product ↔ N:N Categories (mediante array de referencias en Product)  
- Order → N:1 User (buyer)  
- Order → N:M Products (relación embebida con cantidad)

## Endpoints principales

### Autenticación
- `POST /api/auth/register`  
- `POST /api/auth/login`  
- `GET  /api/auth/verify/:token`  
- `POST /api/auth/forgot-password`  
- `POST /api/auth/reset-password/:token`

### Productos
- `GET  /api/products`              (paginación, filtros por categoría/precio/estado, orden por precio/fecha/popularidad)  
- `GET  /api/products/:id`  
- `POST /api/products`              (requiere autenticación)  
- `PUT  /api/products/:id`          (solo propietario)  
- `DELETE /api/products/:id`        (solo propietario)

### Pedidos
- `POST /api/orders`                (crear pedido)  
- `GET  /api/orders/me`             (pedidos del usuario autenticado)  
- `GET  /api/orders/:id`            (detalle – propietario o comprador)

### Reseñas y favoritos
- `POST /api/products/:id/reviews`  
- `POST /api/products/:id/favorite`  
- `DELETE /api/products/:id/favorite`

### Imágenes
- `POST /api/upload`                (subida de imágenes a Cloudinary)

## Cómo ejecutar

### Requisitos previos
- Node.js ≥ 18  
- MongoDB (local o Atlas)  
- Cuentas activas en Cloudinary y servicio SMTP (Gmail, SendGrid, etc.)

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd tienda-online-mvp