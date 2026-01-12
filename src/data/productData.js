// src/data/productData.js

const availableColors = [
  "Fehér", "Barna", "Antracit", "Szürke", "Dió", "Aranytölgy","Világosfa", "Mahagóni", "RAL szín"
];

const colorSurcharges = {
  "REDŐNYÖK": {
    "Fehér": 0, "Barna": 0, "Antracit": 0, "Szürke": 15,
    "Dió": 25, "Aranytölgy": 25, "Világosfa": 25, "Mahagóni": 25, "RAL szín": 30
  },
  "SZÚNYOGHÁLÓK": {
    "Fehér": 0, "Barna": 0, "Antracit": 0, "Szürke": 40,
    "Dió": 60, "Aranytölgy": 60, "Világosfa": 60, "Mahagóni": 60, "RAL szín": 40
  }
};

const getColorSurcharge = (category, colorName) => {
  if (colorSurcharges[category] && colorSurcharges[category][colorName] !== undefined) {
    return colorSurcharges[category][colorName];
  }
  return 0;
};

export { availableColors, getColorSurcharge };