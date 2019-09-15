// Based on Mark Rhodes's JQuery rankingTableUpdate plugin.

(function ($) {
"use strict";
    $.fn.rankingTableUpdate = function (newTable, options) {
        var jOrigTable = this,
            jNewTable = $(newTable),
            origTable = this[0];
        newTable = jNewTable[0];


        var origTBody = jOrigTable.find(".body");
        var newTBody = jNewTable.find(".body");
        var rowsInNewTable = newTBody.find("row").length;

        jNewTable.hide();
        var jOrigTableParent;
        jOrigTableParent = jOrigTable.parent();
        if (jNewTable.parent()[0] !== jOrigTableParent[0]) {
            jOrigTableParent.append(newTable);
        }

        var origTableIdsToRows = {}, newTableIdsToRows = {};
        $(origTBody.find(".row")).each(function (index, row) {
            origTableIdsToRows[$(row).find("div").eq(0).html()] = index;
        });
        $(newTBody.find(".row")).each(function (index, row) {
            newTableIdsToRows[$(row).find("div").eq(0).html()] = index;
        });

        var up = {}, down = {}, fresh = {}, drop = {}, stayPut = {};
        var maxRowsUp = 0, maxRowsDown = 0, numRowsStaying = 0;
        $.each(origTableIdsToRows, function (id, oldRow) {
            //case that a the row needs to be moved..
            if (id in newTableIdsToRows) {
                var newRow = newTableIdsToRows[id];
                var diff = oldRow - newRow;
                if (diff > 0) {
                    up[oldRow] = newRow;
                    maxRowsUp = Math.max(diff, maxRowsUp);
                } else if (diff < 0) {
                    down[oldRow] = newRow;
                    maxRowsDown = Math.max(0 - maxRowsDown, maxRowsDown);
                } else {
                    stayPut[oldRow] = true;
                    numRowsStaying++;
                }
                delete newTableIdsToRows[id];
            } else {
                drop[oldRow] = true;
            }
        });
        $.each(newTableIdsToRows, function (id, newRow) {
            fresh['x' + newRow] = true;
        });

        var origHeight = jOrigTable.height();
        var newHeight = jNewTable.height();

        jOrigTable.css({
            "overflow": "hidden",
            "height": jOrigTable.height()
        });

        jOrigTable.find(".row").each(function (index, row) {
            $(row).data("row", index);
            $(row).addClass("moveable");
        });

        var rowDiff = rowsInNewTable - jOrigTable.find(".row").length;
        if (rowDiff > 0) {
            var emptyRow = $('<div class="row"></div>');
            //put something in first cell to ensure height is ok.
            for (var i = 1; i < 5; i++) {
                emptyRow.append($('<div/>').html('a'));
            }
            jOrigTable.append(emptyRow);

            while (rowDiff > 0) {
                //append a clone so that there is an extra empty row in the table..
                var emptyClone = emptyRow.clone();
                jOrigTable.append(emptyClone);
                rowDiff--;
            }
        }
        $.each(fresh, function (row) {
            //the row which the fresh row will move to..
            row = row.substring(1) * 1;
            var clone = $(newTBody).find(".row").eq(row).clone();
            jOrigTable.find(".body").append(clone);
            $(clone).addClass('moveable').data("row", 'x' + row);
        });

        if (origHeight < newHeight) {
            jOrigTable.animate({
                "height": newHeight
            }, 1000);

        } else if (origHeight > newHeight) {
            jOrigTable.animate({
                "height": newHeight
            }, 1000);
        }
        if ($.isEmptyObject(up) && $.isEmptyObject(down) && $.isEmptyObject(fresh) && $.isEmptyObject(drop)) {
            setTimeout(function () {
                $(origTable).replaceWith(jNewTable);
                 jNewTable.show();
                options.onComplete();
            }, 1000);

        }
       
        var color = function (c, wrapper) {
            $(wrapper).animate({ backgroundColor: c}, 300);
        };
		var left = function (l, wrapper) {
			$(wrapper).animate({left: l}, 200);
		};
        var getrow = function (index) {
            return $(origTable).find(".row").eq(index);
        };
		var moving = function (diff, wrapper) {
            $(wrapper).animate({"top": diff}, 1000, function () {
                $(wrapper).animate({ backgroundColor: "#a3a3a3" }, 300, function() {
                    $(origTable).replaceWith(jNewTable);
                    jNewTable.show();
                    options.onComplete();
                });
            });
        };
        jOrigTable.find('.moveable').each(function (i, wrapper) {
            var row = $(wrapper).data("row");
            var topDiff;
            if (row in up) {
                topDiff = getrow(up[row]).position().top - getrow(row).position().top;
				moving(topDiff, wrapper);

            } else if (row in down) {
                topDiff = getrow(down[row]).position().top - getrow(row).position().top;
                moving(topDiff, wrapper);

            } else if (row in drop) {
                topDiff = newHeight - getrow(row).height() * row;
                moving(topDiff, wrapper);

            } else if (row in fresh) {
                row = row.substring(1) * 1;
                topDiff = getrow(row).position().top - $(this).position().top;
                moving(topDiff, wrapper);

            }
        });
        /* return this; */
    };
})(jQuery);

