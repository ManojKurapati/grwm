"use client";

/**
 * Environmental context.
 *
 * Shown before and alongside every recommendation, because "why this outfit"
 * starts with "what is it like outside". When the live provider fails we say so
 * rather than quietly pretending.
 */
export function WeatherStrip({
  weather,
  intent,
}: {
  weather: {
    city: string;
    temperatureC: number;
    feelsLikeC?: number;
    summary: string;
    vibe?: string;
    isFallback: boolean;
  };
  intent?: { occasionLabel: string; dressCode: string; timeOfDay: string };
}) {
  return (
    <div className="flex flex-wrap items-end gap-x-10 gap-y-5">
      <div>
        <span className="label text-[0.62rem]">{weather.city}</span>
        <p className="display nums mt-1 text-[2.6rem] leading-none">
          {Math.round(weather.temperatureC)}°
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[0.85rem] text-slate">{weather.summary}</span>
        {weather.vibe && <span className="text-[0.85rem] text-ink">{weather.vibe}</span>}
      </div>

      {intent && (
        <div className="flex flex-col gap-1 border-l border-clay/40 pl-6">
          <span className="label text-[0.62rem]">Reading</span>
          <span className="text-[0.85rem] text-ink">
            {intent.occasionLabel} · {intent.dressCode} · {intent.timeOfDay}
          </span>
        </div>
      )}

      {weather.isFallback && (
        <span className="label text-[0.6rem] text-warn">Seasonal estimate</span>
      )}
    </div>
  );
}
