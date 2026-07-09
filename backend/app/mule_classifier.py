import os
import numpy as np
import json

USE_ONNX = os.getenv("USE_ONNX", "False").lower() in ("true", "1")

if not USE_ONNX:
    import joblib
    import pandas as pd
else:
    import onnxruntime as rt

# Global variables to hold the loaded model and feature names
_MODEL = None
_FEATURE_NAMES = None
_CATEGORICAL_INFO = None
_SCALER = None
_PCA = None
_BACKGROUND_POINTS = None
_DATASET_CACHE_LEGIT = None
_DATASET_CACHE_MULE = None

def load_model(model_path: str = "app/mule_model.pkl", dataset_path: str = "../DataSet.csv"):
    """
    Loads the trained XGBoost model, features, scaler, PCA, and background points from disk.
    Also caches dataset splits for class-specific sampling.
    """
    global _MODEL, _FEATURE_NAMES, _CATEGORICAL_INFO, _SCALER, _PCA, _BACKGROUND_POINTS
    
    if USE_ONNX:
        onnx_path = model_path.replace(".pkl", ".onnx")
        meta_path = model_path.replace(".pkl", ".json").replace("mule_model", "mule_metadata")
        
        if os.path.exists(onnx_path) and os.path.exists(meta_path):
            try:
                _MODEL = rt.InferenceSession(onnx_path)
                with open(meta_path, "r") as f:
                    meta = json.load(f)
                _FEATURE_NAMES = meta.get("feature_names", [])
                _CATEGORICAL_INFO = meta.get("categorical_info", {})
                _SCALER = meta.get("scaler")
                _PCA = meta.get("pca")
                _BACKGROUND_POINTS = meta.get("background_points", [])
                print(f"Successfully loaded ONNX model from {onnx_path}")
            except Exception as e:
                print(f"Failed to load ONNX model: {e}")
        else:
            print(f"ONNX model files not found at {onnx_path} or {meta_path}")
            
    else:
        if os.path.exists(model_path):
            try:
                model_data = joblib.load(model_path)
                _MODEL = model_data["model"]
                _FEATURE_NAMES = model_data["feature_names"]
                _CATEGORICAL_INFO = model_data.get("categorical_info", {})
                _SCALER = model_data.get("scaler")
                _PCA = model_data.get("pca")
                _BACKGROUND_POINTS = model_data.get("background_points", [])
                print(f"Successfully loaded ML model from {model_path} with {len(_FEATURE_NAMES)} selected features.")
            except Exception as e:
                print(f"Failed to load ML model: {e}")
                _MODEL = None
                _FEATURE_NAMES = None
                _CATEGORICAL_INFO = None
                _SCALER = None
                _PCA = None
                _BACKGROUND_POINTS = None
        else:
            print(f"Model file {model_path} not found. ML classification will be disabled.")
            
        # Cache dataset splits only in standard mode since Pandas is required
        cache_dataset_splits(dataset_path)

def cache_dataset_splits(dataset_path: str):
    """
    Splits the dataset into legitimate and mule classes and caches them for fast simulation.
    """
    global _DATASET_CACHE_LEGIT, _DATASET_CACHE_MULE
    
    # Try to load from joblib cache first for near-instant startup
    dir_path = os.path.dirname(os.path.realpath(__file__))
    cache_path = os.path.join(dir_path, "dataset_cache.joblib")
    if os.path.exists(cache_path):
        try:
            print(f"Loading cached dataset splits from {cache_path}...")
            cache = joblib.load(cache_path)
            _DATASET_CACHE_LEGIT = cache["legit"]
            _DATASET_CACHE_MULE = cache["mule"]
            print(f"Cached splits loaded: {len(_DATASET_CACHE_LEGIT)} Legit rows, {len(_DATASET_CACHE_MULE)} Mule rows.")
            return
        except Exception as e:
            print(f"Failed to load cached splits from {cache_path}: {e}")
            
    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path} for caching splits.")
        return
        
    try:
        print("Caching dataset splits for simulation (this runs once and will be cached)...")
        df = pd.read_csv(dataset_path)
        target_col = "F3924"
        if target_col in df.columns:
            df_legit = df[df[target_col] == 0]
            df_mule = df[df[target_col] == 1]
            
            # Cache a sample of legit and all mules
            _DATASET_CACHE_LEGIT = df_legit.sample(min(500, len(df_legit)), random_state=42).copy()
            _DATASET_CACHE_MULE = df_mule.copy()
            print(f"Cached splits: {len(_DATASET_CACHE_LEGIT)} Legit rows, {len(_DATASET_CACHE_MULE)} Mule rows.")
            
            # Save cache to disk
            try:
                joblib.dump({"legit": _DATASET_CACHE_LEGIT, "mule": _DATASET_CACHE_MULE}, cache_path)
                print(f"Successfully saved dataset cache to {cache_path}")
            except Exception as save_err:
                print(f"Failed to save dataset cache to {cache_path}: {save_err}")
        else:
            print(f"Target column '{target_col}' not found in dataset for split caching.")
    except Exception as e:
        print(f"Error caching dataset splits: {e}")

def predict_mule_score(features: dict) -> dict:
    """
    Predicts the mule probability for a given feature dictionary.
    Returns:
      - mule_probability: float
      - is_suspicious: bool
      - top_contributing_features: list of dicts with feature impact
      - pca_coords: dict with x and y coordinates
      - background_points: list of background dataset points
    """
    if _MODEL is None or _FEATURE_NAMES is None:
        raise ValueError("ML model is not loaded. Please train the model first.")

    # 1. Process features to match _FEATURE_NAMES (top 30 features)
    input_row = []
    local_values = {}  # Store values for explanation output

    for i, fname in enumerate(_FEATURE_NAMES):
        val = features.get(fname)
        
        # Factorize categorical columns if needed
        if fname in _CATEGORICAL_INFO:
            cats = _CATEGORICAL_INFO[fname]
            if val in cats:
                numeric_val = float(cats.index(val))
            elif isinstance(val, (int, float)) and 0 <= int(val) < len(cats):
                numeric_val = float(int(val))
            else:
                numeric_val = -1.0 # default missing
        else:
            if val is None:
                numeric_val = np.nan
            else:
                try:
                    numeric_val = float(val)
                except (ValueError, TypeError):
                    numeric_val = np.nan
        
        input_row.append(numeric_val)
        local_values[fname] = val

    if USE_ONNX:
        # ONNX Prediction
        input_data = np.array([input_row], dtype=np.float32)
        input_name = _MODEL.get_inputs()[0].name
        label_name = _MODEL.get_outputs()[1].name
        pred_onx = _MODEL.run([label_name], {input_name: input_data})
        prob = float(pred_onx[0][0][1])  # Class 1 probability
    else:
        # XGBoost Prediction
        df_input = pd.DataFrame([input_row], columns=_FEATURE_NAMES)
        prob = float(_MODEL.predict_proba(df_input)[0, 1])

    # 2. Compute PCA 2D Coordinates
    pca_coords = {"x": 0.0, "y": 0.0}
    if _SCALER is not None and _PCA is not None:
        # Fill missing values using training means from the scaler
        filled_row = []
        for i, val in enumerate(input_row):
            if np.isnan(val) or val == -1.0:
                if USE_ONNX:
                    filled_row.append(float(_SCALER["mean"][i]))
                else:
                    filled_row.append(float(_SCALER.mean_[i]))
            else:
                filled_row.append(val)
        
        try:
            if USE_ONNX:
                # Manual standard scaling and PCA projection
                means = np.array(_SCALER["mean"])
                scales = np.array(_SCALER["scale"])
                pca_comp = np.array(_PCA["components"])
                pca_mean = np.array(_PCA["mean"])
                
                scaled = (np.array(filled_row) - means) / scales
                projected = np.dot(scaled - pca_mean, pca_comp.T)
                pca_coords = {"x": float(projected[0]), "y": float(projected[1])}
            else:
                # Scale and project using sklearn objects
                scaled_row = _SCALER.transform([filled_row])
                projected = _PCA.transform(scaled_row)[0]
                pca_coords = {"x": float(projected[0]), "y": float(projected[1])}
        except Exception as e:
            print(f"Failed to project coordinates with PCA: {e}")

    # 3. Explainable AI (Local Feature Impact)
    # Estimate feature contribution = (value - mean) / std * global_importance
    if USE_ONNX:
        # Load importances from metadata
        meta_path = os.path.join(os.path.dirname(__file__), "mule_metadata.json")
        with open(meta_path, "r") as f:
            meta = json.load(f)
        importances = meta.get("feature_importances", [1.0] * len(_FEATURE_NAMES))
    else:
        importances = _MODEL.feature_importances_
        
    feature_impacts = []
    
    for i, fname in enumerate(_FEATURE_NAMES):
        val = input_row[i]
        if USE_ONNX:
            mean = float(_SCALER["mean"][i]) if _SCALER is not None else 0.0
            std = float(_SCALER["scale"][i]) if _SCALER is not None else 1.0
        else:
            mean = float(_SCALER.mean_[i]) if _SCALER is not None else 0.0
            std = float(_SCALER.scale_[i]) if _SCALER is not None else 1.0
            
        importance = float(importances[i])
        
        # Calculate contribution score
        if np.isnan(val) or val == -1.0:
            contrib = 0.0 
        else:
            contrib = ((val - mean) / max(1e-5, std)) * importance
            
        original_val = local_values[fname]
        feature_impacts.append({
            "feature": fname,
            "importance": importance,
            "contribution": contrib,
            "value": original_val if original_val is not None else "NaN"
        })

    # Sort by absolute contribution score descending to find features driving the prediction
    top_features = sorted(feature_impacts, key=lambda x: abs(x["contribution"]), reverse=True)[:10]

    return {
        "mule_probability": prob,
        "is_suspicious": prob > 0.5,
        "top_contributing_features": top_features,
        "pca_coords": pca_coords,
        "background_points": _BACKGROUND_POINTS
    }

def get_random_test_sample(dataset_path: str = "../DataSet.csv") -> dict:
    """
    Fetches a random row from DataSet.csv for testing purposes.
    """
    global _DATASET_CACHE_LEGIT, _DATASET_CACHE_MULE
    
    # Fallback if splits aren't cached
    if _DATASET_CACHE_LEGIT is None or len(_DATASET_CACHE_LEGIT) == 0:
        if not os.path.exists(dataset_path):
            raise FileNotFoundError(f"Dataset not found at {dataset_path}")
        df = pd.read_csv(dataset_path, nrows=100)
        sample = df.sample(1).iloc[0]
    else:
        # Sample randomly from either legit or mule cache
        if np.random.rand() > 0.5 and _DATASET_CACHE_MULE is not None and len(_DATASET_CACHE_MULE) > 0:
            sample = _DATASET_CACHE_MULE.sample(1).iloc[0]
        else:
            sample = _DATASET_CACHE_LEGIT.sample(1).iloc[0]
    
    # Separate features and target
    target_val = float(sample["F3924"]) if "F3924" in sample else None
    
    # Convert to dict, dropping target and replacing NaNs with None for JSON serialization
    feature_dict = sample.drop(labels=["F3924", "Unnamed: 0"], errors="ignore").replace({np.nan: None}).to_dict()
    
    return {
        "actual_target": target_val,
        "features": feature_dict
    }

def get_sample_by_class(class_type: str) -> dict:
    """
    Fetches a sample feature vector from the cached splits.
    class_type: "mule" or "legitimate"
    """
    global _DATASET_CACHE_LEGIT, _DATASET_CACHE_MULE
    
    if class_type == "mule" and _DATASET_CACHE_MULE is not None and len(_DATASET_CACHE_MULE) > 0:
        sample = _DATASET_CACHE_MULE.sample(1).iloc[0]
    elif _DATASET_CACHE_LEGIT is not None and len(_DATASET_CACHE_LEGIT) > 0:
        sample = _DATASET_CACHE_LEGIT.sample(1).iloc[0]
    else:
        raise ValueError("Dataset caches are empty or not initialized. Run model loader first.")
        
    target_val = float(sample["F3924"]) if "F3924" in sample else None
    feature_dict = sample.drop(labels=["F3924", "Unnamed: 0"], errors="ignore").replace({np.nan: None}).to_dict()
    
    return {
        "actual_target": target_val,
        "features": feature_dict
    }

