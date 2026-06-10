import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report
import xgboost as xgb
import time

def main():
    data_path = "../DataSet.csv"
    output_path = "app/mule_model.pkl"

    print(f"Loading dataset from {data_path} ...")
    start_time = time.time()
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} rows and {df.shape[1]} columns in {time.time() - start_time:.2f} seconds.")

    target_col = "F3924"
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in the dataset!")

    # Clean dataset
    df = df.dropna(subset=[target_col])
    if "Unnamed: 0" in df.columns:
        df = df.drop(columns=["Unnamed: 0"])

    X = df.drop(columns=[target_col])
    y = df[target_col].astype(int)

    # Handle object columns if any
    categorical_info = {}
    object_cols = X.select_dtypes(include=['object']).columns
    for col in object_cols:
        X[col] = X[col].astype('category')
        categorical_info[col] = list(X[col].cat.categories)
        X[col] = X[col].cat.codes.astype(float)

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Step 1: Running Automated Feature Selection using initial XGBoost importances...")
    # Train initial model on all features to select top features
    initial_model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        objective='binary:logistic',
        use_label_encoder=False,
        eval_metric='auc',
        random_state=42,
        n_jobs=-1,
        tree_method='hist',
        enable_categorical=True
    )
    initial_model.fit(X_train, y_train)

    # Get feature importances
    importances = initial_model.feature_importances_
    feature_names_all = list(X.columns)
    
    # Sort by importance descending
    sorted_idx = np.argsort(importances)[::-1]
    
    # Select top 30 features
    top_k = 30
    selected_features = [feature_names_all[idx] for idx in sorted_idx[:top_k]]
    print(f"Top {top_k} selected features:")
    for i, f in enumerate(selected_features):
        print(f"  {i+1}. {f}: {importances[sorted_idx[i]]:.6f}")

    # Reduce datasets to selected features only
    X_train_sel = X_train[selected_features]
    X_test_sel = X_test[selected_features]

    print("Step 2: Fitting StandardScaler and PCA for dimensionality reduction...")
    # Fill missing values for PCA & scaling
    # PCA and standard scaler cannot handle NaNs directly
    imputer = StandardScaler()
    
    # Simple imputation: fill NaNs with column mean
    X_train_filled = X_train_sel.fillna(X_train_sel.mean())
    X_test_filled = X_test_sel.fillna(X_train_sel.mean()) # use train mean

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_filled)
    X_test_scaled = scaler.transform(X_test_filled)

    pca = PCA(n_components=2, random_state=42)
    X_train_pca = pca.fit_transform(X_train_scaled)
    X_test_pca = pca.transform(X_test_scaled)
    
    print(f"PCA explained variance ratio: {pca.explained_variance_ratio_} (Total: {sum(pca.explained_variance_ratio_):.4f})")

    print("Step 3: Training final robust XGBoost classifier on selected features only...")
    # Calculate scale_pos_weight to handle extreme imbalance (9001 / 81 = 111.1)
    neg_count = sum(y_train == 0)
    pos_count = sum(y_train == 1)
    scale_weight = neg_count / max(1, pos_count)
    print(f"Imbalance ratio (neg/pos) = {scale_weight:.2f}. Setting scale_pos_weight.")

    final_model = xgb.XGBClassifier(
        n_estimators=150,
        max_depth=5,
        learning_rate=0.08,
        scale_pos_weight=scale_weight,
        objective='binary:logistic',
        use_label_encoder=False,
        eval_metric='auc',
        random_state=42,
        n_jobs=-1,
        tree_method='hist'
    )
    final_model.fit(X_train_sel, y_train)

    # Evaluate final model
    y_pred = final_model.predict(X_test_sel)
    y_prob = final_model.predict_proba(X_test_sel)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)

    print("\n--- Final Model Evaluation ---")
    print(f"Accuracy: {acc:.4f}")
    print(f"ROC-AUC:  {auc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    print("Step 4: Generating background points for t-SNE/PCA Scatter Plot...")
    # Project the entire cleaned dataset using our fitted scaler + PCA
    X_filled_all = X[selected_features].fillna(X_train_sel.mean())
    X_scaled_all = scaler.transform(X_filled_all)
    X_pca_all = pca.transform(X_scaled_all)

    # Separate legitimate and suspicious indices
    legit_idx = np.where(y == 0)[0]
    mule_idx = np.where(y == 1)[0]

    # Sample points for visualization
    np.random.seed(42)
    sample_legit_idx = np.random.choice(legit_idx, size=min(300, len(legit_idx)), replace=False)
    
    # We take all mule instances to show the minority class fully
    sample_mule_idx = mule_idx

    background_points = []
    # Add legitimate points
    for idx in sample_legit_idx:
        background_points.append({
            "x": float(X_pca_all[idx, 0]),
            "y": float(X_pca_all[idx, 1]),
            "label": 0
        })
    # Add mule points
    for idx in sample_mule_idx:
        background_points.append({
            "x": float(X_pca_all[idx, 0]),
            "y": float(X_pca_all[idx, 1]),
            "label": 1
        })

    print(f"Generated {len(background_points)} background points (Legit: {len(sample_legit_idx)}, Mule: {len(sample_mule_idx)}).")

    print(f"Saving model artifacts to {output_path}...")
    model_data = {
        "model": final_model,
        "feature_names": selected_features,
        "categorical_info": categorical_info,
        "scaler": scaler,
        "pca": pca,
        "background_points": background_points
    }
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    joblib.dump(model_data, output_path)
    print("Model training pipeline completed and model saved successfully!")

if __name__ == "__main__":
    main()
