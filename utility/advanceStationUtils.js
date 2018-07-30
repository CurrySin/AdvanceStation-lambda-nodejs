function AdvanStationUtils() {}

AdvanStationUtils.prototype.isBlank = function(input) {
    let result = false;
    if (input === null || input === undefined) {
        result = true;
    } else {
        switch (typeof(input)) {
            case 'string':
                if (input.length === 0) {
                    result = true;
                } else {
                    result = false;
                }
                break;
            case 'null':
                result = true;
                break;
            case 'undefined':
                result = true;
                break;
            case 'object':
                if (Object.keys(input).length === 0) {
                    result = true;
                } else {
                    result = false;
                }
                break;
            case 'number':
                result = false;
                break;
            default:
                result = false;
        }
    }
    return result;
};

AdvanStationUtils.prototype.isNotBlank = function(input) {
    let result = false;
    if (input === null || input === undefined) {
        result = false;
    } else {
        switch (typeof(input)) {
            case 'string':
                if (input.length > 0) {
                    result = true;
                } else {
                    result = false;
                }
                break;
            case 'null':
                result = false;
                break;
            case 'undefined':
                result = false;
                break;
            case 'object':
                if (Object.keys(input).length > 0) {
                    result = true;
                } else {
                    result = false;
                }
                break;
            case 'number':
                result = true;
                break;
            default:
                result = false;;
        }
    }
    return result;
};

AdvanStationUtils.prototype.getItemValueByItem = function(item, key, type) {
    return item[key][type];
};

// export the class
module.exports = AdvanStationUtils;