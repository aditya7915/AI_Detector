import pandas as pd
from typing import List, Tuple, Optional
import numpy as np

def detect_columns(df: pd.DataFrame) -> Tuple[List[str], Optional[str]]:
    sensitive_candidates = [
        "gender", "sex", "race", "ethnicity", "age", "religion", 
        "region", "location", "zip_code", "zip", "nationality",
        "marital_status", "disability", "education", "income"
    ]
    target_candidates = [
        "approved", "selected", "target", "prediction", "outcome", 
        "label", "class", "status", "decision", "y", "admit", "hired"
    ]
    # Keywords that usually indicate general text/notes rather than demographics
    exclude_keywords = ["content", "note", "comment", "text", "description", "summary", "body", "id"]

    found_sensitive = []
    cols = [str(c).strip() for c in df.columns]
    cols_lower = [c.lower() for c in cols]
    
    for i, col_lower in enumerate(cols_lower):
        # 1. Match demographic keywords
        if any(cand in col_lower for cand in sensitive_candidates):
            # Check it's not in exclude list (e.g. "age_notes")
            if not any(ex in col_lower for ex in exclude_keywords):
                found_sensitive.append(df.columns[i])
            
    target_col = None
    for i, col_lower in enumerate(cols_lower):
        if any(cand == col_lower for cand in target_candidates):
            target_col = df.columns[i]
            break
            
    if not target_col:
        for i, col_lower in enumerate(cols_lower):
            if any(cand in col_lower for cand in target_candidates):
                target_col = df.columns[i]
                break

    if not target_col:
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            for col in reversed(numeric_cols):
                if col not in found_sensitive:
                    target_col = col
                    break
    
    if not target_col and len(df.columns) > 0:
        target_col = df.columns[-1]
            
    return found_sensitive, target_col
