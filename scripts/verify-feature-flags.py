#!/usr/bin/env python3
"""
Verify feature flag functionality by running through common scenarios.
This script demonstrates and validates the key features of our flag system.
"""

import json
import logging
from pathlib import Path
from typing import Dict

from evidenceai.feature_flags import FeatureFlags, PercentageFlag, ExperimentalFlag

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_basic_flags():
    """Test basic boolean flag functionality"""
    logger.info("Testing basic flags...")
    
    config = {
        "features": {
            "test_feature": {
                "enabled": False
            }
        }
    }
    
    flags = FeatureFlags(config)
    assert not flags.is_enabled("test_feature"), "Feature should be disabled by default"
    
    flags.enable("test_feature")
    assert flags.is_enabled("test_feature"), "Feature should be enabled after enable()"
    
    flags.disable("test_feature")
    assert not flags.is_enabled("test_feature"), "Feature should be disabled after disable()"
    
    logger.info("Basic flag tests passed")

def test_percentage_rollout():
    """Test percentage-based rollout functionality"""
    logger.info("Testing percentage rollout...")
    
    config = {
        "features": {
            "gradual_feature": {
                "enabled": True,
                "rollout_percentage": 50
            }
        }
    }
    
    flags = FeatureFlags(config)
    
    # Test with 1000 different IDs
    enabled_count = sum(
        1 for i in range(1000)
        if flags.should_enable("gradual_feature", f"test_id_{i}")
    )
    
    # Should be roughly 50%, allow 5% margin
    assert 450 <= enabled_count <= 550, f"Expected ~500 enabled, got {enabled_count}"
    
    logger.info("Percentage rollout tests passed")

def test_shadow_mode():
    """Test shadow mode functionality"""
    logger.info("Testing shadow mode...")
    
    config = {
        "features": {
            "experimental_feature": {
                "enabled": False,
                "shadow_mode": True
            }
        }
    }
    
    flags = FeatureFlags(config)
    
    assert not flags.is_enabled("experimental_feature"), "Feature should be disabled"
    assert flags.is_shadow_enabled("experimental_feature"), "Shadow mode should be enabled"
    
    # Simulate processing with shadow mode
    def process_with_shadow():
        result = "old_result"
        if flags.is_shadow_enabled("experimental_feature"):
            shadow_result = "new_result"
            # Would normally log comparison here
        return result
    
    assert process_with_shadow() == "old_result", "Should return old result despite shadow mode"
    
    logger.info("Shadow mode tests passed")

def test_feature_lifecycle():
    """Test complete feature lifecycle"""
    logger.info("Testing feature lifecycle...")
    
    # Start with feature off
    config = {
        "features": {
            "new_feature": {
                "enabled": False,
                "rollout_percentage": 0,
                "shadow_mode": True
            }
        }
    }
    
    flags = FeatureFlags(config)
    
    # Phase 1: Shadow Mode
    assert flags.is_shadow_enabled("new_feature"), "Should start in shadow mode"
    assert not flags.is_enabled("new_feature"), "Should start disabled"
    
    # Phase 2: Gradual Rollout
    flags.set_rollout_percentage("new_feature", 25)
    enabled_25 = sum(
        1 for i in range(1000)
        if flags.should_enable("new_feature", f"test_id_{i}")
    )
    assert 200 <= enabled_25 <= 300, "Should enable for ~25% of IDs"
    
    # Phase 3: Full Rollout
    flags.enable("new_feature")
    assert flags.is_enabled("new_feature"), "Should be fully enabled"
    
    # Phase 4: Cleanup
    flags.add_deprecated_flag("new_feature")
    removed = flags.clean_deprecated_flags()
    assert "new_feature" in removed, "Should be removed during cleanup"
    
    logger.info("Lifecycle tests passed")

def test_persistence():
    """Test state persistence"""
    logger.info("Testing state persistence...")
    
    config = {
        "features": {
            "persistent_feature": {
                "enabled": True,
                "rollout_percentage": 50
            }
        }
    }
    
    flags = FeatureFlags(config)
    
    # Save state
    temp_file = Path("temp_flags.json")
    flags.save_state(temp_file)
    
    # Load state in new instance
    new_flags = FeatureFlags.load_state(temp_file)
    
    assert new_flags.is_enabled("persistent_feature"), "State should persist"
    assert new_flags.should_enable("persistent_feature", "test_id") == \
           flags.should_enable("persistent_feature", "test_id"), "Behavior should be consistent"
    
    # Cleanup
    temp_file.unlink()
    
    logger.info("Persistence tests passed")

def main():
    """Run all verification tests"""
    logger.info("Starting feature flag verification...")
    
    test_basic_flags()
    test_percentage_rollout()
    test_shadow_mode()
    test_feature_lifecycle()
    test_persistence()
    
    logger.info("All feature flag tests passed!")

if __name__ == "__main__":
    main()
