export const APP_NAME = "GRIDPILOT AI";
export const TAGLINE = "Predict the problem. Explain the cause. Optimize the response.";

export const DEFAULT_REGION = "All Regions";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const USE_MOCK_DATA_DEFAULT = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";


export const REGIONS = [
  { id: "ALL", name: "All Regions" },
  { id: "R01", name: "R01 - Metro Central" },
  { id: "R02", name: "R02 - Solar Valley" },
  { id: "R03", name: "R03 - Highland Wind Corridor" },
  { id: "R04", name: "R04 - Industrial Belt" },
  { id: "R05", name: "R05 - Coastal Mixed" },
];
