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
                
                # Replace mock creation names: mocks.MockProductRepository -> mocks.ProductRepository
                content = re.sub(r'mocks\.Mock([A-Za-z]+Repository)', r'mocks.\1', content)
                
                # Replace audit service init: audit.NewAuditService(log) -> audit.NewAuditService(nil, log)
                content = content.replace("audit.NewAuditService(appLogger)", "audit.NewAuditService(nil, appLogger)")
                content = content.replace("audit.NewAuditService(testLogger)", "audit.NewAuditService(nil, testLogger)")
                
                # If there are any `new(mocks.Mocksomething)`, `mocks.ProductRepository` works for mockery generated mocks too?
                # Actually, mockery v2 generates `NewProductRepository(t)` instead of `new(mocks.ProductRepository)`
                # Let's just fix the struct type reference first. If there are other errors, we will fix them.
                
                if content != original_content:
                    with open(path, "w", encoding="utf-8") as file:
                        file.write(content)

print("Test fixes applied.")
