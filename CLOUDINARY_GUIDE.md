# Cómo usar Cloudinary para subir imágenes de libros

## Configuración inicial

### 1. Obtener credenciales de Cloudinary

1. Ve a [https://cloudinary.com](https://cloudinary.com) y crea una cuenta gratuita
2. Una vez dentro del dashboard, encontrarás tus credenciales:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2. Configurar variables de entorno

Actualiza tu archivo `.env` con tus credenciales de Cloudinary:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
```

## Uso de los endpoints

### Crear un libro CON imagen

**Endpoint:** `POST /books`

**Tipo:** `multipart/form-data`

**Campos:**

- `title` (string, requerido): Título del libro
- `author` (string, requerido): Autor del libro
- `year` (number, opcional): Año de publicación
- `user` (ObjectId, opcional): ID del usuario
- `image` (file, opcional): Archivo de imagen (jpg, jpeg, png, gif, webp)

**Ejemplo con Postman:**

1. Selecciona el método POST
2. URL: `http://localhost:3000/books`
3. En la pestaña "Body", selecciona "form-data"
4. Agrega los campos:
   - `title`: "El Quijote"
   - `author`: "Miguel de Cervantes"
   - `year`: 1605
   - `image`: [Selecciona un archivo de imagen]

**Ejemplo con JavaScript (Frontend):**

```javascript
const formData = new FormData();
formData.append("title", "El Quijote");
formData.append("author", "Miguel de Cervantes");
formData.append("year", 1605);
formData.append("image", imageFile); // imageFile es un objeto File

fetch("http://localhost:3000/books", {
  method: "POST",
  body: formData,
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

### Crear un libro SIN imagen

Puedes crear un libro sin imagen simplemente omitiendo el campo `image`:

```javascript
fetch("http://localhost:3000/books", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "El Quijote",
    author: "Miguel de Cervantes",
    year: 1605,
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

### Actualizar un libro (con o sin nueva imagen)

**Endpoint:** `PATCH /books/:id`

**Tipo:** `multipart/form-data`

Si envías una nueva imagen, la imagen anterior se eliminará automáticamente de Cloudinary.

**Ejemplo:**

```javascript
const formData = new FormData();
formData.append("title", "El Quijote - Edición actualizada");
formData.append("image", newImageFile); // Nueva imagen (opcional)

fetch("http://localhost:3000/books/123456", {
  method: "PATCH",
  body: formData,
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

### Eliminar un libro

**Endpoint:** `DELETE /books/:id`

Al eliminar un libro, su imagen también se eliminará automáticamente de Cloudinary.

**Ejemplo:**

```javascript
fetch("http://localhost:3000/books/123456", {
  method: "DELETE",
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

## Respuesta de la API

Cuando creas o actualizas un libro con imagen, la respuesta incluirá:

```json
{
  "message": "Libro creado exitosamente",
  "book": {
    "_id": "123456",
    "title": "El Quijote",
    "author": "Miguel de Cervantes",
    "year": 1605,
    "image": "https://res.cloudinary.com/tu_cloud_name/image/upload/v1234567890/books/abc123.jpg",
    "imagePublicId": "books/abc123"
  }
}
```

- `image`: URL pública de la imagen en Cloudinary (úsala en el frontend para mostrar la imagen)
- `imagePublicId`: ID interno de Cloudinary (se usa para eliminar la imagen)

## Características implementadas

✅ Subida de imágenes a Cloudinary
✅ Imágenes redimensionadas automáticamente (máximo 500x500px)
✅ Formatos permitidos: jpg, jpeg, png, gif, webp
✅ Eliminación automática de imágenes al actualizar o borrar libros
✅ Manejo de errores
✅ Campos opcionales (puedes crear libros sin imagen)

## Notas importantes

- Las imágenes se guardan en la carpeta "books" en tu cuenta de Cloudinary
- Las imágenes se redimensionan automáticamente para optimizar el almacenamiento
- La cuenta gratuita de Cloudinary incluye 25 GB de almacenamiento y 25 GB de ancho de banda mensual
- Cuando eliminas o actualizas un libro con imagen, la imagen anterior se elimina automáticamente de Cloudinary para no desperdiciar espacio
