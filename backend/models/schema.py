from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DimensionVerdict(BaseModel):
    name: str
    verdict: str  # UNBIASED, WARNING, UNFAIR
    note: str
    gap: float

class FeatureBias(BaseModel):
    feature: str
    bias_percent: int
    favored_group: str
    disadvantaged_group: str

class Recommendation(BaseModel):
    action: str
    impact: str

class BiasMetrics(BaseModel):
    final_verdict: str
    bias_score: float
    confidence: float
    data_quality: str
    explanation: str
    dimensions: List[DimensionVerdict]
    bias_breakdown: List[FeatureBias] = []
    recommendations: List[Recommendation] = []

class WorldResponse(BaseModel):
    name: str
    bias_score: float
    status: str

class SimulateResponse(BaseModel):
    worlds: List[WorldResponse]
    stability_score: float
    insight: str

class ApiTestRequest(BaseModel):
    url: str

class ApiTestResponse(BaseModel):
    bias_detected: bool
    bias_score: float
    cases_tested: int
    inconsistent_cases: int
    explanation: str
    decision_variations: List[Dict[str, Any]]
