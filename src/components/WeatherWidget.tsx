/**
 * Weather Widget
 *
 * Collapsible 12-hour weather forecast for the outfit builder.
 * Uses Open-Meteo API (free, no key needed).
 * City preference is saved to Google Drive alongside closet data.
 *
 * Customization:
 *  - Forecast hours: change FORECAST_HOURS
 *  - Widget corners: change rounded-2xl
 *  - Collapsed icon size: change w-5 h-5
 */
import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, CloudSun, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

/** Number of hours shown in forecast — change to show more/fewer */
const FORECAST_HOURS = 12;

interface GeoResult {
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface HourForecast {
  time: string;
  temp: number;
  weatherCode: number;
  rainChance: number;
}

/** Map WMO weather codes to emoji — add more codes for finer granularity */
function weatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 77) return '🌨️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌥️';
}

/** Build a unique key for deduplication */
function geoKey(r: GeoResult) {
  return `${r.latitude.toFixed(2)}_${r.longitude.toFixed(2)}`;
}

interface WeatherWidgetProps {
  savedCity: string | null;
  onCityChange: (city: string, lat: number, lon: number) => void;
}

export function WeatherWidget({ savedCity, onCityChange }: WeatherWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<GeoResult[]>([]);
  const [city, setCity] = useState(savedCity || '');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [forecast, setForecast] = useState<HourForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [useCelsius, setUseCelsius] = useState(false);

  // Fetch forecast when coords change
  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    setLoading(true);

    const unit = useCelsius ? 'celsius' : 'fahrenheit';
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=temperature_2m,weather_code,precipitation_probability&forecast_hours=${FORECAST_HOURS}&temperature_unit=${unit}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const hours: HourForecast[] = (data.hourly?.time || []).map((t: string, i: number) => ({
          time: t,
          temp: data.hourly.temperature_2m[i],
          weatherCode: data.hourly.weather_code[i],
          rainChance: data.hourly.precipitation_probability?.[i] ?? 0,
        }));
        setForecast(hours);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [coords, useCelsius]);

  // If savedCity exists, geocode it on mount
  useEffect(() => {
    if (savedCity && !coords) {
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(savedCity)}&count=1`)
        .then((r) => r.json())
        .then((data) => {
          const r = data.results?.[0];
          if (r) {
            const label = r.admin1 ? `${r.name}, ${r.admin1}, ${r.country}` : `${r.name}, ${r.country}`;
            setCity(label);
            setCoords({ lat: r.latitude, lon: r.longitude });
          }
        })
        .catch(() => {});
    }
  }, [savedCity, coords]);

  const searchCity = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=10`);
      const data = await res.json();
      const raw: GeoResult[] = data.results || [];
      // Deduplicate by lat/lon
      const seen = new Set<string>();
      const unique: GeoResult[] = [];
      for (const r of raw) {
        const k = geoKey(r);
        if (!seen.has(k)) { seen.add(k); unique.push(r); }
      }
      setResults(unique.slice(0, 5));
    } catch {
      setResults([]);
    }
    setSearching(false);
  }, [query]);

  const selectCity = (r: GeoResult) => {
    const label = r.admin1 ? `${r.name}, ${r.admin1}, ${r.country}` : `${r.name}, ${r.country}`;
    setCity(label);
    setCoords({ lat: r.latitude, lon: r.longitude });
    setResults([]);
    setQuery('');
    onCityChange(label, r.latitude, r.longitude);
  };

  const tempUnit = useCelsius ? '°C' : '°F';

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden mb-4">
      {/* Toggle header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <CloudSun className="w-5 h-5 text-primary" />
          Weather {city && `— ${city}`}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* City search */}
          <div className="flex gap-2">
            <Input
              placeholder="Search city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchCity(); } }}
              className="rounded-xl bg-background text-sm flex-1"
            />
            <Button variant="outline" size="sm" onClick={searchCity} className="rounded-xl" disabled={searching || !query.trim()}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {/* Search results */}
          {results.length > 0 && (
            <div className="rounded-xl border border-border bg-background divide-y divide-border overflow-hidden">
              {results.map((r, i) => (
                <button key={i} onClick={() => selectCity(r)} className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors">
                  {r.name}{r.admin1 ? `, ${r.admin1}` : ''}, {r.country}
                </button>
              ))}
            </div>
          )}

          {/* F / C toggle */}
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-muted-foreground">°F</span>
            <Switch checked={useCelsius} onCheckedChange={setUseCelsius} />
            <span className="text-xs text-muted-foreground">°C</span>
          </div>

          {/* Forecast — horizontally scrollable */}
          {loading ? (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading forecast...
            </div>
          ) : forecast.length > 0 ? (
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
              <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
                {forecast.map((h) => {
                  const d = new Date(h.time);
                  const hour = d.toLocaleTimeString([], { hour: 'numeric' });
                  return (
                    <div key={h.time} className="flex flex-col items-center gap-1 rounded-xl bg-muted/40 p-2 min-w-[72px]">
                      <span className="text-xs text-muted-foreground">{hour}</span>
                      <span className="text-xl">{weatherEmoji(h.weatherCode)}</span>
                      <span className="text-sm font-semibold text-foreground">{Math.round(h.temp)}{tempUnit}</span>
                      {/* Rain chance */}
                      <span className="text-[10px] text-muted-foreground">💧 {h.rainChance}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : city ? (
            <p className="text-xs text-muted-foreground text-center py-2">No forecast data available</p>
          ) : null}

          <p className="text-[10px] text-muted-foreground/60 text-center">
            City preference is saved to your Google Drive.
          </p>
        </div>
      )}
    </div>
  );
}
