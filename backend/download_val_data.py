import os
import json
import requests
import zipfile

def download_coco():
    data_dir = "data"
    os.makedirs(data_dir, exist_ok=True)
    
    # We will use the COCO 2017 val instances (smaller than train)
    annot_url = "http://images.cocodataset.org/annotations/annotations_trainval2017.zip"
    annot_zip = os.path.join(data_dir, "annotations.zip")
    
    if not os.path.exists(annot_zip):
        print(f"Downloading {annot_url} with requests...")
        with requests.get(annot_url, stream=True) as r:
            r.raise_for_status()
            with open(annot_zip, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192): 
                    f.write(chunk)
    
    print("Extracting annotations...")
    with zipfile.ZipFile(annot_zip, 'r') as zip_ref:
        zip_ref.extract("annotations/instances_val2017.json", data_dir)
        
    json_path = os.path.join(data_dir, "annotations/instances_val2017.json")
    print("Loading annotations...")
    with open(json_path, 'r') as f:
        coco = json.load(f)
        
    # Cell phone category ID in COCO is 73
    cat_id = 73
    
    # Find all annotations for cell phones
    phone_anns = [ann for ann in coco['annotations'] if ann['category_id'] == cat_id]
    
    # Group by image_id
    img_map = {}
    for img in coco['images']:
        img_map[img['id']] = img
        
    target_count = 500
    images_to_download = []
    
    # Collect unique images containing at least one phone
    unique_img_ids = set()
    for ann in phone_anns:
        if ann['image_id'] not in unique_img_ids:
            unique_img_ids.add(ann['image_id'])
            images_to_download.append(ann['image_id'])
            if len(images_to_download) == target_count:
                break
                
    phones_dir = os.path.join(data_dir, "phones")
    os.makedirs(phones_dir, exist_ok=True)
    
    ground_truth = {}
    
    print(f"Downloading {target_count} images...")
    count = 0
    for img_id in images_to_download:
        img_info = img_map[img_id]
        url = img_info['coco_url']
        filename = f"{img_id:012d}.jpg"
        filepath = os.path.join(phones_dir, filename)
        
        # Download image
        if not os.path.exists(filepath):
            try:
                img_data = requests.get(url).content
                with open(filepath, 'wb') as img_f:
                    img_f.write(img_data)
            except Exception as e:
                print(f"Failed to download {url}: {e}")
                continue
                
        # Get all phone boxes for this image
        boxes = []
        for ann in phone_anns:
            if ann['image_id'] == img_id:
                # COCO box format: [x, y, width, height]
                # Convert to [x1, y1, x2, y2]
                x, y, w, h = ann['bbox']
                boxes.append([x, y, x + w, y + h])
                
        ground_truth[filename] = boxes
        count += 1
        if count % 50 == 0:
            print(f"Downloaded {count}/{target_count}...")
            
    with open(os.path.join(data_dir, "ground_truth.json"), "w") as f:
        json.dump(ground_truth, f, indent=4)
        
    print(f"Dataset ready. Found {len(ground_truth)} images.")

if __name__ == "__main__":
    download_coco()
