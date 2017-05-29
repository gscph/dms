<%@ Page Title="" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="WebForm_FromSavedQuery.aspx.cs" Inherits="WebAppWalkthrough.WebForm_SavedQuery_Edit" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server" />
<asp:Content ContentPlaceHolderID="MainContent" runat="server">
	<asp:ScriptManager runat="server" />
	<crm:CrmDataSource ID="Contacts" runat="server" />
	<crm:CrmEntityFormView DataSourceID="Contacts" EntityName="contact" SavedQueryName="Active Contacts" runat="server" />
</asp:Content>
