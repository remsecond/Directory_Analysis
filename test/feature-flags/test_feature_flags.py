import pytest
from typing import Dict
from src.feature_flags import FeatureFlags, PercentageFlag, ExperimentalFlag

# Test Data
SAMPLE_CONFIG = {
    "features": {
        "enhanced_email": {
            "enabled": False,
            "rollout_percentage": 0,
            "shadow_mode": True,
            "log_level": "debug"
        },
        "ai_categorization": {
            "enabled": False,
            "confidence_threshold": 0.9,
            "fallback_enabled": True
        }
    },
    "experiments": {
        "new_pdf_processor": {
            "enabled": False,
            "sample_size": 100,
            "compare_results": True
        }
    }
}

@pytest.fixture
def feature_flags():
    return FeatureFlags(SAMPLE_CONFIG)

class TestFeatureFlags:
    def test_basic_flag_disabled_by_default(self, feature_flags):
        """Features should be disabled by default"""
        assert not feature_flags.is_enabled("non_existent_feature")
        assert not feature_flags.is_enabled("enhanced_email")

    def test_enable_feature(self, feature_flags):
        """Should be able to enable features"""
        feature_flags.enable("enhanced_email")
        assert feature_flags.is_enabled("enhanced_email")

    def test_disable_feature(self, feature_flags):
        """Should be able to disable features"""
        feature_flags.enable("enhanced_email")
        feature_flags.disable("enhanced_email")
        assert not feature_flags.is_enabled("enhanced_email")

    def test_percentage_rollout(self, feature_flags):
        """Percentage rollout should affect expected number of cases"""
        feature_flags.set_rollout_percentage("enhanced_email", 50)
        
        # Test with 1000 different IDs
        enabled_count = sum(
            1 for i in range(1000)
            if feature_flags.should_enable("enhanced_email", f"test_id_{i}")
        )
        
        # Should be roughly 50%, allow 5% margin
        assert 450 <= enabled_count <= 550

    def test_shadow_mode(self, feature_flags):
        """Shadow mode should not affect main functionality"""
        feature_flags.enable_shadow("enhanced_email")
        
        # Feature should still be disabled for normal operation
        assert not feature_flags.is_enabled("enhanced_email")
        
        # But shadow mode should be active
        assert feature_flags.is_shadow_enabled("enhanced_email")

class TestPercentageFlag:
    def test_consistent_results(self):
        """Same ID should get same result"""
        flag = PercentageFlag("test", 50)
        test_id = "user_123"
        
        # Should get same result for same ID
        first_result = flag.should_enable(test_id)
        for _ in range(10):
            assert flag.should_enable(test_id) == first_result

    def test_distribution(self):
        """Results should follow expected distribution"""
        flag = PercentageFlag("test", 25)
        results = [flag.should_enable(f"id_{i}") for i in range(1000)]
        enabled_count = sum(results)
        
        # Should be roughly 25%, allow 5% margin
        assert 200 <= enabled_count <= 300

class TestExperimentalFlag:
    def test_shadow_mode(self):
        """Shadow mode should work independently"""
        flag = ExperimentalFlag("test")
        
        # Enable shadow mode
        flag.enable_shadow()
        assert flag.is_shadow_enabled()
        assert not flag.is_enabled()
        
        # Enable main feature
        flag.enable()
        assert flag.is_shadow_enabled()
        assert flag.is_enabled()
        
        # Disable shadow mode
        flag.disable_shadow()
        assert not flag.is_shadow_enabled()
        assert flag.is_enabled()

    def test_logging(self, caplog):
        """Should log comparisons in shadow mode"""
        flag = ExperimentalFlag("test", log_results=True)
        flag.enable_shadow()
        
        # Process with both implementations
        old_result = {"status": "success"}
        new_result = {"status": "success", "extra_data": "test"}
        
        flag.log_comparison(old_result, new_result)
        
        # Check log contains comparison
        assert "Comparing results for test" in caplog.text
        assert "success" in caplog.text

class TestFeatureFlagIntegration:
    def test_feature_interaction(self, feature_flags):
        """Multiple features should work together"""
        feature_flags.enable("enhanced_email")
        feature_flags.enable("ai_categorization")
        
        assert feature_flags.is_enabled("enhanced_email")
        assert feature_flags.is_enabled("ai_categorization")
        
        # Disable one feature
        feature_flags.disable("enhanced_email")
        assert not feature_flags.is_enabled("enhanced_email")
        assert feature_flags.is_enabled("ai_categorization")

    def test_experiment_to_feature(self, feature_flags):
        """Should be able to convert experiment to feature"""
        # Start as experiment
        feature_flags.add_experiment("test_feature")
        feature_flags.enable_shadow("test_feature")
        
        assert feature_flags.is_shadow_enabled("test_feature")
        assert not feature_flags.is_enabled("test_feature")
        
        # Convert to feature
        feature_flags.convert_to_feature("test_feature")
        feature_flags.enable("test_feature")
        
        assert feature_flags.is_enabled("test_feature")
        assert not feature_flags.is_shadow_enabled("test_feature")

def test_cleanup(feature_flags):
    """Should clean up deprecated flags"""
    # Add some deprecated flags
    feature_flags.add_deprecated_flag("old_feature_1")
    feature_flags.add_deprecated_flag("old_feature_2")
    
    # Clean up
    removed = feature_flags.clean_deprecated_flags()
    
    assert "old_feature_1" in removed
    assert "old_feature_2" in removed
    assert not feature_flags.has_flag("old_feature_1")
    assert not feature_flags.has_flag("old_feature_2")

def test_metrics(feature_flags):
    """Should track feature usage metrics"""
    feature_flags.enable("enhanced_email")
    
    # Record some usage
    feature_flags.record_usage("enhanced_email", {"duration": 100})
    metrics = feature_flags.get_metrics("enhanced_email")
    
    assert metrics["usage_count"] > 0
    assert metrics["average_duration"] == 100

def test_validation(feature_flags):
    """Should validate feature configuration"""
    invalid_config = {
        "features": {
            "test": {
                "enabled": "not_a_boolean"  # Invalid type
            }
        }
    }
    
    with pytest.raises(ValueError):
        FeatureFlags(invalid_config)

def test_persistence(feature_flags, tmp_path):
    """Should persist feature state"""
    # Enable some features
    feature_flags.enable("enhanced_email")
    feature_flags.set_rollout_percentage("ai_categorization", 50)
    
    # Save state
    state_file = tmp_path / "feature_flags.json"
    feature_flags.save_state(state_file)
    
    # Load state in new instance
    new_flags = FeatureFlags.load_state(state_file)
    
    assert new_flags.is_enabled("enhanced_email")
    assert new_flags.get_rollout_percentage("ai_categorization") == 50
