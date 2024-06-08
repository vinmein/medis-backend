export class FilterKeysHelper {
    static filterKeys<T>(obj: T, keys: string[]): Partial<T> {
      return keys.reduce((filteredObj, key) => {
        if (obj.hasOwnProperty(key)) {
          filteredObj[key] = obj[key];
        }
        return filteredObj;
      }, {});
    }
  }