import logging
from typing import Any, Dict
from app.services.pricing_engine import ProductionPricingEngine

logger = logging.getLogger(__name__)

class PricingService:
    def __init__(self):
        self.engine = ProductionPricingEngine()

    async def calculate_valuation(self, device: Any, inspection_score: int, detected_issues: list[dict], functional_tests: dict | None = None, seller_claims: dict | None = None) -> dict:
        """
        Calculates the estimated resale value based purely on deterministic math rules.
        """
        logger.info("PricingService: Routing to deterministic ProductionPricingEngine...")
        
        metadata = {
            "brand": getattr(device, 'brand', 'Unknown'),
            "model": getattr(device, 'model', 'Unknown'),
            "purchase_price": getattr(device, 'purchase_price', None),
            "purchase_year": getattr(device, 'purchase_year', None)
        }
        
        # Format detected issues into the engine's inspection schema
        damages = []
        for issue in detected_issues:
            damages.append({
                "component_name": issue.get("component", issue.get("component_name", "Unknown")),
                "damage_type": issue.get("class", issue.get("type", issue.get("damage_type", "Damage"))),
                "severity": issue.get("severity", "Medium").title()
            })
            
        inspection = {
            "damages": damages
        }
        
        result_schema = self.engine.calculate_price(metadata, inspection)
        
        return {
            "estimated_price": result_schema["Final Resale Value"],
            "pricing_schema": result_schema,
            "evidence_report": [], # Handled by upstream services now
            "claim_verification_results": {}
        }
