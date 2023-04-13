function removeDuplicatesFromResults(arr) {
    var obj = {};
    var ret_arr = [];
    for (var i = 0; i < arr.length; i++) {
        obj[arr[i]] = true;
    }
    for (var key in obj) {
        ret_arr.push(key);
    }
    arr = ret_arr;
    return arr;
}

// https://stackoverflow.com/a/14930567/14597561
function compareAndRemove(removeFromThis, compareToThis) {
    removeFromThis = removeFromThis.filter(val => !compareToThis.includes(val));
    return (removeFromThis);
}