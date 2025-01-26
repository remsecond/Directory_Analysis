import json
import logging
import hashlib
from typing import Dict, List, Optional, Any
from pathlib import Path

logger = logging.getLogger(__name__)

class FeatureFlag:
    def __init__(self, name: str, enabled: bool = False):
        self.name = name
        self._enabled = enabled
        self._shadow_enabled = False
        
    def enable(self) -> None:
        self._enabled = True
        
    def disable(self) -> None:
        self._enabled = False
        
    def is_enabled(self) -> bool:
        return self._enabled
        
    def enable_shadow(self) -> None:
        self._shadow_enabled = True
        
    def disable_shadow(self) -> None:
        self._shadow_enabled = False
        
    def is_shadow_enabled(self) -> bool:
        return self._shadow_enabled

class PercentageFlag(FeatureFlag):
    def __init__(self, name: str, percentage: float = 0):
        super().__init__(name)
        self.percentage = percentage
        
    def should_enable(self, identifier: str) -> bool:
        """Determine if feature should be enabled based on identifier hash"""
        if not self.percentage:
            return False
            
        # Create consistent hash of feature name + identifier
        hash_input = f"{self.name}:{identifier}"
        hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
        
        # Convert hash to percentage (0-100)
        hash_percent = hash_value % 100
        
        return hash_percent < self.percentage

class ExperimentalFlag(FeatureFlag):
    def __init__(self, name: str, log_results: bool = False):
        super().__init__(name)
        self.log_results = log_results
        self.metrics: Dict[str, Any] = {
            "usage_count": 0,
            "error_count": 0,
            "durations": []
        }
        
    def log_comparison(self, old_result: Dict, new_result: Dict) -> None:
        """Log comparison between old and new implementations"""
        if self.log_results:
            logger.info(f"Comparing results for {self.name}")
            logger.info(f"Old result: {old_result}")
            logger.info(f"New result: {new_result}")
            
            # Track metrics
            self.metrics["usage_count"] += 1
            if "duration" in new_result:
                self.metrics["durations"].append(new_result["duration"])

class FeatureFlags:
    def __init__(self, config: Dict):
        self._validate_config(config)
        self.flags: Dict[str, FeatureFlag] = {}
        self.deprecated_flags: List[str] = []
        self.metrics: Dict[str, Dict] = {}
        
        # Initialize features
        for name, settings in config.get("features", {}).items():
            if "rollout_percentage" in settings:
                flag = PercentageFlag(name, settings.get("rollout_percentage", 0))
            else:
                flag = FeatureFlag(name)
                
            if settings.get("enabled", False):
                flag.enable()
            if settings.get("shadow_mode", False):
                flag.enable_shadow()
                
            self.flags[name] = flag
            
        # Initialize experiments
        for name, settings in config.get("experiments", {}).items():
            flag = ExperimentalFlag(
                name,
                log_results=settings.get("compare_results", False)
            )
            self.flags[name] = flag

    def _validate_config(self, config: Dict) -> None:
        """Validate configuration format"""
        if not isinstance(config, dict):
            raise ValueError("Config must be a dictionary")
            
        for section in ["features", "experiments"]:
            if section in config and not isinstance(config[section], dict):
                raise ValueError(f"{section} must be a dictionary")
                
        for section in ["features", "experiments"]:
            for name, settings in config.get(section, {}).items():
                if "enabled" in settings and not isinstance(settings["enabled"], bool):
                    raise ValueError(f"enabled flag for {name} must be boolean")

    def is_enabled(self, feature: str) -> bool:
        """Check if feature is enabled"""
        if feature not in self.flags:
            return False
        return self.flags[feature].is_enabled()

    def enable(self, feature: str) -> None:
        """Enable a feature"""
        if feature in self.flags:
            self.flags[feature].enable()

    def disable(self, feature: str) -> None:
        """Disable a feature"""
        if feature in self.flags:
            self.flags[feature].disable()

    def set_rollout_percentage(self, feature: str, percentage: float) -> None:
        """Set rollout percentage for feature"""
        if feature in self.flags and isinstance(self.flags[feature], PercentageFlag):
            self.flags[feature].percentage = percentage

    def should_enable(self, feature: str, identifier: str) -> bool:
        """Check if feature should be enabled for identifier"""
        if feature not in self.flags:
            return False
        if isinstance(self.flags[feature], PercentageFlag):
            return self.flags[feature].should_enable(identifier)
        return self.flags[feature].is_enabled()

    def enable_shadow(self, feature: str) -> None:
        """Enable shadow mode for feature"""
        if feature in self.flags:
            self.flags[feature].enable_shadow()

    def disable_shadow(self, feature: str) -> None:
        """Disable shadow mode for feature"""
        if feature in self.flags:
            self.flags[feature].disable_shadow()

    def is_shadow_enabled(self, feature: str) -> bool:
        """Check if shadow mode is enabled"""
        if feature not in self.flags:
            return False
        return self.flags[feature].is_shadow_enabled()

    def add_experiment(self, name: str) -> None:
        """Add new experimental feature"""
        self.flags[name] = ExperimentalFlag(name)

    def convert_to_feature(self, name: str) -> None:
        """Convert experiment to regular feature"""
        if name in self.flags and isinstance(self.flags[name], ExperimentalFlag):
            enabled = self.flags[name].is_enabled()
            self.flags[name] = FeatureFlag(name)
            if enabled:
                self.flags[name].enable()

    def add_deprecated_flag(self, name: str) -> None:
        """Mark feature as deprecated"""
        self.deprecated_flags.append(name)

    def clean_deprecated_flags(self) -> List[str]:
        """Remove deprecated flags"""
        removed = []
        for name in self.deprecated_flags:
            if name in self.flags:
                del self.flags[name]
                removed.append(name)
        self.deprecated_flags = []
        return removed

    def record_usage(self, feature: str, data: Dict) -> None:
        """Record feature usage metrics"""
        if feature not in self.metrics:
            self.metrics[feature] = {
                "usage_count": 0,
                "durations": []
            }
            
        self.metrics[feature]["usage_count"] += 1
        if "duration" in data:
            self.metrics[feature]["durations"].append(data["duration"])

    def get_metrics(self, feature: str) -> Dict:
        """Get metrics for feature"""
        if feature not in self.metrics:
            return {}
            
        metrics = self.metrics[feature]
        if metrics["durations"]:
            metrics["average_duration"] = sum(metrics["durations"]) / len(metrics["durations"])
            
        return metrics

    def has_flag(self, feature: str) -> bool:
        """Check if feature flag exists"""
        return feature in self.flags

    def save_state(self, path: Path) -> None:
        """Save feature flag state to file"""
        state = {
            "features": {
                name: {
                    "enabled": flag.is_enabled(),
                    "shadow_enabled": flag.is_shadow_enabled(),
                    "percentage": flag.percentage if isinstance(flag, PercentageFlag) else None
                }
                for name, flag in self.flags.items()
            }
        }
        
        with open(path, 'w') as f:
            json.dump(state, f, indent=2)

    @classmethod
    def load_state(cls, path: Path) -> 'FeatureFlags':
        """Load feature flag state from file"""
        with open(path) as f:
            state = json.load(f)
            
        config = {"features": {}}
        for name, settings in state["features"].items():
            feature_config = {
                "enabled": settings["enabled"],
                "shadow_mode": settings["shadow_enabled"]
            }
            if settings["percentage"] is not None:
                feature_config["rollout_percentage"] = settings["percentage"]
            config["features"][name] = feature_config
            
        return cls(config)
