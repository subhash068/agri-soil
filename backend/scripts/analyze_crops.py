import pandas as pd
df = pd.read_csv("c:/Users/windows-11/Desktop/agri-soil/src/data/Crop_recommendation.csv")
print(df.groupby('label').mean())
