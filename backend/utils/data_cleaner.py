import pandas as pd

def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    # Fill missing values: first forward fill, then backward fill, then 0
    df = df.ffill().bfill().fillna(0)
    return df
