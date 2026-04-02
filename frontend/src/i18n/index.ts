import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      // Navigation
      'nav.dashboard': 'لوحة التحكم',
      'nav.sales': 'المبيعات',
      'nav.products': 'المنتجات',
      'nav.customers': 'العملاء',
      'nav.finance': 'المالية',
      'nav.invoices': 'الفواتير',
      'nav.reports': 'التقارير',
      'nav.settings': 'الإعدادات',

      // Common
      'common.save': 'حفظ',
      'common.cancel': 'إلغاء',
      'common.delete': 'حذف',
      'common.edit': 'تعديل',
      'common.add': 'إضافة',
      'common.search': 'بحث',
      'common.loading': 'جاري التحميل...',
      'common.noData': 'لا توجد بيانات',
      'common.confirm': 'تأكيد',
      'common.close': 'إغلاق',

      // Sales
      'sales.cart': 'السلة',
      'sales.checkout': 'إتمام البيع',
      'sales.total': 'الإجمالي',
      'sales.subtotal': 'المجموع الفرعي',
      'sales.discount': 'الخصم',
      'sales.tax': 'الضريبة',
      'sales.change': 'الباقي',
      'sales.received': 'المبلغ المستلم',
      'sales.emptyCart': 'السلة فارغة',

      // Products
      'products.name': 'اسم المنتج',
      'products.barcode': 'الباركود',
      'products.price': 'السعر',
      'products.cost': 'التكلفة',
      'products.stock': 'المخزون',
      'products.category': 'الفئة',

      // Customers
      'customers.name': 'اسم العميل',
      'customers.phone': 'الهاتف',
      'customers.debt': 'الدين',
      'customers.points': 'النقاط',

      // Settings
      'settings.storeName': 'اسم المتجر',
      'settings.theme': 'المظهر',
      'settings.language': 'اللغة',
    },
  },
  en: {
    translation: {
      'nav.dashboard': 'Dashboard',
      'nav.sales': 'Sales',
      'nav.products': 'Products',
      'nav.customers': 'Customers',
      'nav.finance': 'Finance',
      'nav.invoices': 'Invoices',
      'nav.reports': 'Reports',
      'nav.settings': 'Settings',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.search': 'Search',
      'common.loading': 'Loading...',
      'common.noData': 'No data',
      'common.confirm': 'Confirm',
      'common.close': 'Close',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'ar',
  fallbackLng: 'ar',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
