using Microsoft.Xrm.Client.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Areas.DMS_Api
{
    public interface IXrmConnection
    {
        string ConnectionString { get; }
        OrganizationService ServiceContext { get; }
    }
}