# Perfil de Administrador

## Página: `/admin/perfil`

Controlador: `Admin\ProfileController@index`
Layout: DashboardLayout

### Secciones

#### 1. Información Personal (Card principal)
- **Nombre:** editable inline (input + botón Guardar)
- **Email:** solo lectura, con link a `/settings/profile` para cambiarlo
- **Miembro desde:** fecha de registro
- **Rol:** badge Super Admin (morado) o Administrador (celeste)

#### 2. Mis Adopciones
- Lista de adopciones realizadas por el usuario
- Cada ítem: emoji de especie, nombre (link a detalle), organización, badge de estado, fecha

#### 3. Sidebar

##### Organizaciones
- Membresías del usuario a equipos
- Cada ítem: nombre de la organización (link), badge de rol (Dueña/Admin/Miembro)

##### Accesos Rápidos
- Configuración de perfil → `/settings/profile`
- Seguridad y contraseña → `/settings/security`
- **Apariencia:** toggle de tema inline (Claro / Oscuro / Sistema) usando `AppearanceTabs`

##### Zona de Peligro
- Card roja con advertencia
- Botón "Eliminar cuenta" (confirma antes de eliminar)
