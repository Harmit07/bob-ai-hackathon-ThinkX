from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.database import get_db
from app.db.models import GridNode, TelemetryRecord
from app.db.schemas import GridNodeResponse, TelemetryRecordResponse
from app.ml_engine.dataset_generator import generate_synthetic_telemetry
from app.ml_engine.csv_validator import validate_and_clean_csv

router = APIRouter(prefix="/data", tags=["Grid Data & Telemetry"])

@router.get("/nodes", response_model=List[GridNodeResponse])
def get_grid_nodes(db: Session = Depends(get_db)):
    nodes = db.query(GridNode).all()
    return nodes

@router.get("/synthetic", response_model=List[Dict[str, Any]])
def get_synthetic_telemetry(
    num_hours: int = Query(24, ge=1, le=720, description="Hours of synthetic telemetry to generate"),
    seed: int = Query(42, description="Random seed for reproducibility")
):
    df = generate_synthetic_telemetry(num_hours=num_hours, seed=seed)
    return df.to_dict(orient="records")

@router.post("/upload-csv")
async def upload_and_validate_csv(file: UploadFile = File(...)):
    if not file.filename.endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    is_valid, errors, df = validate_and_clean_csv(content)

    return {
        "filename": file.filename,
        "is_valid": is_valid,
        "row_count": len(df),
        "validation_messages": errors,
        "sample_records": df.head(10).to_dict(orient="records") if not df.empty else []
    }
