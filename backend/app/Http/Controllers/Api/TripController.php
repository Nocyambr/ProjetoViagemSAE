<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Services\SesiLocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TripController extends Controller
{
    private const STATUSES = ['planned', 'boarding', 'transit', 'arrived', 'returning', 'finished'];

    public function __construct(private readonly SesiLocationService $sesiLocation)
    {
    }

    public function sesiCerquilho(): JsonResponse
    {
        return response()->json([
            'location' => $this->sesiLocation->currentOrigin(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    public function index(): JsonResponse
    {
        $trips = Trip::query()
            ->orderBy('date')
            ->orderBy('departure')
            ->orderBy('title')
            ->get()
            ->map(fn (Trip $trip) => $trip->toApiArray());

        return response()->json(['trips' => $trips]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateTripPayload($request);
        $origin = $this->sesiLocation->currentOrigin();
        $now = now();

        $trip = Trip::create([
            'id' => $request->input('id') && is_string($request->input('id')) ? Str::limit(trim($request->input('id')), 64, '') : (string) Str::uuid(),
            'title' => trim($data['title']),
            'destination' => trim((string) ($data['destination'] ?? '')),
            'date' => $data['date'],
            'departure' => $data['departure'],
            'arrival' => $data['arrival'],
            'bus_name' => trim((string) ($data['busName'] ?? '')) ?: 'Ônibus fretado',
            'teacher_name' => trim((string) ($data['teacherName'] ?? '')) ?: 'Ricardo',
            'teacher_contact' => trim((string) ($data['teacherContact'] ?? '')),
            'teacher_photo' => trim((string) ($data['teacherPhoto'] ?? '')) ?: '/images/teachers/prof-ricardo.jpg',
            'status' => 'planned',
            'started_at' => null,
            'location_label' => $origin['label'],
            'location_address' => $origin['address'],
            'location_lat' => $origin['lat'],
            'location_lng' => $origin['lng'],
            'location_progress' => 0,
            'location_updated_at' => $now,
        ]);

        return response()->json(['trip' => $trip->toApiArray()], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $trip = Trip::findOrFail($id);
        $data = $this->validateTripPayload($request);

        $trip->update([
            'title' => trim($data['title']),
            'destination' => trim((string) ($data['destination'] ?? '')),
            'date' => $data['date'],
            'departure' => $data['departure'],
            'arrival' => $data['arrival'],
            'bus_name' => trim((string) ($data['busName'] ?? '')) ?: 'Ônibus fretado',
            'teacher_name' => trim((string) ($data['teacherName'] ?? '')) ?: 'Ricardo',
            'teacher_contact' => trim((string) ($data['teacherContact'] ?? '')),
            'teacher_photo' => trim((string) ($data['teacherPhoto'] ?? '')) ?: $trip->teacher_photo,
        ]);

        return response()->json(['trip' => $trip->fresh()->toApiArray()]);
    }

    public function start(string $id): JsonResponse
    {
        $trip = Trip::findOrFail($id);
        $origin = $this->sesiLocation->currentOrigin();
        $now = now();

        $trip->update([
            'status' => 'transit',
            'started_at' => $trip->started_at ?? $now,
            'location_label' => $origin['label'],
            'location_address' => $origin['address'],
            'location_lat' => $origin['lat'],
            'location_lng' => $origin['lng'],
            'location_updated_at' => $now,
        ]);

        return response()->json([
            'trip' => $trip->fresh()->toApiArray(),
            'origin' => $origin,
        ]);
    }

    public function location(string $id): JsonResponse
    {
        $trip = Trip::findOrFail($id);

        // Impede consulta antes do professor iniciar a viagem
        if ($trip->started_at === null && $trip->status === 'planned') {
            return response()->json([
                'started' => false,
                'message' => 'A viagem ainda não foi iniciada pelo professor.',
            ], 423);
        }

        $origin = $this->sesiLocation->currentOrigin();

        return response()->json([
            'started' => true,
            'tripId' => $trip->id,
            'title' => $trip->title,
            'destination' => $trip->destination,
            'status' => $trip->status,
            'startedAt' => $trip->started_at?->toIso8601String(),
            'origin' => $origin,
            'currentLocation' => [
                'label' => $trip->location_label,
                'address' => $trip->location_address,
                'lat' => $trip->location_lat,
                'lng' => $trip->location_lng,
                'progress' => $trip->location_progress,
                'updatedAt' => ($trip->location_updated_at ?? $trip->updated_at ?? now())->toIso8601String(),
            ],
        ]);
    }

    public function updateLocation(Request $request, string $id): JsonResponse
    {
        $trip = Trip::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(self::STATUSES)],
            'busName' => ['nullable', 'string', 'max:100'],
            'label' => ['required', 'string', 'max:200'],
            'address' => ['nullable', 'string', 'max:240'],
            'lat' => ['nullable', 'string', 'max:32'],
            'lng' => ['nullable', 'string', 'max:32'],
            'progress' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        $now = now();
        $startedAt = $trip->started_at;
        if ($validated['status'] !== 'planned' && $startedAt === null) {
            $startedAt = $now;
        }

        $trip->update([
            'status' => $validated['status'],
            'started_at' => $startedAt,
            'bus_name' => trim((string) ($validated['busName'] ?? '')) ?: $trip->bus_name,
            'location_label' => trim($validated['label']),
            'location_address' => trim((string) ($validated['address'] ?? '')) ?: $trip->location_address,
            'location_lat' => trim((string) ($validated['lat'] ?? '')),
            'location_lng' => trim((string) ($validated['lng'] ?? '')),
            'location_progress' => $validated['progress'],
            'location_updated_at' => $now,
        ]);

        return response()->json(['trip' => $trip->fresh()->toApiArray()]);
    }

    public function destroy(string $id): JsonResponse
    {
        $trip = Trip::findOrFail($id);
        $trip->delete();

        return response()->json(['deleted' => true]);
    }

    private function validateTripPayload(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'destination' => ['nullable', 'string', 'max:120'],
            'date' => ['required', 'date_format:Y-m-d'],
            'departure' => ['required', 'date_format:H:i'],
            'arrival' => ['required', 'date_format:H:i', 'after:departure'],
            'busName' => ['nullable', 'string', 'max:100'],
            'teacherName' => ['nullable', 'string', 'max:100'],
            'teacherContact' => ['nullable', 'string', 'max:100'],
            'teacherPhoto' => ['nullable', 'string', 'max:255'],
        ], [
            'arrival.after' => 'A chegada deve ser posterior à saída no mesmo dia.',
        ]);
    }
}
