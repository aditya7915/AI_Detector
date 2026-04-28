import requests

def test_api_bias(url: str) -> dict:
    base_case = {
        "income": 50000,
        "age": 30,
        "credit_score": 700,
        "loan_amount": 20000,
        "employment_years": 5
    }
    
    sensitive_variations = [
        {"gender": "male", "race": "caucasian"},
        {"gender": "female", "race": "caucasian"},
        {"gender": "male", "race": "african_american"},
        {"gender": "female", "race": "african_american"},
        {"gender": "non-binary", "race": "hispanic"}
    ]
    
    decision_variations = []
    outputs = []
    
    try:
        for var in sensitive_variations:
            case = base_case.copy()
            case.update(var)
            
            try:
                response = requests.post(url, json=case, timeout=5)
                if response.status_code == 200:
                    result = response.json()
                    # Extract prediction
                    pred = str(result.get('prediction', result.get('status', result.get('outcome', result))))
                else:
                    pred = f"Error: {response.status_code}"
            except Exception as e:
                pred = f"Connection Error: {str(e)}"
            
            variation_entry = var.copy()
            variation_entry["result"] = pred
            decision_variations.append(variation_entry)
            outputs.append(pred)
            
        valid_outputs = [o for o in outputs if "Error" not in o]
        
        if valid_outputs:
            # majority output as baseline for consistency
            majority_output = max(set(valid_outputs), key=valid_outputs.count)
            inconsistent_cases = sum(1 for o in valid_outputs if o != majority_output)
        else:
            inconsistent_cases = 0
            
        total_cases = len(sensitive_variations)
        bias_score = inconsistent_cases / total_cases if total_cases > 0 else 0.0
        bias_detected = inconsistent_cases > 0
        
        return {
            "bias_detected": bias_detected,
            "bias_score": round(bias_score, 2),
            "cases_tested": total_cases,
            "inconsistent_cases": inconsistent_cases,
            "explanation": "Model behaves differently for the same inputs when only the sensitive attributes change." if bias_detected else "Model is consistent across all sensitive variations.",
            "decision_variations": decision_variations
        }

    except Exception as e:
        raise ValueError(f"Failed to test the external API at {url}. Error: {str(e)}")
