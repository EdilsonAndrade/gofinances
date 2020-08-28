const formatValue = (value: number): string =>
  Intl.NumberFormat().format(value); 

export default formatValue;
