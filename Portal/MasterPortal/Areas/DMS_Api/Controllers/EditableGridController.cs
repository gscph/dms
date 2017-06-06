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
                if (ex.Message.Equals("An error has occurred.") || ex.Message.Equals("You are not authorized to modify this record."))
                {
                    throw new InvalidOperationException("This record is already referenced to another transaction. It cannot be deleted.");
                    //return InternalServerError(ex);
                }
                else
                {
                    return InternalServerError(ex);
                }
                
            }
        }
    }
}
