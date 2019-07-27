/**
 * Verify if an item is valid
 * 
 * @param { Array } item Array with item values
 * @returns { Object } Object result
 */
module.exports.isValidItem = item => {
  const rows = [];
  let success = true;

  for(const [key, value] of Object.entries(item)) {
    const row = [];
    
    if(!value || value.toString() === '') {
      row.push(item.CUSTOMER, key, value === '' ? 'String vazia' : value, 'Valor inválido');
      success = false;
    }

    if (row.length > 0) rows.push(row);
  }

  return {
    success: success,
    errors: !success ? rows : null,
  };
}