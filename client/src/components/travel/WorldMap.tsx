import { useState, useMemo, useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { useTheme } from "next-themes";
import { TravelTooltip } from "./TravelTooltip";
import { MapErrorBoundary } from "./MapErrorBoundary";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import type { Layer, PathOptions, LeafletMouseEvent } from "leaflet";

interface TravelEntry {
  countryCode: string;
  countryName: string;
  visits: string[];
  isHomeCountry?: boolean;
}

interface WorldMapProps {
  travelHistory: TravelEntry[];
}

// GeoJSON URL for country boundaries with reliable ISO codes
const geoUrl = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

// Tile layer URL for dark mode (light mode uses no tiles - white background)
const DARK_TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png";

const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Fallback name-to-code mapping for countries that might not have ISO codes
const nameToCodeMap: Record<string, string> = {
  "India": "IN",
  "Thailand": "TH",
  "Indonesia": "ID",
  "Saudi Arabia": "SA",
  "Spain": "ES",
  "Portugal": "PT",
  "Vietnam": "VN",
  "Viet Nam": "VN",
  "Japan": "JP",
  "Germany": "DE",
  "Netherlands": "NL",
  "Holland": "NL",
  "The Netherlands": "NL",
  "Malaysia": "MY",
  "Australia": "AU",
};

// Helper function to get country code from geo properties
const getCountryCode = (properties: Record<string, unknown>): string | null => {
  let countryCode = 
    (properties.ISO_A2 as string) || 
    (properties.ISO_A2_EH as string) || 
    (properties.iso_a2 as string) || 
    (properties.iso_a2_eh as string) ||
    (properties.ISO2 as string) ||
    (properties.iso2 as string) ||
    null;
  
  // Fallback: try to match by country name
  if (!countryCode) {
    const countryName = (properties.ADMIN as string) || (properties.NAME as string) || (properties.name as string);
    if (countryName && nameToCodeMap[countryName]) {
      countryCode = nameToCodeMap[countryName];
    }
  }
  
  return countryCode ? countryCode.toUpperCase() : null;
};

// Component to handle theme changes and update tile layer
// Light mode: no tiles (pure white background with GeoJSON only) - Cloudflare style
// Dark mode: CartoDB Dark Matter tiles for context
function TileLayerWithTheme({ theme }: { theme: string | undefined }) {
  // Light mode: no tiles, just render GeoJSON on white background like Cloudflare
  if (theme !== "dark") {
    return null;
  }
  return <TileLayer attribution={TILE_ATTRIBUTION} url={DARK_TILE_URL} />;
}

// Component to invalidate map size when container resizes
function MapResizeHandler() {
  const map = useMap();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [map]);
  
  return null;
}

export function WorldMap({ travelHistory }: WorldMapProps) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [tooltipContent, setTooltipContent] = useState<{
    countryName: string;
    visits: string[];
    isHomeCountry?: boolean;
    x: number;
    y: number;
  } | null>(null);
  const [hoveredCountryCode, setHoveredCountryCode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const { theme } = useTheme();

  // Fetch GeoJSON data
  useEffect(() => {
    fetch(geoUrl)
      .then((res) => res.json())
      .then((data: FeatureCollection) => setGeoData(data))
      .catch((err) => console.error("Failed to load GeoJSON:", err));
  }, []);

  // Transform travel history into a map for quick lookup
  const visitedCountriesMap = useMemo(() => {
    return travelHistory.reduce(
      (acc, entry) => {
        acc[entry.countryCode.toUpperCase()] = {
          countryName: entry.countryName,
          visits: entry.visits,
          isHomeCountry: entry.isHomeCountry || false,
        };
        return acc;
      },
      {} as Record<string, { countryName: string; visits: string[]; isHomeCountry: boolean }>
    );
  }, [travelHistory]);

  // Theme-aware color palettes for the map (Cloudflare-style)
  const mapColors = useMemo(() => {
    const isDark = theme === "dark";
    
    if (isDark) {
      // Dark mode: white visited countries
      return {
        nonVisitedFill: "#374151", // gray-700
        nonVisitedStroke: "#3f4a5c", // very subtle, close to fill
        visitedFill: "#f9fafb", // gray-50 - white/near-white
        visitedStroke: "#4b5563", // subtle border
        hoverFill: "#e5e7eb", // gray-200 - slightly darker on hover
      };
    }
    
    // Light mode: black visited countries (theme color)
    return {
      nonVisitedFill: "#e5e7eb", // gray-200 - lighter gray
      nonVisitedStroke: "#d1d5db", // gray-300 - barely visible border
      visitedFill: "#1f2937", // gray-800 - black/dark
      visitedStroke: "#d1d5db", // same subtle border
      hoverFill: "#374151", // gray-700 - slightly lighter on hover
    };
  }, [theme]);

  // Style function for GeoJSON features
  const getCountryStyle = (feature: Feature<Geometry, Record<string, unknown>> | undefined): PathOptions => {
    if (!feature) return {};
    
    const countryCode = getCountryCode(feature.properties || {});
    const isVisited = countryCode ? countryCode in visitedCountriesMap : false;
    const isHovered = countryCode === hoveredCountryCode;

    return {
      fillColor: isHovered && isVisited 
        ? mapColors.hoverFill 
        : isVisited 
          ? mapColors.visitedFill 
          : mapColors.nonVisitedFill,
      fillOpacity: isVisited ? 0.85 : 1,
      color: isVisited ? mapColors.visitedStroke : mapColors.nonVisitedStroke,
      weight: isHovered ? 1.5 : 0.5,
    };
  };

  // Helper to get country name from GeoJSON properties
  const getCountryName = (properties: Record<string, unknown>): string => {
    return (
      (properties.ADMIN as string) ||
      (properties.NAME as string) ||
      (properties.name as string) ||
      "Unknown"
    );
  };

  // Event handlers for each feature
  const onEachFeature = (feature: Feature<Geometry, Record<string, unknown>>, layer: Layer) => {
    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        const countryCode = getCountryCode(feature.properties || {});
        const geoCountryName = getCountryName(feature.properties || {});
        
        if (countryCode) {
          setHoveredCountryCode(countryCode);
        }
        
        // Show tooltip for ALL countries (visited and non-visited)
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const visited = countryCode ? visitedCountriesMap[countryCode] : null;
          
          setTooltipContent({
            countryName: visited?.countryName || geoCountryName,
            visits: visited?.visits || [], // empty array = not visited
            isHomeCountry: visited?.isHomeCountry || false,
            x: e.originalEvent.clientX - rect.left,
            y: e.originalEvent.clientY - rect.top,
          });
        }
      },
      mousemove: (e: LeafletMouseEvent) => {
        if (tooltipContent && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setTooltipContent({
            ...tooltipContent,
            x: e.originalEvent.clientX - rect.left,
            y: e.originalEvent.clientY - rect.top,
          });
        }
      },
      mouseout: () => {
        setHoveredCountryCode(null);
        setTooltipContent(null);
      },
    });
  };

  // Update GeoJSON styles when hover state or theme changes
  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.setStyle((feature) => 
        getCountryStyle(feature as Feature<Geometry, Record<string, unknown>>)
      );
    }
  }, [hoveredCountryCode, theme, mapColors, visitedCountriesMap]);

  return (
    <MapErrorBoundary>
      <div className="relative w-full flex-1 min-h-0">
        <div 
          ref={containerRef}
          className="w-full h-full min-h-[280px] border border-border rounded-lg overflow-hidden shadow-lg relative"
        >
          <MapContainer
            key={theme || "light"}
            center={[20, 0]}
            zoom={2}
            minZoom={2}
            maxZoom={8}
            scrollWheelZoom={true}
            className="w-full h-full"
            style={{ width: "100%", height: "100%", background: theme === "dark" ? "#1f2937" : "#ffffff" }}
            worldCopyJump={true}
          >
            <TileLayerWithTheme theme={theme || "light"} />
            <MapResizeHandler />
            
            {geoData && (
              <GeoJSON
                ref={geoJsonRef as React.RefObject<L.GeoJSON>}
                data={geoData}
                style={getCountryStyle}
                onEachFeature={onEachFeature}
              />
            )}
          </MapContainer>

          {/* Tooltip - centered above cursor with arrow pointing down */}
          {tooltipContent && (
            <div
              className="absolute z-[1000] pointer-events-none"
              style={{
                left: `${tooltipContent.x}px`,
                top: `${tooltipContent.y - 16}px`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <TravelTooltip
                countryName={tooltipContent.countryName}
                visits={tooltipContent.visits}
                isHomeCountry={tooltipContent.isHomeCountry}
              />
            </div>
          )}
        </div>
      </div>
    </MapErrorBoundary>
  );
}
