import pandas as pd
import numpy as np
from scipy.stats import ttest_ind
from sklearn.preprocessing import LabelEncoder
from backend.utils.feature_detector import detect_columns
from typing import Dict, Any, List

def analyze_bias(df: pd.DataFrame) -> dict:
    sensitive_cols, target_col = detect_columns(df)
    
    if not target_col:
        raise ValueError("No target column detected.")

    if not sensitive_cols:
        exclude_keywords = ["content", "note", "comment", "text", "description", "summary", "body", "id"]
        potential = df.select_dtypes(include=['object', 'category']).columns.tolist()
        if target_col in potential:
            potential.remove(target_col)
        # Select low-cardinality categorical columns that don't match exclusion keywords
        sensitive_cols = [
            col for col in potential 
            if df[col].nunique() < 50 and not any(ex in col.lower() for ex in exclude_keywords)
        ]
        
    if not sensitive_cols:
        # Final fallback: if absolutely nothing found, just pick the first few categoricals
        potential = [c for c in df.select_dtypes(include=['object', 'category']).columns if c != target_col]
        sensitive_cols = potential[:2] if potential else []

    if not sensitive_cols:
        raise ValueError("No demographic or categorical dimensions detected for audit.")

    df_working = df.copy()
    df_working = df_working.ffill().bfill().fillna(0)
    
    # Standardize target to binary (0/1)
    if df_working[target_col].dtype == 'object' or str(df_working[target_col].dtype) == 'category':
        le = LabelEncoder()
        df_working[target_col] = le.fit_transform(df_working[target_col].astype(str))
        if df_working[target_col].nunique() > 2:
            df_working[target_col] = (df_working[target_col] == df_working[target_col].mode()[0]).astype(int)
    else:
        df_working[target_col] = pd.to_numeric(df_working[target_col], errors='coerce').fillna(0)
        if df_working[target_col].nunique() > 2:
            df_working[target_col] = (df_working[target_col] > df_working[target_col].median()).astype(int)

    sample_size = len(df_working)
    
    # Data Quality Mode
    if sample_size < 30:
        mode = "LOW_DATA"
        base_confidence = 0.5
    elif sample_size < 200:
        mode = "MEDIUM_DATA"
        base_confidence = 0.75
    else:
        mode = "HIGH_DATA"
        base_confidence = 0.95

    dimensions = []
    total_score = 0.0
    unfair_count = 0
    warning_count = 0

    for col in sensitive_cols:
        groups = df_working.groupby(col)[target_col]
        means = groups.mean().to_dict()
        sizes = groups.size().to_dict()
        
        if len(means) < 2:
            continue
            
        max_g = max(means, key=means.get)
        min_g = min(means, key=means.get)
        max_v = float(means[max_g])
        min_v = float(means[min_g])
        diff = max_v - min_v
        
        # Sparsity Check: Are groups large enough to be representative?
        avg_group_size = np.mean(list(sizes.values()))
        is_sparse = avg_group_size < 5
        
        max_data = df_working[df_working[col] == max_g][target_col]
        min_data = df_working[df_working[col] == min_g][target_col]
        
        # Calculate p_value if possible
        if len(max_data) > 1 and len(min_data) > 1 and max_data.var() > 0 and min_data.var() > 0:
            _, p_value = ttest_ind(max_data, min_data, equal_var=False)
        else:
            p_value = 1.0

        # ADAPTIVE DECISION RULES
        if mode == "LOW_DATA":
            if diff < 0.15: # Raised threshold for low data
                verdict = "UNBIASED"
                note = f"Minimal variation ({int(diff*100)}%)."
            elif diff < 0.35:
                verdict = "WARNING"
                note = f"Variation observed, but dataset is too small for a definitive conclusion."
            else:
                # Only call it UNFAIR in low data if groups aren't sparse
                if is_sparse:
                    verdict = "WARNING"
                    note = f"Large disparity ({int(diff*100)}%), but sample size per group is too low to confirm bias."
                else:
                    verdict = "UNFAIR"
                    note = f"High disparity ({int(diff*100)}%) detected even in small sample."
                
        elif mode == "MEDIUM_DATA":
            if diff < 0.1:
                verdict = "UNBIASED"
                note = f"Insignificant variation detected."
            elif diff < 0.22:
                verdict = "WARNING"
                note = f"Moderate variation detected ({int(diff*100)}%)."
            else:
                if is_sparse and diff < 0.4:
                    verdict = "WARNING"
                    note = f"Significant disparity ({int(diff*100)}%), but limited samples per group."
                else:
                    verdict = "UNFAIR"
                    note = f"Clear evidence of outcome disparity."
                
        else: # HIGH_DATA
            if p_value > 0.01: # More strict p-value for HIGH_DATA
                verdict = "UNBIASED"
                note = f"Outcomes are statistically consistent (p={p_value:.3f})."
            elif diff < 0.12:
                verdict = "WARNING"
                note = f"Statistically valid but minor practical variation ({int(diff*100)}%)."
            else:
                verdict = "UNFAIR"
                note = f"Statistically significant bias detected (gap={int(diff*100)}%, p={p_value:.4f})."

        if verdict == "UNFAIR":
            unfair_count += 1
            total_score += min(5.0, diff * 10)
        elif verdict == "WARNING":
            warning_count += 1
            total_score += diff * 5
            
        dimensions.append({
            "name": col,
            "verdict": verdict,
            "note": note,
            "gap": diff  # Keeping this for the UI progress bar internally
        })

    if not dimensions:
        return {
            "final_verdict": "UNBIASED",
            "bias_score": 0.0,
            "confidence": 0.0,
            "data_quality": mode.replace("_DATA", ""),
            "explanation": "No analyzable dimensions found.",
            "dimensions": [],
            "bias_breakdown": [],
            "recommendations": []
        }

    avg_score = total_score / len(dimensions)
    bias_score = round(min(5.0, avg_score), 1)

    if unfair_count > 0:
        final_verdict = "UNFAIR"
        explanation = "Clear evidence of discrimination detected across one or more dimensions."
    elif warning_count > 0:
        final_verdict = "WARNING"
        explanation = "Potential fairness risks identified. Review variation in outcomes."
    else:
        final_verdict = "UNBIASED"
        explanation = "No meaningful bias detected. Dataset outcomes are consistent."

    # Gather detailed breakdown
    bias_breakdown = []
    for col in sensitive_cols:
        groups = df_working.groupby(col)[target_col]
        means = groups.mean()
        if len(means) < 2: continue
        
        max_g = means.idxmax()
        min_g = means.idxmin()
        gap = float(means[max_g] - means[min_g])
        
        bias_breakdown.append({
            "feature": col,
            "bias_percent": round(gap * 100),
            "favored_group": str(max_g),
            "disadvantaged_group": str(min_g)
        })

    # Base return object
    res = {
        "final_verdict": final_verdict,
        "bias_score": bias_score,
        "confidence": round(min(1.0, base_confidence + (len(dimensions) * 0.02)), 2),
        "data_quality": mode.replace("_DATA", ""),
        "explanation": explanation,
        "dimensions": dimensions,
        "bias_breakdown": [],
        "recommendations": []
    }

    # Only add deep insights if bias is detected
    if final_verdict != "UNBIASED" and bias_breakdown:
        # 1. Identify Top Feature
        top_factor = max(bias_breakdown, key=lambda x: x['bias_percent'])
        
        # 2. Simple Explanation
        res["explanation"] = (
            f"Bias is mainly driven by {top_factor['feature']}, where {top_factor['favored_group']} "
            f"candidates have a {top_factor['bias_percent']}% higher success rate than "
            f"{top_factor['disadvantaged_group']} candidates."
        )
        
        res["bias_breakdown"] = bias_breakdown

        # 3. Fix Simulations (Estimates)
        # Case 1: Removal impact (approximate based on score contribution)
        removal_impact = round((top_factor['bias_percent'] / (bias_score * 10 + 1)) * 5)
        
        # Case 2: Balancing impact (approximate reduction of gap)
        balancing_impact = round(top_factor['bias_percent'] * 0.4)

        res["recommendations"] = [
            {
                "action": f"Remove or ignore '{top_factor['feature']}' from decision logic",
                "impact": f"Bias score could reduce by approx {removal_impact}%"
            },
            {
                "action": f"Balance dataset across {top_factor['feature']} groups using stratified sampling",
                "impact": f"Bias disparity could reduce by approx {balancing_impact}%"
            }
        ]

    return res
