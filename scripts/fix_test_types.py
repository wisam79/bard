"""
Fix test files that reference float64 where int64 is now expected.
"""
import os
import re

fixes = 0

def fix_test_file(filepath, replacements):
    global fixes
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    original = content
    for old, new in replacements:
        content = content.replace(old, new)
    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        fixes += 1
        print(f"  ✓ Fixed: {os.path.basename(filepath)}")

# Fix integration_test.go
fix_test_file(r"e:\projects\bard\internal\repository\sqlite\integration_test.go", [
    ("float64(i * 10)", "int64(i * 10)"),
    ("float64(i * 100)", "int64(i * 100)"),
])

# Fix validator_comprehensive_test.go
fix_test_file(r"e:\projects\bard\internal\service\validator_comprehensive_test.go", [
    ("1e308", "int64(9999999)"),
    ("0.000001", "int64(0)"),
])
# For accumulators:
vpath = r"e:\projects\bard\internal\service\validator_comprehensive_test.go"
with open(vpath, "r", encoding="utf-8") as f:
    content = f.read()
content = content.replace("calculatedSubtotal += item.Total", "calculatedSubtotal += float64(item.Total)")
content = content.replace("actualSubtotal += item.Total", "actualSubtotal += float64(item.Total)")
with open(vpath, "w", encoding="utf-8") as f:
    f.write(content)

# Fix validator_test.go
fix_test_file(r"e:\projects\bard\internal\service\validator_test.go", [
    ("item.Price * item.Quantity", "float64(item.Price) * item.Quantity"),
])

# Fix domain_test.go  
dpath = r"e:\projects\bard\internal\domain\domain_test.go"
with open(dpath, "r", encoding="utf-8") as f:
    content = f.read()
original = content
# Replace float64 literals used for monetary struct fields
# Pattern: Price: 100.0 → Price: 100
content = re.sub(r'(Price|Cost|Total|Amount|Balance|Subtotal|Discount|VAT|TotalCost|Debt|TotalPurchases):\s+(\d+\.\d+)', 
    lambda m: f'{m.group(1)}: {int(float(m.group(2)))}', content)
if content != original:
    with open(dpath, "w", encoding="utf-8") as f:
        f.write(content)
    fixes += 1
    print(f"  ✓ Fixed: domain_test.go")

print(f"\nDone. {fixes} test files fixed.")
