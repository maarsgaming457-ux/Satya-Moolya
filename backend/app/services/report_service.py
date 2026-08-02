import os
import json
import logging
import asyncio
import io
import time
import httpx
from datetime import datetime
from typing import Dict, Any, List

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether
from reportlab.lib.utils import ImageReader

from app.models.inspection import Inspection
from app.services.storage_service import SupabaseStorageService

logger = logging.getLogger(__name__)

REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)


class ReportGeneratorService:
    def __init__(self, storage_service: SupabaseStorageService | None = None):
        self.storage_service = storage_service or SupabaseStorageService()
        
    async def _fetch_image(self, client: httpx.AsyncClient, url: str) -> io.BytesIO | None:
        try:
            response = await client.get(url, timeout=10.0)
            if response.status_code == 200:
                return io.BytesIO(response.content)
        except Exception as e:
            logger.warning(f"Failed to fetch image {url}: {e}")
        return None

    async def generate_report(self, inspection: Inspection) -> Dict[str, Any]:
        inspection_id = str(inspection.id)
        user_id = str(inspection.user_id) if inspection.user_id else "unknown_user"
        device_id = str(inspection.device_id) if inspection.device_id else "unknown_device"
        
        pdf_filename = f"{inspection_id}.pdf"
        json_filename = f"{inspection_id}.json"
        
        pdf_path = os.path.join(REPORTS_DIR, pdf_filename)
        json_path = os.path.join(REPORTS_DIR, json_filename)
        
        payload = {
            "inspection_id": inspection_id,
            "device_id": device_id,
            "user_id": user_id,
            "created_at": inspection.created_at.isoformat() if inspection.created_at else None,
            "status": inspection.status,
            "inspection_score": inspection.inspection_score,
            "trust_score": inspection.trust_score,
            "confidence": float(inspection.confidence) if inspection.confidence else 0.0,
            "device": {
                "brand": inspection.device_brand,
                "model": inspection.device_model,
                "storage": inspection.device_storage,
                "color": inspection.device_color
            },
            "quality_metrics": inspection.quality_metrics or {},
            "component_detection": inspection.component_detection or [],
            "damage_detection": inspection.damage_detection or [],
            "gemini_output": inspection.gemini_output or {},
            "pricing": inspection.pricing_schema or {},
            "evidence_report": inspection.evidence_report or []
        }
        
        # 1. Fetch images concurrently
        downloaded_images = []
        evidence_report = payload.get("evidence_report", [])
        if evidence_report:
            async with httpx.AsyncClient() as client:
                tasks = []
                for ev in evidence_report:
                    orig_url = ev.get("original_url")
                    ann_url = ev.get("annotated_url")
                    if orig_url: tasks.append(self._fetch_image(client, orig_url))
                    if ann_url: tasks.append(self._fetch_image(client, ann_url))
                results = await asyncio.gather(*tasks)
                
                idx = 0
                for ev in evidence_report:
                    img_data = {}
                    if ev.get("original_url"):
                        img_data["original_bytes"] = results[idx]
                        idx += 1
                    if ev.get("annotated_url"):
                        img_data["annotated_bytes"] = results[idx]
                        idx += 1
                    if img_data:
                        downloaded_images.append(img_data)
        
        # 2. Build PDF and JSON (timing generation)
        start_gen = time.time()
        def write_report():
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2)
            self._create_pdf(payload, downloaded_images, pdf_path)

        try:
            await asyncio.to_thread(write_report)
        except Exception as e:
            logger.error(f"Failed to generate PDF for {inspection_id}: {e}")
            raise RuntimeError("PDF Generation Failed") from e
            
        gen_latency = time.time() - start_gen
            
        # 3. Upload to Storage (timing upload)
        start_up = time.time()
        pdf_url = ""
        json_url = ""
        try:
            with open(pdf_path, "rb") as f:
                pdf_data = f.read()
            pdf_url = await self.storage_service.upload_file(
                file_data=pdf_data,
                filename=pdf_filename,
                content_type="application/pdf",
                folder=f"{user_id}/devices/{device_id}"
            )
            
            with open(json_path, "rb") as f:
                json_data = f.read()
            json_url = await self.storage_service.upload_file(
                file_data=json_data,
                filename=json_filename,
                content_type="application/json",
                folder=f"{user_id}/devices/{device_id}"
            )
        except Exception as e:
            logger.error(f"Failed to upload reports for {inspection_id}: {e}")
            pdf_url = f"/static/reports/{pdf_filename}"
            json_url = f"/static/reports/{json_filename}"
            
        up_latency = time.time() - start_up
            
        return {
            "report_id": inspection_id,
            "pdf_url": pdf_url,
            "json_url": json_url,
            "metrics": {
                "generation_time": gen_latency,
                "upload_time": up_latency
            }
        }

    def _create_pdf(self, payload: Dict[str, Any], images: List[Dict[str, io.BytesIO]], filepath: str):
        doc = SimpleDocTemplate(filepath, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor("#1e1b4b"),
            spaceAfter=20,
            alignment=1
        )
        
        h2_style = ParagraphStyle(
            'CustomH2',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor("#3730a3"),
            spaceBefore=15,
            spaceAfter=10
        )
        
        normal_style = styles['Normal']
        
        elements = []
        
        # --- Header ---
        elements.append(Paragraph("<b>Satya Moolya</b> AI Inspection Platform", title_style))
        elements.append(Paragraph(f"<b>Inspection ID:</b> {payload.get('inspection_id')}", normal_style))
        elements.append(Paragraph(f"<b>Date:</b> {payload.get('created_at') or datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", normal_style))
        elements.append(Spacer(1, 20))
        
        # --- Device Information ---
        device = payload.get("device", {})
        if any(device.values()):
            device_data = [
                ["Brand", device.get("brand") or "Not provided"],
                ["Model", device.get("model") or "Not provided"],
                ["Storage", device.get("storage") or "Not provided"],
                ["Color", device.get("color") or "Not provided"],
            ]
            t_device = Table(device_data, colWidths=[200, 300])
            t_device.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0"))
            ]))
            elements.append(KeepTogether([Paragraph("Device Information", h2_style), t_device]))
            elements.append(Spacer(1, 20))
        
        # --- Images ---
        if images:
            img_elements = [Paragraph("Inspection Images", h2_style)]
            
            for idx, img_dict in enumerate(images):
                orig_bytes = img_dict.get("original_bytes")
                ann_bytes = img_dict.get("annotated_bytes")
                
                row = []
                if orig_bytes:
                    try:
                        im_orig = RLImage(orig_bytes, width=200, height=150, kind='proportional')
                        row.append(im_orig)
                    except:
                        row.append(Paragraph("Image Error", normal_style))
                else:
                    row.append(Paragraph("No Original", normal_style))
                    
                if ann_bytes:
                    try:
                        im_ann = RLImage(ann_bytes, width=200, height=150, kind='proportional')
                        row.append(im_ann)
                    except:
                        row.append(Paragraph("Image Error", normal_style))
                else:
                    row.append(Paragraph("No Annotation", normal_style))
                    
                t_imgs = Table([[Paragraph(f"<b>View {idx+1} Original</b>", normal_style), Paragraph(f"<b>View {idx+1} Annotated</b>", normal_style)], row], colWidths=[250, 250])
                t_imgs.setStyle(TableStyle([('ALIGN', (0, 0), (-1, -1), 'CENTER')]))
                img_elements.append(t_imgs)
                img_elements.append(Spacer(1, 15))
                
            elements.append(KeepTogether(img_elements))
            elements.append(Spacer(1, 20))

        # --- Quality Metrics ---
        qm = payload.get("quality_metrics", {})
        if qm:
            qm_data = [["Metric", "Value"]]
            for k, v in qm.items():
                qm_data.append([str(k).capitalize(), str(v)])
            t_qm = Table(qm_data, colWidths=[200, 300])
            t_qm.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1"))
            ]))
            elements.append(KeepTogether([Paragraph("Image Quality Metrics", h2_style), t_qm]))
            elements.append(Spacer(1, 20))

        # --- Gemini AI Assessment ---
        gemini = payload.get("gemini_output", {})
        if gemini:
            gem_elements = [Paragraph("AI Inspection Assessment", h2_style)]
            if gemini.get("summary"):
                gem_elements.append(Paragraph(f"<b>Summary:</b> {gemini.get('summary')}", normal_style))
                gem_elements.append(Spacer(1, 10))
            
            recs = gemini.get("recommendations", [])
            if recs:
                gem_elements.append(Paragraph("<b>Repair Recommendations:</b>", normal_style))
                for r in recs:
                    gem_elements.append(Paragraph(f"• {r}", normal_style))
                gem_elements.append(Spacer(1, 10))
                
            warnings = gemini.get("warnings", [])
            if warnings:
                gem_elements.append(Paragraph("<b>Warnings:</b>", normal_style))
                for w in warnings:
                    gem_elements.append(Paragraph(f"• <font color='red'>{w}</font>", normal_style))
                gem_elements.append(Spacer(1, 10))
                
            gem_elements.append(Paragraph(f"<b>Overall Confidence:</b> {payload.get('confidence', 0.0) * 100:.1f}%", normal_style))
            elements.append(KeepTogether(gem_elements))
            elements.append(Spacer(1, 20))
        
        # --- Component Detection ---
        comps = payload.get("component_detection", [])
        if comps:
            comp_data = [["Component", "Confidence"]]
            for c in comps:
                conf = c.get('confidence', 0.0)
                if isinstance(conf, float):
                    conf = f"{conf*100:.1f}%"
                comp_data.append([c.get("component", "Unknown"), str(conf)])
            t_comp = Table(comp_data, colWidths=[250, 250])
            t_comp.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#3730a3")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0"))
            ]))
            elements.append(KeepTogether([Paragraph("Detected Components", h2_style), t_comp]))
            elements.append(Spacer(1, 20))

        # --- Damage Summary ---
        damages = payload.get("damage_detection", [])
        dmg_elements = [Paragraph("Damage Summary", h2_style)]
        
        if damages:
            damage_table_data = [["Damage Type", "Severity", "Coverage"]]
            for dmg in damages:
                damage_table_data.append([
                    dmg.get("damage", dmg.get("damage_type", "Unknown")),
                    dmg.get("severity", "Unknown"),
                    str(dmg.get("coverage", "N/A"))
                ])
                
            t_damage = Table(damage_table_data, colWidths=[200, 150, 150])
            t_damage.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#991b1b")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#fca5a5"))
            ]))
            dmg_elements.append(t_damage)
        else:
            dmg_elements.append(Paragraph("No physical damage detected.", normal_style))
            
        elements.append(KeepTogether(dmg_elements))
        elements.append(Spacer(1, 20))
            
        # --- Price Valuation ---
        pricing = payload.get("pricing", {})
        if pricing:
            price_elements = [Paragraph("Valuation & Pricing", h2_style)]
            pricing_data = [["Item", "Amount (INR)"]]
            for bk in pricing.get("breakdown", []):
                amount_str = f"{bk.get('amount', 0):,}"
                pricing_data.append([bk.get("item", ""), amount_str])
                
            pricing_data.append(["FINAL ESTIMATED VALUE", f"{pricing.get('estimated_value', 0):,}"])
            
            t_price = Table(pricing_data, colWidths=[350, 150])
            t_price.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#475569")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor("#e2e8f0")),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1"))
            ]))
            price_elements.append(t_price)
            
            rules = pricing.get("business_rules_applied", [])
            if rules:
                price_elements.append(Spacer(1, 10))
                price_elements.append(Paragraph("<b>Business Rules Applied:</b>", normal_style))
                for r in rules:
                    price_elements.append(Paragraph(f"• {r}", normal_style))
                    
            elements.append(KeepTogether(price_elements))
            
        # Footer
        elements.append(Spacer(1, 40))
        elements.append(Paragraph("<i>Generated automatically by the Satya Moolya AI Platform. Version 1.0.0</i>", normal_style))

        doc.build(elements)
