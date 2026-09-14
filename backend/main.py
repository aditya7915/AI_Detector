from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import analyze, simulate, api_test
from pydantic import BaseModel
import random

app = FastAPI(title="Bias Multiverse Engine API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#nothing
# Include Routers
app.include_router(analyze.router, tags=["Analysis"])
app.include_router(simulate.router, tags=["Simulation"])
app.include_router(api_test.router, tags=["API Testing"])

@app.get("/")
async def root():
    return {"message": "Bias Multiverse Engine Backend is running"}

# Provide a dummy model endpoint for testing the API tester if the user doesn't have an external API
class DummyModelInput(BaseModel):
    income: int = 50000
    age: int = 30
    credit_score: int = 700
    loan_amount: int = 20000
    employment_years: int = 5
    gender: str = "unknown"
    race: str = "unknown"

@app.post("/dummy-model")
async def dummy_model_predict(data: DummyModelInput):
    # This dummy model has a built-in bias against 'female' and 'african_american'
    score = data.income / 1000 + data.credit_score / 10
    
    if data.gender.lower() == "female":
        score -= 15
    if data.race.lower() == "african_american":
        score -= 20
        
    prediction = "approved" if score > 100 else "denied"
    return {"prediction": prediction, "confidence": round(random.uniform(0.7, 0.99), 2)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
