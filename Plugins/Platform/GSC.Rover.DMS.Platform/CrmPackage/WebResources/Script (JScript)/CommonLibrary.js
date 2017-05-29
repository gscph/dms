/********************** Source File Header **************************
Project Name: GSC - Internal
Module/Process Name: Common JavaScript Library
Copyright (c) Gurango Software Corporation. All other rights reserved.
********************************************************************/


if (typeof (GSC) == "undefined")
{ GSC = { __namespace: true }; }

GSC.Common = {
	
    hideOrShowSections: function (Tab, Section, enable) {
        ///<summary>
        /// Private function to show/hide sections
        ///</summary>

        var TabName = Xrm.Page.ui.tabs.get(Tab);
        // Hide/Show Section
        for (var i = 0; i < Section.length; i++) {
            if (Section[i] != null && Section[i] != '') {
                if (TabName.sections.get(Section[i]) != null)
                    TabName.sections.get(Section[i]).setVisible(enable);
            }

        }
    },

    setFieldsOptional: function (ShowFields) {

        ///<summary>
        /// Private function Hide/Show fields
        ///</summary>

        for (var i = 0; i < ShowFields.length; i++) {
            Xrm.Page.getAttribute(ShowFields[i]).setRequiredLevel("none");
        }
    },

    setFieldsBusinessRequired: function (setFields) {

        ///<summary>
        /// Private function to set field business required.
        ///</summary>

        for (var i = 0; i < setFields.length; i++)
            Xrm.Page.getAttribute(setFields[i]).setRequiredLevel("required");
    },

    setFieldsNull: function (setFields) {

        ///<summary>
        /// Private function to set field null
        ///</summary>
        for (var i = 0; i < setFields.length; i++) {
            Xrm.Page.getAttribute(setFields[i]).setValue(null);
        }
    },

    setFieldsNullAndForceSubmit: function (setFields) {

        ///<summary>
        /// Private function to set field null and do force submit on it.
        ///</summary>
        for (var i = 0; i < setFields.length; i++) {
            if (Xrm.Page.getAttribute(setFields[i]).getValue() != null) {
                Xrm.Page.getAttribute(setFields[i]).setValue(null);
                Xrm.Page.getAttribute(setFields[i]).setSubmitMode("always");
            }
        }
    },

    showOrHideSingleField: function (attributeName, enable) {
        ///<summary>
        /// Private function to hide/show single field.
        ///</summary>

        Xrm.Page.getControl(attributeName).setVisible(enable);

    },

    enableOrDisableSingleField: function (attributeName, disable) {
        ///<summary>
        /// Private function to enable/disable  single field.
        ///</summary>
        Xrm.Page.getAttribute(attributeName).controls.forEach(
            function (control, i) {
                control.setDisabled(disable);
            });
        if (disable)
            Xrm.Page.getAttribute(attributeName).setSubmitMode("always");
    },

    showOrHideFieldList: function (attributeArray, showorHide) {
        ///<summary>
        /// Private function to show/Hide Field list.
        ///</summary>

        for (var i = 0; i < attributeArray.length; i++) {
            Xrm.Page.getControl(attributeArray[i]).setVisible(showorHide);
            if (!showorHide) {
                if (Xrm.Page.getAttribute(attributeArray[i]).getRequiredLevel())
                    Xrm.Page.getAttribute(attributeArray[i]).setRequiredLevel("none");
            }
        }
    },

    disableOrEnableFields: function (attributeArray, disableOrEnable) {
        ///<summary>
        /// Private function to disable/enable fields.
        ///</summary>
        for (var i = 0; i < attributeArray.length; i++) {
            Xrm.Page.getControl(attributeArray[i]).setDisabled(disableOrEnable);
            if (disableOrEnable)
                Xrm.Page.getAttribute(attributeArray[i]).setSubmitMode("always");
        }
    },

    getAttributeValue: function (attributeName) {
        var attributeName = Xrm.Page.getAttribute(attributeName);
        if (attributeName != null || attributeName != '')
            return attributeName.getValue();
        return null;
    },

    alertDialog: function (alertMessage, attributeName) {
        Xrm.Utility.alertDialog(alertMessage, function () {
            Xrm.Page.getAttribute(attributeName).setValue(null);
            Xrm.Page.getControl(attributeName).setFocus();
        });
    },

    attributeFireOnChange: function (attributeName) {
        Xrm.Page.getAttribute(attributeName).fireOnChange();
    },
    
	getFormattedDates: function (dateToBeFormatted) {
        if (dateToBeFormatted == null || dateToBeFormatted == '') return null;
        var formattedDate = new Date(dateToBeFormatted);
        var dd = formattedDate.getDate();
        var months = new Array(12);
        months[0] = "Jan";
        months[1] = "Feb";
        months[2] = "March";
        months[3] = "April";
        months[4] = "May";
        months[5] = "June";
        months[6] = "July";
        months[7] = "August";
        months[8] = "September";
        months[9] = "October";
        months[10] = "November";
        months[11] = "December";
        var mmm = formattedDate.getMonth(); //January is 0
        var final = months[mmm];
        var yyyy = formattedDate.getFullYear();
        var formattedStringDate = dd + ' ' + final + ' ' + yyyy;
        return formattedStringDate;
    },
    
	context: function () {
        ///<summary>
        /// Private function to the context object.
        ///</summary>
        ///<returns>Context</returns>
        var oContext;
        if (typeof window.GetGlobalContext != "undefined") {
            oContext = window.GetGlobalContext();
        }
        else {
            if (typeof Xrm != "undefined") {
                oContext = Xrm.Page.context;
            }
            else if (typeof window.parent.Xrm != "undefined") {
                oContext = window.parent.Xrm.Page.context;
            }
            else {
                throw new Error("Context is not available.");
            }
        }
        return oContext;
    },
    
	getClientUrl: function () {
        ///<summary>
        /// Private function to return the server URL from the context
        ///</summary>
        ///<returns>String</returns>
        var clientUrl = this.context().getClientUrl();

        return clientUrl;
    },
    
	getServerUrl: function () {
        ///<summary>
        /// Private function to return the server URL from the context
        ///</summary>
        ///<returns>String</returns>
        if (typeof this.getContext().getClientUrl != "undefined") {
            return this.getContext().getClientUrl();
        }

        var serverUrl = this.getContext().getServerUrl();
        if (serverUrl.match(/\/$/)) {
            serverUrl = serverUrl.substring(0, serverUrl.length - 1);
        }
        return serverUrl;
    },
    
	oDataPath: function () {
        ///<summary>
        /// Private function to return the path to the REST endpoint.
        ///</summary>
        ///<returns>String</returns>
        return this.getClientUrl() + "/XRMServices/2011/OrganizationData.svc/";
    },
    
	dateReviver: function (key, value) {
        ///<summary>
        /// Private function to convert matching string values to Date objects.
        ///</summary>
        ///<param name="key" type="String">
        /// The key used to identify the object property
        ///</param>
        ///<param name="value" type="String">
        /// The string value representing a date
        ///</param>
        var a;
        if (typeof value === 'string') {
            a = /Date\(([-+]?\d+)\)/.exec(value);
            if (a) {
                return new Date(parseInt(value.replace("/Date(", "").replace(")/", ""), 10));
            }
        }
        return value;
    },
    
	errorHandler: function (req) {
        ///<summary>
        /// Private function return an Error object to the errorCallback
        ///</summary>
        ///<param name="req" type="XMLHttpRequest">
        /// The XMLHttpRequest response that returned an error.
        ///</param>
        ///<returns>Error</returns>
        //Error descriptions come from http://support.microsoft.com/kb/193625
        if (req.status == 12029)
        { return new Error("The attempt to connect to the server failed."); }
        if (req.status == 12007)
        { return new Error("The server name could not be resolved."); }
        var errorText;
        try
        { errorText = JSON.parse(req.responseText).error.message.value; }
        catch (e)
        { errorText = req.responseText }

        return new Error("Error : " +
              req.status + ": " +
              req.statusText + ": " + errorText);
    },
    
    parameterCheck: function (parameter, message) {
        ///<summary>
        /// Private function used to check whether required parameters are null or undefined
        ///</summary>
        ///<param name="parameter" type="Object">
        /// The parameter to check;
        ///</param>
        ///<param name="message" type="String">
        /// The error message text to include when the error is thrown.
        ///</param>
        if ((typeof parameter === "undefined") || parameter === null) {
            throw new Error(message);
        }
    },
    
	errorCallBack: function (errorThrown, status) {
        ///<summary>
        /// Error CallBack function
        ///</summary>
        alert("An Error Occurred: " + errorThrown);
    },
    
	stringParameterCheck: function (parameter, message) {
        ///<summary>
        /// Private function used to check whether required parameters are null or undefined
        ///</summary>
        ///<param name="parameter" type="String">
        /// The string parameter to check;
        ///</param>
        ///<param name="message" type="String">
        /// The error message text to include when the error is thrown.
        ///</param>
        if (typeof parameter != "string") {
            throw new Error(message);
        }
    },
    
	callbackParameterCheck: function (callbackParameter, message) {
        ///<summary>
        /// Private function used to check whether required callback parameters are functions
        ///</summary>
        ///<param name="callbackParameter" type="Function">
        /// The callback parameter to check;
        ///</param>
        ///<param name="message" type="String">
        /// The error message text to include when the error is thrown.
        ///</param>
        if (typeof callbackParameter != "function") {
            throw new Error(message);
        }
    },
    
	setLookupObject: function (id, logicalName) {
        ///<summary>
        /// Function to set and return a lookup object
        ///</summary>
        var lookupObject = new Object();
        lookupObject.Id = id;
        lookupObject.LogicalName = logicalName;
        return lookupObject;
    },
    
	discardChanges: function () {
        var attributes = Xrm.Page.data.entity.attributes.get();
        for (var i in attributes) {
            attributes[i].setSubmitMode('never');
        }
    },
    
	setLookupAttribute: function (attributeName, id, name, entityType) {
        ///<summary>
        /// Function to set value of a lookup field
        ///</summary>
        var lookupValue = new Array();
        lookupValue[0] = new Object();
        lookupValue[0].id = id;
        if (name) {
            lookupValue[0].name = name;
        }
        lookupValue[0].entityType = entityType;
        Xrm.Page.getAttribute(attributeName).setValue(lookupValue);
    },
    
	enableOrDisableTabOrSection: function (Tab, Section, enable) {
        var TabName = Xrm.Page.ui.tabs.get(Tab);
        // Hide/Show Section
        if (Section != null && Section != '') {
            if (TabName.sections.get(Section) != null)
                TabName.sections.get(Section).setVisible(enable);
        }
            // Hide/Show Tab
        else if (Tab != null && Tab != '') {
            if (TabName != null && TabName != '')
                TabName.setVisible(enable);
        }
        else {
            alert("Error in Show/Hiding Section/Tab.");
        }
    },
    
	showFormNotification: function (Message, Type, Id) {
        Xrm.Page.ui.setFormNotification(Message, Type, Id);
    },
    
	clearFormNotification: function (MessageId) {
        Xrm.Page.ui.clearFormNotification(MessageId);
    },
    
	showOrHideFieldList: function (attributeArray, showorHide) {
        for (var i = 0; i < attributeArray.length; i++) {
            Xrm.Page.getControl(attributeArray[i]).setVisible(showorHide);
            if (!showorHide) {
                if (Xrm.Page.getAttribute(attributeArray[i]).getRequiredLevel())
                    Xrm.Page.getAttribute(attributeArray[i]).setRequiredLevel("none");
            }
        }
    },
    
	setSubmitMode: function (attributeArray, modevalue) {
        for (var i = 0; i < attributeArray.length; i++) {
            Xrm.Page.getAttribute(attributeArray[i]).setSubmitMode(modevalue);
        }
    },
    
	xmlEncode: function (strInput) {
        var c;
        var XmlEncode = '';
        if (strInput == null) {
            return null;
        }
        if (strInput == '') {
            return '';
        }
        for (var cnt = 0; cnt < strInput.length; cnt++) {
            c = strInput.charCodeAt(cnt);
            if (((c > 96) && (c < 123)) ||
                     ((c > 64) && (c < 91)) ||
                     (c == 32) ||
                     ((c > 47) && (c < 58)) ||
                     (c == 46) ||
                     (c == 44) ||
                     (c == 45) ||
                     (c == 95)) {
                XmlEncode = XmlEncode + String.fromCharCode(c);
            }
            else {
                XmlEncode = XmlEncode + '&#' + c + ';';
            }
        }
        return XmlEncode;
    },
    
	retrieveRecord: function (id, type, select, expand, flag, successCallback, errorCallback) {
        ///<summary>
        /// Sends an asynchronous request to retrieve a record.
        ///</summary>
        ///<param name="id" type="String">
        /// A String representing the GUID value for the record to retrieve.
        ///</param>
        ///<param name="type" type="String">
        /// The Schema Name of the Entity type record to retrieve.
        /// For an Account record, use "Account"
        ///</param>
        ///<param name="select" type="String">
        /// A String representing the $select OData System Query Option to control which
        /// attributes will be returned. This is a comma separated list of Attribute names that are valid for retrieve.
        /// If null all properties for the record will be returned
        ///</param>
        ///<param name="expand" type="String">
        /// A String representing the $expand OData System Query Option value to control which
        /// related records are also returned. This is a comma separated list of of up to 6 entity relationship names
        /// If null no expanded related records will be returned.
        ///</param>
        ///<param name="flag" type="bool">
        /// A bool that specifies if request is synch or asynch call. if true then it is asynchronous call;
        /// </param>
        ///<param name="successCallback" type="Function">
        /// The function that will be passed through and be called by a successful response. 
        /// This function must accept the returned record as a parameter.
        /// </param>
        ///<param name="errorCallback" type="Function">
        /// The function that will be passed through and be called by a failed response. 
        /// This function must accept an Error object as a parameter.
        /// </param>
        this.stringParameterCheck(id, "GSC.retrieveRecord requires the id parameter is a string.");
        this.stringParameterCheck(type, "GSC.retrieveRecord requires the type parameter is a string.");
        if (select != null)
            this.stringParameterCheck(select, "GSC.retrieveRecord requires the select parameter is a string.");
        if (expand != null)
            this.stringParameterCheck(expand, "GSC.retrieveRecord requires the expand parameter is a string.");
        this.callbackParameterCheck(successCallback, "GSC.retrieveRecord requires the successCallback parameter is a function.");
        this.callbackParameterCheck(errorCallback, "GSC.retrieveRecord requires the errorCallback parameter is a function.");

        var systemQueryOptions = "";

        if (select != null || expand != null) {
            systemQueryOptions = "?";
            if (select != null) {
                var selectString = "$select=" + select;
                if (expand != null) {
                    selectString = selectString + "," + expand;
                }
                systemQueryOptions = systemQueryOptions + selectString;
            }
            if (expand != null) {
                systemQueryOptions = systemQueryOptions + "&$expand=" + expand;
            }
        }


        var req = new XMLHttpRequest();
        req.open("GET", encodeURI(this.oDataPath() + type + "Set(guid'" + id + "')" + systemQueryOptions), flag);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.onreadystatechange = function () {
            if (this.readyState == 4 /* complete */) {
                req.onreadystatechange = null;
                if (this.status == 200) {
                    successCallback(JSON.parse(this.responseText, GSC.dateReviver).d);
                }
                else {
                    errorCallback(GSC.Common.errorHandler(this));
                }
            }
        };
        req.send();
    },
    
	updateRecord: function (id, object, type, flag, successCallback, errorCallback) {
        ///<summary>
        /// Sends an asynchronous request to update a record.
        ///</summary>
        ///<param name="id" type="String">
        /// A String representing the GUID value for the record to retrieve.
        ///</param>
        ///<param name="object" type="Object">
        /// A JavaScript object with properties corresponding to the Schema Names for
        /// entity attributes that are valid for update operations.
        ///</param>
        ///<param name="type" type="String">
        /// The Schema Name of the Entity type record to retrieve.
        /// For an Account record, use "Account"
        ///</param>
        ///<param name="successCallback" type="Function">
        /// The function that will be passed through and be called by a successful response. 
        /// Nothing will be returned to this function.
        /// </param>
        ///<param name="errorCallback" type="Function">
        /// The function that will be passed through and be called by a failed response. 
        /// This function must accept an Error object as a parameter.
        /// </param>
        this.stringParameterCheck(id, "GSC.updateRecord requires the id parameter.");
        this.parameterCheck(object, "GSC.updateRecord requires the object parameter.");
        this.stringParameterCheck(type, "GSC.updateRecord requires the type parameter.");
        this.callbackParameterCheck(successCallback, "GSC.updateRecord requires the successCallback is a function.");
        this.callbackParameterCheck(errorCallback, "GSC.updateRecord requires the errorCallback is a function.");
        var req = new XMLHttpRequest();

        req.open("POST", encodeURI(this.oDataPath() + type + "Set(guid'" + id + "')"), flag);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("X-HTTP-Method", "MERGE");
        req.onreadystatechange = function () {
            if (this.readyState == 4 /* complete */) {
                req.onreadystatechange = null;
                if (this.status == 204 || this.status == 1223) {
                    successCallback();
                }
                else {
                    errorCallback(GSC.errorHandler(this));
                }
            }
        };
        req.send(JSON.stringify(object));
    },
    
	retrieveMultipleRecords: function (type, options, flag, successCallback, errorCallback, OnComplete) {

        this.stringParameterCheck(type, "GSC.retrieveMultipleRecords requires the type parameter is a string.");
        if (options != null)
            this.stringParameterCheck(options, "GSC.retrieveMultipleRecords requires the options parameter is a string.");
        this.callbackParameterCheck(successCallback, "GSC.retrieveMultipleRecords requires the successCallback parameter is a function.");
        this.callbackParameterCheck(errorCallback, "GSC.retrieveMultipleRecords requires the errorCallback parameter is a function.");
        this.callbackParameterCheck(OnComplete, "GSC.retrieveMultipleRecords requires the OnComplete parameter is a function.");

        var optionsString;
        if (options != null) {
            if (options.charAt(0) != "?") {
                optionsString = "?" + options;
            }
            else { optionsString = options; }
        }
        var req = new XMLHttpRequest();
        req.open("GET", this.oDataPath() + type + "Set" + optionsString, flag);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.onreadystatechange = function () {
            if (this.readyState == 4 /* complete */) {
                req.onreadystatechange = null;
                if (this.status == 200) {
                    var returned = JSON.parse(this.responseText, GSC.dateReviver).d;
                    successCallback(returned.results);
                    if (returned.__next != null) {
                        var queryOptions = returned.__next.substring((GSC.Common.oDataPath() + type + "Set").length);
                        GSC.Common.retrieveMultipleRecords(type, queryOptions, flag, successCallback, errorCallback, OnComplete);
                    }
                    else { OnComplete(); }
                }
                else {
                    errorCallback(GSC.Common.errorHandler(this));
                }
            }
        };
        req.send();
    },
    
	openWindow: function (url, title, width, height, leftPosition, topPosition) {

        var actualLeftPosition = (window.screen.width / 2) - ((width / 2) + leftPosition);
        var actualTopPosition = (window.screen.height / 2) - ((height / 2) + topPosition);

        window.open(url, title,
        "status=no,height=" + height + ",width=" + width + ",resizable=yes,left="
        + leftPosition + ",top=" + topPosition + ",screenX=" + actualLeftPosition + ",screenY="
        + actualTopPosition + ",toolbar=no,menubar=no,scrollbars=yes");
    },

    __namespace: true
};
