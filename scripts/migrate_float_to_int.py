"""
Bard POS: float64 → int64 Migration Script for Financial Fields
================================================================
This script performs a targeted replacement of float64 → int64 for
MONETARY fields only in Go domain models. Quantity, rate, and percentage
fields (which genuinely need decimals) are left as float64.

Strategy:
  - Money fields: Price, Cost, Total, Amount, Balance, Debt, Value,
    Subtotal, Discount (fixed), VAT, Revenue, Profit, Commission,
    DownPayment, MonthlyAmount, CostImpact, CostLoss, etc.
  - Keep float64: Stock, Qty, MinStock, Rate, Margin, Growth, Percentage,
    PointsRate, DiscountPct, VariancePct, ExchangeRate, Deviation, etc.
"""
import os
import re

DOMAIN_DIR = r"e:\projects\bard\internal\domain"

# ---------- Classification ----------
# Fields that represent MONEY and must become int64
MONEY_FIELD_NAMES = {
    "Price", "Cost", "Total", "TotalCost", "Amount", "Balance",
    "Debt", "InstallmentDebt", "TotalPurchases", "Subtotal",
    "Discount",  # fixed discount amounts
    "VAT", "Value",  # commission/discount/voucher value
    "WholesalePrice", "TotalValue", "TotalAmount", "Profit",
    "DownPayment", "MonthlyAmount", "CostImpact", "CostLoss",
    "StartCash", "EndCash", "Revenue",
    "InitialBalance", "CreditLimit",
    "MinAmount", "MaxAmount", "SpentAmount",
    "BaseAmount", "Commission",
    "TotalSales", "TotalReturns", "AvgSaleValue",
    "TotalTax", "ReturnTax", "NetTax",
    "Pending", "RewardValue",
    "MinPurchase",  # monetary threshold
    "TodaySales", "MonthSales", "TotalDebt",
    "FromAmount", "ToAmount",
    "Predicted", "LowerBound", "UpperBound", "Expected", "Actual",
    "TotalQty",  # this is actually monetary in TopProduct context... but let's keep as float for safety
}

# Fields that must STAY float64 (quantities, rates, percentages)
KEEP_FLOAT_NAMES = {
    "Stock", "MinStock", "Qty", "Quantity", "ItemsCount",
    "ReturnedQty", "QtyBefore", "QtyAfter", "Delta",
    "TaxRate", "Rate", "PointsRate", "DiscountPct",
    "ExchangeRate", "AppliedRate",
    "Margin", "Growth", "Deviation",
    "VariancePct", "Variance", "SystemQty", "PhysicalQty",
    "ReorderPoint", "ReorderQty", "SuggestedQty",
    "CurrentStock", "CurrentQty", "PredictedDemand", "DaysOfStock",
    "MinQty", "TotalQty",
}

# Special: map[string]float64 for SplitDetails (money map)
# We'll handle this separately

def classify_field(field_name):
    """Returns 'int64' if monetary, 'float64' if keep, 'unknown' otherwise."""
    if field_name in MONEY_FIELD_NAMES:
        return "int64"
    if field_name in KEEP_FLOAT_NAMES:
        return "float64"
    return "unknown"

def process_domain_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # Pattern: field_name  float64  `tags`
    # We match lines like:  \tFieldName  float64  `...`
    def replace_monetary_field(match):
        indent = match.group(1)
        field_name = match.group(2)
        rest = match.group(3)

        classification = classify_field(field_name)
        if classification == "int64":
            return f"{indent}{field_name}  int64  {rest}"
        elif classification == "float64":
            return match.group(0)  # keep as-is
        else:
            # Unknown - print warning and keep
            print(f"  ⚠ UNKNOWN field: {field_name} in {os.path.basename(filepath)} – keeping float64")
            return match.group(0)

    # Match struct field lines with float64
    pattern = r'(\t+)(\w+)\s+float64\s+(`[^`]+`)'
    content = re.sub(pattern, replace_monetary_field, content)

    # Handle map[string]float64 for SplitDetails → map[string]int64
    content = content.replace("map[string]float64", "map[string]int64")

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  ✓ Updated: {os.path.basename(filepath)}")
        return True
    return False

def main():
    print("=" * 60)
    print("Bard POS: float64 → int64 Migration (Domain Models)")
    print("=" * 60)

    updated = 0
    for filename in sorted(os.listdir(DOMAIN_DIR)):
        if filename.endswith(".go") and not filename.endswith("_test.go"):
            filepath = os.path.join(DOMAIN_DIR, filename)
            if process_domain_file(filepath):
                updated += 1

    print(f"\n{'=' * 60}")
    print(f"Done. Updated {updated} domain files.")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    main()
