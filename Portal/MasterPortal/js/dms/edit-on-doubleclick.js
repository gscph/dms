/*! ADX custom edit-on-doubleclick.js
 * @Author  Romy
 * @Email   <jcadiao@gurango.net>
 * @version 1.0.0 
*/

// Make sure jQuery has been loaded before edit-on-doubleclick.js
if (typeof jQuery === "undefined") {
    throw new Error("edit on double click requires jQuery");
}

(function ($) {

    $(document).bind('DOMNodeInserted', function (evt) {  
       
        var isSubGrid = $(evt.target).parent().parent().parent('.subgrid').html();
        var isEntityList = $(evt.target).parent().parent().parent('.entitylist').html();     

        if (evt.target.nodeName == 'TBODY' &&
            evt.relatedNode.nodeName == 'TABLE' &&
            ((typeof isSubGrid !== 'undefined') ||
            (typeof isEntityList !== 'undefined'))) {        

            attachDoubleTap('.entity-grid.entitylist .view-grid table tbody tr td:not(:first)', {
                onSingleTap: function () {
                  
                },
                onDoubleTap: function (elem) {
                    // get adx config
                    var _layouts = $('.entity-grid.entitylist').data("view-layouts")[0];
                    // get link from conifg
                    var path = _layouts.Configuration.DetailsActionLink.URL.PathWithQueryString;
                    // get selected record id
                    var editUrl = path + "?id=" + elem.parent('tr').data('id');
                    // transfer client.
                    window.location.href = editUrl;
                },
                onMove: function () {
                  
                }
            });

            $(document).on("dblclick", ".entity-grid.entitylist .view-grid table tbody tr td:not(:first)", function () {
                // get adx config
                var _layouts = $(this).closest('div[data-view-layouts]').data("view-layouts")[0];
                // get link from conifg
                var path = _layouts.Configuration.DetailsActionLink.URL.PathWithQueryString;
                // get selected record id
                var editUrl = path + "?id=" + $(this).parent('tr').data('id');
                // transfer client.
                window.location.href = editUrl;
            });          

        }
     
    });

    var tapped = false;
    var isDragging = false;

    function attachDoubleTap(elem, callbacks) {
        callbacks = callbacks || {};
        callbacks.onSingleTap = callbacks.onSingleTap || function () { }
        callbacks.onDoubleTap = callbacks.onDoubleTap || function () { }
        callbacks.onMove = callbacks.onMove || function () { }

        $(document)
          .on('touchstart', elem, function (e) {

              $(window).bind('touchmove', function () {
                  isDragging = true;
                  callbacks.onMove();
                  $(window).unbind('touchmove');
              });
          })
          .on('touchend', elem, function (e) {

              var wasDragging = isDragging;
              isDragging = false;
              $(window).unbind("touchmove");
              if (!wasDragging) { //was clicking

                  //detect single or double tap
                  var _this = $(this);
                  if (!tapped) { //if tap is not set, set up single tap
                      tapped = setTimeout(function () {
                          tapped = null
                          //insert things you want to do when single tapped
                          callbacks.onSingleTap(_this);

                      }, 200); //wait 300ms then run single click code
                  } else { //tapped within 300ms of last tap. double tap
                      clearTimeout(tapped); //stop single tap callback
                      tapped = null

                      //insert things you want to do when double tapped
                      callbacks.onDoubleTap(_this);

                  }
              }
          })
    }

}(jQuery));