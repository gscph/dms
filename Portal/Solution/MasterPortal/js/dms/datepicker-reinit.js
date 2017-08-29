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
            var inputValue = $(this).parent().children('.datetime');
            var defaultDate = inputValue.val();
            var dataType = inputValue.data("type");
            var dateFormat = dataType == "date" ? "M/D/YYYY" : "M/D/YYYY h:mm A";
            var formattedDate = defaultDate == "" ? "" : moment(defaultDate).format(dateFormat);
            var input = $(this).children('input');

            input.val(formattedDate);
            input.removeAttr('placeholder');
           
            input.blur(function (e) {
                var enteredDate = input.val();
                var regEx = /^(0?[1-9]|1[0-2])\/(0?[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
                if (!enteredDate.match(regEx)) {
                    DMS.Notification.Error("The date you entered has an invalid format.", true, 1000);
                    inputValue.val('');
                    $(this).val('');                    
                }
            });

            input.mask('00/00/0000');

            var isReadOnly = $(this).siblings('input').hasClass('readonly');

            if (isReadOnly) {
                $(this).children('input').attr('disabled', 'disabled');
               return;
            }

            datetime.datetimepicker({
                pickTime: inputValue.data("type") == "date" ? false : true,
                useCurrent: true
            });

            datetime.on('dp.change', function (e) {
                inputValue.val(e.date.format('YYYY-MM-DDTHH:mm:ss.0000000Z'));
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