import os

file_path = r"e:\projects\bard\frontend\src\pages\Customers.tsx"
out_dir = r"e:\projects\bard\frontend\src\components\features\customers"

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

imports_block = """import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { Customer, LoyaltyTier, LoyaltyRule, LoyaltyTransaction, GiftCard, Voucher, CustomerSegment, Campaign } from '@/types';
import { Search, Plus, Pencil, Trash2, Users, Wallet, Eye, UserPlus, Star, Clock, Crown, Gift, CreditCard, Tag, DollarSign, Megaphone, Zap, Trash2 as Trash2Icon, Play } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { wailsApp } from '@/lib/wails';
"""

# Extract components using line numbers (1-indexed -> 0-indexed)
customers_tab = "".join(lines[19:197])
loyalty_tab = "".join(lines[198:314])
giftcards_tab = "".join(lines[315:424])
segments_tab = "".join(lines[425:521])
main_tab = "".join(lines[522:])

components = {
    "CustomersSubTab.tsx": customers_tab,
    "LoyaltySubTab.tsx": loyalty_tab,
    "GiftCardsSubTab.tsx": giftcards_tab,
    "SegmentsSubTab.tsx": segments_tab
}

for name, code in components.items():
    comp_name = name.split(".")[0]
    out_file = os.path.join(out_dir, name)
    with open(out_file, "w", encoding="utf-8") as out:
        out.write(imports_block + "\n" + code + f"\nexport default {comp_name};\n")

# Rewrite Customers.tsx
main_imports = """import React, { useState } from 'react';
import { Users, Crown, Gift, Megaphone } from 'lucide-react';
import CustomersSubTab from '@/components/features/customers/CustomersSubTab';
import LoyaltySubTab from '@/components/features/customers/LoyaltySubTab';
import GiftCardsSubTab from '@/components/features/customers/GiftCardsSubTab';
import SegmentsSubTab from '@/components/features/customers/SegmentsSubTab';

type CustomersTab = 'customers' | 'loyalty' | 'giftcards' | 'segments';

const TAB_ITEMS: { id: CustomersTab; label: string; icon: React.ReactNode }[] = [
  { id: 'customers', label: 'العملاء', icon: <Users size={16} /> },
  { id: 'loyalty', label: 'الولاء', icon: <Crown size={16} /> },
  { id: 'giftcards', label: 'بطاقات الهدايا', icon: <Gift size={16} /> },
  { id: 'segments', label: 'الشرائح', icon: <Megaphone size={16} /> },
];

"""

# Write to Customers.tsx using a safe path open
f = open(file_path, "w", encoding="utf-8")
f.write(main_imports + main_tab)
f.close()

print("Splitting completed via line numbers.")
