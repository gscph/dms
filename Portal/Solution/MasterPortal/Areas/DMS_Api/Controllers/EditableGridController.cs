using Adxstudio.Xrm.Web.Mvc;
using Site.Areas.DMSApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Newtonsoft.Json;
using System.Web.Http.Description;

namespace Site.Areas.DMS_Api.Controllers
{
    public class EditableGridController : ApiController
    {
        private XrmConnection _conn = new XrmConnection();

        // GET: api/EditableGrid/UpdateRecords
        [HttpPut]
        public IHttpActionResult UpdateRecords(IEnumerable<EditableGridModel> records)
        {
            try
            {
                var service = new XrmServiceContext(_conn);
                return Ok(service.UpdateRecords(records));
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }


        [HttpDelete]
        [JsonHandlerError]
        public IHttpActionResult DeleteRecords(IEnumerable<EditableGridModel> records)
        {
            try
            {
                var service = new XrmServiceContext(_conn);
                service.DeleteRecords(records);
                return Ok();
            }
            catch (Exception ex)
            {
                if (ex.Message.Equals("The object you tried to delete is associated with another object and cannot be deleted."))
                {
                    throw new InvalidOperationException("Record/s cannot be deleted. It is already used in transactions.");
                }
                else
                {
                    return InternalServerError(ex);
                }
                
            }
        }
    }
}
