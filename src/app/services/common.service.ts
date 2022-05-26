/**
 * Service class for common functions that are used in other services or controllers.
 */
export class CommonService {
    /**
     * Insert a value to the sorted array with O(log(n)) time complexity in the worse case.
     * @param array: A sorted number array.
     * @param value: value to be inserted to 'arr'.
     */
    static insertElementToSortedArray(arr: number[], value: number) {
        var low = 0,
        high = arr.length;

        while (low < high) {
            var mid = (low + high) >>> 1;
            
            if (arr[mid] < value) {
                low = mid + 1;
            } else if (arr[mid] > value) {
                high = mid - 1;
            } else {
                low = mid;
                break;
            }
        }

        arr.splice(low, 0, value);
    }
}