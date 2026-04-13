import os
import re

file_path = r"e:\projects\bard\frontend\src\pages\Customers.tsx"
out_dir = r"e:\projects\bard\frontend\src\components\features\customers"

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Shared imports that might be needed in subtabs.
# We will just include standard imports for all files to be safe
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

# Extract components using regex
components = ["CustomersSubTab", "LoyaltySubTab", "GiftCardsSubTab", "SegmentsSubTab"]

for comp in components:
    # Match the component block: const Name: React.FC = () => { ... };
    # We find the start of the const, and then match until the start of the next const or end of file
    pattern = rf"const {comp}: React\.FC = \(\) => {{.*?\n}};\n"
    match = re.search(pattern, content, re.DOTALL)
    if match:
        comp_code = match.group(0)
        out_file = os.path.join(out_dir, f"{comp}.tsx")
        with open(out_file, "w", encoding="utf-8") as out:
            out.write(imports_block + "\n" + comp_code + f"\nexport default {comp};\n")

# Now rewrite Customers.tsx to import these
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

# Extract main Customers component
main_pattern = r"const Customers: React\.FC = \(\) => \{([^}]+|(?<=\{)[^}]*(?=\}))+\};\n*export default Customers;"
match_main = re.search(r"const Customers: React\.FC = .*?export default Customers;\n?", content, re.DOTALL)
if match_main:
    main_code = match_main.group(0)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(main_imports + main_code)

print("Customers tabs split successfully.")
