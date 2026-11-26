<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'destination',
        'date',
        'departure',
        'arrival',
        'bus_name',
        'teacher_name',
        'teacher_contact',
        'teacher_photo',
        'status',
        'started_at',
        'location_label',
        'location_address',
        'location_lat',
        'location_lng',
        'location_progress',
        'location_updated_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'location_updated_at' => 'datetime',
            'location_progress' => 'integer',
        ];
    }

    public function toApiArray(): array
    {
        $started = $this->started_at !== null || $this->status !== 'planned';

        return [
            'id' => $this->id,
            'title' => $this->title,
            'destination' => $this->destination,
            'date' => $this->date,
            'departure' => $this->departure,
            'arrival' => $this->arrival,
            'busName' => $this->bus_name,
            'teacherName' => $this->teacher_name,
            'teacherContact' => $this->teacher_contact,
            'teacherPhoto' => $this->teacher_photo ?: '/images/teachers/prof-ricardo.jpg',
            'status' => $this->status,
            'started' => $started,
            'startedAt' => $this->started_at?->toIso8601String(),
            'busLocation' => [
                'label' => $this->location_label,
                'address' => $this->location_address,
                'lat' => $this->location_lat,
                'lng' => $this->location_lng,
                'progress' => $this->location_progress,
                'updatedAt' => ($this->location_updated_at ?? $this->updated_at ?? now())->toIso8601String(),
            ],
        ];
    }
}
