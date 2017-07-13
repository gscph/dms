<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPages/DMS-FormsContent.master" AutoEventWireup="true" CodeBehind="ProspectList.aspx.cs" Inherits="Site.Pages.DMS_Templates.ProspectList" %>

<%@ Import Namespace="System.Web.Mvc.Html" %>
<%@ Import Namespace="Adxstudio.Xrm.Web.Mvc.Html" %>


<asp:Content ContentPlaceHolderID="Head" runat="server">
    <link href="~/css/dms/entity-list.css" rel="stylesheet" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="Breadcrumbs" runat="server">
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PageHeader" runat="server">
    <script>
       DMS.Settings.Prospect.setForceLoad(true);       
       DMS.Settings.User.Id = "<%: Html.AttributeLiteral(Html.PortalUser(), "contactid") %>";
       $(".navbar-right.toolbar-right").addClass("hidden");
    </script>  
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="MainContent" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="EntityControls" runat="server">
       <h1 class="hidden" id="webPageId"><adx:Property PropertyName="adx_webpageid" Editable="false" DataItem='<%$ CrmSiteMap: Current %>' runat="server" /></h1>  
  
   <div id="loader">
        <span class="fa fa-spinner fa-spin fa-4x loader-color"></span>
    </div>
    <div id="mainContents" class="body-container">              
        <h1 id="EntityListTitle" class="hidden">
            <adx:Property PropertyName="adx_title,adx_name" DataItem='<%$ CrmSiteMap: Current %>' runat="server" />
        </h1>
        <div class="notifications "></div>
         <div class="box box-primary">
            <div class="box-body">
                <div class="chart">
                    <adx:EntityList ID="EntityListControl"
                        runat="server"
                        ListCssClass="table table-hover table-striped table-condensed"
                        DefaultEmptyListText="There are no items to display."
                        ClientIDMode="Static"
                        LanguageCode="<%$ SiteSetting: Language Code, 0 %>"
                        PortalName="<%$ SiteSetting: Language Code %>" />
                </div>
            </div>
        </div>
    </div> 
   
    <script src="~/js/bootstrap-datetimepicker.min.js"></script>
    <script src="~/js/dms/multi-select.js"></script>
    <script src="~/js/dms/custom-filter.js"></script>
</asp:Content>
<asp:Content ID="Content6" ContentPlaceHolderID="ContentBottom" runat="server">
    <!--<img src="dist/img/user2-160x160.jpg" class="img-circle" alt="User Image">-->
    <div class="footer">
        <div class="pull-left footer-left">
            <%--<div class="userlist">--%>
        </div>
        <div class="pull-right footer-right">
        </div>
    </div>
</asp:Content>
<asp:Content ID="Content10" ContentPlaceHolderID="Scripts" runat="server"> 
    <script src="~/js/dms/entity-list.js"></script>
    <script>
        // double click
        if (typeof jQuery === "undefined") {
            throw new Error("edit on double click requires jQuery");
        }

        (function ($) {

            $(document).bind('DOMNodeInserted', function (evt) {

                var isSubGrid = $(evt.target).parent().parent().parent('.subgrid').html();
                var isEntityList = $(evt.target).parent().parent().parent('.entitylist').html();              

                if (evt.target.nodeName == 'TBODY' && evt.relatedNode.nodeName == 'TABLE' &&
                    (typeof isEntityList !== 'undefined')) {

                    $(document).on("dblclick", ".entity-grid.entitylist .view-grid table tbody tr td:not(:first)", function () {
                        showLoading();

                        var that = $(this);

                        var _layouts = that.closest('div[data-view-layouts]').data("view-layouts")[0];
                        var entityName = _layouts.Configuration.EntityName;
                        var path = _layouts.Configuration.DetailsActionLink.URL.PathWithQueryString;
                        var editUrl = path + "?id=" + that.parent('tr').data('id');

                        if (DMS.Settings.User.webRole != "Sales Supervisor" && DMS.Settings.User.webRole != "Sales Executive") {
                            window.location.href = editUrl;
                            return;
                        }
                        var isAuthorized = false;

                        if (DMS.Settings.Permission != null) {
                            isAuthorized = DMS.Settings.Permission.UpdateScope == 756150000 && DMS.Settings.Permission.Read == true;
                        }
                        IsRecordOwner(that, isAuthorized, editUrl, entityName);
                    });
                }

            });

          
            function IsRecordOwner(element, isAuthorized, editUrl, entityName) {
                var userId = DMS.Settings.User.Id;

                var attribute = element.data('attribute');
                var tdReportsTo = element.siblings('td[data-attribute="gsc_reportsto"]').data('value');
                var createdBy, reportsToId, salesExecutive;
                
                if (attribute == 'gsc_recordownerid') createdBy = element.data('value') != null ? element.data('value').Id : null;
                else if (typeof element.siblings('td[data-attribute="gsc_recordownerid"]').data('value') !== 'undefined') {
                    createdBy = element.siblings('td[data-attribute="gsc_recordownerid"]').data('value').Id;
                }

                if (attribute == 'gsc_salesexecutiveid') salesExecutive = element.data('value') != null ? element.data('value').Id : null;
                else if (typeof element.siblings('td[data-attribute="gsc_salesexecutiveid"]').data('value') !== 'undefined') {
                    salesExecutive = element.siblings('td[data-attribute="gsc_salesexecutiveid"]').data('value').Id;
                }
             
                var oDataUrl = '/_odata/employee?$filter=contactid%20eq%20(Guid%27' + createdBy + '%27)&';
                $.ajax({
                    type: 'get',
                    async: true,
                    url: oDataUrl,
                    success: function (data) {
                        if (data.value.length !== 0) {
                            var reportsTo = data.value[0].gsc_reportsto;
                            if (reportsTo !== null && reportsTo !== undefined)
                            var reportsToId = reportsTo.Id;

                            if (salesExecutive === userId || reportsToId === DMS.Settings.User.Id || isAuthorized) {
                                window.location.href = editUrl;
                                return;
                            }

                            if (entityName != "contact" || entityName != "account")
                            {
                                if (createdBy === userId) {
                                    window.location.href = editUrl;
                                    return;
                                }
                            }

                            $.unblockUI();
                            $(".loadingDiv").remove();
                            DMS.Notification.Error('You are unauthorized to open this record.', true, 3000);
                        }
                    },
                    error: function (xhr, textStatus, errorMessage) {
                        console.error(errorMessage);
                    }
                });
            }

            function showLoading() {
                $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

                var div = document.createElement("DIV");
                div.className = "view-loading message text-center";
                div.style.cssText = 'position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;';
                var span = document.createElement("SPAN");
                span.className = "fa fa-2x fa-spinner fa-spin";
                div.appendChild(span);
                $(".content-wrapper").append(div);
            }

        }(jQuery));  
    </script>
    <script src="~/js/dms/prospect.js"></script>
    <script src="~/js/dms/entity-permission.js"></script>
</asp:Content>
