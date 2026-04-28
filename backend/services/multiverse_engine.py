import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from backend.utils.feature_detector import detect_columns

def get_pipeline(X):
    categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()
    numeric_features = X.select_dtypes(include=['int64', 'float64', 'int32', 'float32']).columns.tolist()
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ],
        remainder='drop'
    )
    
    return Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42))
    ])

def train_and_evaluate(df_train: pd.DataFrame, df_eval: pd.DataFrame, name: str, sensitive_col: str, target_col: str) -> dict:
    df_train = df_train.copy()
    df_eval = df_eval.copy()
    
    # Preprocess target in training
    if df_train[target_col].dtype == 'object' or str(df_train[target_col].dtype) == 'category':
        le = LabelEncoder()
        y_train = le.fit_transform(df_train[target_col].astype(str))
    else:
        y_train = pd.to_numeric(df_train[target_col], errors='coerce').fillna(0)
        if y_train.nunique() > 2:
            y_train = (y_train > y_train.median()).astype(int)
            
    X_train = df_train.drop(columns=[target_col])
    
    clf = get_pipeline(X_train)
    clf.fit(X_train, y_train)
    
    # Prepare X_eval for prediction
    X_eval = df_eval.drop(columns=[target_col], errors='ignore')
    
    # Ensure same columns
    for col in X_train.columns:
        if col not in X_eval.columns:
            X_eval[col] = 0
    X_eval = X_eval[X_train.columns]
    
    try:
        preds = clf.predict(X_eval)
    except:
        preds = np.zeros(len(df_eval))
        
    df_eval['preds'] = preds
    
    # Calculate Bias (Demographic Parity Difference)
    group_stats = df_eval.groupby(sensitive_col)['preds'].mean().to_dict()
    if len(group_stats) < 2:
        bias_score = 0.0
    else:
        vals = list(group_stats.values())
        bias_score = max(vals) - min(vals)
        
    if bias_score < 0.1:
        status = "Fair"
    elif bias_score <= 0.3:
        status = "Slight Bias"
    else:
        status = "High Bias"
        
    return {
        "name": name,
        "bias_score": round(float(bias_score), 4),
        "status": status
    }

def simulate_multiverse(df: pd.DataFrame) -> dict:
    # Sampling for performance
    df = df.sample(n=min(1000, len(df)), random_state=42)
    
    sensitive_cols, target_col = detect_columns(df)
    if not sensitive_cols or not target_col:
        raise ValueError("Missing sensitive or target column for simulation")
    
    # Use the primary sensitive column for multiverse simulation
    sensitive_col = sensitive_cols[0]
        
    results = []
    
    # 1. Alpha: Original
    results.append(train_and_evaluate(df.copy(), df.copy(), "Alpha", sensitive_col, target_col))
    
    # 2. Beta: Remove sensitive column
    df_beta_train = df.drop(columns=[sensitive_col])
    results.append(train_and_evaluate(df_beta_train, df.copy(), "Beta", sensitive_col, target_col))
    
    # 3. Gamma: Balance dataset
    counts = df[sensitive_col].value_counts()
    max_count = counts.max()
    df_gamma = pd.concat([
        df[df[sensitive_col] == group].sample(max_count, replace=True, random_state=42)
        for group in counts.index if len(df[df[sensitive_col] == group]) > 0
    ]).sample(frac=1, random_state=42).reset_index(drop=True)
    results.append(train_and_evaluate(df_gamma, df.copy(), "Gamma", sensitive_col, target_col))
    
    # 4. Delta: Add noise to numeric columns
    df_delta = df.copy()
    numeric_cols = df_delta.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if col != target_col:
            std = df_delta[col].std()
            if pd.notna(std) and std > 0:
                noise = np.random.normal(0, std * 0.1, len(df_delta))
                df_delta[col] = df_delta[col] + noise
    results.append(train_and_evaluate(df_delta, df.copy(), "Delta", sensitive_col, target_col))
    
    # 5. Epsilon: Remove proxy features
    proxies = ['zip_code', 'zip', 'region', 'location', 'address']
    cols_to_drop = [c for c in df.columns if c.lower() in proxies]
    df_epsilon_train = df.drop(columns=cols_to_drop) if cols_to_drop else df.copy()
    results.append(train_and_evaluate(df_epsilon_train, df.copy(), "Epsilon", sensitive_col, target_col))
    
    # 6. Omega: Stress test
    # Find the group with the lowest mean outcome
    # Binarize target briefly to calculate
    temp_df = df.copy()
    if temp_df[target_col].dtype == 'object':
        temp_df['bin_target'] = LabelEncoder().fit_transform(temp_df[target_col].astype(str))
    else:
        temp_df['bin_target'] = pd.to_numeric(temp_df[target_col], errors='coerce').fillna(0)
        
    group_means = temp_df.groupby(sensitive_col)['bin_target'].mean()
    if not group_means.empty:
        min_group = group_means.idxmin()
        stress_data = df[df[sensitive_col] == min_group].copy()
        # Force outcome to the minority value
        if df[target_col].dtype == 'object':
            stress_data[target_col] = temp_df[target_col].value_counts().index[-1]
        else:
            stress_data[target_col] = 0
        df_omega = pd.concat([df, stress_data, stress_data]).sample(frac=1, random_state=42)
        results.append(train_and_evaluate(df_omega, df.copy(), "Omega", sensitive_col, target_col))
    else:
        results.append(results[0].copy()) # Fallback
        results[-1]["name"] = "Omega"

    scores = [r["bias_score"] for r in results]
    std_dev = np.std(scores)
    stability_score = 100 - (std_dev * 100)
    stability_score = max(0, min(100, float(stability_score)))
    
    return {
        "worlds": results,
        "stability_score": round(stability_score, 2),
        "insight": f"Bias fluctuates from {min(scores):.2f} to {max(scores):.2f}. A higher stability score indicates the model's fairness is robust across data permutations."
    }
