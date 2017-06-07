// date time

$(document).on("createFilter", function (event, filters) {
    $.each(filters, function (x, filter) {
        $.each(filter, function (y, value) {
    var datePickerTemplate = '<ul class="list-unstyled" role="presentation"> \
                                    <li class="entitylist-filter-option-group"> \
                                        <label class="entitylist-filter-option-group-label h4" for="dropdownfilter_0"> \
                                            <span class="sr-only">Filter: </span> \
                                            ' + filter[1] + ' From \
                                        </label> \
                                            <ul class="list-unstyled" role="presentation"> \
                                                <li class="entitylist-filter-option"> \
                                                    <div class="input-group entitylist-filter-option-text"> \
                                                        <div class="input-group date" id="dateFrom' + x + '"> \
                                                            <input type="text" id="dateFromValue' + x + '" class="form-control" placeholder="From"/> \
                                                            <span class="input-group-addon"> \
                                                                <span class="glyphicon glyphicon-calendar"></span> \
                                                            </span> \
                                                        </div> \
                                                     </div>\
                                                </li>\
                                            </ul>\
                                     </li>\
                                     <li class="entitylist-filter-option-group"> \
                                        <label class="entitylist-filter-option-group-label h4" for="dropdownfilter_0"> \
                                            <span class="sr-only">Filter: </span> \
                                            ' + filter[1] + ' To \
                                        </label> \
                                            <ul class="list-unstyled" role="presentation"> \
                                                <li class="entitylist-filter-option"> \
                                                    <div class="input-group entitylist-filter-option-text"> \
                                                        <div class="input-group date" id="dateTo' + x + '"> \
                                                                 <input type="text" id="dateToValue' + x + '" class="form-control" placeholder="To"/> \
                                                                <span class="input-group-addon"> \
                                                                    <span class="glyphicon glyphicon-calendar"></span> \
                                                                </span> \
                                                        </div> \
                                                     </div>\
                                                </li>\
                                            </ul>\
                                     </li>\
                                </ul>';

    $(datePickerTemplate).insertBefore($('#EntityListFilterControl .panel-body .pull-right'));
    
            return false;
        });
    });

    $(function () {
        $.each(filters, function (x, filter) {
            $.each(filter, function (y, value) {
                $('#dateFrom' + x).datetimepicker({
                    pickTime: false,
                    autoclose: true
                });

                $('#dateTo' + x).datetimepicker({
                    autoclose: true,
                    pickTime: false,
                    useCurrent: false //Important! See issue #1075
                });

                $("#dateFrom" + x).on("dp.change", function (e) {
                    $('#dateTo' + x).data("DateTimePicker").setMinDate(e.date);
                });
                $("#dateTo" + x).on("dp.change", function (e) {
                    $('#dateFrom' + x).data("DateTimePicker").setMaxDate(e.date);
                });

                $("#dateToValue" + x).on("change", function (e) {
                    $('#dateFrom' + x).data("DateTimePicker").setMaxDate(new Date(9999,12,31));
                });

                $("#dateFromValue" + x).on("change", function (e) {
                    $('#dateTo' + x).data("DateTimePicker").setMinDate(new Date(1753,01,01));
                });

                $('#dateFromValue' + x).mask('00/00/0000');
                $('#dateToValue' + x).mask('00/00/0000');

                if (value !== 'undefined') {
                    $('#dateFromValue'+ x).attr('data-entityfield', value);
                 }
                return false;
            });
        });
    });
});
