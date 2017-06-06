using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Areas.DMS_Api
{
    public class CrmDataRepository
    {
        private readonly IXrmConnection _service;

        public CrmDataRepository(IXrmConnection service)
        {
            _service = service;
        }
    }
}