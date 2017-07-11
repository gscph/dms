using Microsoft.Xrm.Sdk;
using Newtonsoft.Json;
using Site.Areas.DMS_Api;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using Microsoft.Xrm.Sdk.Query;
using GSC.Rover.DMS.BusinessLogic.PriceList;

namespace Site.Areas.DMSApi.Controllers
{
    public class ServiceController : ApiController
    {
        private XrmConnection _conn = new XrmConnection();
        private readonly CurrentlyUsedWebPageRepository _repoWebPage = new CurrentlyUsedWebPageRepository();
        [HttpPut]
        public IHttpActionResult UpdateEntityStatus(IEnumerable<EditableGridModel> records)
        {
            try
            {
                var service = new XrmServiceContext(_conn);
                service.UpdateEntityState(records);
                return Ok();
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        public IHttpActionResult GetCurrentlyUsedWebPages(UserPageDefinition data)
        {
            try
            {
                return Ok(_repoWebPage.GetWebPagesWithTimeAndUrlFilter(data.Url));
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPut]
        public IHttpActionResult StoreNewPages(CurrentlyUsedWebPage data)
        {
            try
            {
                _repoWebPage.InsertPage(data);
                SalesHub hub = new SalesHub();
                hub.Update(data, 1);
                return Ok();
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPut]
        public IHttpActionResult UpdatePage(int id, string connId, string url)
        {
            try
            {
                _repoWebPage.UpdatePage(id, connId);
                SalesHub hub = new SalesHub();
                hub.Update(new CurrentlyUsedWebPage
                {
                    Id = id,
                    ConnectionId = new Guid(connId),
                    Url = url
                }, 2);
                return Ok();
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpDelete]
        public IHttpActionResult DeletePage(string connId)
        {
            try
            {
                _repoWebPage.DeletePage(connId);
                SalesHub hub = new SalesHub();
                return Ok();
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpGet]
        public EntityForm GetPrimaryFieldValue(string logicalName, string Id)
        {
            var service = new XrmServiceContext(_conn);
            Guid id = Guid.Empty;

            if (Id != "null")
            {
                id = new Guid(Id);
            }

            return service.GetEntityPrimaryFieldValue(logicalName, id);
        }

        [HttpGet]
        public string GetEntityPluralName(string logicalName)
        {
            var service = new XrmServiceContext(_conn);
            return service.GetEntityPluralName(logicalName);
        }

        [HttpGet]
        public string GetEntityDisplayName(string logicalName)
        {
            var service = new XrmServiceContext(_conn);
            return service.GetEntityDisplayName(logicalName);
        }

        [HttpPut]
        public IHttpActionResult RunWorkFlow(String workFlowName, Guid entityId)
        {
            try
            {
                var service = new WorkFlowTrigger(_conn);
                service.RunWorkFlow(workFlowName, entityId);
                return Ok();
            }
            catch (Exception e)
            {
                return InternalServerError(e);
            }
        }

        [HttpGet]
        public IHttpActionResult GetPrivilages(Guid webPageId, Guid recordOwnerId, Guid OwningBranchId, Guid salesExecutiveId)
        {
            try
            {
                var context = HttpContext.Current;
                Guid webRoleId = new Guid();
                if (context != null)
                {
                    var request = context.Request.RequestContext;
                    var cookies = request.HttpContext.Request.Cookies;

                    if (cookies != null)
                    {
                        if (cookies["Branch"] != null)
                        {
                            webRoleId = new Guid(cookies["Branch"]["webRoleId"]);
                            var service = new XrmServiceContext(_conn);
                            var result = service.GetEntityPermission(webRoleId, webPageId, recordOwnerId, OwningBranchId, salesExecutiveId);
                            return Ok(result);
                        }
                    }
                }
                return NotFound();

            }
            catch (Exception e)
            {
                return InternalServerError(e);
            }

        }

        [HttpGet]
        public Privileges GetEntityPermission(Guid webRoleId, Guid webPageId, Guid recordOwnerId, Guid OwningBranchId, Guid salesExecutiveId)
        {
            var service = new XrmServiceContext(_conn);
            return service.GetEntityPermission(webRoleId, webPageId, recordOwnerId, OwningBranchId, salesExecutiveId);
        }

        [HttpGet]
        public IHttpActionResult GetEntityGridPrivilages(String entityName, Guid recordOwnerId, Guid OwningBranchId)
        {
            try
            {
                var context = HttpContext.Current;
                Guid webRoleId = new Guid();
                if (context != null)
                {
                    var request = context.Request.RequestContext;
                    var cookies = request.HttpContext.Request.Cookies;

                    if (cookies != null)
                    {
                        if (cookies["Branch"] != null)
                        {
                            webRoleId = new Guid(cookies["Branch"]["webRoleId"]);
                            var service = new XrmServiceContext(_conn);
                            var result = service.GetEditableGridEntityPermission(webRoleId, entityName, recordOwnerId, OwningBranchId);
                            return Ok(result);
                        }
                    }
                }
                return NotFound();

            }
            catch (Exception e)
            {
                return InternalServerError(e);
            }

        }

        [HttpGet]
        public Privileges GetEditableGridEntityPermission(Guid webRoleId, String entityName, Guid recordOwnerId, Guid OwningBranchId)
        {
            var service = new XrmServiceContext(_conn);
            return service.GetEditableGridEntityPermission(webRoleId, entityName, recordOwnerId, OwningBranchId);
        }

        [HttpGet]
        public IHttpActionResult GetVehicleUnitPrice(Guid productId, int markUp)
        {
            try
            {

                var context = HttpContext.Current;
                Guid branchId = Guid.Empty;

                if (context != null)
                {
                    var request = context.Request.RequestContext;
                    var cookies = request.HttpContext.Request.Cookies;

                    if (cookies != null)
                    {
                        if (cookies["Branch"] != null)
                        {
                            branchId = new Guid(cookies["Branch"]["branchId"]);
                        }
                    }
                }

                if (branchId == Guid.Empty)
                {
                    return InternalServerError(new Exception("Couldn't determine current branch."));
                }


                if (productId != Guid.Empty)
                {

                    decimal sellPrice = 0;

                    PriceListHandler priceListHandler = new PriceListHandler(_conn.ServiceContext);
                    priceListHandler.itemType = 0;
                    priceListHandler.productFieldName = "gsc_productid";
                    Entity quoteEntity = new Entity();
                    quoteEntity.Attributes.Add("gsc_branchid", new EntityReference("account", branchId));
                    quoteEntity.Attributes.Add("gsc_productid", new EntityReference("product", productId));

                    Entity productEntity = _conn.ServiceContext.Retrieve("product", productId, new ColumnSet("gsc_taxrate"));

                    List<Entity> latestPriceList = priceListHandler.RetrievePriceList(quoteEntity, 100000000, 100000003);

                    if (latestPriceList.Count > 0)
                    {
                        Entity priceListItem = latestPriceList[0];
                        Entity priceList = latestPriceList[1];

                        sellPrice = priceListItem.GetAttributeValue<Money>("amount").Value;

                        decimal taxStatus = priceList.GetAttributeValue<OptionSetValue>("gsc_taxstatus").Value;

                        var taxRate = productEntity.Contains("gsc_taxrate")
                            ? (Decimal)productEntity.GetAttributeValue<Double>("gsc_taxrate")
                            : 0;

                        if (markUp != 0)
                        {
                            markUp = markUp / 100;
                        }

                        if (taxRate != 0)
                        {
                            taxRate = taxRate / 100;
                        }

                        if (taxStatus == 100000001)
                            sellPrice = (sellPrice * (1 + taxRate));

                        sellPrice = sellPrice * (1 + markUp);
                    }
                    else
                    {
                        return InternalServerError(new Exception("There is no effective Price List for the selected Vehicle."));
                    }

                    return Ok(sellPrice);
                }
                return InternalServerError(new Exception("No Vehicle Price Found."));
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}
