/// <reference path="../jquery-1.11.1.min.js" />
/// <reference path="../jQuery-2.1.4.min.js" />

$(document).ready(function () {
    /* - Look for Tab titles - */

    $('#EntityFormView').children('.tab-title').each(function (index) {

        /* -  Section to Tab Converter -*/
        var tabHeaderInner = '';
        var tabContentInner = '';
        var untabbedContent = [];

        /* Check How Many Section Does it Have */
        var sectionCount = $(this).next().find('fieldset').length;
        var $section = $(this).next();

        /* - Look for Sections - */
        $(this).next().find('fieldset').each(function (index2) {

            var isSectionNotIncluded = $(this).find('table').data('name');

            if (typeof isSectionNotIncluded === 'undefined') {
                return;
            }

            if (sectionCount === 1) {
                return;
            }

            if (isSectionNotIncluded.substr(0, 6) == "tabbed") {

                /* - Create Title for Tabs - */
                tabHeaderInner += TabHeaderInner($(this).find('legend').detach().html(), index, index2);
                /* - Insert Section contents to tab contents - */
                tabContentInner += TabContentInner($(this), index, index2);

                $(this).remove();

                return;
            }


        });

        if ($section.html().length > 61) {
            untabbedContent.push('<div class="tab clearfix" style="padding-top:0px">' + $section.html() + '</div>');
        }

        /* Remove the tab from DOM */
        var detachedTab = $(this).next().find('.tab-column').remove();


        /* Tab Wrapper */
        var tabHeader = TabHeader(tabHeaderInner, index);
        var tabContent = TabInner(tabContentInner);

        /* End Section to Tab Converter */

        /*  Accordion Body Wrapper */
        AccordionWrapper(index, $(this), untabbedContent, tabHeader, tabContent);

        ///* initialize all first tab to be active */                 
        $('#tabs-' + index + ' a:first').tab('show');


    });

    $('.box.box-dms').each(function () {
        var tab = $(this).find('ul.nav.nav-tabs li');
        if (tab.length <= 0) {
            $(this).find('ul.nav.nav-tabs').remove();
        }
    });

});


function AccrodionContent(unTabbed, tabHeader, tabContent) {
    var $body = $('<div class="box-body"></div>');


    jQuery.each(unTabbed, function (i, val) {

        $body.append(val);

    });

    $body.append(tabHeader);
    $body.append(tabContent);

    return $body;
}

function AccordionInit(elementID, elementWrapper) {
    $(elementID).wrap(elementWrapper);
}

function AccrodionTitle(titleInnerHtml, index) {
    var icon = "fa-minus";

    //if (index == 0) {
        /* collapse if first 
        icon = "fa-minus";
    }*/

    return '<div class="box-header with-border" data-widget="collapse" style="cursor:pointer">' +
               '<h3 class="box-title"> ' + titleInnerHtml + '</h3>' +
               '<div class="box-tools pull-right">\
                      <button class="btn btn-box-tool" data-widget="collapse" data-toggle="tooltip"><i class="fa ' + icon + '"></i></button>\
               </div>' +
           '</div>';
}

function AccordionWrapper(index, title, unTabbed, tabHeader, tabContent) {

    //var boxCss = "box box-dms collapsed-box";

    var boxCss = "box box-dms";
    //if (index == 0) {
    //    /* collapse if first */
    //    boxCss = "box box-dms";
    //}

    var $div = $('<div class="' + boxCss + '">' + AccrodionTitle(title.html(), index) + '</div>');

    var $boxBody = AccrodionContent(unTabbed, tabHeader, tabContent);

    $div.append($boxBody);

    title.wrap($div);

    title.remove();
}


function TabHeaderInner(innerHtml, firstIndex, secondIndex) {
    /* check if a section has shown its label */
    if (typeof innerHtml === 'undefined') {
        innerHtml = "Section-" + (secondIndex + 1);
    };

    return '<li role="presentation"><a role="button" href="#tab-' + firstIndex + '-' + secondIndex + '"  data-toggle="tab" >' + innerHtml + '</a></li>';
}

function TabContentInner(innerHtml, firstIndex, secondIndex) {

    return '<div role="tabpanel" class="tab-pane" id="tab-' + firstIndex + '-' + secondIndex + '"><br/><fieldset>' + innerHtml.html() + '</fieldset></div>';
}


function TabHeader(tabHeaderInner, firstIndex) {
    var id = 'tabs-' + firstIndex;
    var $ul = $('<ul class="nav nav-tabs" id="' + id + '"></ul>');
    $ul.append(tabHeaderInner);

    return $ul;
}

function TabInner(tabContentInner) {
    var $div = $('<div class="tab-content"></div>');

    $div.append(tabContentInner);

    return $div;
}



// toggle all accordion.

$(document).ready(function () {
    var button = $('<a href="#" class="btn-toggle" type="button" title="open all tabs"><span class="fa fa-minus-square-o"></span></a>');

    button.on('click', function () {

        var boxes = $('.box.box-dms');
        var icon = $(this).find('span');
        var button = $(this);

        $.each(boxes, function (i, val) {
            var box = $(val);
            var boxHeader = box.find('.box-header');
            var box_content = box.find("> .box-body, > .box-footer, > form  >.box-body, > form > .box-footer");

            if (!icon.hasClass("fa-plus-square-o")) {
                //Hide the content
                //Convert minus into plus
                boxHeader.find(".fa.fa-minus")
                        .removeClass("fa-minus")
                        .addClass("fa-plus");
                box_content.slideUp(100, function () {
                    box.addClass("collapsed-box");
                });
            } else {
                boxHeader.find(".fa.fa-plus")
               .removeClass("fa-plus")
               .addClass("fa-minus");
                //Show the content
                box_content.slideDown(100, function () {
                    box.removeClass("collapsed-box");
                });
            }

        });

        if (!icon.hasClass("fa-minus-square-o")) {
            button.attr('title', 'close all tabs');
            icon.removeClass('fa-plus-square-o');
            icon.addClass('fa-minus-square-o');
        } else {
            button.attr('title', 'open all tabs');
            icon.removeClass('fa-minus-square-o');
            icon.addClass('fa-plus-square-o');
        }
    });

    $('div[data-name="Header"] > .tab-column:last table tbody tr td.clearfix.cell:last').append(button);



});