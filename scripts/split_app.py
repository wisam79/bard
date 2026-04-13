import os
import re

app_go_path = r"e:\projects\bard\internal\handler\app.go"

with open(app_go_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find where the struct and constructors end
# We'll keep lines 1 to 167 in app.go
core_end = 167

# We'll regex match `func (a *App) Action...` to categorize
categories = {
    "products": ["Product", "Categories"],
    "sales": ["Sale", "Installment"],
    "customers": ["Customer"],
    "finance": ["Expense", "Payment"],
    "settings": ["Preference", "Database", "DashboardStats"],
    "staff": ["Staff", "Login", "Logout", "Password"],
    "shifts": ["Shift", "CashMovement"],
    "inventory": ["Supplier", "PurchaseOrder", "Stock", "Waste"],
    "features_loyalty": ["Loyalty", "GiftCard", "Voucher"],
    "features_kitchen": ["Kitchen"],
    "features_wallet": ["Wallet", "CreditLimit"],
    "features_currency": ["Currenc", "ExchangeRate"],
    "features_messaging": ["Message", "Messaging"],
    "features_comms": ["Commission", "Performance"],
    "features_campaigns": ["Segment", "Campaign"],
    "features_tax": ["Tax"],
    "features_kiosk": ["Kiosk"],
    "features_delivery": ["Delivery"],
    "features_analytics": ["Analytic", "Forecast", "Anomal", "ProfitAnalysis"],
    "features_misc": ["Branch", "Kit", "RecurringInvoice", "Reorder", "Budget", "Report", "Export"]
}

blocks = {}
current_block = []
current_func = None

for line in lines[core_end:]:
    if line.startswith("func (a *App)"):
        # Match function name
        m = re.match(r"func \(a \*App\) (\w+)\(", line)
        if m:
            if current_func:
                # save previous block
                blocks[current_func] = "".join(current_block)
            current_func = m.group(1)
            current_block = [line]
        else:
            current_block.append(line)
    elif line.startswith("// ── Feature"):
        if current_func:
            blocks[current_func] = "".join(current_block)
            current_func = None
            current_block = []
    else:
        current_block.append(line)

if current_func:
    blocks[current_func] = "".join(current_block)


file_contents = {}
for func_name, code in blocks.items():
    assigned = "misc"
    for cat, keys in categories.items():
        if any(k in func_name for k in keys):
            assigned = cat
            break
    
    if assigned not in file_contents:
        file_contents[assigned] = []
    file_contents[assigned].append(code)

out_dir = r"e:\projects\bard\internal\handler"

for cat, codes in file_contents.items():
    out_path = os.path.join(out_dir, f"app_{cat}.go")
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write("package handler\n\nimport (\n\t\"bard/internal/domain\"\n\t\"bard/internal/middleware\"\n\t\"bard/internal/audit\"\n\t\"fmt\"\n)\n\n")
        f.write("\n".join(codes))

# Write the new app.go
with open(app_go_path, 'w', encoding='utf-8') as f:
    f.writelines(lines[:core_end])

print("Splitting complete")
