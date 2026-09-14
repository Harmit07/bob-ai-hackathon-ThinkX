import os
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session

from app.db.database import Base, engine, SessionLocal
from app.db.models import GridNode, TelemetryRecord, ForecastRecord, AlertRecord, OptimizationRun

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data")

SEED_NODES = [
    {"id": "SOLAR_B17", "node_name": "Solar Valley B17", "node_type": "solar", "max_capacity_mw": 150.0, "cost_per_mwh": 10.0, "emission_rate_kg_mwh": 0.0, "status": "active"},
    {"id": "BESS_03", "node_name": "Industrial Belt Battery BESS_03", "node_type": "battery", "max_capacity_mw": 350.0, "cost_per_mwh": 5.0, "emission_rate_kg_mwh": 0.0, "status": "active"},
    {"id": "WIND_W01", "node_name": "Highland Wind Corridor 01", "node_type": "wind", "max_capacity_mw": 200.0, "cost_per_mwh": 15.0, "emission_rate_kg_mwh": 0.0, "status": "active"},
    {"id": "THERMAL_T01", "node_name": "Metro Gas Peaker T01", "node_type": "thermal", "max_capacity_mw": 300.0, "cost_per_mwh": 85.0, "emission_rate_kg_mwh": 480.0, "status": "active"},
    {"id": "HYDRO_H01", "node_name": "Coastal Hydro H01", "node_type": "hydro", "max_capacity_mw": 120.0, "cost_per_mwh": 22.0, "emission_rate_kg_mwh": 0.0, "status": "active"}
]

def init_db():
    Base.metadata.create_all(bind=engine)

def seed_database(db: Session):
    # Load unique assets from data/assets.csv if available
    assets_file = os.path.join(DATA_DIR, "assets.csv")
    existing_nodes = db.query(GridNode).count()

    if existing_nodes == 0:
        if os.path.exists(assets_file):
            assets_df = pd.read_csv(assets_file)
            unique_assets = assets_df.drop_duplicates(subset=["asset_id"]).to_dict(orient="records")
            
            cost_map = {"solar": 10.0, "wind": 15.0, "thermal": 85.0, "hydro": 22.0, "battery": 5.0, "substation": 0.0}
            emiss_map = {"thermal": 480.0, "solar": 0.0, "wind": 0.0, "hydro": 0.0, "battery": 0.0, "substation": 0.0}

            for a in unique_assets:
                node = GridNode(
                    id=a["asset_id"],
                    node_name=a["asset_name"],
                    node_type=a["asset_type"],
                    max_capacity_mw=float(a["capacity_mw"]),
                    current_load_mw=0.0,
                    cost_per_mwh=cost_map.get(a["asset_type"], 40.0),
                    emission_rate_kg_mwh=emiss_map.get(a["asset_type"], 0.0),
                    ramp_rate_mw_h=float(a["capacity_mw"]) * 0.8,
                    location_lat=float(a["latitude"]),
                    location_lon=float(a["longitude"]),
                    status="active" if a["status"] == "NORMAL" else a["status"].lower()
                )
                db.add(node)
            db.commit()
            print(f"Seeded {len(unique_assets)} real grid assets from data/assets.csv.")
        else:
            db.add_all([GridNode(**node) for node in SEED_NODES])
            db.commit()
            print(f"Seeded {len(SEED_NODES)} default grid assets.")

    # Telemetry seed from data/asset_telemetry.csv
    telemetry_count = db.query(TelemetryRecord).count()
    telemetry_file = os.path.join(DATA_DIR, "asset_telemetry.csv")
    
    if telemetry_count == 0 and os.path.exists(telemetry_file):
        # Sample first 500 rows for fast DB seeding
        t_df = pd.read_csv(telemetry_file, nrows=500)
        telemetry_objs = []
        
        for _, row in t_df.iterrows():
            ts = pd.to_datetime(row["timestamp"])
            p_mw = float(row.get("power_output_mw", 0.0))
            v_kv = float(row.get("voltage_kv", 1.0))
            freq = float(row.get("frequency_hz", 60.0))
            irr = float(row.get("irradiance_w_m2", 0.0))
            temp = float(row.get("temperature_c", 25.0))
            fault = str(row.get("fault_type", "NORMAL"))
            
            t_obj = TelemetryRecord(
                timestamp=ts,
                node_id=str(row["asset_id"]),
                power_mw=round(p_mw, 2),
                voltage_pu=round(v_kv / 33.0, 3) if v_kv > 2.0 else round(v_kv, 3), # normalize kv to pu
                frequency_hz=round(freq, 2),
                solar_irradiance=round(irr, 1),
                wind_speed=0.0,
                temperature=round(temp, 1),
                congestion_flag=fault == "GRID_CONSTRAINT",
                anomaly_score=0.90 if fault != "NORMAL" else 0.05
            )
            telemetry_objs.append(t_obj)

        db.bulk_save_objects(telemetry_objs)
        db.commit()
        print(f"Seeded {len(telemetry_objs)} telemetry records from data/asset_telemetry.csv.")
    elif telemetry_count == 0:
        default_telemetry = [
            TelemetryRecord(
                timestamp=datetime.utcnow() - timedelta(minutes=index * 5),
                node_id=node["id"],
                power_mw=node["max_capacity_mw"] * 0.6,
                voltage_pu=1.0,
                frequency_hz=60.0,
                solar_irradiance=0.0,
                wind_speed=0.0,
                temperature=25.0,
                congestion_flag=False,
                anomaly_score=0.0,
            )
            for index, node in enumerate(SEED_NODES)
        ]
        db.add_all(default_telemetry)
        db.commit()
        print(f"Seeded {len(default_telemetry)} default telemetry records.")

if __name__ == "__main__":
    init_db()
    db = SessionLocal()
    seed_database(db)
    print("Database seeding completed.")
