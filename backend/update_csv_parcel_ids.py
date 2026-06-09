import csv
import re

def update_parcel_ids():
    csv_path = '../src/data/AP_Soil_Health_Card_Dataset_With_Area_Health_Updated.csv'
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)
        
    for i, row in enumerate(rows):
        state = row.get('State', 'Andhra Pradesh')
        district = row.get('District', 'Unknown')
        
        # Format State: First 3 letters, uppercase
        state_code = state.replace(' ', '')[:3].upper()
        if not state_code:
            state_code = "AND"
            
        # Format District: First 3 letters, uppercase
        district_code = district.replace(' ', '')[:3].upper()
        if not district_code:
            district_code = "UNK"
            
        # Extract the old number or generate a new one
        old_id = row.get('Parcel_ID', '')
        num_match = re.search(r'\d+', old_id)
        if num_match:
            number = num_match.group(0).zfill(6)
        else:
            number = str(i + 1).zfill(6)
            
        new_id = f"{state_code}-{district_code}-{number}"
        row['Parcel_ID'] = new_id

    # Overwrite the same updated file
    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"Successfully updated Parcel IDs for {len(rows)} rows!")

if __name__ == "__main__":
    update_parcel_ids()
