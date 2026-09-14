import io
from typing import Tuple, Dict, Any, List
import pandas as pd
import numpy as np

REQUIRED_COLUMNS = ["timestamp", "node_id", "power_mw"]
OPTIONAL_COLUMNS = [
    "voltage_pu", "frequency_hz", "solar_irradiance",
    "wind_speed", "temperature", "congestion_flag", "anomaly_score"
]

def validate_and_clean_csv(csv_content: bytes | str | pd.DataFrame) -> Tuple[bool, List[str], pd.DataFrame]:
    """
    Validates CSV telemetry payload.
    Returns: (is_valid, error_list, cleaned_dataframe)
    """
    errors: List[str] = []

    # 1. Parse DataFrame
    try:
        if isinstance(csv_content, bytes):
            df = pd.read_csv(io.BytesIO(csv_content))
        elif isinstance(csv_content, str):
            df = pd.read_csv(io.StringIO(csv_content))
        elif isinstance(csv_content, pd.DataFrame):
            df = csv_content.copy()
        else:
            return False, ["Invalid input format. Expected bytes, CSV string, or DataFrame."], pd.DataFrame()
    except Exception as e:
        return False, [f"Failed to parse CSV format: {str(e)}"], pd.DataFrame()

    if df.empty:
        return False, ["CSV file is empty."], df

    # 2. Check required columns
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        return False, [f"Missing required column(s): {', '.join(missing_cols)}"], df

    # 3. Clean column names (strip whitespace)
    df.columns = [c.strip().lower() for c in df.columns]

    # 4. Fill optional missing columns with sensible defaults
    defaults = {
        "voltage_pu": 1.0,
        "frequency_hz": 60.0,
        "solar_irradiance": 0.0,
        "wind_speed": 0.0,
        "temperature": 25.0,
        "congestion_flag": False,
        "anomaly_score": 0.0
    }
    for col, default_val in defaults.items():
        if col not in df.columns:
            df[col] = default_val

    # 5. Type coercions & numeric validation
    try:
        df["timestamp"] = pd.to_datetime(df["timestamp"])
    except Exception as e:
        errors.append(f"Invalid timestamp format: {str(e)}")

    df["node_id"] = df["node_id"].astype(str)

    numeric_cols = ["power_mw", "voltage_pu", "frequency_hz", "solar_irradiance", "wind_speed", "temperature"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Check for NaN in critical columns
    null_power = df["power_mw"].isnull().sum()
    if null_power > 0:
        errors.append(f"Found {null_power} missing/invalid numeric values in 'power_mw'. Imputing with column mean.")
        df["power_mw"] = df["power_mw"].fillna(df["power_mw"].mean())

    # Range validations
    if (df["voltage_pu"] < 0.5).any() or (df["voltage_pu"] > 1.5).any():
        errors.append("Warning: 'voltage_pu' contains extreme outliers out of bounds [0.5, 1.5]. Clipping values.")
        df["voltage_pu"] = df["voltage_pu"].clip(0.5, 1.5)

    if (df["frequency_hz"] < 50.0).any() or (df["frequency_hz"] > 70.0).any():
        errors.append("Warning: 'frequency_hz' contains out-of-bounds frequency readings outside [50, 70] Hz.")
        df["frequency_hz"] = df["frequency_hz"].clip(50.0, 70.0)

    df["congestion_flag"] = df["congestion_flag"].astype(bool)
    df["anomaly_score"] = df["anomaly_score"].fillna(0.0).clip(0.0, 1.0)

    # Sort chronologically
    df = df.sort_values(by="timestamp").reset_index(drop=True)

    is_valid = len([e for e in errors if not e.startswith("Warning:")]) == 0
    return is_valid, errors, df
