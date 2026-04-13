import os
import re

directories = [r"e:\projects\bard\internal\handler", r"e:\projects\bard\internal\service", r"e:\projects\bard\internal\audit"]

for d in directories:
    for root, dirs, files in os.walk(d):
        for f in files:
            if f.endswith("_test.go"):
                path = os.path.join(root, f)
                with open(path, "r", encoding="utf-8") as file:
                    content = file.read()

                original_content = content
                
                # Replace audit.NewAuditService([something]) -> audit.NewAuditService(nil, [something])
                content = re.sub(r'audit\.NewAuditService\(([^,]+)\)', r'audit.NewAuditService(nil, \1)', content)
                
                if content != original_content:
                    with open(path, "w", encoding="utf-8") as file:
                        file.write(content)

print("Audit Test fixes applied.")
