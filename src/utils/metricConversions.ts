
// Conversion factors for different land measurement units
export type LandMetric = "sqft" | "acre" | "sqyd" | "ankanam";

export const metricLabels: Record<LandMetric, string> = {
  sqft: "Square Feet",
  acre: "Acres",
  sqyd: "Square Yards",
  ankanam: "Ankanam"
};

// Conversion rates to square feet (base unit)
export const conversionFactors: Record<LandMetric, number> = {
  sqft: 1, // base unit
  acre: 43560, // 1 acre = 43560 sq ft
  sqyd: 9, // 1 sq yard = 9 sq ft
  ankanam: 72, // 1 ankanam = 72 sq ft (approximate value, may vary by region)
};

// Convert from one unit to another
export const convertArea = (value: number, fromUnit: LandMetric, toUnit: LandMetric): number => {
  // Convert to sq ft first (our base unit)
  const valueInSqFt = value * conversionFactors[fromUnit];
  
  // Convert from sq ft to target unit
  const valueInTargetUnit = valueInSqFt / conversionFactors[toUnit];
  
  return valueInTargetUnit;
};

// Format area with proper units
export const formatArea = (value: number, unit: LandMetric): string => {
  const formattedValue = value.toLocaleString('en-IN', {
    maximumFractionDigits: unit === "acre" ? 3 : 2
  });
  
  return `${formattedValue} ${unit === "sqft" ? "sq.ft" : unit}`;
};
