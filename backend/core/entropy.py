import math
from collections import Counter

def calculate_shannon_entropy(text: str) -> float:
    """
    Calculate Shannon entropy of a string
    H(X) = -Σ P(x) * log2(P(x))
    """
    if not text:
        return 0.0
    
    # Count frequency of each character
    char_counts = Counter(text)
    length = len(text)
    
    # Calculate entropy
    entropy = 0.0
    for count in char_counts.values():
        probability = count / length
        if probability > 0:
            entropy -= probability * math.log2(probability)
    
    return entropy

def get_entropy_color(entropy: float, max_entropy: float = 8.0) -> str:
    """
    Get color based on entropy value
    Returns: color name for TailwindCSS
    """
    if max_entropy == 0:
        return "yellow"
    
    ratio = entropy / max_entropy
    
    if ratio < 0.5:
        return "yellow"
    else:
        return "green"

