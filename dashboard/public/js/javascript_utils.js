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

JSU = {
    padZeros : function (num, size) {
        /**
         * Pads leading zeros on a number
         */

        var s = num+"";
        if (num < 0){
            s = s.slice(1);
        }

        while (s.length < size) s = "0" + s;
        if (num < 0){
            s = "-" + s;
        }

        return s;
    }
};
