import logging
from typing import Dict, Any, List
import datetime

logger = logging.getLogger(__name__)

class ProductionPricingEngine:
    """
    Deterministic pricing engine based on strict financial rules and constraints.
    """

    def __init__(self):
        # Mocking a database of launch prices for rule 3
        self.launch_prices = {
            "apple iphone 13": 79900,
            "apple iphone 14": 79900,
            "apple iphone 15": 79900,
            "samsung galaxy s22": 72999,
            "samsung galaxy s23 ultra": 124999,
            "google pixel 7": 59999,
            "oneplus 11": 56999
        }
        
        # Hardcoded deduction percentages based on market price
        self.damage_deduction_map = {
            "screen": {
                "Minor": 0.05,
                "Moderate": 0.10,
                "Major": 0.20,
                "Critical": 0.35
            },
            "rear panel": {
                "Minor": 0.02,
                "Moderate": 0.05,
                "Major": 0.10,
                "Critical": 0.15
            },
            "rear camera module": {
                "Minor": 0.03,
                "Moderate": 0.08,
                "Major": 0.15,
                "Critical": 0.25
            },
            "frame": {
                "Minor": 0.01,
                "Moderate": 0.03,
                "Major": 0.05,
                "Critical": 0.10
            }
        }
        
        self.default_deduction_map = {
            "Minor": 0.01,
            "Moderate": 0.03,
            "Major": 0.05,
            "Critical": 0.10
        }

    def _get_base_market_price(self, brand: str, model: str) -> float:
        # In a real system, this would query a live API.
        # We simulate this by taking the launch price and discounting it slightly as the "current market value" baseline
        key = f"{brand} {model}".lower()
        launch_price = self.launch_prices.get(key, 50000.0) # Fallback 50k
        return launch_price * 0.70 # Assume average market base is 70% of launch before specific deductions

    def calculate_price(self, metadata: Dict[str, Any], inspection: Dict[str, Any]) -> Dict[str, Any]:
        logger.info("ProductionPricingEngine: Calculating deterministic valuation...")
        
        brand = metadata.get("brand", "")
        model = metadata.get("model", "")
        purchase_price = metadata.get("purchase_price")
        purchase_year = metadata.get("purchase_year", datetime.datetime.now().year - 2)
        
        business_rules_applied = []
        
        # Determine Original Purchase Price and Maximum Allowed Price
        search_key = f"{brand} {model}".lower()
        launch_price = self.launch_prices.get(search_key, 50000.0)

        if purchase_price is None or purchase_price <= 0:
            original_purchase_price = launch_price
            business_rules_applied.append("Purchase price unavailable. Used official launch price from DB.")
        else:
            original_purchase_price = float(purchase_price)
            
        maximum_allowed_price = original_purchase_price

        # Base Market Value
        market_price = self._get_base_market_price(brand, model)
        
        # Age Depreciation (e.g., 10% per year)
        current_year = datetime.datetime.now().year
        age = max(0, current_year - purchase_year)
        depreciation = round(market_price * (age * 0.10), 2)
        
        # Ensure depreciation doesn't wipe out the whole phone value (cap at 60%)
        if depreciation > market_price * 0.60:
            depreciation = round(market_price * 0.60, 2)

        # Deductions
        component_deductions = []
        damage_deductions_list = []
        total_damage_deductions = 0.0
        
        # Process Inspection JSON for Damages
        damages = inspection.get("damages", [])
        for damage in damages:
            comp = damage.get("component_name", "Unknown")
            severity = damage.get("severity", "Minor")
            dmg_type = damage.get("damage_type", "Damage")
            
            comp_map = self.damage_deduction_map.get(comp.lower(), self.default_deduction_map)
            deduction_pct = comp_map.get(severity, 0.05)
            
            deduction_val = round(market_price * deduction_pct, 2)
            
            damage_item = {
                "item": f"{comp} {dmg_type}",
                "severity": severity,
                "amount": -deduction_val
            }
            damage_deductions_list.append(damage_item)
            total_damage_deductions += deduction_val

        # Repair Estimate (often higher than the raw deduction)
        repair_estimate = round(total_damage_deductions * 1.5, 2)
        
        # Calculate Current Value
        current_value = market_price - depreciation - total_damage_deductions
        
        # Rule 4: Minimum Value (5% Scrap)
        min_value = round(market_price * 0.05, 2)
        if current_value < min_value:
            current_value = min_value
            business_rules_applied.append("Price adjusted to minimum scrap value threshold (5%).")
            
        # Recommended Selling Price (before caps)
        recommended_selling_price = round(current_value, 2)
        
        # Rule 1 & 2: Cap at Maximum Allowed Price
        if current_value > maximum_allowed_price:
            current_value = maximum_allowed_price
            business_rules_applied.append("Business Rule Applied: Resale value cannot exceed the original purchase price.")

        # Final Resale Value
        final_resale_value = round(current_value, 2)
        
        # Format the required output schema
        return {
            "Market Price": round(market_price, 2),
            "Original Purchase Price": round(original_purchase_price, 2),
            "Maximum Allowed Price": round(maximum_allowed_price, 2),
            "Depreciation": -depreciation,
            "Component Deductions": component_deductions, # Future expansion for missing accessories/components
            "Damage Deductions": damage_deductions_list,
            "Repair Estimate": repair_estimate,
            "Recommended Selling Price": recommended_selling_price,
            "Final Resale Value": final_resale_value,
            "Confidence": 0.95,
            "Business Rules Applied": business_rules_applied
        }
