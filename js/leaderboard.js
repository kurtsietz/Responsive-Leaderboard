$(function(jQuery){
    "use strict";
    var $ = jQuery;
    var portfolio = [];
    var updatePortfolio = function(callback){
        $.getJSON("http://www.fxdd.com/fileadmin/setup/libraries/proxy/contest_json.php", function(data){
            portfolio = $.extend({}, data);
            callback();
        });
    };

    var updating = false;

    var generateTable = function(){
        var table = $('#stocks').find('.template').clone();
        table.attr('class', 'actualTable');
        var tBody = $(table).find(".body");

        $.each(portfolio, function(i, position){
            //var id = position.splice(0,1);
            var row = $("<div/>");
			var cell = $("<div/>"),
			cellp = $("<p />");
            row.addClass("row");
            $.each(position, function(j, value){
				switch(j) {
				//rank
				case 0:
				row.append($('<div class="rank large-1 medium-1 small-2 columns"><p class="rankText">' + value + '</p></div>') );
				break;
				//nickname
				case 1:
				row.append($('<div class="nickname large-5 medium-5 small-6 columns"><p class="nicknameText">' + value + '</p></div>') );
				break;
				//roi
				case 2:
				row.append($('<div class="ROI large-2 medium-2 small-3 columns"><p class="ROIText">' + value + '</p></div>') );
				break;
				//trades
				case 3:
				row.append($('<div class="trades large-3 medium-3 columns hide-for-small-only"><p class="tradesText">' + value + '</p></div>') );
				break;
				//country
				case 4:
				row.append($('<div class="country large-1 medium-1 small-1 columns"><p><span class="f32 show-for-large-up"><span class="flag jp"></span></span><span class="f16 show-for-medium-only"><span class="flag jp"></span></span><span class="f16 show-for-small-only"><span class="flag jp"></span></span></p></div>') );
				break;
				
				
				}
            });
 //           tBody.append("<div class='ids'>"+id+"</div>");
            tBody.append(row);
        });
        return table;
    };

    var updateStatusTime = function(){
        var date = new Date();
        var dateStr = date.getHours() +
            ":" + date.getMinutes() +
            ":" + date.getSeconds();
        $('#stocks').find('.status').html("Updated at: " + dateStr);
    };

    //set up the table initially..
    var table = generateTable().show();
    //add image showing sort..
    $('#stocks').find('.tableHolder').append(table);
    updateStatusTime();
    //Updates the table..
    var updateTable = function(updateIndexMark, data){
        var newTable = generateTable();
        if (updateIndexMark) updateIndex(data);
        table.rankingTableUpdate(newTable, {

            onComplete: function(){
                updating = false;
                updateStatusTime();
                if (updateIndexMark) updateIndex(data);
                $.each($("#leader_board .body"), function(index, item) {
                  $(".row").removeClass("highlight");
                  $(item).find(".row").eq(updateIndexMark).addClass("highlight");
                });

                $.each($("#leader_board .left"), function(index, item) {
                  $(".ids").removeClass("highlight");
                  $(item).find(".ids").eq(updateIndexMark).addClass("highlight");
                });
            }
        });
        table = newTable;
    };

    //reference to the infinite loop..
    var loop = null;
    var loopFunc = function(){
      if(!updating){
        updating = true;
        $('#stocks .status').html("Updating..");
        updatePortfolio(updateTable);
      }
    };

    var startLoop = function() {
      $('#stocks .triggerUpdates').html('Stop "live" updates..');
      loopFunc();
      loop = setInterval(loopFunc, 3000);
    };
    var endLoop = function() {
      $('#stocks .triggerUpdates').html('Start "live" updates..');
      clearInterval(loop);
      loop = null;
    }

    $('#stocks .triggerUpdates').click(function(event){
        if(!loop){
          startLoop();
        } else {
          endLoop();
        }
        event.preventDefault();
    });


    $("#searchUsername").focus(function(){
      endLoop();
    }).blur(function(){
//      startLoop();
    });

    var updateIndex = function(data) {

      $.each($("#leader_board.actualTable .ids"), function(index, element) {
        var id = data[index];
        $(element).html(id);
      });
    }


    $("#searchSubmit").click(function(event) {
      /* 1. decide if there's movement needed, if no, highlight the row
         2. load list from position - 5 ~ position + 5
         3. scroll list up until position - 5;
         4. highlight position
         5. update index number at the same time
       */
      var nickname = $("#searchUsername").val();
      $(".search_status").hide();

      $.getJSON("http://www.fxdd.com/fileadmin/setup/libraries/proxy/search_name.php?nickname="+nickname, function(data){
        if (parseInt(data[0]) >= 0) {
          portfolio = $.extend({}, data[1]);
          var ids = [];
          $.each(data[1], function(index, item){
            ids[index] = item[0];
          });
          updateTable(data[0], ids);
        } else {
          $(".search_status").show();
        }

      });
      event.preventDefault();

    });

    $("#searchClear").click(function(event) {
      $("#searchUsername").val("");
      startLoop();
      event.preventDefault();
    });

});