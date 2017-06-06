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
    });

}(jQuery));