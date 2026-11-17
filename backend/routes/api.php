<?php

use App\Http\Controllers\Api\TripController;
use Illuminate\Support\Facades\Route;

Route::get('/location/sesi-cerquilho', [TripController::class, 'sesiCerquilho']);

Route::get('/trips', [TripController::class, 'index']);
Route::post('/trips', [TripController::class, 'store']);
Route::patch('/trips/{id}', [TripController::class, 'update']);
Route::post('/trips/{id}/start', [TripController::class, 'start']);
Route::get('/trips/{id}/location', [TripController::class, 'location']);
Route::patch('/trips/{id}/location', [TripController::class, 'updateLocation']);
Route::delete('/trips/{id}', [TripController::class, 'destroy']);
