/*! ADX custom dms-jshelpers.js
 * @Author  Romy
 * @Email   <jcadiao@gurango.net>
 * @version 1.0.0 
*/

// Make sure jQuery has been loaded before dms-jshelpers.js

if (typeof jQuery === "undefined") {
    throw new Error("DMS Javascript Helpers requires jQuery");
}



var Helpers = {
    AppendButtonToToolbar: function (button) {
        var $li = $('<li></li>');

        $li.append(button);

        var totalButton = $('.toolbar-right li:not(.dropdown)').length;
        var dropdown = $('.toolbar-right li.dropdown').html();

        if (totalButton >= 5) {
            if (typeof dropdown === 'undefined') {
                var $dropdown = $('<li class="dropdown"></li>');
                var $toggle = $('<a href="#" class="dropdown-toggle btn-sm" data-toggle="dropdown" aria-expanded="false"><span class="fa fa-ellipsis-v"></span></a>');
                var $dropdownMenu = $('<ul class="dropdown-menu"></ul>')
                $dropdownMenu.append($li);

                $dropdown.append($toggle);
                $dropdown.append($dropdownMenu);

                $('.toolbar-right').append($dropdown);
            }
            else {
                $('.toolbar-right li.dropdown ul.dropdown-menu').append($li);
            }
            return;
        }
        $('.toolbar-right').append($li);
    },
    // create a model when using xrm create/update/delete services
    CreateModel: function (records, entityLogicalName, attributes) {

        data = [];

        records.forEach(function (item, index) {

            var record = {
                Id: item,
                Entity: entityLogicalName,
                Records: []
            }

            if (item) {
                // add fields to be updated
                record.Records.push(attributes);
                data.push(record);
            }

        });
        return JSON.stringify(data);
    },
    CreateModelWithoutFieldUpdate: function (records, entityLogicalName) {

        data = [];

        records.forEach(function (item, index) {

            var record = {
                Id: item,
                Entity: entityLogicalName,
                Records: []
            }

            if (item) data.push(record);

        });

        return JSON.stringify(data);
    },
    CreateAnchorButton: function (classes, styles, html, icon) {

        var button = $('<a href="#"></a>');

        if (classes == true) button.addClass('btn btn-sm');
        else button.addClass(classes);

        button.attr('style', styles);
        button.html(html);

        if (icon) button.prepend(icon);

        return button;
    },
  
    CreateButton: function (buttonType, classes, styles, html, icon) {

        var button = $('<button></button>');

        button.attr('type', buttonType);

        if (classes == true) {
            button.addClass('btn btn-sm btn-primary');
        }
        else {
            button.addClass(classes);
        }

        button.attr('style', styles);
        button.html(html);

        if (icon) button.prepend(icon);

        return button;
    },
    // icons will only work if font awesome and glypicon are loaded in the project.
    CreateFontAwesomeIcon: function (iconCode) {

        var icon = $('<i class="fa"></i>');

        icon.addClass(iconCode);

        return icon;
    },
    ContainsInKey: function (arr, val) {
        for (i in arr) {
            if (arr[i].key == val) return i;
        }
        return -1;
    },
    CreateGlyphIcon: function (iconCode) {

        var icon = $('<i class="glyphicon"></i>');

        icon.addClass(iconCode);

        return icon;
    },
    CreateDeleteConfirmation: function () {
        var deleteModalTemplate =
            '<section aria-hidden="true" class="modal fade modal-delete" data-backdrop="static" role="dialog" tabindex="-1"> \
                  <div class="modal-dialog"> \
                      <div class="modal-content"> \
                            <div class="modal-header"> \
                                <button class="close" data-dismiss="modal" type="button"> \
                                    <span aria-hidden="true">×</span><span class="sr-only">Close</span> \
                                </button> \
                                <h1 class="modal-title h4"><span class="fa fa-trash-o" aria-hidden="true"></span> Delete</h1> \
                            </div> \
                            <div class="modal-body"> \
                                Are you sure you want to delete this record? \
                            </div> \
                            <div class="modal-footer">\
                                <button class="deleteModal btn btn-default btn-dialog" type="button"> DELETE</button> \
                                <button class="cancelModal btn btn-default btn-dialog" data-dismiss="modal" type="button"> CANCEL</button> \
                            </div> \
                       </div> \
                   </div> \
            </section>';
        // create instance
        var $modal = $(deleteModalTemplate);
        return $modal;
    }, 
    CreateModalConfirmation: function (options) {
        var ModalTemplate =
            '<section id="'+ options.id +'" aria-hidden="true" class="modal fade" data-backdrop="static" role="dialog" tabindex="-1"> \
                  <div class="modal-dialog"> \
                      <div class="modal-content"> \
                            <div class="modal-header"> \
                                <button class="close" data-dismiss="modal" type="button"> \
                                    <span aria-hidden="true">×</span><span class="sr-only">Close</span> \
                                </button> \
                                <h1 class="modal-title h4"><span class="' + options.headerIcon +'" aria-hidden="true"></span>' + options.headerTitle + '</h1> \
                            </div> \
                            <div class="modal-body"> \
                                ' + options.Body + ' \
                            </div> \
                            <div class="modal-footer">\
                                <button class="confirmModal btn btn-default btn-dialog" type="button"> CONFIRM</button> \
                                <button class="cancelModal btn btn-default btn-dialog" data-dismiss="modal" type="button"> CANCEL</button> \
                            </div> \
                       </div> \
                   </div> \
            </section>';
        // create instance
        var $modal = $(ModalTemplate);
        return $modal;
    },
    Debounce : function (func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },
    DefaultErrorHandler: function (jqXhr) {      
        var contentType = jqXhr.getResponseHeader("content-type");
        var error = contentType.indexOf("json") > -1 ? $.parseJSON(jqXhr.responseText) : { Message: jqXhr.ExceptionMesage, InnerError: { Message: jqXhr.ExceptionMesage } };
        DMS.Notification.Error(error, true, 5000);
    },
    DisableEntityForm: function () {
        // disable forms and fields
        $('form fieldset').attr('disabled', true);
        // clear disabled class
        $('.toolbar-right > li >.btn').removeClass('disabled');
        // disable buttons
        $('.toolbar-right > li >.btn').addClass('disabled');
    },
    EnableEntityForm: function () {
        $('form fieldset:not(.permanent-disabled)').attr('disabled', false);
        $('.toolbar-right > li >.btn:not(.permanent-disabled)').removeClass('disabled');
    },
    GenerateFromPreDefinedColors: function (arr) {
        var preDefinedColors = ['#fd3a41', '#00bff3', '#7cc576', '#f26522', '#7accc8', '#f5989d',
                              '#5674b9', '#fbaf5d', '#9e005d', '#aba000', '#ec008c', '#0c8b81', '#bd8cbf',
                              '#6ba6eb', '#f9ad81', '#c4df9b', '#7da7d9', '#004a80', '#d10014', '#664a4d'];

        var randomIndex = Math.floor(Math.random() * 19);
        var color = preDefinedColors[randomIndex];

        while (arr.indexOf(color) > -1) {
            color = preDefinedColors[Math.floor(Math.random() * 19)];
        }

        return color;
    },
    GenerateRandomHexColor: function () {    
        return '#' + Math.floor(Math.random() * 16777215).toString(16);        
    },
    GetMonthWeek: function(date){
        prefixes = [1, 2, 3, 4, 5];
        return prefixes[0 | moment(date).date() / 7];
    },
    GetNumberOfWeeksInCurrentMonth: function () {
        var start = moment().startOf('month').format('DD');
        var end = moment().endOf('month').format('DD');
        var weeks = (end-start+1)/7;
        return Math.ceil(weeks);
    },
    GetCurrentWeekNumber: function (calendarDate) {
        var whichNext = 6;//0=Sunday, 1=Monday ...
        var D = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var date = new Date(calendarDate);
        var dif = date.getDay() - whichNext;
        dif = dif > 0 ? dif = 7 - dif : -dif;
        date.setDate(date.getDate() + dif);
        date.setHours(1);//DST pseudobug correction           
        return moment(date).week();
    },
    GetUrlQueryString: function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    GetModelForSelectedRecords: function (fields, selector) {
        var result = [];

        var arr = { Id: null, Entity: null, Records: [] };
        // get configuration from adx layout config.
        var _layouts = $('.entitylist[data-view-layouts]').data("view-layouts");
        arr.Entity = _layouts[0].Configuration.EntityName;

        $(selector).each(function () {

            var that = $(this).parent('tr');
            var isRowSelected = that.find('td:first').data('checked');
            // row is checked?
            if (isRowSelected == "true") {
                arr.Id = that.data('id');

                that.find('td:not(:first)').each(function () {
                    var _this = $(this);
                    var row = {
                        Attr: _this.data('attribute'),
                        Value: null,
                        Type: _this.data('type')
                    }
                    //return -1 if attribute is not found. if found, returns the index of the attribute
                    var index = DMS.Helpers.ContainsInKey(fields, row.Attr);

                    // checks if the field is in included in the parameter
                    if (index != -1) {
                        row.Value = fields[index].value;
                        arr.Records.push(row);
                    }
                });

                result.push(arr);
            }
        });

        return result;
    },
    GetOptionListSet: function (url, id, text) {
        var list = []
        var text1 = "";

        $.getJSON(url)
         .done(function (response) {
           
             if (response.length <= 0) {
                 return list;
             }

             jQuery.each(response.value, function (i, val) {

                 var record = {
                     id: id.indexOf('.') >= 0 ? val[id.split('.')[0]][id.split('.')[1]] : val[id],
                     text: text.indexOf('.') >= 0 ? val[text.split('.')[0]][text.split('.')[1]] : val[text]
                 }

                 list.push(record);
             });
         });

        return list;
    },
    RefreshEntityList: function (query) {

        var $this = $(this),
          key = "mf",
          target = "#EntityListFilterControl",
          $entitylist = $(".entitylist"),
          $entitygrid = $entitylist.find(".entity-grid").filter(":first"),
          value,
          uri;
        if ($entitygrid.length == 1 && target) {

            var metaFilter = $(target).find('input,select').serialize();

            if (query) {
                metaFilter += query;
            }

            $entitygrid.trigger("metafilter", metaFilter);
        } else if (target && key) {
            value = $(target).find('input,select').serialize();

            uri = new URI();
            uri.setSearch(key, value);

            window.location.href = uri.toString();
        }

    },
    ReadCookie: function (name) {
        var nameEQ = name + "=";
        var ca = $.cookie("Branch").split('&');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.split("=").pop();
        }
        return null;
    }
}
