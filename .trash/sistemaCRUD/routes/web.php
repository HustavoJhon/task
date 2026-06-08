<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmpleadoController;

Route::get('/', function () {
    return view('welcome');
});
/*Route::get('/empleados', function () {
    return view('empleado.index');
});
//estoy usando la funcion create de la clase EmpleadoController 
//Route::get('/empleado/create', [EmpleadoController::class, 'create'])->name('empleado.create');*/
Route::resource('empleado', EmpleadoController::class);