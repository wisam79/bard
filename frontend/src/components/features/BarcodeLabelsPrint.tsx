import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Tag, Printer, X, Minus, Plus, Package } from 'lucide-react';
import { Product } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import BarcodeDisplay from '@/components/ui/BarcodeDisplay';
import Modal from '@/components/ui/Modal';
import { wailsApp } from '@/lib/wails';

interface BarcodeLabelsPrintProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SelectedProduct {
  product: Product;
  quantity: number;
}

type LabelFormat = '30x20' | '40x30' | '50x30' | '60x40';

const BarcodeLabelsPrint: React.FC<BarcodeLabelsPrintProps> = ({ isOpen, onClose }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchError, setSearchError] = useState('');
  const [labelFormat, setLabelFormat] = useState<LabelFormat>('50x30');
  const [includePrice, setIncludePrice] = useState(true);
  const [includeStoreName, setIncludeStoreName] = useState(true);

  const searchProducts = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setSearchError('');
      return;
    }
    try {
      const results = await wailsApp.SearchProducts(query, 10);
      setSearchResults(results || []);
      setSearchError('');
    } catch (error: unknown) {
      setSearchResults([]);
      setSearchError(error instanceof Error ? error.message : 'تعذر البحث عن المنتجات.');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchProducts(value);
  };

  const addProduct = (product: Product) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((p) => p.product.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setSelectedProducts((prev) =>
      prev
        .map((p) =>
          p.product.id === productId ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.product.id !== productId));
  };

  const totalLabels = selectedProducts.reduce((sum, p) => sum + p.quantity, 0);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    pageStyle: `
      @page {
        margin: 0;
        size: auto;
      }
      @media print {
        body { margin: 0; padding: 0; }
        .no-print { display: none; }
      }
    `,
  });

  const getLabelDimensions = () => {
    const dimensions: Record<LabelFormat, { width: string; height: string; fontSize: string }> = {
      '30x20': { width: '30mm', height: '20mm', fontSize: 'text-[8px]' },
      '40x30': { width: '40mm', height: '30mm', fontSize: 'text-[10px]' },
      '50x30': { width: '50mm', height: '30mm', fontSize: 'text-[11px]' },
      '60x40': { width: '60mm', height: '40mm', fontSize: 'text-[12px]' },
    };
    return dimensions[labelFormat] || dimensions['50x30'];
  };

  const dimensions = getLabelDimensions();

  const renderLabel = (product: Product, index: number) => (
    <div
      key={`${product.id}-${index}`}
      className="bg-white border border-gray-300 flex flex-col items-center justify-center overflow-hidden text-black"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        pageBreakInside: 'avoid',
      }}
    >
      {includeStoreName && (
        <div className={`${dimensions.fontSize} font-bold text-center truncate w-full`}>
          Bard
        </div>
      )}
      <div className={`${dimensions.fontSize} font-bold text-center line-clamp-2`}>
        {product.name}
      </div>
      <BarcodeDisplay
        value={product.barcode || product.id}
        format="CODE128"
        width={1.5}
        height={labelFormat === '30x20' ? 30 : labelFormat === '40x30' ? 40 : 50}
        fontSize={8}
        showValue={true}
      />
      {includePrice && (
        <div className={`${dimensions.fontSize} font-bold`}>
          {product.price.toLocaleString('ar-IQ')} د.ع
        </div>
      )}
    </div>
  );

  const handleLabelFormatChange = (value: string) => {
    setLabelFormat(value as LabelFormat);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="طباعة ملصقات الباركود"
      size="xl"
    >
      <div className="space-y-6">
        {/* Search Products */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            البحث عن منتج
          </label>
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="ابحث عن منتج بالاسم أو الباركود..."
              icon={<Package size={18} />}
            />
            {searchError && (
              <p className="mt-2 text-xs font-bold text-rose-500" role="alert">
                {searchError}
              </p>
            )}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addProduct(product)}
                    className="w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        الباركود: {product.barcode || 'بدون'}
                      </p>
                    </div>
                    <p className="font-bold text-primary-600">{product.price.toLocaleString('ar-IQ')} د.ع</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              حجم الملصق
            </label>
            <Select
              value={labelFormat}
              onChange={handleLabelFormatChange}
              options={[
                { value: '30x20', label: '30 × 20 مم (صغير)' },
                { value: '40x30', label: '40 × 30 مم (متوسط)' },
                { value: '50x30', label: '50 × 30 مم (قياسي)' },
                { value: '60x40', label: '60 × 40 مم (كبير)' },
              ]}
            />
          </div>
          <div className="flex items-center gap-4 pt-7">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includePrice}
                onChange={(e) => setIncludePrice(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">السعر</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeStoreName}
                onChange={(e) => setIncludeStoreName(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">اسم المتجر</span>
            </label>
          </div>
        </div>

        {/* Selected Products */}
        {selectedProducts.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Tag size={20} className="text-primary-500" />
                <span className="font-medium">الملصقات المحددة</span>
              </div>
              <span className="text-sm text-gray-500">
                الإجمالي: {totalLabels} ملصق
              </span>
            </div>

            <div className="space-y-2">
              {selectedProducts.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between bg-white dark:bg-gray-700 p-3 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.product.barcode || item.product.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => removeProduct(item.product.id)}
                      className="p-1 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={onClose} variant="secondary" className="flex-1">
            إلغاء
          </Button>
          <Button
            onClick={() => handlePrint()}
            disabled={totalLabels === 0}
            className="flex-1"
            icon={<Printer size={18} />}
          >
            طباعة {totalLabels} ملصق
          </Button>
        </div>
      </div>

      {/* Hidden print content */}
      <div className="hidden">
        <div ref={componentRef} className="flex flex-wrap gap-2 p-2">
          {selectedProducts.flatMap((item) =>
            Array.from({ length: item.quantity }, (_, i) => renderLabel(item.product, i))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default BarcodeLabelsPrint;
