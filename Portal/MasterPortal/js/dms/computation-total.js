/*! replication of crm quote/order/invoice computation totals 
 * @Author  Romy
 * @Email   <jcadiao@gurango.net>
 * @version 1.0.0 
 * @integration with adx portal
*/

(function ($) {

    $(document).ready(function () {
        $('table.section').each(function () {            

            if (typeof $(this).data('name') === 'undefined') {
                return;
            }

            var isSectionTotal = $(this).data('name').indexOf("total");

            if (isSectionTotal !== -1) {

                $(this).find('tbody tr td.form-control-cell').each(function () {
                    var labelWrapper = $('<th style="width:50%"></th>');
                    var controlWrapper = $('<td></td>');

                    labelWrapper.html($(this).find('div.info label').html());
                   
                    var input = $(this).find('div.control input');

                    if (!input.hasClass('readonly')) {
                        console.error('please make ' + input.attr('id') + ' read-only if you want the section to be summarized. This form will not submit, because it will still validate this field that is supposed to be read only.');
                    }                  

                    if (input.val() !== "") {
                        controlWrapper.html("&#8369;" + input.val());
                    }

                    controlWrapper.attr('id', input.attr('id'));

                    $(this).parent().append(labelWrapper);
                    $(this).parent().append(controlWrapper);
                    $(this).remove();

                });
                $(this).wrap('<div class="table-responsive"></div>');
                $(this).removeClass('section');
                $(this).addClass('table table-striped');
            }
        });

    });

}(jQuery));