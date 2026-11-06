"""TrueLens Models Module.

Provides a common interface and implementations for all 7 models:
- Logistic Regression
- Random Forest
- SVM
- KNN
- XGBoost
- CNN
- Vision Transformer
"""

from models.base import BaseModel
from models.logistic_regression import LogisticRegressionModel
from models.random_forest import RandomForestModel
from models.svm import SVMModel
from models.knn import KNNModel
from models.xgboost_model import XGBoostModel
from models.cnn import CNNModel
from models.vision_transformer import VisionTransformerModel

MODEL_REGISTRY = {
    "logistic_regression": LogisticRegressionModel,
    "random_forest": RandomForestModel,
    "svm": SVMModel,
    "knn": KNNModel,
    "xgboost": XGBoostModel,
    "cnn": CNNModel,
    "vision_transformer": VisionTransformerModel,
}

__all__ = [
    "BaseModel",
    "LogisticRegressionModel",
    "RandomForestModel",
    "SVMModel",
    "KNNModel",
    "XGBoostModel",
    "CNNModel",
    "VisionTransformerModel",
    "MODEL_REGISTRY",
]
