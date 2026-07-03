import os
import joblib
import onnxmltools
from onnxmltools.convert.common.data_types import FloatTensorType
import numpy as np

def convert_model():
    model_path = os.path.join(os.path.dirname(__file__), "app", "mule_model.pkl")
    onnx_path = os.path.join(os.path.dirname(__file__), "app", "mule_model.onnx")
    
    if not os.path.exists(model_path):
        print(f"Model file {model_path} not found.")
        return
        
    print(f"Loading model from {model_path}...")
    model_data = joblib.load(model_path)
    xgb_model = model_data["model"]
    feature_names = model_data["feature_names"]
    
    print(f"Converting XGBoost model to ONNX (features: {len(feature_names)})...")
    
    # XGBoost expects a 2D array of floats
    initial_type = [('float_input', FloatTensorType([None, len(feature_names)]))]
    
    # Fix feature names for onnxmltools
    booster = xgb_model.get_booster()
    booster.feature_names = [f"f{i}" for i in range(len(feature_names))]
    
    # Convert the model
    onnx_model = onnxmltools.convert_xgboost(xgb_model, initial_types=initial_type)
    
    print(f"Saving ONNX model to {onnx_path}...")
    onnxmltools.utils.save_model(onnx_model, onnx_path)
    
    # Save metadata to json
    metadata_path = os.path.join(os.path.dirname(__file__), "app", "mule_metadata.json")
    import json
    metadata = {
        "feature_names": feature_names,
        "categorical_info": model_data.get("categorical_info", {}),
    }
    
    scaler = model_data.get("scaler")
    if scaler is not None:
        metadata["scaler"] = {
            "mean": scaler.mean_.tolist(),
            "scale": scaler.scale_.tolist()
        }
        
    pca = model_data.get("pca")
    if pca is not None:
        metadata["pca"] = {
            "components": pca.components_.tolist(),
            "mean": pca.mean_.tolist()
        }
        
    background_points = model_data.get("background_points", [])
    if isinstance(background_points, np.ndarray):
        metadata["background_points"] = background_points.tolist()
    else:
        metadata["background_points"] = background_points
        
    # Also we need feature importances if possible, but xgboost model has it
    try:
        metadata["feature_importances"] = xgb_model.feature_importances_.tolist()
    except:
        metadata["feature_importances"] = [1.0] * len(feature_names)
        
    with open(metadata_path, "w") as f:
        json.dump(metadata, f)
        
    print(f"Metadata saved to {metadata_path}")
    print("Conversion complete.")

if __name__ == "__main__":
    convert_model()
