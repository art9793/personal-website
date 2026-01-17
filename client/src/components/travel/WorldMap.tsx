import { useState, useMemo, useRef, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { useTheme } from "next-themes";
import { TravelTooltip } from "./TravelTooltip";
import { MapErrorBoundary } from "./MapErrorBoundary";

interface TravelEntry {
  countryCode: string;
  countryName: string;
  visits: string[];
}

interface WorldMapProps {
  travelHistory: TravelEntry[];
}

// World GeoJSON URL - react-simple-maps can handle both TopoJSON and GeoJSON
// Using a source with reliable ISO_A2 codes
const geoUrl = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

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
const getCountryCode = (props: any): string | null => {
  let countryCode = 
    props.ISO_A2 || 
    props.ISO_A2_EH || 
    props.iso_a2 || 
    props.iso_a2_eh ||
    props.ISO2 ||
    props.iso2 ||
    null;
  
  // Fallback: try to match by country name
  if (!countryCode) {
    const countryName = props.NAME || props.name || props.NAME_LONG || props.NAME_EN;
    if (countryName && nameToCodeMap[countryName]) {
      countryCode = nameToCodeMap[countryName];
    }
  }
  
  return countryCode ? countryCode.toUpperCase() : null;
};

// Detect if user is on Mac for correct modifier key hint
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export function WorldMap({ travelHistory }: WorldMapProps) {
  const [tooltipContent, setTooltipContent] = useState<{
    countryName: string;
    visits: string[];
    x: number;
    y: number;
  } | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [showScrollHint, setShowScrollHint] = useState(false);
  const mapRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Auto-hide scroll hint after 1.5 seconds (like Google Maps)
  useEffect(() => {
    if (showScrollHint) {
      const timer = setTimeout(() => setShowScrollHint(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showScrollHint]);

  // Intercept wheel events to require Cmd/Ctrl for zoom (native listener needed to prevent ZoomableGroup's built-in zoom)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      // Only allow zoom if Cmd (Mac) or Ctrl (Windows) is pressed
      if (!e.metaKey && !e.ctrlKey) {
        // Show hint and allow normal page scroll
        setShowScrollHint(true);
        // Don't prevent default - let page scroll normally
        return;
      }
      
      // Cmd/Ctrl is pressed - prevent default and handle zoom
      e.preventDefault();
      e.stopPropagation();
      
      const delta = e.deltaY;
      const zoomFactor = delta > 0 ? 0.92 : 1.08;
      
      setPosition(prev => {
        const newZoom = Math.max(1, Math.min(8, prev.zoom * zoomFactor));
        
        // Calculate zoom point relative to map container
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        // Zoom towards the mouse position
        const scale = newZoom / prev.zoom;
        const dx = (x - 0.5) * (1 - scale);
        const dy = (y - 0.5) * (1 - scale);
        
        return {
          coordinates: [
            prev.coordinates[0] - dx * 400,
            prev.coordinates[1] - dy * 300,
          ] as [number, number],
          zoom: newZoom,
        };
      });
    };

    // Use capture phase to intercept before ZoomableGroup
    container.addEventListener('wheel', handleNativeWheel, { passive: false, capture: true });
    
    return () => {
      container.removeEventListener('wheel', handleNativeWheel, { capture: true });
    };
  }, []);

  // Theme-aware color palettes for the map
  const mapColors = useMemo(() => {
    const isDark = theme === 'dark';
    
    if (isDark) {
      // Dark mode: dark grey non-visited, white visited (current behavior)
      return {
        nonVisitedFill: 'hsl(240, 3.7%, 15.9%)',
        nonVisitedStroke: 'hsl(240, 3.7%, 20%)',
        nonVisitedHoverFill: 'hsl(240, 3.7%, 22%)',
        visitedFill: '#ffffff',
        visitedHoverFill: '#f5f5f5',
        visitedPressedFill: '#e5e5e5',
        visitedStroke: 'hsl(240, 3.7%, 25%)',
      };
    }
    
    // Light mode: soft greys with off-black visited countries
    return {
      nonVisitedFill: 'hsl(240, 5%, 85%)',        // light grey land
      nonVisitedStroke: 'hsl(240, 5%, 70%)',      // visible border between countries
      nonVisitedHoverFill: 'hsl(240, 5%, 80%)',   // slightly darker on hover
      visitedFill: 'hsl(240, 10%, 20%)',          // off-black (not jarring)
      visitedHoverFill: 'hsl(240, 10%, 25%)',     // slightly lighter on hover
      visitedPressedFill: 'hsl(240, 10%, 30%)',   // pressed state
      visitedStroke: 'hsl(240, 5%, 50%)',         // medium grey border to differentiate neighbors
    };
  }, [theme]);

  // Transform travel history into a map for quick lookup
  const visitedCountriesMap = useMemo(() => {
    const map = travelHistory.reduce(
      (acc, entry) => {
        acc[entry.countryCode.toUpperCase()] = {
          countryName: entry.countryName,
          visits: entry.visits,
        };
        return acc;
      },
      {} as Record<string, { countryName: string; visits: string[] }>
    );
    return map;
  }, [travelHistory]);

  const handleMouseEnter = (geo: any, event: React.MouseEvent) => {
    const countryCode = getCountryCode(geo.properties);
    
    if (countryCode) {
      const visited = visitedCountriesMap[countryCode];
      if (visited && containerRef.current) {
        setHoveredCountry(countryCode);
        const rect = containerRef.current.getBoundingClientRect();
        setTooltipContent({
          countryName: visited.countryName,
          visits: visited.visits,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      } else {
        // Non-visited country - clear tooltip
        setHoveredCountry(null);
        setTooltipContent(null);
      }
    }
  };

  const handleMouseMove = (geo: any, event: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const countryCode = getCountryCode(geo.properties);
    const rect = containerRef.current.getBoundingClientRect();
    
    // Check if we've moved to a different country
    if (countryCode && countryCode !== hoveredCountry) {
      const visited = visitedCountriesMap[countryCode];
      if (visited) {
        setHoveredCountry(countryCode);
        setTooltipContent({
          countryName: visited.countryName,
          visits: visited.visits,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      } else {
        setHoveredCountry(null);
        setTooltipContent(null);
      }
    } else if (tooltipContent) {
      // Same country - just update position
      setTooltipContent({
        ...tooltipContent,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredCountry(null);
    setTooltipContent(null);
  };

  return (
    <MapErrorBoundary>
      <div className="relative w-full">
        <div 
          ref={containerRef}
          className="w-full h-[500px] md:h-[600px] border border-border rounded-lg overflow-hidden shadow-lg relative"
          style={{ backgroundColor: theme === 'dark' ? 'hsl(240, 10%, 3.9%)' : 'hsl(240, 5%, 92%)' }}
        >
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 147,
              center: [0, 20],
            }}
            className="w-full h-full"
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              onMoveStart={() => {}}
              onMoveEnd={(position) => {
                setPosition(position);
              }}
              minZoom={1}
              maxZoom={8}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryCode = getCountryCode(geo.properties);
                    const isVisited = countryCode ? countryCode in visitedCountriesMap : false;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={(e) => handleMouseEnter(geo, e)}
                        onMouseMove={(e) => handleMouseMove(geo, e)}
                        onMouseLeave={handleMouseLeave}
                        style={{
                          default: {
                            fill: isVisited ? mapColors.visitedFill : mapColors.nonVisitedFill,
                            stroke: isVisited ? mapColors.visitedStroke : mapColors.nonVisitedStroke,
                            strokeWidth: 0.75,
                            outline: "none",
                            cursor: "grab",
                          },
                          hover: {
                            fill: isVisited ? mapColors.visitedHoverFill : mapColors.nonVisitedHoverFill,
                            stroke: isVisited ? mapColors.visitedStroke : mapColors.nonVisitedStroke,
                            strokeWidth: 1,
                            outline: "none",
                            cursor: isVisited ? "pointer" : "grab",
                          },
                          pressed: {
                            fill: isVisited ? mapColors.visitedPressedFill : mapColors.nonVisitedHoverFill,
                            stroke: isVisited ? mapColors.visitedStroke : mapColors.nonVisitedStroke,
                            strokeWidth: 1,
                            outline: "none",
                            cursor: "grabbing",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {/* Tooltip */}
          {tooltipContent && (
            <div
              className="absolute z-50 pointer-events-none"
              style={{
                left: `${Math.max(10, Math.min(tooltipContent.x + 15, (containerRef.current?.offsetWidth || 800) - 200))}px`,
                top: `${Math.max(10, Math.min(tooltipContent.y - 10, (containerRef.current?.offsetHeight || 600) - 150))}px`,
                transform: tooltipContent.y < 100 ? "translateY(0)" : "translateY(-100%)",
              }}
            >
              <TravelTooltip
                countryName={tooltipContent.countryName}
                visits={tooltipContent.visits}
                position={{ x: 0, y: 0 }}
              />
            </div>
          )}

          {/* Scroll hint overlay (Google Maps style) */}
          {showScrollHint && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-40 pointer-events-none transition-opacity duration-200">
              <div className="bg-background/95 backdrop-blur-sm px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg border border-border">
                Use {isMac ? '⌘' : 'Ctrl'} + scroll to zoom
              </div>
            </div>
          )}
        </div>

      </div>
    </MapErrorBoundary>
  );
}
