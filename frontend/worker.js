import { DurableObject } from 'cloudflare:workers';

const SESI_CERQUILHO = {
  name: 'SESI Cerquilho - SP',
  unit: 'CE 428',
  label: 'SESI Cerquilho - SP (Rua Antônio Modanez, 111 - Residencial São Francisco)',
  address: 'Rua Antônio Modanez, 111 - Residencial São Francisco, Cerquilho - SP, CEP 18527-372',
  city: 'Cerquilho',
  state: 'SP',
  cep: '18527-372',
  lat: '-23.16345',
  lng: '-47.76580',
  source: 'api-sesi-cerquilho',
};

const STATUSES = new Set(['planned', 'boarding', 'transit', 'arrived', 'returning', 'finished']);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...CORS_HEADERS,
    },
  });
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function validateTripPayload(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'Dados da viagem inválidos.' };
  }
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) return { error: 'Informe o nome da viagem.' };
  if (title.length > 100) return { error: 'O nome deve ter até 100 caracteres.' };
  if (!validDate(body.date)) return { error: 'Informe uma data válida.' };
  if (!validTime(body.departure) || !validTime(body.arrival)) return { error: 'Informe horários válidos.' };
  if (body.arrival <= body.departure) return { error: 'A chegada deve ser posterior à saída no mesmo dia.' };

  return {
    data: {
      id: typeof body.id === 'string' && body.id.trim() ? body.id.trim().slice(0, 64) : crypto.randomUUID(),
      title,
      destination: typeof body.destination === 'string' ? body.destination.trim().slice(0, 120) : '',
      date: body.date,
      departure: body.departure,
      arrival: body.arrival,
      busName: (typeof body.busName === 'string' ? body.busName.trim().slice(0, 100) : '') || 'Ônibus fretado',
      teacherName: (typeof body.teacherName === 'string' ? body.teacherName.trim().slice(0, 100) : '') || 'Ricardo',
      teacherContact: typeof body.teacherContact === 'string' ? body.teacherContact.trim().slice(0, 100) : '',
      teacherPhoto:
        (typeof body.teacherPhoto === 'string' ? body.teacherPhoto.trim().slice(0, 255) : '') ||
        '/images/teachers/prof-ricardo.jpg',
    },
  };
}

function rowToApiTrip(row) {
  const started = Boolean(row.started_at !== null || row.status !== 'planned');
  return {
    id: row.id,
    title: row.title,
    destination: row.destination || '',
    date: row.date,
    departure: row.departure,
    arrival: row.arrival,
    busName: row.bus_name || 'Ônibus fretado',
    teacherName: row.teacher_name || 'Ricardo',
    teacherContact: row.teacher_contact || '',
    teacherPhoto: row.teacher_photo || '/images/teachers/prof-ricardo.jpg',
    status: row.status || 'planned',
    started,
    startedAt: row.started_at || null,
    busLocation: {
      label: row.location_label || SESI_CERQUILHO.label,
      address: row.location_address || SESI_CERQUILHO.address,
      lat: row.location_lat || SESI_CERQUILHO.lat,
      lng: row.location_lng || SESI_CERQUILHO.lng,
      progress: Number(row.location_progress) || 0,
      updatedAt: row.location_updated_at || new Date().toISOString(),
    },
  };
}

export class TripStore extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        destination TEXT NOT NULL DEFAULT '',
        date TEXT NOT NULL,
        departure TEXT NOT NULL,
        arrival TEXT NOT NULL,
        bus_name TEXT NOT NULL DEFAULT 'Ônibus fretado',
        teacher_name TEXT NOT NULL DEFAULT 'Ricardo',
        teacher_contact TEXT NOT NULL DEFAULT '',
        teacher_photo TEXT NOT NULL DEFAULT '/images/teachers/prof-ricardo.jpg',
        status TEXT NOT NULL DEFAULT 'planned',
        started_at TEXT,
        location_label TEXT NOT NULL,
        location_address TEXT NOT NULL,
        location_lat TEXT NOT NULL,
        location_lng TEXT NOT NULL,
        location_progress INTEGER NOT NULL DEFAULT 0,
        location_updated_at TEXT NOT NULL
      )
    `);
  }

  listTrips() {
    const rows = this.sql
      .exec('SELECT * FROM trips ORDER BY date ASC, departure ASC, title ASC')
      .toArray();
    return rows.map(rowToApiTrip);
  }

  getRow(id) {
    return this.sql.exec('SELECT * FROM trips WHERE id = ?', id).toArray()[0] || null;
  }

  createTrip(data) {
    const now = new Date().toISOString();
    this.sql.exec(
      `INSERT OR REPLACE INTO trips (
        id, title, destination, date, departure, arrival,
        bus_name, teacher_name, teacher_contact, teacher_photo,
        status, started_at, location_label, location_address,
        location_lat, location_lng, location_progress, location_updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planned', NULL, ?, ?, ?, ?, 0, ?)`,
      data.id,
      data.title,
      data.destination,
      data.date,
      data.departure,
      data.arrival,
      data.busName,
      data.teacherName,
      data.teacherContact,
      data.teacherPhoto,
      SESI_CERQUILHO.label,
      SESI_CERQUILHO.address,
      SESI_CERQUILHO.lat,
      SESI_CERQUILHO.lng,
      now,
    );
    return rowToApiTrip(this.getRow(data.id));
  }

  updateTrip(id, data) {
    const current = this.getRow(id);
    if (!current) return null;
    this.sql.exec(
      `UPDATE trips SET
        title = ?, destination = ?, date = ?, departure = ?, arrival = ?,
        bus_name = ?, teacher_name = ?, teacher_contact = ?, teacher_photo = ?
       WHERE id = ?`,
      data.title,
      data.destination,
      data.date,
      data.departure,
      data.arrival,
      data.busName,
      data.teacherName,
      data.teacherContact,
      data.teacherPhoto || current.teacher_photo,
      id,
    );
    return rowToApiTrip(this.getRow(id));
  }

  startTrip(id) {
    const current = this.getRow(id);
    if (!current) return null;
    const now = new Date().toISOString();
    const startedAt = current.started_at || now;
    this.sql.exec(
      `UPDATE trips SET
        status = 'transit',
        started_at = ?,
        location_label = ?,
        location_address = ?,
        location_lat = ?,
        location_lng = ?,
        location_updated_at = ?
       WHERE id = ?`,
      startedAt,
      SESI_CERQUILHO.label,
      SESI_CERQUILHO.address,
      SESI_CERQUILHO.lat,
      SESI_CERQUILHO.lng,
      now,
      id,
    );
    return rowToApiTrip(this.getRow(id));
  }

  getTripLocation(id) {
    const current = this.getRow(id);
    if (!current) return { notFound: true };
    if (current.started_at === null && current.status === 'planned') {
      return {
        locked: true,
        payload: {
          started: false,
          message: 'A viagem ainda não foi iniciada pelo professor.',
        },
      };
    }
    return {
      payload: {
        started: true,
        tripId: current.id,
        title: current.title,
        destination: current.destination,
        status: current.status,
        startedAt: current.started_at,
        origin: SESI_CERQUILHO,
        currentLocation: {
          label: current.location_label,
          address: current.location_address,
          lat: current.location_lat,
          lng: current.location_lng,
          progress: Number(current.location_progress) || 0,
          updatedAt: current.location_updated_at,
        },
      },
    };
  }

  updateTripLocation(id, payload) {
    const current = this.getRow(id);
    if (!current) return { notFound: true };
    const status = typeof payload?.status === 'string' && STATUSES.has(payload.status) ? payload.status : null;
    const label = typeof payload?.label === 'string' ? payload.label.trim().slice(0, 200) : '';
    const progressNum = Number(payload?.progress);
    if (!status || !label || !Number.isFinite(progressNum)) {
      return { error: 'Informe o status, ponto de referência e progresso válidos.' };
    }
    const progress = Math.min(100, Math.max(0, Math.round(progressNum)));
    const now = new Date().toISOString();
    const startedAt = current.started_at || (status !== 'planned' ? now : null);
    const busName =
      typeof payload.busName === 'string' && payload.busName.trim()
        ? payload.busName.trim().slice(0, 100)
        : current.bus_name;
    const address =
      typeof payload.address === 'string' && payload.address.trim()
        ? payload.address.trim().slice(0, 240)
        : current.location_address;
    const lat = typeof payload.lat === 'string' ? payload.lat.trim().slice(0, 32) : current.location_lat;
    const lng = typeof payload.lng === 'string' ? payload.lng.trim().slice(0, 32) : current.location_lng;

    this.sql.exec(
      `UPDATE trips SET
        status = ?, started_at = ?, bus_name = ?,
        location_label = ?, location_address = ?, location_lat = ?, location_lng = ?,
        location_progress = ?, location_updated_at = ?
       WHERE id = ?`,
      status,
      startedAt,
      busName,
      label,
      address,
      lat,
      lng,
      progress,
      now,
      id,
    );
    return { trip: rowToApiTrip(this.getRow(id)) };
  }

  deleteTrip(id) {
    const current = this.getRow(id);
    if (!current) return false;
    this.sql.exec('DELETE FROM trips WHERE id = ?', id);
    return true;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      }

      if (pathname === '/api/location/sesi-cerquilho' && request.method === 'GET') {
        return json({
          location: SESI_CERQUILHO,
          timestamp: new Date().toISOString(),
        });
      }

      const store = env.TRIP_STORE.get(env.TRIP_STORE.idFromName('global-trips'));

      if (pathname === '/api/trips' && request.method === 'GET') {
        const trips = await store.listTrips();
        return json({ trips });
      }

      if (pathname === '/api/trips' && request.method === 'POST') {
        let body = null;
        try {
          body = await request.json();
        } catch {
          return json({ message: 'JSON inválido.' }, 400);
        }
        const validated = validateTripPayload(body);
        if (validated.error) {
          return json({ message: validated.error }, 422);
        }
        const trip = await store.createTrip(validated.data);
        return json({ trip }, 201);
      }

      const tripMatch = pathname.match(/^\/api\/trips\/([^/]+)$/);
      if (tripMatch) {
        const tripId = decodeURIComponent(tripMatch[1]);
        if (request.method === 'PATCH') {
          let body = null;
          try {
            body = await request.json();
          } catch {
            return json({ message: 'JSON inválido.' }, 400);
          }
          const validated = validateTripPayload(body);
          if (validated.error) {
            return json({ message: validated.error }, 422);
          }
          const trip = await store.updateTrip(tripId, validated.data);
          if (!trip) return json({ message: 'Viagem não encontrada.' }, 404);
          return json({ trip });
        }

        if (request.method === 'DELETE') {
          const deleted = await store.deleteTrip(tripId);
          if (!deleted) return json({ message: 'Viagem não encontrada.' }, 404);
          return json({ deleted: true });
        }
      }

      const startMatch = pathname.match(/^\/api\/trips\/([^/]+)\/start$/);
      if (startMatch && request.method === 'POST') {
        const tripId = decodeURIComponent(startMatch[1]);
        const trip = await store.startTrip(tripId);
        if (!trip) return json({ message: 'Viagem não encontrada.' }, 404);
        return json({ trip, origin: SESI_CERQUILHO });
      }

      const locMatch = pathname.match(/^\/api\/trips\/([^/]+)\/location$/);
      if (locMatch) {
        const tripId = decodeURIComponent(locMatch[1]);
        if (request.method === 'GET') {
          const res = await store.getTripLocation(tripId);
          if (res.notFound) return json({ message: 'Viagem não encontrada.' }, 404);
          if (res.locked) return json(res.payload, 423);
          return json(res.payload);
        }
        if (request.method === 'PATCH') {
          let body = null;
          try {
            body = await request.json();
          } catch {
            return json({ message: 'JSON inválido.' }, 400);
          }
          const res = await store.updateTripLocation(tripId, body);
          if (res.notFound) return json({ message: 'Viagem não encontrada.' }, 404);
          if (res.error) return json({ message: res.error }, 422);
          return json({ trip: res.trip });
        }
      }

      return json({ message: 'Rota não encontrada.' }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};
