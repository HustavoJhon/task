# Módulo Mascotas (Pets)

## Modelos Involucrados
- `Pet` — datos de la mascota
- `Team` — organización dueña
- `Adoption` — solicitudes relacionadas

## Enums

| Enum | Valores |
|---|---|
| `PetSpecies` | `dog`, `cat`, `rabbit`, `bird`, `other` |
| `PetSize` | `small`, `medium`, `large` |
| `PetStatus` | `available`, `adopted`, `reserved`, `medical`, `temporary` |

## Flujo de Vida

```
Creación → Disponible (available)
                  ↓
        Alguien se postula
                  ↓
        Reservado (reserved)
                  ↓
        Adoptado (adopted)
                  ↓
        Seguimientos programados
```

## Endpoints

### Admin (`/admin/mascotas`)
| Método | Ruta | Controlador |
|---|---|---|
| GET | `/admin/mascotas` | `Admin\PetController@index` |
| GET | `/admin/mascotas/crear` | `Admin\PetController@create` |
| POST | `/admin/mascotas` | `Admin\PetController@store` |
| GET | `/admin/mascotas/{id}` | `Admin\PetController@show` |
| GET | `/admin/mascotas/{id}/editar` | `Admin\PetController@edit` |
| PUT | `/admin/mascotas/{id}` | `Admin\PetController@update` |
| DELETE | `/admin/mascotas/{id}` | `Admin\PetController@destroy` |

### Dashboard por Org (`/{team}/mascotas`)
Mismas rutas, controlador `Teams\PetController`.

### Público (`/mascotas`)
| GET | `/mascotas` | `Public\PetController@index` (con filtros) |
| GET | `/mascotas/{slug}` | `Public\PetController@show` |

## Características

### Admin Index
- Búsqueda textual (nombre, raza, color)
- Filtros: especie, estado, organización
- Stats: por estado, por especie, por organización
- Vista de cards con emoji de especie, nombre, badge de estado, organización, fechas
- Paginación

### Admin Create/Edit
- Formulario en secciones con gradient cards
- Foto: subida desde archivo o URL (descarga automática via HTTP)
- Previsualización de imagen
- Selectores para especie, tamaño, género, estado

### Admin Show
- Header con emoji + nombre + badge
- Galería de fotos
- Detalles en sidebar (organización, especie, raza, edad, color, género, tamaño, estado médico)
- Adopciones relacionadas (si fue adoptado)

### Público
- Catálogo con filtros (especie, tamaño, género, edad, ubicación)
- Grid responsivo de cards
- Detalle con galería, información completa y botón "Postularme"
