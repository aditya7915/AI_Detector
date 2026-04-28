def generate_explanation(bias_score: float, feature: str, status: str) -> str:
    """
    Generates a clear explanation based on the bias score.
    """
    if status == "Fair":
        return f"The model's outcomes are well-balanced across different {feature} groups, indicating a fair decision-making process."
    elif status == "Slight Bias":
        return f"There is a minor discrepancy in outcomes based on {feature}. The difference is noticeable but within acceptable margins for some contexts."
    else:
        return f"Significant bias detected! The system strongly favors certain {feature} groups over others, creating unfair advantages."

def generate_reason(final_verdict: str, bias_score: float, feature: str) -> str:
    if final_verdict == "FAIR":
        return f"The maximum difference between {feature} groups is {bias_score:.2f}, which is below the critical threshold."
    elif final_verdict == "WARNING":
        return f"Minor disparities detected in {feature} groups (diff: {bias_score:.2f}). Monitoring is recommended."
    else:
        return f"The difference between {feature} groups ({bias_score:.2f}) exceeds the acceptable limit (0.3), necessitating intervention."
