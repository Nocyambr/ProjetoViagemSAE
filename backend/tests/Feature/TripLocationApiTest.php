<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TripLocationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_sesi_cerquilho_endpoint_returns_integrated_location(): void
    {
        $response = $this->getJson('/api/location/sesi-cerquilho');

        $response->assertOk()
            ->assertJsonPath('location.name', 'SESI Cerquilho - SP')
            ->assertJsonPath('location.city', 'Cerquilho')
            ->assertJsonPath('location.state', 'SP')
            ->assertJsonPath('location.lat', '-23.16345')
            ->assertJsonPath('location.lng', '-47.76580');
    }

    public function test_location_requires_trip_started_by_teacher_and_integrates_sesi_cerquilho(): void
    {
        $this->getJson('/api/trips')
            ->assertOk()
            ->assertJsonPath('trips', []);

        $created = $this->postJson('/api/trips', [
            'title' => 'Excursão 3ºB',
            'destination' => 'Museu Catavento',
            'date' => '2026-11-28',
            'departure' => '08:00',
            'arrival' => '17:00',
            'busName' => 'Ônibus 01',
            'teacherName' => 'Prof. Carlos',
        ]);

        $created->assertCreated()
            ->assertJsonPath('trip.started', false)
            ->assertJsonPath('trip.status', 'planned');

        $tripId = $created->json('trip.id');

        // Locked before the teacher starts the trip
        $this->getJson("/api/trips/{$tripId}/location")
            ->assertStatus(423)
            ->assertJsonPath('started', false);

        // Teacher starts the trip
        $this->postJson("/api/trips/{$tripId}/start")
            ->assertOk()
            ->assertJsonPath('trip.started', true)
            ->assertJsonPath('trip.status', 'transit')
            ->assertJsonPath('origin.name', 'SESI Cerquilho - SP');

        // Clicking the started trip returns SESI Cerquilho-SP location from API
        $this->getJson("/api/trips/{$tripId}/location")
            ->assertOk()
            ->assertJsonPath('started', true)
            ->assertJsonPath('origin.name', 'SESI Cerquilho - SP')
            ->assertJsonPath('currentLocation.lat', '-23.16345')
            ->assertJsonPath('currentLocation.lng', '-47.76580');

        // Teacher updates bus location along the route
        $this->patchJson("/api/trips/{$tripId}/location", [
            'status' => 'transit',
            'busName' => 'Ônibus 01',
            'label' => 'Rodovia Castelo Branco, km 72',
            'lat' => '-23.45000',
            'lng' => '-47.42000',
            'progress' => 55,
        ])->assertOk()
            ->assertJsonPath('trip.busLocation.label', 'Rodovia Castelo Branco, km 72')
            ->assertJsonPath('trip.busLocation.progress', 55);

        $this->deleteJson("/api/trips/{$tripId}")
            ->assertOk()
            ->assertJsonPath('deleted', true);

        $this->getJson('/api/trips')
            ->assertOk()
            ->assertJsonPath('trips', []);
    }
}
