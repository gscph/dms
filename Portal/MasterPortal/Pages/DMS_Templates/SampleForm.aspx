<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="SampleForm.aspx.cs" Inherits="Site.Pages.DMS_Templates.SampleForm" %>

<%@ Import Namespace="System.Web.Mvc.Html" %>
<%@ Import Namespace="Adxstudio.Xrm.Web.Mvc.Html" %>

<%: System.Web.Optimization.Scripts.Render("~/js/default.preform.bundle.js") %>
<form id="hey" runat="server">
     <asp:ScriptManager runat="server">
                <Scripts>
                    <asp:ScriptReference Path="~/js/jquery.blockUI.js" />
                </Scripts>
     </asp:ScriptManager>

    <adx:CrmEntityFormView runat="server" ID="FormView" Mode="Insert" EntityName="gsc_syscity" FormName="City Portal" DataSourceID="FormViewDataSource">
    </adx:CrmEntityFormView>
    
    <adx:CrmDataSource runat="server" ID="FormViewDataSource">
        <FetchXml>
		<fetch mapping='logical'>
			<entity name='gsc_syscity'>
				<all-attributes />
				<filter type='and'>
					<condition attribute = 'gsc_syscityid' operator='eq' value="{f81d246d-97de-e511-8276-08edb99f225a}" />
				</filter>
			</entity>
		</fetch>
        </FetchXml>
    </adx:CrmDataSource>
</form>

 <%: System.Web.Optimization.Scripts.Render("~/js/default.bundle.js") %>
<%--<script src="~/js/entity-associate.js"></script>
<script src="~/js/entity-form.js"></script>
<script src="~/js/entity-grid.js"></script>
<script src="~/js/entity-lookup.js"></script>--%>
