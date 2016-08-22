/**################################################################################
#(C) Copyright Pumpkin, Inc. All Rights Reserved.
#
#This file may be distributed under the terms of the License
#Agreement provided with this software.
#
#THIS FILE IS PROVIDED AS IS WITH NO WARRANTY OF ANY KIND,
#INCLUDING THE WARRANTY OF DESIGN, MERCHANTABILITY AND
#FITNESS FOR A PARTICULAR PURPOSE.
################################################################################**/

/**
 *
 * This is a nodeJS module that provides an easy to use interface to command line args
 *
 */

var _args = {};
var _last = null;
var _lastValue = null;

process.argv.slice(2).forEach(function (val){
    // See if it starts with a - or --
    var is_arg = val.match(/^-+([^-"'].*)/);
    if (is_arg){
        _args[is_arg[1]] = true;
        _last = is_arg[1];
        _lastValue = null;
        return;
    }

    if (_last == null){
        throw "Invalid set of arguments passed";
    }

    // See if it's a quoted argument
    var is_beginning_quote = val.match(/^["']([^"']*)["']?$/)
    if (is_beginning_quote && _lastValue === null){
        // See if it has an ending quote
        if (val.match(/["']$/)){
            _args[_last] = is_beginning_quote[1].trim()
        } else {
            _lastValue = is_beginning_quote[1].trim()
        }

        return;
    } else if (is_beginning_quote){
        throw "Quote in middle of arguments";
    }

    // See if its an ending quote
    var is_ending_quote = val.match(/^([^"']*)["']$/)
    if (is_ending_quote && _lastValue != null){
        _args[_last] = (_lastValue + " " + is_ending_quote[1]).trim();
        _last = null;
        return;
    }

    // Add the current and last value together and the args
    _lastValue = _lastValue === null ? "" : _lastValue;
    _args[_last] = (_lastValue + " " + val).trim();
});

/**
 * Gets a value from the arguments passed
 * @param name The parameter in the command line arguments
 * @param val The value of the parameter, if it doesnt exist
 */
function getArgument(name, val){
    val = val || undefined;

    if (name in _args){
        return _args[name];
    } else {
        return val;
    }
}

mod = {
    get : getArgument
};

module.exports = mod;