import { Router, Request, Response } from 'express';
import { decodePolyline } from '../utils/polyline';

export const directionsRouter = Router();

const GOOGLE_API_BASE = 'https://maps.googleapis.com/maps/api/directions/json';

// Strip HTML tags from Google's step instructions
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

/**
 * GET /api/directions
 * Query params:
 *   origin_lat, origin_lng   — parent position
 *   dest_lat, dest_lng       — child position
 *   mode                     — "driving" | "walking"
 *   language                 — "fr" (default)
 */
directionsRouter.get('/', async (req: Request, res: Response) => {
  const { origin_lat, origin_lng, dest_lat, dest_lng, mode = 'driving', language = 'fr' } = req.query;

  if (!origin_lat || !origin_lng || !dest_lat || !dest_lng) {
    res.status(400).json({ success: false, error: 'Coordonnées manquantes.' });
    return;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    res.status(503).json({ success: false, error: 'Clé Google Maps non configurée.' });
    return;
  }

  const url = new URL(GOOGLE_API_BASE);
  url.searchParams.set('origin', `${origin_lat},${origin_lng}`);
  url.searchParams.set('destination', `${dest_lat},${dest_lng}`);
  url.searchParams.set('mode', mode as string);
  url.searchParams.set('language', language as string);
  url.searchParams.set('units', 'metric');
  url.searchParams.set('key', apiKey);

  try {
    const googleRes = await fetch(url.toString());
    if (!googleRes.ok) {
      res.status(502).json({ success: false, error: 'Erreur Google Maps.' });
      return;
    }

    const data = await googleRes.json() as any;

    if (data.status !== 'OK' || !data.routes?.length) {
      res.status(404).json({
        success: false,
        error: data.status === 'ZERO_RESULTS'
          ? 'Aucun itinéraire trouvé entre ces deux points.'
          : `Google Maps: ${data.status}`,
      });
      return;
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // Overview polyline (full route shape)
    const overviewPoints = decodePolyline(route.overview_polyline.points);

    // Step-by-step instructions
    const steps = leg.steps.map((step: any) => ({
      instruction: stripHtml(step.html_instructions),
      distanceText: step.distance.text,
      distanceValue: step.distance.value,
      durationText: step.duration.text,
      maneuver: step.maneuver ?? '',
      startLocation: {
        latitude: step.start_location.lat,
        longitude: step.start_location.lng,
      },
    }));

    res.json({
      success: true,
      data: {
        mode,
        distanceText: leg.distance.text,
        distanceValue: leg.distance.value,   // meters
        durationText: leg.duration.text,
        durationValue: leg.duration.value,   // seconds
        durationInTrafficText: leg.duration_in_traffic?.text,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        overviewPolyline: overviewPoints,
        steps,
        bounds: {
          northeast: {
            latitude: route.bounds.northeast.lat,
            longitude: route.bounds.northeast.lng,
          },
          southwest: {
            latitude: route.bounds.southwest.lat,
            longitude: route.bounds.southwest.lng,
          },
        },
        copyrights: route.copyrights,
      },
    });
  } catch (err) {
    console.error('Directions error:', err);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur.' });
  }
});
