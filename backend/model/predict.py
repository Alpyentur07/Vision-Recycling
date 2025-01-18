import torch
from PIL import Image
import torchvision.transforms as transforms
import sys
import json
import os
import traceback
from transformers import BeitForImageClassification

def predict_image(image_path):
    try:
        print(f"Gelen görüntü yolu: {image_path}")
        
        # Model yükleme
        model_path = os.path.join(os.path.dirname(__file__), 'beit_model.pth')
        print(f"Model yolu: {model_path}")
        
        # Görüntü işleme - Colab'daki ile aynı dönüşümleri uygula
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            # Colab'daki normalizasyon değerlerini kullan
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406], 
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        # Görüntüyü yükle ve ön işle
        image = Image.open(image_path).convert('RGB')  # RGB'ye çevir
        image_tensor = transform(image).unsqueeze(0)
        
        # Model oluştur ve yükle
        model = BeitForImageClassification.from_pretrained(
            "microsoft/beit-base-patch16-224", 
            num_labels=5,
            ignore_mismatched_sizes=True
        )
        
        # State dict'i yükle
        state_dict = torch.load(model_path, map_location=torch.device('cpu'))
        model.load_state_dict(state_dict, strict=False)
        model.eval()
        
        # Tahmin
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs.logits, dim=1)
            
            # Tüm sınıflar için olasılıkları hesapla
            classes = ['cam', 'kagit', 'metal', 'organik', 'plastik']
            class_probs = {}
            
            for idx, (class_name, prob) in enumerate(zip(classes, probabilities[0])):
                class_probs[class_name] = float(prob.item()) * 100
            
            # En yüksek olasılıklı sınıfı bul
            predicted_class = max(class_probs.items(), key=lambda x: x[1])
            
            result = {
                'class': predicted_class[0],
                'confidence': predicted_class[1],
                'all_probabilities': class_probs
            }
            
            print(f"Tahmin sonucu: {json.dumps(result, indent=2)}")
            return result
            
    except Exception as e:
        print(f"Hata: {str(e)}")
        print("Traceback:")
        print(traceback.format_exc())
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        result = predict_image(image_path)
        print(json.dumps(result)) 