import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Task: Normalize messy free-text student pantry entries (e.g., "2 chx breast, green onions, leftover rice")
# into canonical ingredient IDs with confidence scores using vector embeddings / cosine similarity.