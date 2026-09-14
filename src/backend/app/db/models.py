from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

class GridNode(Base):
    __tablename__ = "grid_nodes"

    id = Column(String(50), primary_key=True, index=True)
    node_name = Column(String(100), nullable=False)
    node_type = Column(String(50), nullable=False) # 'solar', 'wind', 'thermal', 'hydro', 'battery', 'load_center'
    max_capacity_mw = Column(Float, nullable=False, default=100.0)
    current_load_mw = Column(Float, nullable=False, default=0.0)
    cost_per_mwh = Column(Float, nullable=False, default=50.0) # operational cost $ / MWh
    emission_rate_kg_mwh = Column(Float, nullable=False, default=0.0) # kg CO2 / MWh
    ramp_rate_mw_h = Column(Float, nullable=False, default=50.0) # Max MW/h change
    location_lat = Column(Float, nullable=True)
    location_lon = Column(Float, nullable=True)
    status = Column(String(20), nullable=False, default="active") # active, degraded, offline

    telemetry = relationship("TelemetryRecord", back_populates="node", cascade="all, delete-orphan")
    forecasts = relationship("ForecastRecord", back_populates="node", cascade="all, delete-orphan")
    alerts = relationship("AlertRecord", back_populates="node", cascade="all, delete-orphan")


class TelemetryRecord(Base):
    __tablename__ = "telemetry_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, index=True, default=datetime.utcnow)
    node_id = Column(String(50), ForeignKey("grid_nodes.id"), nullable=False)
    power_mw = Column(Float, nullable=False)
    voltage_pu = Column(Float, nullable=False, default=1.0) # Per-unit voltage (0.95 - 1.05 normal)
    frequency_hz = Column(Float, nullable=False, default=60.0) # 60 Hz standard
    solar_irradiance = Column(Float, nullable=True, default=0.0) # W/m2
    wind_speed = Column(Float, nullable=True, default=0.0) # m/s
    temperature = Column(Float, nullable=True, default=25.0) # Celsius
    congestion_flag = Column(Boolean, nullable=False, default=False)
    anomaly_score = Column(Float, nullable=False, default=0.0)

    node = relationship("GridNode", back_populates="telemetry")


class ForecastRecord(Base):
    __tablename__ = "forecast_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    node_id = Column(String(50), ForeignKey("grid_nodes.id"), nullable=False)
    forecast_type = Column(String(50), nullable=False) # 'demand', 'solar', 'wind'
    predicted_mw = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=False)
    upper_bound = Column(Float, nullable=False)

    node = relationship("GridNode", back_populates="forecasts")


class OptimizationRun(Base):
    __tablename__ = "optimization_runs"

    id = Column(String(50), primary_key=True, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    status = Column(String(20), nullable=False, default="optimal") # optimal, infeasible, warning
    total_cost_usd = Column(Float, nullable=False, default=0.0)
    total_emissions_tons = Column(Float, nullable=False, default=0.0)
    total_curtailment_mwh = Column(Float, nullable=False, default=0.0)
    grid_stress_index = Column(Float, nullable=False, default=0.0)
    recommendations_json = Column(JSON, nullable=True)


class AlertRecord(Base):
    __tablename__ = "alert_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    node_id = Column(String(50), ForeignKey("grid_nodes.id"), nullable=True)
    alert_type = Column(String(50), nullable=False) # VOLTAGE_SAG, FREQUENCY_DROP, OVERLOAD, CURTAILMENT_RISK
    severity = Column(String(20), nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="active")

    node = relationship("GridNode", back_populates="alerts")
