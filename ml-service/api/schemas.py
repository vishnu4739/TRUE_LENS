"""Pydantic schemas for TrueLens ML API."""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "TrueLens ML Service"
    version: str = "1.0.0"
    available_models: List[str]
    loaded_models: List[str]


class SingleModelPrediction(BaseModel):
    model_name: str
    predicted_class: str
    confidence: float
    original_probability: float
    ai_generated_probability: float
    is_uncertain: bool


class PredictResponse(BaseModel):
    prediction_id: str
    predicted_class: str
    original_probability: float
    ai_generated_probability: float
    uncertainty_status: str  # "certain", "uncertain", "inconclusive"
    model_version: str = "1.0.0"
    model_predictions: List[SingleModelPrediction]
    available_model_count: int
    analyzed_at: str


class ConfusionMatrixData(BaseModel):
    matrix: List[List[int]]  # [[TN, FP], [FN, TP]]
    labels: List[str] = ["Original", "AI-Generated"]


class ModelMetricEntry(BaseModel):
    model: str
    model_key: str
    model_type: str
    status: str  # "trained" | "not_trained"
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    roc_auc: Optional[float] = None
    confusion_matrix: Optional[List[List[int]]] = None
    dataset_version: Optional[str] = None


class MetricsResponse(BaseModel):
    dataset_version: Optional[str]
    test_sample_count: int
    models: List[ModelMetricEntry]


class ModelComparisonEntry(BaseModel):
    rank: int
    model_name: str
    model_key: str
    model_type: str
    status: str
    accuracy: Optional[float]
    precision: Optional[float]
    recall: Optional[float]
    f1_score: Optional[float]
    roc_auc: Optional[float]


class ComparisonResponse(BaseModel):
    dataset_version: Optional[str]
    total_models: int
    trained_models_count: int
    comparison: List[ModelComparisonEntry]


class EvaluateResponse(BaseModel):
    message: str
    summary: Dict[str, Any]
