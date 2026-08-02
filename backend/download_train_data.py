import zipfile
import json
import os
import requests

data_dir = 'data'
annot_zip = os.path.join(data_dir, 'annotations.zip')

print('Extracting train annotations...')
with zipfile.ZipFile(annot_zip, 'r') as zip_ref:
    zip_ref.extract('annotations/instances_train2017.json', data_dir)

print('Loading train annotations...')
with open(os.path.join(data_dir, 'annotations/instances_train2017.json'), 'r') as f:
    coco = json.load(f)

phone_anns = [ann for ann in coco['annotations'] if ann['category_id'] == 73]

img_map = {img['id']: img for img in coco['images']}

gt_path = os.path.join(data_dir, 'ground_truth.json')
with open(gt_path, 'r') as f:
    ground_truth = json.load(f)

current_count = len(ground_truth)
target_count = 500
needed = target_count - current_count

print(f"Current count: {current_count}. Needed: {needed}")

unique_img_ids = set()
for ann in phone_anns:
    filename = f"{ann['image_id']:012d}.jpg"
    if filename not in ground_truth:
        unique_img_ids.add(ann['image_id'])
    if len(unique_img_ids) >= needed:
        break

print(f'Downloading {len(unique_img_ids)} more images...')
phones_dir = os.path.join(data_dir, 'phones')

count = 0
for img_id in unique_img_ids:
    img_info = img_map[img_id]
    url = img_info['coco_url']
    filename = f"{img_id:012d}.jpg"
    filepath = os.path.join(phones_dir, filename)
    
    if not os.path.exists(filepath):
        try:
            img_data = requests.get(url).content
            with open(filepath, 'wb') as img_f:
                img_f.write(img_data)
        except Exception as e:
            continue
            
    boxes = []
    for ann in phone_anns:
        if ann['image_id'] == img_id:
            x, y, w, h = ann['bbox']
            boxes.append([x, y, x + w, y + h])
            
    ground_truth[filename] = boxes
    count += 1
    if count % 50 == 0:
        print(f'Downloaded {count}/{needed} from train set...')

with open(gt_path, 'w') as f:
    json.dump(ground_truth, f, indent=4)
print(f'Dataset ready. Total images: {len(ground_truth)}')
