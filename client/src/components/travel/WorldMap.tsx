import { useState, useMemo, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { useTheme } from "next-themes";
import { TravelTooltip } from "./TravelTooltip";
import { MapErrorBoundary } from "./MapErrorBoundary";
import topologyData from "world-atlas/countries-110m.json";

interface TravelEntry {
  countryCode: string;
  countryName: string;
  visits: string[];
  isHomeCountry?: boolean;
}

interface WorldMapProps {
  travelHistory: TravelEntry[];
}

// ISO 3166-1 numeric → alpha-2 mapping for world-atlas country IDs
const ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  "004": "AF", "008": "AL", "010": "AQ", "012": "DZ", "024": "AO",
  "031": "AZ", "032": "AR", "036": "AU", "040": "AT", "044": "BS",
  "050": "BD", "051": "AM", "056": "BE", "064": "BT", "068": "BO",
  "070": "BA", "072": "BW", "076": "BR", "084": "BZ", "090": "SB",
  "096": "BN", "100": "BG", "104": "MM", "108": "BI", "112": "BY",
  "116": "KH", "120": "CM", "124": "CA", "140": "CF", "144": "LK",
  "148": "TD", "152": "CL", "156": "CN", "158": "TW", "170": "CO",
  "178": "CG", "180": "CD", "188": "CR", "191": "HR", "192": "CU",
  "196": "CY", "203": "CZ", "204": "BJ", "208": "DK", "214": "DO",
  "218": "EC", "222": "SV", "226": "GQ", "231": "ET", "232": "ER",
  "233": "EE", "238": "FK", "242": "FJ", "246": "FI", "250": "FR",
  "260": "TF", "262": "DJ", "266": "GA", "268": "GE", "270": "GM",
  "275": "PS", "276": "DE", "288": "GH", "296": "KI", "300": "GR",
  "304": "GL", "320": "GT", "324": "GN", "328": "GY", "332": "HT",
  "340": "HN", "348": "HU", "352": "IS", "356": "IN", "360": "ID",
  "364": "IR", "368": "IQ", "372": "IE", "376": "IL", "380": "IT",
  "384": "CI", "388": "JM", "392": "JP", "398": "KZ", "400": "JO",
  "404": "KE", "408": "KP", "410": "KR", "414": "KW", "417": "KG",
  "418": "LA", "422": "LB", "426": "LS", "428": "LV", "430": "LR",
  "434": "LY", "440": "LT", "442": "LU", "450": "MG", "454": "MW",
  "458": "MY", "466": "ML", "478": "MR", "484": "MX", "496": "MN",
  "498": "MD", "499": "ME", "504": "MA", "508": "MZ", "512": "OM",
  "516": "NA", "524": "NP", "528": "NL", "540": "NC", "548": "VU",
  "554": "NZ", "558": "NI", "562": "NE", "566": "NG", "578": "NO",
  "586": "PK", "591": "PA", "598": "PG", "600": "PY", "604": "PE",
  "608": "PH", "616": "PL", "620": "PT", "624": "GW", "626": "TL",
  "630": "PR", "634": "QA", "642": "RO", "643": "RU", "646": "RW",
  "682": "SA", "686": "SN", "688": "RS", "694": "SL", "700": "SG",
  "703": "SK", "704": "VN", "705": "SI", "706": "SO", "710": "ZA",
  "716": "ZW", "724": "ES", "728": "SS", "729": "SD", "732": "EH",
  "740": "SR", "748": "SZ", "752": "SE", "756": "CH", "760": "SY",
  "762": "TJ", "764": "TH", "768": "TG", "780": "TT", "784": "AE",
  "788": "TN", "792": "TR", "795": "TM", "800": "UG", "804": "UA",
  "807": "MK", "818": "EG", "826": "GB", "834": "TZ", "840": "US",
  "854": "BF", "858": "UY", "860": "UZ", "862": "VE", "887": "YE",
  "894": "ZM",
};

export function WorldMap({ travelHistory }: WorldMapProps) {
  const [tooltipContent, setTooltipContent] = useState<{
    countryName: string;
    visits: string[];
    isHomeCountry?: boolean;
    x: number;
    y: number;
  } | null>(null);
  const [hoveredGeoId, setHoveredGeoId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

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

  const isDark = resolvedTheme === "dark";

  const colors = useMemo(() => {
    if (isDark) {
      return {
        bg: "#1f2937",
        visitedFill: "#d1d5db",
        nonVisitedFill: "#374151",
        nonVisitedHoverFill: "#4b5563",
        stroke: "#4b5563",
        hoverFill: "#e5e7eb",
      };
    }
    return {
      bg: "#f9fafb",
      visitedFill: "#4b5563",
      nonVisitedFill: "#e5e7eb",
      nonVisitedHoverFill: "#d1d5db",
      stroke: "#d1d5db",
      hoverFill: "#374151",
    };
  }, [isDark]);

  return (
    <MapErrorBoundary>
      <div className="relative w-full flex-1 min-h-0">
        <div
          ref={containerRef}
          className="w-full h-full min-h-[280px] rounded-lg overflow-hidden relative select-none"
          style={{ background: colors.bg }}
        >
          <ComposableMap
            projection="geoEquirectangular"
            projectionConfig={{ scale: 175, center: [0, 20] }}
            width={960}
            height={380}
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={topologyData}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const alpha2 = ISO_NUMERIC_TO_ALPHA2[geo.id] || null;
                  const visited = alpha2 ? visitedCountriesMap[alpha2] : null;
                  const isVisited = !!visited;
                  const isHovered = geo.id === hoveredGeoId;

                  let fill = isVisited ? colors.visitedFill : colors.nonVisitedFill;
                  if (isHovered) {
                    fill = isVisited ? colors.hoverFill : colors.nonVisitedHoverFill;
                  }

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke={colors.stroke}
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", cursor: "pointer", transition: "fill 0.2s ease" },
                        hover: { outline: "none", cursor: "pointer", strokeWidth: 1.5 },
                        pressed: { outline: "none", cursor: "pointer" },
                      }}
                      onMouseEnter={(e: React.MouseEvent) => {
                        setHoveredGeoId(geo.id);
                        if (containerRef.current) {
                          const rect = containerRef.current.getBoundingClientRect();
                          const geoName = geo.properties.name || "Unknown";
                          setTooltipContent({
                            countryName: visited?.countryName || geoName,
                            visits: visited?.visits || [],
                            isHomeCountry: visited?.isHomeCountry || false,
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                          });
                        }
                      }}
                      onMouseMove={(e: React.MouseEvent) => {
                        if (containerRef.current) {
                          const rect = containerRef.current.getBoundingClientRect();
                          setTooltipContent((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  x: e.clientX - rect.left,
                                  y: e.clientY - rect.top,
                                }
                              : null
                          );
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredGeoId(null);
                        setTooltipContent(null);
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

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
