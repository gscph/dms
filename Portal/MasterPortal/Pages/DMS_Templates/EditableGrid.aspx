<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPages/Default.master" AutoEventWireup="true" CodeBehind="EditableGrid.aspx.cs" Inherits="Site.Pages.DMS_Templates.EditableGrid" %>


<%@ Import Namespace="System.Web.Mvc.Html" %>
<%@ Import Namespace="Adxstudio.Xrm.Web.Mvc.Html" %>
<%@ OutputCache CacheProfile="EditableGrid" %>


<asp:Content ContentPlaceHolderID="Head" runat="server">
    <link href="~/css/dms/handsontable.full.min.css" rel="stylesheet" />
    <link href="~/css/dms/handsontable.bootstrap.css" rel="stylesheet" />
    
</asp:Content>

<asp:Content ID="MyContent" ContentPlaceHolderID="MainContent" runat="server">
    <script src="~/js/jquery.cookie.js"></script>
    <%: Html.HtmlAttribute("adx_copy", cssClass: "page-copy") %>
    <h1>Editable Grid Demo</h1>
    <div class="notifications"></div>    
    <table role="presentation" data-name="boombastik" class="section">
        <colgroup>
            <col style="width: 100%;">
            <col>
        </colgroup>
        <tbody>
            <tr>
                <td colspan="1" rowspan="1" class="clearfix cell"></td>
                <td class="cell zero-cell"></td>
            </tr>
        </tbody>
    </table>
</asp:Content>

<asp:Content ID="Content10" ContentPlaceHolderID="Scripts" runat="server">
         <script src="~/js/dms/service.js"></script>
    <script src="~/js/dms/notification.js"></script>
    <script src="~/js/dms/helpers.js"></script>
    <script src="~/js/dms/site-settings.js"></script>
    <script src="~/js/dms/dms-app.js"></script>
    <script src="~/js/dms/handsontable.full.js"></script>
    <script src="~/js/dms/select2-editor.js"></script>
    <script src="~/js/dms/hot-renderers.js"></script>
    <script src="~/js/dms/generic-grid.js"></script>
  
    <script>
        $(document).ready(function () {
            $(document).trigger("initializeEditableGrid", gridInstance);          
        });

        var optionsList = getVehicleBaseModel();

        function getVehicleBaseModel() {
            var list = []
            $.getJSON("/_odata/gsc_iv_vehiclebasemodel")
             .done(function (response) {

                 jQuery.each(response.value, function (i, val) {

                     var record = {
                         id: val.gsc_iv_vehiclebasemodelid,
                         text: val.gsc_basemodelpn
                     }

                     list.push(record);
                 });
             });

            return list;
        }

        var gridInstance = {
            initialize: function () {
                /* - Editable Grid - documentchecklistsubgrid */
                $('<div id="sampleness" class="editable-grid"></div>').appendTo('.content-wrapper');

                var $container = document.getElementById('sampleness');
                var odataQuery = '/_odata/lead';
                var screenSize = $(window).width() - 100;
                var options = {
                    dataSchema: {
                        leadid: null, gsc_inquiryno: null, gsc_inquirydate: null,
                        gsc_prospectname: null, gsc_vehiclebasemodelid: { Id: null, Name: null },
                        gsc_colorid: { Id: null, Name: null },
                        gsc_vehicletypeid: { Id: null, Name: null },
                        gsc_paymentmode: { Name: null, Value: null },
                        createdon: null
                    },
                    colHeaders: ['Inquiry No', 'Inquiry Date',
                           'Prospect Name', 'Base Model No',
                           'Color', 'Vehicle Type',
                           'Payment Mode', 'Date Created'],
                    columns: [
                       { data: 'gsc_inquiryno' },
                       {
                           data: 'gsc_inquirydate',
                           renderer: dateRenderer,
                           type: 'date',
                           dateFormat: 'MM/DD/YYYY'                         
                       },
                       { data: 'fullname' },
                       {
                           data: 'gsc_vehiclebasemodelid',
                           renderer: customDropdownRenderer,
                           editor: 'select2',
                           select2Options: { // these options are the select2 initialization options 
                               data: optionsList,
                               dropdownAutoWidth: true,
                               allowClear: true,
                               width: 'resolve'
                           }
                       },
                       {
                           data: 'gsc_colorid',
                           renderer: multiPropertyRenderer,
                           readOnly: true
                       },
                       {
                           data: 'gsc_vehicletypeid',
                           renderer: multiPropertyRenderer,
                           readOnly: true
                       },
                       {
                           data: 'gsc_paymentmode',
                           renderer: multiPropertyRenderer,
                           readOnly: true
                       },
                       {
                           data: 'createdon',
                           renderer: dateRenderer,
                           type: 'date',
                           dateFormat: 'MM/DD/YYYY',
                           correctFormat: true,
                           readOnly: true
                       }
                    ],
                    gridWidth: screenSize,
                    addNewRows: true,
                    deleteRows: true
                } 

                var sectionName = "boombastik";
                var attributes = [  { key: 'gsc_inquiryno', type: 'System.String' },
                                    { key: 'gsc_inquirydate', type: 'System.DateTime' },
                                    { key: 'fullname', type: 'System.String' },
                                    { key: 'gsc_vehiclebasemodelid', type: 'Microsoft.Xrm.Sdk.EntityReference' }                                   
                                 ];
                var model = { id: 'leadid', entity: 'lead', attr: attributes };
                var hotInstance = EditableGrid(options, $container, sectionName, odataQuery, model);

            }
        }
    </script>
</asp:Content>
