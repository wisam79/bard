"""
Final batch fix for remaining type mismatches in service files after float64→int64 migration.
"""
import re
import os

SERVICE_DIR = r"e:\projects\bard\internal\service"
fixes = 0

def fix_file(filepath, replacements):
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

# shift_supplier_service.go
fix_file(os.path.join(SERVICE_DIR, "shift_supplier_service.go"), [
    ("StartCash: startCash,", "StartCash: int64(startCash),"),
    ("EndCash:  endCash", "EndCash:  int64(endCash)"),
    # For CashMovement.Amount
    ("Amount:    amount,", "Amount:    int64(amount),"),
])

# stock_adjustment_service.go  
fix_file(os.path.join(SERVICE_DIR, "stock_adjustment_service.go"), [
    ("delta * product.Cost", "int64(delta) * product.Cost"),
    ("qty * product.Cost", "int64(qty) * product.Cost"),
    ("variance * p.Cost", "int64(variance) * p.Cost"),
])

# validator.go
fix_file(os.path.join(SERVICE_DIR, "validator.go"), [
    ("float64(item.Quantity) * item.Price", "float64(item.Quantity) * float64(item.Price)"),
])

# wallet_service.go
fix_file(os.path.join(SERVICE_DIR, "wallet_service.go"), [
    ("CreditLimit: creditLimit,", "CreditLimit: int64(creditLimit),"),
    ("wallet.Balance += amount", "wallet.Balance += int64(amount)"),
    ("wallet.Balance -= amount", "wallet.Balance -= int64(amount)"),
    # WalletTransaction.Amount
])

# Read wallet_service to fix Amount field in struct literal
wpath = os.path.join(SERVICE_DIR, "wallet_service.go")
with open(wpath, "r", encoding="utf-8") as f:
    content = f.read()
# Fix: Amount: amount → Amount: int64(amount) but only for WalletTransaction struct
content = re.sub(r'Amount:\s+amount,', 'Amount:    int64(amount),', content)
# Also Amount: -amount
content = re.sub(r'Amount:\s+-amount,', 'Amount:    -int64(amount),', content)
with open(wpath, "w", encoding="utf-8") as f:
    f.write(content)

print(f"\nDone. {fixes} files fixed.")
