/**
 * Weather context.
 *
 * Open-Meteo needs no API key, which removes one live dependency from the demo
 * entirely. If it is slow or unreachable we fall back to a climate table keyed
 * by city and month — clearly flagged with `isFallback`, so the UI can be
 * honest and the recommendation flow still completes.
 */

import { bandFromTemperature } from "./engine/taxonomy";
import { KNOWN_CITIES } from "./engine/intent";

const OPEN_METEO = "https://api.open-meteo.com/v1/forecast";
const TIMEOUT_MS = 4_000;

export type WeatherContext = {
  city: string;
  country?: string;
  temperatureC: number;
  feelsLikeC?: number;
  humidity?: number;
  condition: string;
  band: string;
  summary: string;
  vibe?: string;
  isFallback: boolean;
  fetchedAt: number;
};

/** WMO weather interpretation codes -> the handful of states we care about. */
function conditionFromCode(code: number): string {
  if (code === 0) return "clear";
  if (code <= 3) return "cloudy";
  if (code <= 48) return "fog";
  if (code <= 67) return "rain";
  if (code <= 77) return "snow";
  if (code <= 82) return "rain";
  if (code <= 86) return "snow";
  return "storm";
}

/**
 * Seasonal averages for the demo cities. Not a weather service — a graceful
 * degradation so a dead network can't stop a recommendation.
 */
const CLIMATE_FALLBACK: Record<string, number[]> = {
  // Jan..Dec average daily high, °C
  Dubai: [24, 25, 28, 33, 38, 40, 41, 41, 38, 35, 30, 26],
  "Abu Dhabi": [24, 25, 28, 33, 38, 40, 41, 41, 38, 35, 30, 26],
  London: [8, 9, 11, 14, 18, 21, 23, 23, 20, 15, 11, 9],
  Paris: [7, 9, 13, 16, 20, 23, 25, 25, 21, 16, 11, 8],
  Milan: [7, 9, 14, 18, 23, 27, 29, 29, 24, 18, 11, 7],
  "New York": [4, 6, 10, 16, 22, 26, 29, 28, 24, 18, 12, 6],
  "Los Angeles": [20, 20, 21, 23, 24, 26, 29, 29, 28, 26, 22, 19],
  Tokyo: [10, 11, 14, 19, 23, 26, 30, 31, 27, 22, 17, 12],
  Singapore: [30, 31, 32, 32, 32, 32, 31, 31, 31, 31, 31, 30],
  Mumbai: [31, 31, 33, 33, 33, 32, 30, 30, 31, 34, 34, 32],
  Bengaluru: [28, 31, 33, 34, 33, 29, 28, 28, 28, 28, 27, 27],
  Delhi: [21, 24, 30, 36, 40, 39, 35, 34, 34, 33, 28, 23],
  Berlin: [3, 4, 9, 14, 19, 22, 24, 24, 19, 13, 7, 4],
  Barcelona: [14, 15, 17, 19, 22, 26, 29, 29, 26, 22, 17, 15],
  Lisbon: [15, 16, 19, 20, 23, 26, 28, 29, 27, 22, 18, 15],
  Amsterdam: [6, 7, 10, 14, 18, 20, 22, 22, 19, 14, 10, 7],
  Istanbul: [9, 9, 12, 17, 21, 26, 28, 29, 25, 20, 15, 11],
  Riyadh: [21, 24, 28, 33, 39, 42, 43, 43, 40, 35, 28, 22],
  Doha: [22, 24, 28, 33, 39, 41, 42, 41, 39, 35, 30, 24],
  "San Francisco": [14, 16, 17, 18, 19, 21, 21, 22, 23, 21, 17, 14],
  Sydney: [26, 26, 25, 23, 20, 17, 17, 18, 20, 22, 24, 25],
};

const DEFAULT_CITY = "Dubai";

function summarize(temperatureC: number, condition: string, humidity?: number): string {
  const band = bandFromTemperature(temperatureC);
  const words: string[] = [];
  words.push(band.charAt(0).toUpperCase() + band.slice(1));
  if (humidity !== undefined && humidity >= 60) words.push("Humid");
  else if (humidity !== undefined && humidity < 30) words.push("Dry");
  if (condition === "rain") words.push("Rain");
  else if (condition === "clear") words.push("Clear");
  else if (condition === "cloudy") words.push("Cloudy");
  return words.join(" · ");
}

/** A short, evocative read on whether you can be outside. */
function vibeFor(temperatureC: number, condition: string): string {
  if (condition === "rain" || condition === "storm") return "Stay covered";
  if (condition === "snow") return "Layer up";
  if (temperatureC >= 38) return "Indoors until sundown";
  if (temperatureC >= 27) return "Rooftop-friendly";
  if (temperatureC >= 20) return "Terrace weather";
  if (temperatureC >= 12) return "Layer-friendly";
  return "Coat weather";
}

export function fallbackWeather(city: string, now = Date.now()): WeatherContext {
  const resolved = CLIMATE_FALLBACK[city] ? city : DEFAULT_CITY;
  const month = new Date(now).getUTCMonth();
  const high = CLIMATE_FALLBACK[resolved][month];
  // Evening is a few degrees off the daily high.
  const temperatureC = Math.round(high - 3);
  const condition = "clear";
  const humidity = resolved === "Dubai" ? 62 : 45;

  return {
    city: resolved,
    country: findCountry(resolved),
    temperatureC,
    feelsLikeC: temperatureC + (humidity >= 60 ? 3 : 0),
    humidity,
    condition,
    band: bandFromTemperature(temperatureC),
    summary: summarize(temperatureC, condition, humidity),
    vibe: vibeFor(temperatureC, condition),
    isFallback: true,
    fetchedAt: now,
  };
}

function findCountry(city: string): string | undefined {
  for (const entry of Object.values(KNOWN_CITIES)) {
    if (entry.name === city) return entry.country;
  }
  return undefined;
}

function coordsFor(city: string) {
  const key = city.trim().toLowerCase();
  if (KNOWN_CITIES[key]) return KNOWN_CITIES[key];
  for (const entry of Object.values(KNOWN_CITIES)) {
    if (entry.name.toLowerCase() === key) return entry;
  }
  return undefined;
}

/**
 * Fetch live weather. Never throws — a failure returns the flagged fallback so
 * the recommendation pipeline always has a context to reason about.
 */
export async function getWeather(
  city: string,
  coords?: { lat: number; lon: number },
): Promise<WeatherContext> {
  const location = coords ?? coordsFor(city);
  if (!location) return fallbackWeather(city);

  const lat = "lat" in location ? location.lat : (location as { lat: number }).lat;
  const lon = "lon" in location ? location.lon : (location as { lon: number }).lon;

  const url =
    `${OPEN_METEO}?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code` +
    `&timezone=auto`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      console.warn(`[weather] open-meteo ${response.status} — using fallback`);
      return fallbackWeather(city);
    }
    const json = (await response.json()) as {
      current?: {
        temperature_2m?: number;
        relative_humidity_2m?: number;
        apparent_temperature?: number;
        weather_code?: number;
      };
    };

    const current = json.current;
    if (!current || typeof current.temperature_2m !== "number") {
      console.warn("[weather] unexpected payload — using fallback");
      return fallbackWeather(city);
    }

    const temperatureC = Math.round(current.temperature_2m);
    const condition = conditionFromCode(current.weather_code ?? 0);
    const humidity = current.relative_humidity_2m;
    const resolvedCity = coordsFor(city)?.name ?? city;

    return {
      city: resolvedCity,
      country: findCountry(resolvedCity),
      temperatureC,
      feelsLikeC:
        typeof current.apparent_temperature === "number"
          ? Math.round(current.apparent_temperature)
          : undefined,
      humidity,
      condition,
      band: bandFromTemperature(temperatureC),
      summary: summarize(temperatureC, condition, humidity),
      vibe: vibeFor(temperatureC, condition),
      isFallback: false,
      fetchedAt: Date.now(),
    };
  } catch (error) {
    console.warn(
      "[weather] request failed — using fallback:",
      error instanceof Error ? error.message : "unknown",
    );
    return fallbackWeather(city);
  }
}
