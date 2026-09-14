export type AssetType = 'solar' | 'wind' | 'thermal' | 'battery' | 'hydro' | 'substation';
export type AssetStatus = 'NORMAL' | 'DEGRADED' | 'OFFLINE' | 'MAINTENANCE';

export interface GridAsset {
  asset_id: string;
  asset_name: string;
  asset_type: AssetType;
  region_id: string;
  capacity_mw: number;
  expected_output_mw: number;
  actual_output_mw: number;
  variance_mw: number;
  performance_pct: number;
  health_score: number; // 0 - 100
  status: AssetStatus;
  latitude?: number;
  longitude?: number;
  fault_type?: string;
}

export interface AssetTelemetry {
  timestamp: string;
  asset_id: string;
  power_output_mw: number;
  voltage_kv: number;
  current_a: number;
  temperature_c: number;
  inverter_temperature_c: number;
  inverter_voltage: number;
  inverter_efficiency: number;
  tracker_angle: number;
  vibration: number;
  frequency_hz: number;
  irradiance_w_m2: number;
}
