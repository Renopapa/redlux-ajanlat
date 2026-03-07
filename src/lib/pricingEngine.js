import { getColorSurcharge } from '../data/productData';

const roundUpToFirstDecimal = (num) => {
  return Math.ceil(num * 10) / 10;
};

/**
 * Tiszta árképzési logika egyetlen tételre.
 * A belső kalkulátor és a publikus widget is ezt használja.
 *
 * @param {Object} params
 * @param {Object} params.product - A termék objektum az adatbázisból
 * @param {string} params.color - Választott szín neve
 * @param {number|string} params.widthCm - Szélesség centiméterben (m2 esetén)
 * @param {number|string} params.heightCm - Magasság centiméterben (m2 esetén)
 * @param {number|string} params.lengthM - Hossz méterben (m esetén)
 * @param {number} params.quantity - Mennyiség
 */
export const calculateQuoteItem = ({
  product,
  color,
  widthCm,
  heightCm,
  lengthM,
  quantity = 1,
}) => {
  if (!product) {
    throw new Error('Product is required for price calculation');
  }

  const unit = product.unit;
  let dimensions = '';
  let area = 0;

  switch (unit) {
    case 'm2': {
      const width = parseFloat(widthCm);
      const height = parseFloat(heightCm);

      if (!width || !height) {
        throw new Error('Width and height are required for m2 products');
      }

      const widthInMeters = roundUpToFirstDecimal(width / 100);
      const heightInMeters = roundUpToFirstDecimal(height / 100);
      area = widthInMeters * heightInMeters;
      area = Math.max(area, 1.3);
      dimensions = `${widthInMeters.toFixed(1)}x${heightInMeters.toFixed(1)} m`;
      break;
    }
    case 'm': {
      const length = parseFloat(lengthM);
      if (!length) {
        throw new Error('Length is required for m products');
      }
      const roundedLength = roundUpToFirstDecimal(length);
      area = roundedLength;
      dimensions = `${roundedLength.toFixed(1)} m`;
      break;
    }
    case 'db': {
      dimensions = `${quantity} db`;
      area = 1;
      break;
    }
    default: {
      dimensions = `${quantity} ${unit}`;
      area = 1;
    }
  }

  const colorSurcharge = getColorSurcharge(product.category, color);
  const basePrice = (product.basePrice || 0) * area;
  const priceWithSurcharge = basePrice * (1 + colorSurcharge / 100);
  const materialPrice = priceWithSurcharge * quantity;
  const laborCost = (product.laborCost || 0) * quantity;
  const totalPriceBeforeDiscount = materialPrice + laborCost;
  const itemDiscount = product.discount || 0;
  const totalPrice = totalPriceBeforeDiscount * (1 - itemDiscount / 100);

  return {
    productName: product.name,
    category: product.category,
    color,
    quantity,
    unit,
    dimensions,
    materialPrice,
    laborCost,
    discount: itemDiscount,
    totalPrice,
    area: area > 0 ? area.toFixed(2) : null,
  };
};

