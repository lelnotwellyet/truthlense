import logging
from typing import Dict

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

logger = logging.getLogger(__name__)


class FakeNewsClassifier:
    """Fake news classifier using a pre-trained RoBERTa model."""

    def __init__(self, model_name: str = "hamzab/roberta-fake-news-classification"):
        logger.info("Loading model: %s", model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.model.eval()

        # Resolve label mapping from model config, falling back to default
        id2label = getattr(self.model.config, "id2label", None)
        if id2label and len(id2label) == 2:
            # Normalize labels: model may use TRUE/FALSE or REAL/FAKE
            raw = {int(k): v.upper() for k, v in id2label.items()}
            # Standardize: TRUE -> REAL, FALSE -> FAKE
            self.id2label = {}
            for k, v in raw.items():
                if v == "TRUE":
                    self.id2label[k] = "REAL"
                elif v == "FALSE":
                    self.id2label[k] = "FAKE"
                else:
                    self.id2label[k] = v
        else:
            # Default mapping: 0 -> FAKE, 1 -> REAL
            self.id2label = {0: "FAKE", 1: "REAL"}

        logger.info("Model loaded. Label mapping: %s", self.id2label)

    def predict(self, text: str) -> Dict:
        """Run inference on the given text.

        Args:
            text: The input text to classify.

        Returns:
            Dictionary with prediction, confidence, and probabilities.
        """
        if not text or not text.strip():
            return {
                "prediction": "FAKE",
                "confidence": 0.0,
                "probabilities": {"REAL": 0.0, "FAKE": 0.0},
            }

        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True,
        )

        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = torch.nn.functional.softmax(logits, dim=-1)

        probs = probabilities[0].tolist()
        predicted_class = int(torch.argmax(probabilities, dim=-1).item())
        prediction_label = self.id2label.get(predicted_class, "FAKE")
        confidence = round(probs[predicted_class] * 100, 2)

        # Build probabilities dict using the label mapping
        prob_dict = {}
        for idx, prob in enumerate(probs):
            label = self.id2label.get(idx, f"LABEL_{idx}")
            prob_dict[label] = round(prob * 100, 2)

        return {
            "prediction": prediction_label,
            "confidence": confidence,
            "probabilities": prob_dict,
        }
