/*! ADX custom multi-select.js
 * @Author  Romy
 * @Email   <jcadiao@gurango.net>
 * @version 1.0.0 
*/

// Make sure jQuery has been loaded before multi-select.js

if (typeof jQuery === "undefined") {
    throw new Error("Multi-Select requires jQuery");
}

(function ($) {

    $(document).bind('DOMNodeInserted', function (evt) {
        var isSubGridFrm = $(evt.target).parent().parent('.subgrid').html();
        var isEntityListFrm = $(evt.target).parent().parent('.entitylist').html();

        if (evt.target.nodeName == 'TABLE' && ((typeof isSubGridFrm !== 'undefined') || (typeof isEntityListFrm !== 'undefined'))) {

            $(evt.target).removeClass('table-striped');
            $(evt.target).addClass('table-hover');
            $(evt.target).addClass('table-condensed');

            var $anchor = $('<a href="#"></a>');
            var $th = $('<th class="sort-disabled" title="select all"></th>');

            $anchor.data('checked', 'false');
            $anchor.append('<span class="fa fa-check"></span>');

            $anchor.on('click', selectAllClick);

            $th.append($anchor);

            $(evt.target).find('thead tr').prepend($th);

        }

        var isSubGrid = $(evt.target).parent().parent().parent('.subgrid').html();
        var isEntityList = $(evt.target).parent().parent().parent('.entitylist').html();
        var isEntityGrid = $(evt.target).parent().parent().parent('.entity-grid').html();

        if (evt.target.nodeName == 'TBODY' &&
            evt.relatedNode.nodeName == 'TABLE' &&
            ((typeof isSubGrid !== 'undefined') ||
            (typeof isEntityList !== 'undefined'))) {

            $(evt.target).find('tr').each(function () {

                var $checkbox = $('<td><span class="fa fa-square-o"></span></td>');

                $checkbox.data('checked', 'false');
                $checkbox.addClass('multi-select-cbx');
                $checkbox.on("click", checkboxClick);

                $(this).prepend($checkbox);
            });

            $(document).on("click", ".entity-grid.entitylist .view-grid table tbody tr td:not(:first)", rowClick);

            $(document).on("click", ".entity-grid.subgrid .view-grid table  tbody  tr td:not(:first)", rowClick);      

        }
     
        if (typeof isEntityGrid !== 'undefined') {
            $(document).on("click", ".modal-body .entity-grid .view-grid table tbody tr td:not(:first)", function () {               
                $(this).closest('table').parent().parent().find('.rowSelectedCount').html('(1 selected)');
            });

        }      

    });

    function selectAllClick() {

        var isChecked = $(this).data('checked');
        var rows = $(this).closest('table').find('tbody tr');

        if (isChecked == 'false') {
            rows.each(function () {
                var $td = $(this).find('td:first');

                $td.data('checked', 'true');              

                $td.html('<span class="fa fa-check-square-o"></span>');
                $(this).addClass('selected');
            });

            $(this).data('checked', 'true');
        }
        else {

            rows.each(function () {
                var $td = $(this).find('td:first');

                $td.data('checked', 'false');
                $(this).removeClass('selected');
                // $td.html('');
                $td.html('<span class="fa fa-square-o"></span>');
            });

            $(this).data('checked', 'false');
        }

        countRowSelected($(this));

        return false;
    }

    function checkboxClick(evt) {

        var isChecked = $(this).data('checked');

        if (isChecked == 'true') {
            $(this).data('checked', 'false');          
            $(this).html('<span class="fa fa-square-o"></span>');
            $(this).parent('tr').removeClass('selected');
        }
        else {
            $(this).data('checked', 'true');
            //     $(this).html('<span class="fa fa-check"></span>');
            $(this).html('<span class="fa fa-check-square-o"></span>');
            $(this).parent('tr').addClass('selected');
        }

        countRowSelected($(this));

        evt.stopPropagation();
    }

    function rowClick() {

        var $currentCell = $(this).siblings('td:first');

        $currentCell.data('checked', 'true');
        // $currentCell.html('<span class="fa fa-check"></span>');
        $currentCell.html('<span class="fa fa-check-square-o"></span>');
        $currentCell.parent().addClass('selected');

        $(this).parent().siblings('tr').each(function () {
            var $td = $(this).find('td:first');

            $td.data('checked', 'false');
            //  $td.html('');
            $td.html('<span class="fa fa-square-o"></span>');
            $(this).removeClass('selected');
        });

        countRowSelected($(this));
    }

    function countRowSelected(obj) {
        var counter = 0;
        var $tbody = obj.closest('tbody');

        if (typeof $tbody.html() === 'undefined') {
            $tbody = obj.closest('table').find('tbody');
        }

        $($tbody).find('tr td.multi-select-cbx').each(function () {

            var checked = $(this).data('checked');

            if (checked == "true") {
                counter++;
            }
        });

        $('.rowSelectedCount').html('');
        $('.rowSelectedCount').html('(' + counter + ' selected)');

        if (counter == 0) {
            $('.btn.activate').addClass('disabled');
            $('.btn.deactivate').addClass('disabled');
            return;
        }
        $('.btn.activate').removeClass('disabled');
        $('.btn.deactivate').removeClass('disabled');
    }

}(jQuery));

function getSelectedRecordsId(subgridId) {
    var arr = []

    $(subgridId + ' .entity-grid.subgrid .view-grid table tbody tr').each(function () {
        var isRowSelected = $(this).find('td:first').data('checked');
        if (isRowSelected == "true") {
            arr.push($(this).data('id'));
        }
    });
    return arr;
}

function getSelectedRecords() {
    var arr = []

    $('.entity-grid .view-grid table tbody tr').each(function () {
        var isRowSelected = $(this).find('td:first').data('checked');
        if (isRowSelected == "true") {
            arr.push($(this).data('id'));
        }
    });
    return arr;
}
