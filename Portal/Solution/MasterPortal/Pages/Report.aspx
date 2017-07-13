<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Report.aspx.cs" Inherits="Site.Reports.RequirementChecklist" EnableEventValidation="false"%>

<%@ Register Assembly="Microsoft.ReportViewer.WebForms, Version=10.0.0.0, Culture=neutral, PublicKeyToken=B03F5F7F11D50A3A" Namespace="Microsoft.Reporting.WebForms" TagPrefix="rsweb" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>

<body onload="resizeWindow()">
    
    <script type = "text/javascript">
        // Print function (require the reportviewer client ID)
        var reportType = '<% = dssr.Value %>';
        function printReport(report_ID) {

            //var prtContent = document.getElementById("ReportViewer1_ctl09");
            //var WinPrint = window.open('', '', 'left=100,top=100,width=600,height=600');

            //WinPrint.document.write(prtContent.innerHTML);
            //WinPrint.document.close();
            //WinPrint.focus();
            //WinPrint.print();

            //var rv1 = $('#' + report_ID);
            //alert("hi");
            //var iDoc = rv1.parents('html');

            //// Reading the report styles
            //var styles = iDoc.find("head style[id$='ReportControl_styles']").html();
            //if ((styles == undefined) || (styles == '')) {
            //    iDoc.find('head script').each(function () {
            //        var cnt = $(this).html();
            //        var p1 = cnt.indexOf('ReportStyles":"');
            //        if (p1 > 0) {
            //            p1 += 15;
            //            var p2 = cnt.indexOf('"', p1);
            //            styles = cnt.substr(p1, p2 - p1);
            //        }
            //    });
            //}
            //if (styles == '') { alert("Cannot generate styles, Displaying without styles.."); }
            //styles = '<style type="text/css">' + styles + "</style>";

            //// Reading the report html
            //var table = rv1.find("div[id$='_oReportDiv']");
            //if (table == undefined) {
            //    alert("Report source not found.");
            //    return;
            //}

            //// Generating a copy of the report in a new window
            //var docType = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/loose.dtd">';
            //var docCnt = styles + table.parent().html();
            //var docHead = '<head><title>Printing ...</title><style>body{margin:5;padding:0;}</style></head>';
            //var winAttr = "location=yes, statusbar=no, directories=no, menubar=no, titlebar=no, toolbar=no, dependent=no, width=720, height=600, resizable=yes, screenX=200, screenY=200, personalbar=no, scrollbars=yes";;
            //var newWin = window.open("", "_blank", winAttr);
            //writeDoc = newWin.document;
            //writeDoc.open();
            //writeDoc.write(docType + '<html>' + docHead + '<body onload="window.print();">' + docCnt + '</body></html>');
            //writeDoc.close();

            //// The print event will fire as soon as the window loads
            //newWin.focus();
            //// uncomment to autoclose the preview window when printing is confirmed or canceled.
            //// newWin.close();
        };

        function resizeWindow() {
            if (reportType == "DSSR") {
                var prtContent = document.getElementById("ReportViewer1");
                WinPrint.document.write(prtContent.innerHTML, 'left=0, top=100, width=1000,height=1000');
                WinPrint.focus();
            }
            else {
                var WinPrint = window.open('', '', 'left=100,top=100,width=850,height=1000');
                var width = 850;
                var height = 1000;
                window.resizeTo(width, height);
            }


        }

    </script>
    
    <div id="layout" style="margin: auto; width:850px;">
    <form id="form1" runat="server">
        <asp:HiddenField ID="dssr" runat="server" Value="tom" />
        <asp:scriptmanager id="sm" runat="server" enablepartialrendering="true" scriptmode="release" enablepagemethods="true"></asp:scriptmanager>
       <%-- <asp:Button id="printreport" Text="Print" runat="server" OnClientClick="printReport(ReportViewer1)"/>--%>
           <rsweb:reportviewer ID="ReportViewer1" runat="server"  Font-Names="Verdana" Font-Size="8pt" Height="100%" ProcessingMode="Remote" Width="100%" ShowBackButton="True" PromptAreaCollapsed="True" SizeToReportContent="True"
             ShowPrintButton="true">
                    <serverreport reportserverurl="" />
                </rsweb:reportviewer>
    </form>
    </div>

    <script src="~/js/jquery-1.11.1.min.js"></script>
    <script src="~/dms-plugins/input-mask/jquery.inputmask.date.extensions.js"></script>
</body>
</html>
