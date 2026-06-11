import os

src_dir = r"c:\Users\windows-11\Desktop\agri-soil\src"
target_string = "https://true-rockets-end.loca.lt"
replacement_string = "/api"

count = 0
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(".ts") or file.endswith(".tsx"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            if target_string in content:
                content = content.replace(target_string, replacement_string)
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                count += 1
                print(f"Updated {filepath}")
print(f"Finished updating {count} files.")
