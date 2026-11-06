"""Model evaluation metrics calculation for TrueLens.

Calculates binary classification metrics:
- Accuracy
- Precision (for AI-generated class)
- Recall (for AI-generated class)
- F1-Score
- ROC-AUC
- Confusion Matrix
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Union

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

logger = logging.getLogger(__name__)


def compute_metrics(
    y_true: Union[List[int], np.ndarray],
    y_pred: Union[List[int], np.ndarray],
    y_proba: Optional[Union[List[float], np.ndarray]] = None,
) -> Dict[str, Any]:
    """Calculate comprehensive evaluation metrics for binary classification.
    
    Class 0 = Original / Real
    Class 1 = AI-Generated
    """
    y_true_arr = np.asarray(y_true).astype(int)
    y_pred_arr = np.asarray(y_pred).astype(int)

    acc = float(accuracy_score(y_true_arr, y_pred_arr))
    prec = float(precision_score(y_true_arr, y_pred_arr, pos_label=1, zero_division=0))
    rec = float(recall_score(y_true_arr, y_pred_arr, pos_label=1, zero_division=0))
    f1 = float(f1_score(y_true_arr, y_pred_arr, pos_label=1, zero_division=0))

    roc_auc: Optional[float] = None
    if y_proba is not None:
        try:
            y_proba_arr = np.asarray(y_proba).astype(float)
            # Ensure at least two classes present in y_true to compute ROC-AUC
            if len(np.unique(y_true_arr)) > 1:
                roc_auc = float(roc_auc_score(y_true_arr, y_proba_arr))
        except Exception as exc:
            logger.warning("ROC-AUC computation failed: %s", exc)
            roc_auc = None

    cm = confusion_matrix(y_true_arr, y_pred_arr, labels=[0, 1]).tolist()

    return {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4) if roc_auc is not None else None,
        "confusion_matrix": cm,
        "sample_count": len(y_true_arr),
    }
