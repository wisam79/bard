import React from 'react';
import Barcode from 'react-barcode';
import { QRCodeCanvas } from 'qrcode.react';

interface BarcodeDisplayProps {
  value: string;
  type?: 'barcode' | 'qrcode';
  format?: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC';
  width?: number;
  height?: number;
  fontSize?: number;
  showValue?: boolean;
  className?: string;
}

const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  type = 'barcode',
  format = 'CODE128',
  width = 2,
  height = 80,
  fontSize = 14,
  showValue = true,
  className = '',
}) => {
  if (!value) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-400">
        لا توجد قيمة للباركود
      </div>
    );
  }

  if (type === 'qrcode') {
    return (
      <div className={`inline-flex p-2 bg-white rounded-lg ${className}`}>
        <QRCodeCanvas
          value={value}
          size={height}
          level="M"
          includeMargin={true}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex bg-white rounded-lg overflow-hidden p-2 ${className}`}>
      <Barcode
        value={value}
        format={format}
        width={width}
        height={height}
        fontSize={fontSize}
        displayValue={showValue}
        background="transparent"
        lineColor="#000"
      />
    </div>
  );
};

export default BarcodeDisplay;
