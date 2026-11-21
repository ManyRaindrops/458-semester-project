"""Planned recipe filtering and ranking module; ranking is not implemented.

The intended work is to filter recipes by hard constraints, score eligible
recipes, and explain the top matches. This module currently has no catalog,
scoring function, or public API.
"""

import numpy as np

# Task: Filter the recipe catalog against hard student constraints (allergens & dorm equipment),
# score surviving recipes with a weighted linear model, and return the top 3 matches with explanations.
