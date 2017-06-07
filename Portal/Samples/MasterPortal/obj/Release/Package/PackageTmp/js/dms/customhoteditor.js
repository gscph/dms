
var optionsList = [{ id: 1, text: 'first' }, { id: 2, text: 'second' }];
$(document).ready(function () {


    var columnsList = [{
        editor: 'select2',
        renderer: customDropdownRenderer,
        width: '200px',
        select2Options: {
            data: optionsList,
            dropdownAutoWidth: true,
            width: 'resolve'
        }
    }
    ],

    $container = $('#example_handsontable');

    $container.handsontable({
        minSpareRows: 0,
        colHeaders: true,
        contextMenu: true,
        columns: columnsList
    });
});



