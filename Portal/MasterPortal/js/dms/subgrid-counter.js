(function ($) {

    $(document).ready(function () {      

        $('.subgrid .entity-grid').each(function (i, value) {

            var $actionButtons = $(this).find("a.action");
            $.each($actionButtons, function (index, value) {

                $(value).addClass('add-margin-right');
                $(value).removeClass('pull-right');

            });

        });

    });
})(jQuery);