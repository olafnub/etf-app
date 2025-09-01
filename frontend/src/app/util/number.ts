export const money = (x: number) => {
    if (x < 0) {
      return Math.round(x / 6) * 6; // nearest multiple of 6
    }
  
    return x.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };