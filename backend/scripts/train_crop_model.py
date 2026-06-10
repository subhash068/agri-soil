import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# Paths
csv_path = r"c:\Users\windows-11\Desktop\agri-soil\src\data\Crop_recommendation.csv"
model_path = r"c:\Users\windows-11\Desktop\agri-soil\backend\crop_model.pkl"

print("Loading dataset...")
df = pd.read_csv(csv_path)

# Features and Target
X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = df['label']

# Train Model
print("Training Random Forest Classifier...")
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X, y)

# Save Model
print(f"Saving model to {model_path}...")
joblib.dump(clf, model_path)
print("Done!")
