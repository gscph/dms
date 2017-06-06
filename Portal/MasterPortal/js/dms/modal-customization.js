(function ($) {
    $(document).ready(function () {
        $('.lookup-modal .grid-actions').addClass('col-md-6 col-xs-12 pull-right');
        $('.lookup-modal .grid-actions').attr('style', 'padding-right: 0px;');
        $('.lookup-modal .grid-actions').each(function () {
            var filter = $(this).find('.toggle-related-filter').detach();
            $(this).find('.entitylist-search .input-group-btn').append(filter);
        });


    });

    var button = $('.modal-footer .btn-primary');
    button.removeClass('btn-primary');
    button.addClass('btn-default');
})(jQuery);