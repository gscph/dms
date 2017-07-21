(function ($) {
    // get the record's primary field value and append to header section
    var _layout = $('#EntityFormView_EntityLayoutConfig').data('form-layout');
    var logicalName;

    if (typeof _layout === 'undefined') {
        $(document).trigger("hideLoader");
        return;
    }
    logicalName = _layout.EntityName;
    var Id = DMS.Helpers.GetUrlQueryString('id');
    var url = "/api/Service/GetPrimaryFieldValue?Id=" + Id + "&logicalName=" + logicalName;

    $.ajax(url).then(function (data) {
        console.log('b');
        SetPrimaryFieldEnabled(data.PrimaryField);

        var $div = $('<div></div>');
        var $entityTitle = $('<div></div>');

        $entityTitle.addClass('entity-title');
        var titleValue = $('#EntityListTitle .xrm-attribute-value').html();
        $entityTitle.attr('title', titleValue.toUpperCase());
        $entityTitle.html(titleValue.toUpperCase());      
        $div.addClass('form-title');

        if (data.PrimaryFieldVal == 'New ') {
            data.PrimaryFieldVal += titleValue;          
        }

        $div.attr('title', data.PrimaryFieldVal);
        $div.html(data.PrimaryFieldVal);

        if (data == "empty") {
            $('.box.box-dms:first').attr('style', 'margin-top:45px');
            console.warn('primary field not found!');
            return;
        }

        $div.attr('style', 'width:' + ($(window).width() / 2 - 35) + 'px');
        $('table[data-name="HeaderSection"]').prepend($div);
        $('table[data-name="HeaderSection"]').prepend($entityTitle);
        $('.box.box-dms:first').addClass('box-with-header');

        String.prototype.trunc = function (n) {
            return this.substr(0, n - 1) + (this.length > n ? '&hellip;' : '');
        }

        var crumbs = $('.toolbar-left').width() - 45;
        var truncate = 23;
        var a = $('<a href="#" class="btn btn-primary btn-sm"></a>');

        if (crumbs > 768) {
            truncate = 15;
        }

        if (data.PrimaryFieldVal.match("^New")) {
            a.html(data.PrimaryFieldVal);
        } else {
            a.html(data.PrimaryFieldVal.trunc(truncate));
        }

        $('.toolbar-left span li:nth-child(4)').html('');
        $('.toolbar-left span li:nth-child(4)').append(a);
    }).always(function () {
        $(document).trigger("hideLoader");
    });

    function SetPrimaryFieldEnabled(primaryFields)
    {
        $.each(primaryFields, function(index, value){
            if ($("#" + value).val() != "undefined")
            {
                if ($("#" + value).val() != "" && $("#" + value).hasClass("permanent-enabled") == false) {
                    $("#" + value).attr("readonly", true);
                }
                return;
            }
        });
    }


})(jQuery);