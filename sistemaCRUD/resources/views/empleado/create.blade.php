<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Creación de nuevos registros de Empleados</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light"> <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                
                <h1 class="text-center mb-4">Registrar Nuevo Empleado</h1>

                <div class="card shadow-sm">
                    <div class="card-body p-4">
                        
                        <form action="{{ url('/empleado') }}" method="POST" enctype="multipart/form-data">
                            @csrf
                            
                            <div class="mb-3">
                                <label for="Nombre" class="form-label fw-bold">Nombre:</label>
                                <input type="text" class="form-control" id="Nombre" name="Nombre">
                            </div>
                            
                            <div class="mb-3">
                                <label for="ApellidoPaterno" class="form-label fw-bold">Apellido Paterno:</label>
                                <input type="text" class="form-control" id="ApellidoPaterno" name="ApellidoPaterno">
                            </div>
                            
                            <div class="mb-3">
                                <label for="ApellidoMaterno" class="form-label fw-bold">Apellido Materno:</label>      
                                <input type="text" class="form-control" id="ApellidoMaterno" name="ApellidoMaterno">
                            </div>
                            
                            <div class="mb-3">
                                <label for="Correo" class="form-label fw-bold">Correo:</label>
                                <input type="email" class="form-control" id="Correo" name="Correo">
                            </div>
                            
                            <div class="mb-4">
                                <label for="Foto" class="form-label fw-bold">Foto:</label>
                                <input type="file" class="form-control" id="Foto" name="Foto">
                            </div>
                            
                            <div class="d-flex justify-content-between">
                                <a href="{{ url('/empleado') }}" class="btn btn-secondary">Regresar</a>
                                <input type="submit" class="btn btn-success" value="Registrar datos">
                            </div>
                            
                        </form>

                    </div>
                </div>

            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>