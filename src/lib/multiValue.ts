/** 把單值/多值欄位正規化為陣列。 */
export const toValues = (field: string | string[]): string[] =>
  Array.isArray(field) ? field : [field]

/** 商品欄位（可能缺、單值或多值）是否符合篩選值。 */
export const matchesField = (
  field: string | string[] | undefined,
  value: string
): boolean => field != null && toValues(field).includes(value)
