/*! extension for currency fields 
 * @Author  Romy
 * @Email   <jcadiao@gurango.net>
 * @version 1.0.0 
 * @integration with adx portal
*/

(function ($) {

    $(document).ready(function () {

        var $addOn = $('<span class="input-group-addon" id="basic-addon1">&#8369;</span>');
        var $groupWrapper = $('<div class="input-group"></div>');

        $('input.money').wrap($groupWrapper);
        $('input.money').parent().prepend($addOn);
        $('input.money').attr('style', 'padding-left:5px !important;');
        $("input.money").keypress(function (e) {
            //if the letter is not digit then display error and don't type anything
            if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                return false;
            }
        });
    });

}(jQuery));