from fastapi import APIRouter, HTTPException
from backend.models.schema import ApiTestRequest, ApiTestResponse
from backend.services.model_tester import test_api_bias

router = APIRouter()

@router.post("/test-api", response_model=ApiTestResponse)
async def test_external_api_route(request: ApiTestRequest):
    try:
        results = test_api_bias(request.url)
        return results
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
