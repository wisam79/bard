"""
Final fix for test assertions and format specifiers after float64→int64 migration.
"""
import re

fixes = 0

def fix_file(path, replacements):
    global fixes
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    original = content
    for old, new in replacements:
        content = content.replace(old, new)
    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        fixes += 1
        print(f"  ✓ {path.split('\\')[-1]}")

# integration_test.go - change float64() expected values to int64() for monetary fields
ipath = r"e:\projects\bard\internal\repository\sqlite\integration_test.go"
with open(ipath, "r", encoding="utf-8") as f:
    content = f.read()
original = content

# Replace float64(xxx) in assert.Equal for monetary values
# e.g., assert.Equal(t, float64(100), product.Price) → assert.Equal(t, int64(100), product.Price)
content = re.sub(
    r'(assert\.Equal\(t,\s+)float64\((\d+)\)(,\s+\w+\.(Price|Cost|Total|Amount|Balance|Debt|Subtotal|VAT|Discount|WholesalePrice|TotalCost|TotalPurchases|InstallmentDebt))',
    r'\1int64(\2)\3',
    content
)

if content != original:
    with open(ipath, "w", encoding="utf-8") as f:
        f.write(content)
    fixes += 1
    print(f"  ✓ integration_test.go")

# validator_test.go - fix expectedTotal type
fix_file(r"e:\projects\bard\internal\service\validator_test.go", [
    ("item.Total != expectedTotal", "float64(item.Total) != expectedTotal"),
])

# domain_test.go - fix format specifiers %f → %d for int64 fields
dpath = r"e:\projects\bard\internal\domain\domain_test.go"
with open(dpath, "r", encoding="utf-8") as f:
    content = f.read()
original = content
# Replace: Errorf("... %f ...", stats.TodaySales) → Errorf("... %d ...", stats.TodaySales)
content = re.sub(r'(%f)(.*?)(stats\.TodaySales|product\.TotalQty|calc\.TotalAmount|calc\.DownPayment|calc\.MonthlyAmount)', r'%d\2\3', content)
if content != original:
    with open(dpath, "w", encoding="utf-8") as f:
        f.write(content)
    fixes += 1
    print(f"  ✓ domain_test.go")

print(f"\nDone. {fixes} files fixed.")
