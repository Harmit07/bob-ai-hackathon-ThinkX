import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.models import Base, GridNode, TelemetryRecord
from app.db.seed import SEED_NODES, seed_database

def test_db_models_and_seeding():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    seed_database(db)

    nodes = db.query(GridNode).all()
    assert len(nodes) >= 5

    telemetry_count = db.query(TelemetryRecord).count()
    assert telemetry_count > 0
