"""Integration test suite for TrueLens FastAPI ML Service."""

import os
import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure ml-service root is in sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from api.main import app
from api.routes import load_all_saved_models

def run_tests():
    print("========================================")
    print("TRUELENS ML SERVICE INTEGRATION TESTS")
    print("========================================")

    # 1. Initialize models
    print("\n[1/5] Loading saved models...")
    load_all_saved_models()

    client = TestClient(app)

    # 2. Test GET /health
    print("\n[2/5] Testing GET /health ...")
    res_health = client.get("/health")
    print("Status:", res_health.status_code)
    health_json = res_health.json()
    print("Health response:", health_json)
    assert res_health.status_code == 200
    assert health_json["status"] == "ok"
    assert len(health_json["loaded_models"]) > 0, "Expected at least 1 trained model loaded!"
    print("PASS: /health verified.")

    # 3. Test GET /models and GET /models/comparison
    print("\n[3/5] Testing GET /models and /models/comparison ...")
    res_models = client.get("/models")
    assert res_models.status_code == 200
    models_json = res_models.json()
    print(f"Total model definitions: {len(models_json['models'])}")

    res_comp = client.get("/models/comparison")
    assert res_comp.status_code == 200
    comp_json = res_comp.json()
    print(f"Comparison total models: {comp_json['total_models']}, trained: {comp_json['trained_models_count']}")
    for m in comp_json["comparison"]:
        print(f"  - {m['model_name']} ({m['model_type']}): status={m['status']}, acc={m['accuracy']}")
    print("PASS: /models and /models/comparison verified.")

    # 4. Test GET /metrics
    print("\n[4/5] Testing GET /metrics ...")
    res_metrics = client.get("/metrics")
    assert res_metrics.status_code == 200
    metrics_json = res_metrics.json()
    print(f"Metrics dataset: {metrics_json['dataset_version']}, samples: {metrics_json['test_sample_count']}")
    assert len(metrics_json["models"]) == 7, "Expected metrics for all 7 models"
    print("PASS: /metrics verified.")

    # 5. Test POST /predict with real images
    print("\n[5/5] Testing POST /predict with test images ...")
    test_real_img = BASE_DIR / "data" / "test" / "real" / "real_0000.jpg"
    test_ai_img = BASE_DIR / "data" / "test" / "ai_generated" / "ai_0000.jpg"

    assert test_real_img.exists(), f"Missing {test_real_img}"
    assert test_ai_img.exists(), f"Missing {test_ai_img}"

    # Test real image prediction
    with open(test_real_img, "rb") as f:
        res_pred_real = client.post(
            "/predict",
            files={"file": ("real_0000.jpg", f, "image/jpeg")}
        )
    print("Real image predict status:", res_pred_real.status_code)
    assert res_pred_real.status_code == 200
    real_json = res_pred_real.json()
    print(f"Prediction for real image: class={real_json['predicted_class']}, P(real)={real_json['original_probability']}, P(AI)={real_json['ai_generated_probability']}, uncertainty={real_json['uncertainty_status']}")
    print(f"Model predictions count: {len(real_json['model_predictions'])}")

    # Test AI image prediction
    with open(test_ai_img, "rb") as f:
        res_pred_ai = client.post(
            "/predict",
            files={"file": ("ai_0000.jpg", f, "image/jpeg")}
        )
    print("AI image predict status:", res_pred_ai.status_code)
    assert res_pred_ai.status_code == 200
    ai_json = res_pred_ai.json()
    print(f"Prediction for AI image: class={ai_json['predicted_class']}, P(real)={ai_json['original_probability']}, P(AI)={ai_json['ai_generated_probability']}, uncertainty={ai_json['uncertainty_status']}")

    print("\n========================================")
    print("ALL ML SERVICE INTEGRATION TESTS PASSED!")
    print("========================================")

if __name__ == "__main__":
    run_tests()
