#  Sistema de Gestión de Personal (CRUD) - Laravel 11

SistemaCRUD semana10, desarrollada bajo el patrón de diseño **Modelo-Vista-Controlador (MVC)** utilizando **Laravel 11**, **MySQL** como motor de base de datos y **Bootstrap 5** para una interfaz de usuario limpia y responsiva. El sistema incluye funcionalidades completas de CRUD (Crear, Leer, Actualizar, Eliminar) 

---

## Requisitos Previos

Antes de iniciar la instalación, asegúrate de tener instalado en tu entorno de desarrollo local:
* PHP (Versión 8.2 o superior)
* Composer (Gestor de dependencias de PHP)
* Servidor local con MySQL (XAMPP el que use yo )

---

## Guía de Instalación y Despliegue desde Cero

### 1  Extraer el Proyecto
Extraer el proyecto y mover al HTDOCS

### 2 Instalar Dependencias de PHP
Descarga e instala todas las librerías del framework necesarias para el funcionamiento del sistema ejecutando:
composer install

### 3 Configurar el Archivo de Entorno .env
verificar si el archivo .env tiene las siquientes configuraciones  
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bdsistemaCRUD
DB_USERNAME=root
DB_PASSWORD=

### 4 Configurar la Base de Datos y Ejecutar las Migraciones
* Primero, iniciar los servicios de Apache y MySQL desde el panel de control de tu entorno local ( XAMPP).
* Segundo, ingresar a localhost/phpmyadmin/ en el navegador y crear una base de datos vacía llamada bdsistemaCRUD.
* Tercero, regresar a la consola y ejecutar el comando de migración para construir automáticamente las tablas en la base de datos:
php artisan migrate

### 5️⃣ Crear el Enlace Simbólico de Almacenamiento (Crucial para las Fotos)
Por seguridad, Laravel almacena las imágenes subidas en una carpeta interna privada (storage/app/public). Para que el navegador web pueda leer e imprimir las fotografías en la tabla, crear el acceso directo público ejecutando obligatoriamente este comando en la terminal:
php artisan storage:link

### 6️⃣ Iniciar el Servidor Local
Levantar el servicio web nativo de desarrollo de Laravel:
php artisan serve