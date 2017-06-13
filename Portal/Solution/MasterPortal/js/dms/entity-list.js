(function ($) {
    $(document).ready(function () {
        var toolbar = $('<div class="view-toolbar toolbar clearfix"></div>');
        var search = $('.entitylist-search').detach();
        var title = $('<div class="list-title"></div>')
        var titleValue = $('#EntityListTitle .xrm-attribute-value').html();

        title.html(titleValue);
        toolbar.append(search);
        toolbar.append(title);


        var breadcrumb = "<a href='#' style='cursor:default;pointer-events:none;'>" + titleValue + "</a>";
        $('ul.breadcrumb li:nth-child(3)').html(breadcrumb);
     
        $(toolbar).insertAfter('.view-toolbar.grid-actions');        

        var $actionButtons = $("a.action");

        $.each($actionButtons, function (index, value) {

            var button = $(value).detach();

            button.removeClass('pull-right');

            $('.view-toolbar.grid-actions').prepend(button);

        });

        $('.entitylist-download').removeClass('btn-info');
        $('.entitylist-download').addClass('btn-primary');

        $('.modal-footer .primary.btn').removeClass('btn-primary');
        $('.modal-footer .primary.btn').addClass('btn-default');


        var $options = $('option[label]');

        $.each($options, function (index, value) {

            var text = $(value).attr('label');
            $(value).text(text);
        });
     

       

        $('.grid-actions').children().each(function () {
            var $li = $('<li></li>');
            $li.append($(this));
            $('.toolbar-right').append($li);
        });
        $('.grid-actions').remove();
        $('.view-toolbar.toolbar').removeClass('toolbar');
        
        $("#EntityListFilterControl select").each(function () {
            $(this).find('option:first').attr('label', 'All');
        });
       
    });
}(jQuery));


$(document).on('loaded', function () {
    $('.footer .pull-left').append($('.row-count-container').detach());
    $('.footer .pull-right').append($('.view-pagination').detach());
});
