import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class ClaimVerificationService:
    def __init__(self):
        pass

    def verify_claims(self, seller_claims: Dict[str, Any], evidence_report: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Verifies seller claims strictly against CV evidence.
        Outputs TRUE, FALSE, or NEEDS MANUAL REVIEW for each claim.
        """
        results = {}
        
        # Aggregate all detected issues from evidence
        detected_issue_types = set()
        for ev in evidence_report:
            if ev.get("issue_type"):
                detected_issue_types.add(ev["issue_type"].lower())

        for claim_key, claim_value in seller_claims.items():
            if claim_key == "no_scratches":
                if claim_value is True:
                    if "scratch" in detected_issue_types:
                        results[claim_key] = {
                            "status": "FALSE",
                            "reason": "CV detected scratches despite seller claim of no scratches.",
                            "penalty": 20.00
                        }
                    else:
                        results[claim_key] = {
                            "status": "TRUE",
                            "reason": "No scratches detected by CV.",
                            "penalty": 0.00
                        }
                else:
                    results[claim_key] = {"status": "TRUE", "reason": "Seller declared scratches.", "penalty": 0.00}
                    
            elif claim_key == "no_cracks":
                if claim_value is True:
                    crack_found = any(term in detected_issue_types for term in ["crack", "broken glass"])
                    if crack_found:
                        results[claim_key] = {
                            "status": "FALSE",
                            "reason": "CV detected cracks/broken glass despite seller claim.",
                            "penalty": 50.00
                        }
                    else:
                        results[claim_key] = {
                            "status": "TRUE",
                            "reason": "No cracks detected by CV.",
                            "penalty": 0.00
                        }
                else:
                    results[claim_key] = {"status": "TRUE", "reason": "Seller declared cracks.", "penalty": 0.00}
                    
            elif claim_key == "battery_health":
                # CV cannot detect battery health
                results[claim_key] = {
                    "status": "NEEDS MANUAL REVIEW",
                    "reason": "Battery health cannot be verified via Computer Vision.",
                    "penalty": 0.00
                }
                
            else:
                # Default generic claim check
                results[claim_key] = {
                    "status": "NEEDS MANUAL REVIEW",
                    "reason": "Claim type not supported by automatic CV verification.",
                    "penalty": 0.00
                }
                
        return results
