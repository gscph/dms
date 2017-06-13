using Newtonsoft.Json;
using Site.Areas.DMS_Api;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;


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
        public IHttpActionResult GetPrivilages(Guid webPageId)
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
                            var result = service.GetEntityPermission(webRoleId, webPageId);
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
        public Privileges GetEntityPermission(Guid webRoleId, Guid webPageId)
        {
            var service = new XrmServiceContext(_conn);
            return service.GetEntityPermission(webRoleId, webPageId);
        }

        [HttpGet]
        public IHttpActionResult GetEntityGridPrivilages(String entityName)
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
                            var result = service.GetEditableGridEntityPermission(webRoleId, entityName);
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
        public Privileges GetEditableGridEntityPermission(Guid webRoleId, String entityName)
        {
            var service = new XrmServiceContext(_conn);
            return service.GetEditableGridEntityPermission(webRoleId, entityName);
        }
    }
}
