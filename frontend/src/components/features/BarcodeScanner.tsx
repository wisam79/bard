import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Search, Barcode as BarcodeIcon, X, Zap, ZapOff } from 'lucide-react';
import Input from '@/components/ui/Input';
import { Product } from '@/types';
import { wailsApp } from '@/lib/wails';

interface BarcodeScannerProps {
  onProductFound: (product: Product) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  showScannerMode?: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onProductFound,
  onError,
  placeholder = 'امسح الباركود أو ابحث عن منتج...',
  autoFocus = true,
  className = '',
  showScannerMode = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'manual' | 'scanner'>('scanner');
  const [isScanning, setIsScanning] = useState(false);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 2) return;

    try {
      // First try exact barcode lookup
      if (/^\d+$/.test(query.trim())) {
        try {
          const product = await wailsApp.GetProductByBarcode(query.trim());
          if (product && product.id) {
            onProductFound(product);
            setSearchQuery('');
            document.getElementById('barcode-input')?.focus();
            return; // Return immediately to prevent duplicate call
          }
        } catch {
          // Fall back to search
        }
      }

      // Fallback to search only if exact barcode lookup didn't find anything
      const results = await wailsApp.SearchProducts(query.trim(), 1);
      if (results && results.length > 0) {
        onProductFound(results[0]);
        setSearchQuery('');
        document.getElementById('barcode-input')?.focus();
      } else {
        onError?.('لم يتم العثور على المنتج');
      }
    } catch {
      onError?.('خطأ في البحث عن المنتج');
    }
  }, [onProductFound, onError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchMode === 'scanner' && value.length > 10) {
      // Barcode scanners input quickly, detect this
      setIsScanning(true);
      const timeout = setTimeout(() => {
        handleSearch(value);
        setIsScanning(false);
      }, 200);
      debounceTimeoutRef.current = timeout;
    } else if (searchMode === 'manual') {
      const timeout = setTimeout(() => {
        handleSearch(value);
      }, 500);
      debounceTimeoutRef.current = timeout;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(searchQuery);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex gap-2 items-center">
        {showScannerMode && (
          <button
            onClick={() => setSearchMode(searchMode === 'scanner' ? 'manual' : 'scanner')}
            className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title={searchMode === 'scanner' ? 'وضع البحث اليدوي' : 'وضع الماسح'}
          >
            {searchMode === 'scanner' ? <Zap size={18} className="text-green-500" /> : <ZapOff size={18} className="text-gray-400" />}
          </button>
        )}
        <Input
          id="barcode-input"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          icon={<Search size={18} />}
          className={isScanning ? 'ring-2 ring-green-500' : ''}
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              document.getElementById('barcode-input')?.focus();
            }}
            className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      {/* Scanner Mode Indicator */}
      {searchMode === 'scanner' && (
        <div className="flex items-center gap-2 mt-2 text-xs text-green-500">
          <BarcodeIcon size={14} />
          <span>وضع الماسح الضوئي: امسح الباركود مباشرة</span>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
