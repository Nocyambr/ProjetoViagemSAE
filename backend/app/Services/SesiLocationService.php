<?php

namespace App\Services;

/**
 * Provides the integrated current origin location for SESI Cerquilho - SP.
 */
class SesiLocationService
{
    public const UNIT_NAME = 'SESI Cerquilho - SP';
    public const UNIT_CODE = 'CE 428';
    public const STREET_ADDRESS = 'Rua Antônio Modanez, 111 - Residencial São Francisco';
    public const CITY = 'Cerquilho';
    public const STATE = 'SP';
    public const CEP = '18527-372';
    public const LAT = '-23.16345';
    public const LNG = '-47.76580';

    /**
     * Returns the canonical SESI Cerquilho-SP geolocation payload.
     */
    public function currentOrigin(): array
    {
        return [
            'name' => self::UNIT_NAME,
            'unit' => self::UNIT_CODE,
            'label' => self::UNIT_NAME.' ('.self::STREET_ADDRESS.')',
            'address' => self::STREET_ADDRESS.', '.self::CITY.' - '.self::STATE.', CEP '.self::CEP,
            'city' => self::CITY,
            'state' => self::STATE,
            'cep' => self::CEP,
            'lat' => self::LAT,
            'lng' => self::LNG,
            'source' => 'api-sesi-cerquilho',
        ];
    }
}
