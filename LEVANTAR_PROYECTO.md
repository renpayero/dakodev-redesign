# 🚀 Cómo Levantar el Proyecto (Dakodev)

Esta guía te explica cómo ejecutar el proyecto tanto en **modo desarrollo** (localmente con Node.js) como en **modo producción** (usando Docker).

---

## 🛠️ Requisitos previos

- **Node.js** (v18 o superior recomendado)
- **npm** (o pnpm/yarn)
- **Docker** y **Docker Compose** (si usas la opción de contenedor)

---

## 💻 Opción 1: Desarrollo Local (Recomendado para editar)

Si quieres hacer cambios en el código y verlos en tiempo real:

1.  **Instalar dependencias:**
    Ejecuta el siguiente comando en la raíz del proyecto para descargar las librerías necesarias:

    ```bash
    npm install
    ```

2.  **Iniciar el servidor de desarrollo:**
    Levanta el entorno local de Astro:

    ```bash
    npm run dev
    ```

3.  **Abrir en el navegador:**
    Por defecto, la aplicación estará disponible en:
    > [http://localhost:4321](http://localhost:4321)

---

## 🐳 Opción 2: Correr con Docker (Modo Producción)

Simula el entorno final de producción usando Nginx y Docker. Ideal para verificar que todo el _build_ funcione correctamente antes de desplegar.

1.  **Levantar el contenedor:**
    Usa Docker Compose para construir y levantar el servicio:

    ```bash
    docker-compose up -d --build
    ```

    _El flag `--build` asegura que se reconstruya la imagen con los últimos cambios._

2.  **Verificar estado:**
    Puedes ver si el contenedor está corriendo con:

    ```bash
    docker-compose ps
    ```

3.  **Abrir en el navegador:**
    La configuración de Docker expone el puerto `3070`:

    > [http://localhost:3070](http://localhost:3070)

4.  **Detener el servicio:**
    Cuando termines, puedes bajar el contenedor:
    ```bash
    docker-compose down
    ```

---

## 🔧 Comandos Útiles

| Comando           | Descripción                                                     |
| :---------------- | :-------------------------------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo.                               |
| `npm run build`   | Compila el proyecto para producción en la carpeta `/dist`.      |
| `npm run preview` | Sirve la carpeta `/dist` localmente para probar el build final. |
