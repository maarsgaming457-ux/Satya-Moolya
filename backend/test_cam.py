import cv2
import numpy as np

cap = cv2.VideoCapture(0)
scores = []

for i in range(20):
    ret, frame = cap.read()
    if not ret:
        continue
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness = float(np.mean(gray))
    
    is_blurry = blur_score < 100.0
    is_too_dark = brightness < 30.0
    is_too_bright = brightness > 225.0
    is_partial = False
    
    quality_acceptable = not (is_blurry or is_too_dark or is_too_bright or is_partial)
    sharpness = min(blur_score / 500.0, 1.0) * 100
    
    scores.append({
        'blur_score': blur_score,
        'sharpness': sharpness,
        'quality_acceptable': quality_acceptable
    })

cap.release()

blur_scores = [s['blur_score'] for s in scores]
print(f'Minimum: {min(blur_scores):.2f}')
print(f'Maximum: {max(blur_scores):.2f}')
print(f'Average: {np.mean(blur_scores):.2f}')
print(f'Median: {np.median(blur_scores):.2f}')
print('---')
for idx, s in enumerate(scores):
    print(f'Frame {idx+1}: blur_score={s[\'blur_score\']:.2f}, sharpness={s[\'sharpness\']:.2f}, quality_acceptable={s[\'quality_acceptable\']}')
