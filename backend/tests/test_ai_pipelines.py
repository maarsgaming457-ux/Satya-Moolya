import pytest
import numpy as np
from app.services.component_detection_service import HeuristicComponentDetector
from app.services.damage_detection_service import DamageDetectionEngine
from app.services.quality_validation_service import QualityValidationService

def test_component_detection_boot():
    """Test that the component detector initializes and handles empty frames without crashing."""
    detector = HeuristicComponentDetector()
    
    # Create a synthetic 1920x1080 black image (numpy array)
    frame = np.zeros((1080, 1920, 3), dtype=np.uint8)
    
    # Predict components on a blank frame
    results = detector.predict(frame, "Front")
    
    # Should return valid JSON schema with components list
    assert "components" in results
    assert "frame" in results
    assert results["frame"] == "Front"

def test_damage_detection_boot():
    """Test that the damage detector initializes and processes synthetic data safely."""
    engine = DamageDetectionEngine()
    
    frame = np.zeros((1080, 1920, 3), dtype=np.uint8)
    mock_components = {
        "components": [
            {
                "class": "screen",
                "confidence": 0.99,
                "bbox": {"x": 100, "y": 100, "width": 500, "height": 800}
            }
        ]
    }
    
    results = engine.analyze(frame, "Front", mock_components)
    
    # Should return valid JSON schema with damages list
    assert "damages" in results
    assert "frame" in results
    assert results["frame"] == "Front"

def test_quality_validation_service():
    """Test the image quality heuristic logic."""
    service = QualityValidationService()
    
    # Completely black frame should fail validation
    frame = np.zeros((1080, 1920, 3), dtype=np.uint8)
    tracks = [{"class": "phone", "confidence": 0.9, "bbox": {"x": 10, "y": 10, "width": 100, "height": 100}}]
    
    results = service.validate(frame, tracks)
    
    assert "accepted" in results
    assert "quality_score" in results
    assert "reason" in results
