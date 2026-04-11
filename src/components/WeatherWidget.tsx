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
const FORECAST_HOURS = 24;
 
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
 
/** Map WMO weather codes to emoji */
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
 
/**
 * Parse a free-form query into a city name and a region hint.
 *  - Comma:  "los angeles, california" → city="los angeles", hint="california"
 *  - Space (3+ words): "los angeles california" → city="los angeles", hint="california"
 *  - Space (1-2 words): "los angeles" → city="los angeles", hint=""
 */
const US_STATES = new Set([
  'alabama','alaska','arizona','arkansas','california','colorado','connecticut',
  'delaware','florida','georgia','hawaii','idaho','illinois','indiana','iowa',
  'kansas','kentucky','louisiana','maine','maryland','massachusetts','michigan',
  'minnesota','mississippi','missouri','montana','nebraska','nevada','new hampshire',
  'new jersey','new mexico','new york','north carolina','north dakota','ohio',
  'oklahoma','oregon','pennsylvania','rhode island','south carolina','south dakota',
  'tennessee','texas','utah','vermont','virginia','washington','west virginia',
  'wisconsin','wyoming'
]);
const STATE_ABBR: Record<string, string> = {
  ca: 'california',
  ny: 'new york',
  tx: 'texas',
  in: 'indiana',
  // add more if you want
};
function parseQuery(q: string): { cityName: string; regionHint: string } {
  const cleaned = q.trim().toLowerCase();
  // ✅ 1. Comma = always trust user intent (global safe)
  const commaParts = cleaned.split(',').map((p) => p.trim()).filter(Boolean);
  if (commaParts.length >= 2) {
    return {
      cityName: commaParts[0],
      regionHint: commaParts.slice(1).join(' ')
    };
  }
  const words = cleaned.split(/\s+/);
  // ✅ 2. Try detecting known regions (SAFE mode)
  if (words.length >= 2) {
    const last = words[words.length - 1];
    const lastTwo = words.slice(-2).join(' ');
    // US full state
    if (US_STATES.has(last)) {
      return {
        cityName: words.slice(0, -1).join(' '),
        regionHint: last
      };
    }
    // US abbreviation
    if (STATE_ABBR[last]) {
      return {
        cityName: words.slice(0, -1).join(' '),
        regionHint: STATE_ABBR[last]
      };
    }
    // Multi-word state (e.g. "new york")
    if (US_STATES.has(lastTwo)) {
      return {
        cityName: words.slice(0, -2).join(' '),
        regionHint: lastTwo
      };
    }
  }
  // ✅ 3. GLOBAL fallback:
  // DO NOT split — treat full query as city
  return {
    cityName: cleaned,
    regionHint: ''
  };
}
 
/**
 * How well does the result's city name match the searched city name?
 * Prevents fuzzy API matches (e.g. "Lagos" for "los angeles") from
 * outranking the actual intended city.
 */
function nameScore(r: GeoResult, cityName: string): number {
  const name = r.name.toLowerCase();
  const city = cityName.toLowerCase();
  if (name === city) return 100;
  // Strong prefix match (best fallback)
  if (name.startsWith(city)) return 60;
  const words = city.split(/\s+/);
  // All words match somewhere
  if (words.every((w) => name.includes(w))) return 40;
  const matchedWords = words.filter((w) => name.includes(w)).length;
  // 🚨 NEW: If nothing matches, heavily penalize
  if (matchedWords === 0) return -50;
  return matchedWords * 10;
}
 
/**
 * How well does the result's region/country match the hint?
 */
function regionScore(r: GeoResult, regionHint: string): number {
  if (!regionHint) return 0;
  const haystack = [r.admin1 ?? '', r.country].join(' ').toLowerCase();
  return regionHint.split(/\s+/).reduce((acc, token) => acc + (haystack.includes(token) ? 10 : 0), 0);
}
 
function getLocalHourStringFromUtcOffset(utcOffsetSeconds: number): string {
  const nowUtcMs = Date.now();
  const localMs = nowUtcMs + utcOffsetSeconds * 1000;
  const localDate = new Date(localMs);
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localDate.getUTCDate()).padStart(2, '0');
  const hour = String(localDate.getUTCHours()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:00`;
}
 
interface WeatherWidgetProps {
  savedCity: string | null;
  savedLat?: number | null;
  savedLon?: number | null;
  onCityChange: (city: string, lat: number, lon: number) => void;
}
 
export function WeatherWidget({ savedCity, savedLat, savedLon, onCityChange }: WeatherWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<GeoResult[]>([]);
  const [city, setCity] = useState(savedCity || '');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [forecast, setForecast] = useState<HourForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [useCelsius, setUseCelsius] = useState(false);
 
  // Restore saved location reactively — handles async Google Drive load
  useEffect(() => {
    if (savedLat != null && savedLon != null) {
      setCoords((prev) => {
        if (prev?.lat === savedLat && prev?.lon === savedLon) return prev;
        return { lat: savedLat, lon: savedLon };
      });
      if (savedCity) setCity(savedCity);
      return;
    }
    if (!savedCity) return;
    const cityNameOnly = savedCity.split(',')[0].trim();
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityNameOnly)}&count=5`)
      .then((r) => r.json())
      .then((data) => {
        const raw: GeoResult[] = data.results || [];
        const saved = savedCity.toLowerCase();
        const best =
          raw.find((r) => {
            const label = r.admin1 ? `${r.name}, ${r.admin1}, ${r.country}` : `${r.name}, ${r.country}`;
            return label.toLowerCase() === saved;
          }) ?? raw[0];
        if (best) {
          const label = best.admin1 ? `${best.name}, ${best.admin1}, ${best.country}` : `${best.name}, ${best.country}`;
          setCity(label);
          setCoords({ lat: best.latitude, lon: best.longitude });
        }
      })
      .catch(() => {});
  }, [savedCity, savedLat, savedLon]);
 
  // Fetch forecast whenever coords or unit change
  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    setLoading(true);
    const unit = useCelsius ? 'celsius' : 'fahrenheit';
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}` +
        `&hourly=temperature_2m,weather_code,precipitation_probability&forecast_days=2&temperature_unit=${unit}&timezone=auto`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const times: string[] = data.hourly?.time || [];
        const temps: number[] = data.hourly?.temperature_2m || [];
        const codes: number[] = data.hourly?.weather_code || [];
        const rain: number[] = data.hourly?.precipitation_probability || [];
        const utcOffsetSeconds: number = data.utc_offset_seconds ?? 0;
        const currentLocalHour = getLocalHourStringFromUtcOffset(utcOffsetSeconds);
        let startIndex = times.findIndex((t) => t >= currentLocalHour);
        if (startIndex === -1) startIndex = 0;
        const hours: HourForecast[] = times
          .slice(startIndex, startIndex + FORECAST_HOURS)
          .map((t, i) => ({
            time: t,
            temp: temps[startIndex + i],
            weatherCode: codes[startIndex + i],
            rainChance: rain[startIndex + i] ?? 0,
          }));
        setForecast(hours);
      })
      .catch(() => { if (!cancelled) setForecast([]); })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [coords, useCelsius]);
 
  const searchCity = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const { cityName, regionHint } = parseQuery(query);
 
      const fetchGeo = async (name: string): Promise<GeoResult[]> => {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=10`
        );
        const data = await res.json();
        return data.results || [];
      };
 
      // Search full query + parsed city name (if different).
      // Dual search handles both cases:
      //   "los angeles"          → full query finds it directly
      //   "hayward california"   → full query fails, city-only "hayward" succeeds
      const searches: Promise<GeoResult[]>[] = [fetchGeo(query.trim())];
      if (cityName.toLowerCase() !== query.trim().toLowerCase()) {
        searches.push(fetchGeo(cityName));
      }
 
      const allResults = (await Promise.all(searches)).flat();
 
      // Deduplicate by lat/lon
      const seen = new Set<string>();
      const unique: GeoResult[] = [];
      for (const r of allResults) {
        const k = geoKey(r);
        if (!seen.has(k)) { seen.add(k); unique.push(r); }
      }
 
      // Sort by name match first, then region hint.
      // nameScore ensures "Los Angeles" beats fuzzy matches like "Lagos".
      unique.sort((a, b) =>
        (nameScore(b, cityName) + regionScore(b, regionHint)) -
        (nameScore(a, cityName) + regionScore(a, regionHint))
      );
 
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
          <div className="flex gap-2">
            <Input
              placeholder="Search city... (e.g. 'Los Angeles California', or just 'Los Angeles', 'Paris', etc.)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchCity(); } }}
              className="rounded-xl bg-background text-sm flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={searchCity}
              className="rounded-xl"
              disabled={searching || !query.trim()}
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
 
          {results.length > 0 && (
            <div className="rounded-xl border border-border bg-background divide-y divide-border overflow-hidden">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectCity(r)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  {r.name}{r.admin1 ? `, ${r.admin1}` : ''}, {r.country}
                </button>
              ))}
            </div>
          )}
 
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-muted-foreground">°F</span>
            <Switch checked={useCelsius} onCheckedChange={setUseCelsius} />
            <span className="text-xs text-muted-foreground">°C</span>
          </div>
 
          {loading ? (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading forecast...
            </div>
          ) : forecast.length > 0 ? (
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
              <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
                {forecast.map((h) => {
                  const hour = new Date(h.time).toLocaleTimeString([], { hour: 'numeric' });
                  return (
                    <div key={h.time} className="flex flex-col items-center gap-1 rounded-xl bg-muted/40 p-2 min-w-[72px]">
                      <span className="text-xs text-muted-foreground">{hour}</span>
                      <span className="text-xl">{weatherEmoji(h.weatherCode)}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {Math.round(h.temp)}{tempUnit}
                      </span>
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