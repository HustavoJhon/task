<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use Illuminate\Http\Request;

class EmpleadoController extends Controller
{
   public function index()
{
    // Mostrar todos los empleados de la base de datos
    $datos['empleados'] = Empleado::paginate(5);

    return view('empleado.index', $datos);
}

    public function create()
    {
        return view('empleado.create');
    }

    public function form()
    {
        return view('empleado.form');
    }

    public function store(Request $request)
    {
        //recuperar datos de empleaod
        $datosEmpleado = request()->except('_token');
        //consultar si existe la foto   
        if ($request->hasFile('Foto')) {
            //Estamos cambiando la direccion .tmp a la dirección real de la foto 
            $datosEmpleado['Foto'] = $request->file('Foto')->store('uploads', 'public');
        }
        //alamecen de los datos del empleado
        Empleado::insert($datosEmpleado);
        //mostrarndo los datos en formato json
        return response()->json($datosEmpleado);
    }

    public function show(Empleado $empleado)
    {
        //
    }

    public function edit(Empleado $empleado)
    {
        
        return view('empleado.edit', compact('empleado'));
    }

  public function update(Request $request, Empleado $empleado)
        {
            // 1. Recolectamos datos quitando tokens
            $datosEmpleado = $request->except(['_token', '_method']);
            // 2. Control de la foto por si suben una nueva
            if ($request->hasFile('Foto')) {
                if ($empleado->Foto) {
                    \Storage::delete('public/' . $empleado->Foto);
                }
                $datosEmpleado['Foto'] = $request->file('Foto')->store('uploads', 'public');
            }

            // 3. Modifica los datos de forma efectiva en la base de datos
            $empleado->update($datosEmpleado);

            // 4. TE DEVUELVE AL INDEX enviando la alerta
            return redirect('empleado')->with('mensaje', 'Datos actualizados correctamente');
        }
  public function destroy($id)
    {
    // Eliminar el registro por ID
    Empleado::destroy($id);

    return redirect('empleado');
    }   
}