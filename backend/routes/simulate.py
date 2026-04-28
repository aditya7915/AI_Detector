from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
from backend.services.multiverse_engine import simulate_multiverse
from backend.utils.data_cleaner import clean_dataset
from backend.models.schema import SimulateResponse

router = APIRouter()

@router.post("/simulate", response_model=SimulateResponse)
async def simulate_multiverse_route(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.json')):
        raise HTTPException(status_code=400, detail="Only CSV and JSON files are supported.")
        
    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_json(io.BytesIO(contents))
            
        df = clean_dataset(df)
        simulation_results = simulate_multiverse(df)
        
        return simulation_results
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")
