<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edición de empleado</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

    <div class="container mt-5" style="max-width: 600px;">
        
        <h1 class="text-center mb-4">Editar Datos del Empleado</h1>

        <form action="{{ url('/empleado/' . $empleado->id) }}" method="post" enctype="multipart/form-data" class="bg-white p-4 border rounded shadow-sm">
            @csrf
            {{ method_field('PATCH') }}

            <div class="mb-3">
                <label for="Nombre" class="form-label fw-bold">Nombre</label>
                <input type="text" class="form-control" name="Nombre" value="{{ isset($empleado->Nombre) ? $empleado->Nombre : '' }}" id="Nombre">
            </div>

            <div class="mb-3">
                <label for="ApellidoPaterno" class="form-label fw-bold">Apellido Paterno</label>
                <input type="text" class="form-control" name="ApellidoPaterno" value="{{ isset($empleado->ApellidoPaterno) ? $empleado->ApellidoPaterno : '' }}" id="ApellidoPaterno">
            </div>

            <div class="mb-3">
                <label for="ApellidoMaterno" class="form-label fw-bold">Apellido Materno</label>
                <input type="text" class="form-control" name="ApellidoMaterno" value="{{ isset($empleado->ApellidoMaterno) ? $empleado->ApellidoMaterno : '' }}" id="ApellidoMaterno">
            </div>

            <div class="mb-3">
                <label for="Correo" class="form-label fw-bold">Correo</label>
                <input type="email" class="form-control" name="Correo" value="{{ isset($empleado->Correo) ? $empleado->Correo : '' }}" id="Correo">
            </div>

            <div class="mb-4">
                <label for="Foto" class="form-label fw-bold">Foto</label>
                @if(isset($empleado->Foto))
                    <div class="mb-2">
                        <img src="{{ asset('storage').'/'.$empleado->Foto }}" alt="Foto actual" class="img-thumbnail" width="100">
                    </div>
                @endif
                <input type="file" class="form-control" name="Foto" id="Foto">
            </div>

            <div class="d-flex justify-content-end">
                <input type="submit" class="btn btn-warning px-4" value="Modificar datos">
            </div>
            
        </form>

    </div>

</body>
</html>