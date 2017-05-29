<%@ Page Title="" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="WebForm_LinqDataSource.aspx.cs" Inherits="WebAppWalkthrough.WebForm_LinqDataSource" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server" />
<asp:Content ContentPlaceHolderID="MainContent" runat="server">
	<!--This example lists all contacts from the CRM system -->
	<asp:LinqDataSource ID="Contacts" ContextTypeName="Xrm.XrmServiceContext" TableName="ContactSet" runat="server" />
	<asp:GridView DataSourceID="Contacts" AutoGenerateColumns="false" runat="server">
		<Columns>
			<asp:TemplateField HeaderText="First Name">
				<ItemTemplate>
					<asp:Label Text='<%# Eval("firstname")%>' runat="server" />
				</ItemTemplate>
			</asp:TemplateField>
			<asp:TemplateField HeaderText="Last Name">
				<ItemTemplate>
					<asp:Label Text='<%# Eval("lastname")%>' runat="server" />
				</ItemTemplate>
			</asp:TemplateField>
			<asp:TemplateField HeaderText="City">
				<ItemTemplate>
					<asp:Label Text='<%#Eval("address1_city") %>' runat="server" />
				</ItemTemplate>
			</asp:TemplateField>
		</Columns>
	</asp:GridView>
</asp:Content>
