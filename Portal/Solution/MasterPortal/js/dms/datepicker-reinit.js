/*! bug fix for date pickers being detached to the DOM 
 * @Author  Leslie Baliguat
 * @Email   <lbaliguat@gurango.net>
 * @version 1.0.0 
 * @integration with adx portal
*/

(function ($) {

    $(document).ready(function () {
        var datetime = $("form").find('input.datetime').next('.datetimepicker');

        $.each(datetime, function () {
            var defaultDate = $(this).parent().children('.datetime').val();
            var dataType = $(this).parent().children('.datetime').data("type");
            var dateFormat = dataType == "date" ? "M/D/YYYY" : "M/D/YYYY h:mm A"
            var formattedDate = defaultDate == "" ? "" : moment(defaultDate).format(dateFormat);
            $(this).children('input').val(formattedDate);
            $(this).children('input').removeAttr('placeholder');

            var isReadOnly = $(this).siblings('input').hasClass('readonly');

            if (isReadOnly) {
                $(this).children('input').attr('disabled', 'disabled');
               return;
            }

            datetime.datetimepicker({
                pickTime: $(this).parent().children('.datetime').data("type") == "date" ? false : true,
                useCurrent: true
            });

            datetime.on('dp.change', function (e) {
                $(this).parent().children('.datetime').val(e.date.format('YYYY-MM-DDTHH:mm:ss.0000000Z'));
            });

            $(".datetimepicker input").on("change", function (e) {
                var currentVal = $(this).val();
                if (currentVal != "") {
                    var newFromattedVal = currentVal.split("/");
                    currentVal = moment(newFromattedVal[2] + "-" + newFromattedVal[0] + "-" + newFromattedVal[1]).format("YYYY-MM-DDTHH:mm:ss.0000000Z");
                }
                $(this).parent().parent().children('.datetime').val(currentVal);
            });

        });     
    });

}(jQuery));