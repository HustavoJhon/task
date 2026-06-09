# Servicios

## PetService

**Archivo:** `app/Services/PetService.php`

Encapsula la lógica de negocio para el catálogo público de mascotas.

### Métodos

```php
class PetService
{
    // Obtener mascotas con filtros para el catálogo público
    public function getAvailablePets(array $filters = []): LengthAwarePaginator
    
    // Obtener detalle de una mascota por slug
    public function getPetBySlug(string $slug): ?Pet
    
    // Obtener especies disponibles (para filtros)
    public function getAvailableSpecies(): array
    
    // Obtener ubicaciones disponibles (para filtros por ciudad)
    public function getAvailableLocations(): array
}
```

### Filtros soportados

| Filtro | Valores |
|---|---|
| `species` | `dog`, `cat`, `rabbit`, `bird`, `other` |
| `size` | `small`, `medium`, `large` |
| `gender` | `male`, `female` |
| `age` | `baby` (0-1), `young` (1-3), `adult` (3-8), `senior` (8+) |
| `location` | Ciudad de la organización |
| `search` | Texto libre (nombre, raza) |

## CheckOverdueMilestonesJob

**Archivo:** `app/Jobs/CheckOverdueMilestonesJob.php`

Job programado que se ejecuta diariamente.

```php
class CheckOverdueMilestonesJob implements ShouldQueue
{
    public function handle(): void
    {
        // Encuentra seguimientos con scheduled_date < hoy y status = pending
        // Los marca como status = missed
    }
}
```

Programado en `routes/console.php`:
```php
Schedule::job(new CheckOverdueMilestonesJob)->daily();
```
