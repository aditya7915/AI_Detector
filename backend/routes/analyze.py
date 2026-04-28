from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
from backend.services.bias_engine import analyze_bias
from backend.utils.data_cleaner import clean_dataset
from backend.models.schema import BiasMetrics

router = APIRouter()

@router.post("/analyze", response_model=BiasMetrics)
async def analyze_dataset_route(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.json')):
        raise HTTPException(status_code=400, detail="Only CSV and JSON files are supported.")
    
    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            # Use engine='python' and sep=None to auto-detect the separator
            df = pd.read_csv(io.BytesIO(contents), sep=None, engine='python')
        else:
            df = pd.read_json(io.BytesIO(contents))
            
        df = clean_dataset(df)
        metrics = analyze_bias(df)
        
        return metrics
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
