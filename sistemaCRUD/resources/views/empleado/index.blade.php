<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Página principal del CRUD Empleados</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    @if(Session::has('mensaje'))
    <script>
        alert("{{ Session::get('mensaje') }}");
    </script>
    @endif

    <div class="container mt-5">
        
        <h1 class="text-center mb-4">Lista de Empleados</h1>


        <div class="table-responsive">
            <table class="table table-striped table-hover table-bordered align-middle text-center">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Foto</th>
                        <th>Nombres</th>
                        <th>Apellido Paterno</th>
                        <th>Apellido Materno</th>
                        <th>Correo</th>
                        <th>Editar/Eliminar</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($empleados as $empleado)
                    <tr>
                        <td>{{$empleado->id}}</td>
                        <td>
                            <img src="{{ asset('storage').'/'.$empleado->Foto }}" alt="Foto del empleado" class="img-thumbnail" width="70">
                        </td>
                        <td>{{$empleado->Nombre}}</td>
                        <td>{{$empleado->ApellidoPaterno}}</td>
                        <td>{{$empleado->ApellidoMaterno}}</td>
                        <td>{{$empleado->Correo}}</td>
                        <td>
                            <div class="d-flex justify-content-center gap-2">
                                
                                <a href="{{ url('/empleado/'.$empleado->id.'/edit') }}" class="btn btn-warning btn-sm">
                                    Editar
                                </a>

                                <form action="{{ url('/empleado/'.$empleado->id) }}" method="post" class="d-inline">
                                    @csrf
                                    @method('DELETE')
                                    <input 
                                        type="submit" 
                                        class="btn btn-danger btn-sm"
                                        value="Eliminar"
                                        onclick="return confirm('¿Deseas eliminar este empleado?')"
                                    >
                                </form>

                            </div>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
             <div class="d-flex justify-content-end mb-3">
            <a href="{{ url('empleado/create') }}" class="btn btn-success">Registrar nuevo empleado</a>
        </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>