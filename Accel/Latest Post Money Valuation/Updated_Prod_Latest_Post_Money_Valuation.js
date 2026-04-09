/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search', 'N/file', 'N/encode', 'N/format', 'N/url', 'N/config'],
    function (serverWidget, search, file, encode, format, url, config) {

        function onRequest(context) {
            try {
                var seriesArr = getAccountSeriesList();
                log.debug('seriesArr', seriesArr)
                var bpn_Data = {}, investeeArr = [], seriesNameArr = [], closingDateArr = [], postMoneyArr = [], investee, closingDate, seriesName, postMoney;
                if (context.request.method == 'GET') {
                    var form = serverWidget.createForm({ title: 'Portco Report', hideNavBar: false });
                    form.addSubmitButton({ label: 'Export To Excel' });
                    var reportDate = getDate();
                    var reportDateObj = parseAndFormatDateString(getDate())
                    reportDateObj = reportDateObj[0];
                    var reportDateTime = reportDateObj.getTime();
                    var sublist = form.addSublist({ id: 'custpage_sublist', label: '.', type: serverWidget.SublistType.LIST });
                    sublist.addField({ id: 'custpage_recordid', label: 'Record Id', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_investee', label: 'Investee', type: serverWidget.FieldType.SELECT, source: 'customrecord_acc_investee' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
                    sublist.addField({ id: 'custpage_investeestatus', label: 'Investee Status', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_base_currency', label: 'Base Currency', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_project_manager', label: 'Project Manager', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_registration_no', label: 'Registration No', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_ssn_for_us_co', label: 'SSN (for US Co)', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_web_address', label: 'Web address', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_investee_sector', label: 'sector', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_investee_subsector', label: 'Sub sector', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_investee_onelinedes', label: 'One Line Description', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_investee_incorporated', label: 'Incorporated In', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_investee_auditors', label: 'Auditor', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_investee_legalcounsel', label: 'Legal counsel', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_investee_initialstage', label: 'Intial stage', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_investee_role', label: 'role', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_investee_datecompanyfound', label: 'Date Company founded', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_investee_stealth', label: 'Stealth', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_investee_stealth_frmdt', label: 'Stealth (From Date)', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_investee_stealth_todt', label: 'Stealth (To Date)', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_investee_demat', label: 'Shares Held In', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_seriesname', label: 'Series Name', type: serverWidget.FieldType.SELECT, source: 'customrecord_acc_series_names_list' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
                    sublist.addField({ id: 'custpage_closingdate', label: 'Closing Date', type: serverWidget.FieldType.TEXT });
                    sublist.addField({ id: 'custpage_postmoney', label: 'Post Money', type: serverWidget.FieldType.TEXT });
                    var investeeObjArray = getBPNsearchResult()
                    investeeObjArray = getTermsheetsearchResult(investeeObjArray)
                    investeeObjArray = getSeriesWihtoutTermsheetsearchResult(investeeObjArray)
                    var ibsCompleteObj = {};
                    var closingDate, recordType, closingDateObj, closingDateTime, timediff, smallDiff, investee, investeeStatus, investeeText, seriesName, seriesType, seriesTypeText, seriesNameText, postMoney, recordId, baseCurrency, projectManager, registrationNo, ssnUs, logo, webAddress, sector, subSector,
                        description, incorporated, auditors, legalCounsel, initialStage, role, dateCompanyFounded, stealth, stealthFrom, stealthTo, sharesHeldIn;
                    for (line in investeeObjArray) {
                        var investee = investeeObjArray[line].investee;
                        if (investeeObjArray[line].recordType == "Bridge_Promissory_Note") {
                            var index = seriesArr.seriesName.indexOf(investeeObjArray[line].seriesName)
                            investeeObjArray[line].seriesType = seriesArr.seriesType[index]
                        }
                        var ibsLineObject = {
                            investee: investeeObjArray[line].investee,
                            investeeText: investeeObjArray[line].investeeText,
                            seriesName: investeeObjArray[line].seriesName,
                            seriesNameText: investeeObjArray[line].seriesNameText,
                            seriesType: investeeObjArray[line].seriesType,
                            seriesTypeText: investeeObjArray[line].seriesTypeText,
                            closingDate: investeeObjArray[line].closingDate,
                            postMoney: investeeObjArray[line].postMoney,
                            recordId: investeeObjArray[line].recordId,
                            recordType: investeeObjArray[line].recordType,
                            investeeStatus: investeeObjArray[line].investeeStatus,
                            baseCurrency: investeeObjArray[line].baseCurrency,
                            projectManager: investeeObjArray[line].projectManager,
                            registrationNo: investeeObjArray[line].registrationNo,
                            ssnUs: investeeObjArray[line].ssnUs,
                            logo: investeeObjArray[line].logo,
                            webAddress: investeeObjArray[line].webAddress,
                            sector: investeeObjArray[line].sector,
                            subSector: investeeObjArray[line].subSector,
                            description: investeeObjArray[line].description,
                            incorporated: investeeObjArray[line].incorporated,
                            auditors: investeeObjArray[line].auditors,
                            legalCounsel: investeeObjArray[line].legalCounsel,
                            initialStage: investeeObjArray[line].initialStage,
                            role: investeeObjArray[line].role,
                            dateCompanyFounded: investeeObjArray[line].dateCompanyFounded,
                            stealth: investeeObjArray[line].stealth,
                            stealthFrom: investeeObjArray[line].stealthFrom,
                            stealthTo: investeeObjArray[line].stealthTo,
                            sharesHeldIn: investeeObjArray[line].sharesHeldIn,
                        };
                        var a_temp = ibsCompleteObj[investee];
                        if (a_temp) {
                            a_temp.push(ibsLineObject);
                            ibsCompleteObj[investee] = a_temp;
                        } else {
                            ibsCompleteObj[investee] = [ibsLineObject];
                        }
                    }

                    var irkey = Object.keys(ibsCompleteObj);
                    var finalArray = [],
                        finalObj = {};
                    var a = [];
                    if (irkey.length > 0) {
                        for (var t = 0; t < irkey.length; t++) {
                            var oneIRdata = ibsCompleteObj[irkey[t]];
                            timediff = '', smallDiff = '';
                            a.push(oneIRdata[0].investeeText)
                            for (var n = 0; n < oneIRdata.length; n++) {
                                closingDate = oneIRdata[n].closingDate;
                                closingDateObj = parseAndFormatDateString(closingDate)
                                closingDateObj = closingDateObj[0];
                                closingDateTime = closingDateObj.getTime();
                                if (closingDateTime <= reportDateTime) {
                                    timediff = Math.abs(reportDateTime - closingDateTime)
                                    investee = oneIRdata[n].investee;
                                    investeeText = oneIRdata[n].investeeText;
                                    seriesName = oneIRdata[n].seriesName;
                                    seriesNameText = oneIRdata[n].seriesNameText;
                                    seriesType = oneIRdata[n].seriesType;
                                    seriesTypeText = oneIRdata[n].seriesTypeText;
                                    postMoney = oneIRdata[n].postMoney;
                                    recordId = oneIRdata[n].recordId;
                                    recordType = oneIRdata[n].recordType;
                                    investeeStatus = oneIRdata[n].investeeStatus;
                                    baseCurrency = oneIRdata[n].baseCurrency;
                                    projectManager = oneIRdata[n].projectManager;
                                    registrationNo = oneIRdata[n].registrationNo;
                                    ssnUs = oneIRdata[n].ssnUs;
                                    logo = oneIRdata[n].logo;
                                    webAddress = oneIRdata[n].webAddress;
                                    sector = oneIRdata[n].sector;
                                    subSector = oneIRdata[n].subSector;
                                    description = oneIRdata[n].description;
                                    incorporated = oneIRdata[n].incorporated;
                                    auditors = oneIRdata[n].auditors;
                                    legalCounsel = oneIRdata[n].legalCounsel;
                                    initialStage = oneIRdata[n].initialStage;
                                    role = oneIRdata[n].role;
                                    dateCompanyFounded = oneIRdata[n].dateCompanyFounded;
                                    stealth = oneIRdata[n].stealth;
                                    stealthFrom = oneIRdata[n].stealthFrom;
                                    stealthTo = oneIRdata[n].stealthTo;
                                    sharesHeldIn = oneIRdata[n].sharesHeldIn;
                                    if (n == 0) {
                                        smallDiff = timediff;
                                        finalObj.investee = "";
                                        finalObj.recordId = "";
                                        finalObj.closingDate = "";
                                        finalObj.investeeText = "";
                                        finalObj.seriesName = "";
                                        finalObj.seriesNameText = "";
                                        finalObj.postMoney = "";
                                        finalObj.seriesType = "";
                                        finalObj.seriesTypeText = "";
                                        finalObj.investee = investee;
                                        finalObj.closingDate = closingDate;
                                        finalObj.investeeText = investeeText;
                                        finalObj.seriesName = seriesName;
                                        finalObj.seriesNameText = seriesNameText;
                                        finalObj.postMoney = postMoney;
                                        finalObj.recordId = recordId;
                                        finalObj.recordType = recordType;
                                        finalObj.seriesTypeText = seriesTypeText;
                                        finalObj.seriesType = seriesType;
                                        finalObj.investeeStatus = investeeStatus;
                                        finalObj.baseCurrency = baseCurrency;
                                        finalObj.projectManager = projectManager;
                                        finalObj.registrationNo = registrationNo;
                                        finalObj.ssnUs = ssnUs;
                                        finalObj.logo = logo;
                                        finalObj.webAddress = webAddress;
                                        finalObj.sector = sector;
                                        finalObj.subSector = subSector;
                                        finalObj.description = description;
                                        finalObj.incorporated = incorporated;
                                        finalObj.auditors = auditors;
                                        finalObj.legalCounsel = legalCounsel;
                                        finalObj.initialStage = initialStage;
                                        finalObj.role = role;
                                        finalObj.dateCompanyFounded = dateCompanyFounded;
                                        finalObj.stealth = stealth;
                                        finalObj.stealthFrom = stealthFrom;
                                        finalObj.stealthTo = stealthTo;
                                        finalObj.sharesHeldIn = sharesHeldIn;

                                    } else if (timediff == smallDiff) {
                                        if (seriesType == "1") {
                                            finalObj.investee = "";
                                            finalObj.recordId = "";
                                            finalObj.closingDate = "";
                                            finalObj.investeeText = "";
                                            finalObj.seriesName = "";
                                            finalObj.seriesNameText = "";
                                            finalObj.postMoney = "";
                                            finalObj.seriesType = "";
                                            finalObj.seriesTypeText = "";
                                            smallDiff = timediff;
                                            finalObj.investee = investee;
                                            finalObj.investeeText = investeeText;
                                            finalObj.closingDate = closingDate;
                                            finalObj.seriesName = seriesName;
                                            finalObj.seriesNameText = seriesNameText;
                                            finalObj.postMoney = postMoney;
                                            finalObj.recordId = recordId;
                                            finalObj.recordType = recordType;
                                            finalObj.seriesTypeText = seriesTypeText;
                                            finalObj.seriesType = seriesType;
                                            finalObj.investeeStatus = investeeStatus;
                                            finalObj.baseCurrency = baseCurrency;
                                            finalObj.projectManager = projectManager;
                                            finalObj.registrationNo = registrationNo;
                                            finalObj.ssnUs = ssnUs;
                                            finalObj.logo = logo;
                                            finalObj.webAddress = webAddress;
                                            finalObj.sector = sector;
                                            finalObj.subSector = subSector;
                                            finalObj.description = description;
                                            finalObj.incorporated = incorporated;
                                            finalObj.auditors = auditors;
                                            finalObj.legalCounsel = legalCounsel;
                                            finalObj.initialStage = initialStage;
                                            finalObj.role = role;
                                            finalObj.dateCompanyFounded = dateCompanyFounded;
                                            finalObj.stealth = stealth;
                                            finalObj.stealthFrom = stealthFrom;
                                            finalObj.stealthTo = stealthTo;
                                            finalObj.sharesHeldIn = sharesHeldIn;

                                        }
                                    } else {
                                        if (timediff < smallDiff) {
                                            smallDiff = timediff;
                                            finalObj.investee = "";
                                            finalObj.recordId = "";
                                            finalObj.closingDate = "";
                                            finalObj.investeeText = "";
                                            finalObj.seriesName = "";
                                            finalObj.seriesNameText = "";
                                            finalObj.postMoney = "";
                                            finalObj.seriesType = "";
                                            finalObj.seriesTypeText = "";
                                            finalObj.investee = investee;
                                            finalObj.investeeText = investeeText;
                                            finalObj.closingDate = closingDate;
                                            finalObj.seriesName = seriesName;
                                            finalObj.seriesNameText = seriesNameText;
                                            finalObj.postMoney = postMoney;
                                            finalObj.recordId = recordId;
                                            finalObj.recordType = recordType;
                                            finalObj.seriesTypeText = seriesTypeText;
                                            finalObj.seriesType = seriesType;
                                            finalObj.investeeStatus = investeeStatus;
                                            finalObj.baseCurrency = baseCurrency;
                                            finalObj.projectManager = projectManager;
                                            finalObj.registrationNo = registrationNo;
                                            finalObj.ssnUs = ssnUs;
                                            finalObj.logo = logo;
                                            finalObj.webAddress = webAddress;
                                            finalObj.sector = sector;
                                            finalObj.subSector = subSector;
                                            finalObj.description = description;
                                            finalObj.incorporated = incorporated;
                                            finalObj.auditors = auditors;
                                            finalObj.legalCounsel = legalCounsel;
                                            finalObj.initialStage = initialStage;
                                            finalObj.role = role;
                                            finalObj.dateCompanyFounded = dateCompanyFounded;
                                            finalObj.stealth = stealth;
                                            finalObj.stealthFrom = stealthFrom;
                                            finalObj.stealthTo = stealthTo;
                                            finalObj.sharesHeldIn = sharesHeldIn;

                                        }
                                    }
                                }
                            }

                            if (finalObj.investee) sublist.setSublistValue({ id: 'custpage_investee', line: t, value: finalObj.investee });
                            if (finalObj.closingDate) sublist.setSublistValue({ id: 'custpage_closingdate', line: t, value: finalObj.closingDate });
                            if (finalObj.postMoney) sublist.setSublistValue({ id: 'custpage_postmoney', line: t, value: formatINR((finalObj.postMoney).split('.')[0]) });
                            if (finalObj.seriesName) sublist.setSublistValue({ id: 'custpage_seriesname', line: t, value: finalObj.seriesName });
                            if (finalObj.investeeStatus) sublist.setSublistValue({ id: 'custpage_investeestatus', line: t, value: finalObj.investeeStatus });
                            if (finalObj.baseCurrency) sublist.setSublistValue({ id: 'custpage_base_currency', line: t, value: finalObj.baseCurrency });
                            if (finalObj.projectManager) sublist.setSublistValue({ id: 'custpage_project_manager', line: t, value: finalObj.projectManager });
                            if (finalObj.registrationNo) sublist.setSublistValue({ id: 'custpage_registration_no', line: t, value: finalObj.registrationNo });
                            if (finalObj.ssnUs) sublist.setSublistValue({ id: 'custpage_ssn_for_us_co', line: t, value: finalObj.ssnUs });
                            if (finalObj.webAddress) sublist.setSublistValue({ id: 'custpage_web_address', line: t, value: finalObj.webAddress });
                            if (finalObj.sector) sublist.setSublistValue({ id: 'custpage_investee_sector', line: t, value: finalObj.sector });
                            if (finalObj.subSector) sublist.setSublistValue({ id: 'custpage_investee_subsector', line: t, value: finalObj.subSector });
                            if (finalObj.description) sublist.setSublistValue({ id: 'custpage_investee_onelinedes', line: t, value: finalObj.description });
                            if (finalObj.incorporated) sublist.setSublistValue({ id: 'custpage_investee_incorporated', line: t, value: finalObj.incorporated });
                            if (finalObj.auditors) sublist.setSublistValue({ id: 'custpage_investee_auditors', line: t, value: finalObj.auditors });
                            if (finalObj.legalCounsel) sublist.setSublistValue({ id: 'custpage_investee_legalcounsel', line: t, value: finalObj.legalCounsel });
                            if (finalObj.initialStage) sublist.setSublistValue({ id: 'custpage_investee_initialstage', line: t, value: finalObj.initialStage });
                            if (finalObj.role) sublist.setSublistValue({ id: 'custpage_investee_role', line: t, value: finalObj.role });
                            if (finalObj.dateCompanyFounded) sublist.setSublistValue({ id: 'custpage_investee_datecompanyfound', line: t, value: finalObj.dateCompanyFounded });
                            if (finalObj.stealth) sublist.setSublistValue({ id: 'custpage_investee_stealth', line: t, value: finalObj.stealth });
                            if (finalObj.stealthFrom) sublist.setSublistValue({ id: 'custpage_investee_stealth_frmdt', line: t, value: finalObj.stealthFrom });
                            if (finalObj.stealthTo) sublist.setSublistValue({ id: 'custpage_investee_stealth_todt', line: t, value: finalObj.stealthTo });
                            if (finalObj.sharesHeldIn) sublist.setSublistValue({ id: 'custpage_investee_demat', line: t, value: finalObj.sharesHeldIn });
                            if (finalObj.recordType == "Bridge_Promissory_Note")
                                var recordTypeURL = 'customrecord_acc_promissorynotes';
                            if (finalObj.recordType == "Termsheet")
                                var recordTypeURL = 'customrecord_acc_termsheet';
                            if (finalObj.recordType == "Series_Without_Termsheet")
                                var recordTypeURL = 'customrecord_acc_initial_incorporation';
                            if (finalObj.recordId) {
                                var output = url.resolveRecord({ recordType: recordTypeURL, recordId: finalObj.recordId, isEditMode: false });
                                var netsuiteurl = 'https://5095851-sb1.app.netsuite.com';
                                var finalUrl = netsuiteurl + output;
                                sublist.setSublistValue({ id: 'custpage_recordid', line: t, value: '<a href=' + finalUrl + '>' + finalObj.recordId + '</a>' });
                            }

                        }
                    }
                    context.response.writePage(form);
                } else {
                    var seriesArr = getAccountSeriesList()
                    var reportDate = getDate();
                    if (reportDate) {
                        var reportDateObj = parseAndFormatDateString(reportDate)
                        reportDateObj = reportDateObj[0]
                        var reportDateTime = reportDateObj.getTime();
                        var investeeObjArray = getBPNsearchResult()
                        investeeObjArray = getTermsheetsearchResult(investeeObjArray)
                        investeeObjArray = getSeriesWihtoutTermsheetsearchResult(investeeObjArray)
                        var smallDiff;
                        var hardHeaders = ["Record Id", "Investee", "Investee Status", "Base Currency", "ProjectManager", "Registration No", "SSN (For US CO)", "Web Address", "Sector", "Sub Sector",
                            "Description", "Incorporated In", "Auditors", "Legal Counsel", "Initial Stage", "Role", "Date Company Founded", "Stealth", "Stealth From", "Stealth To", "Share Held In" , "Series Name", "Closing Date", "Post Money",];
                        var CSVData = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
                        CSVData += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
                        CSVData += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
                        CSVData += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
                        CSVData += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
                        CSVData += 'xmlns:html="http://www.w3.org/TR/REC-html40">';
                        CSVData += '<Styles>';
                        CSVData += '<Style ss:ID="s1">';
                        CSVData += '<Font ss:Bold="1" ss:Underline="Single"/>';
                        CSVData += '<Interior ss:Color="#CCFFFF" ss:Pattern="Solid"/>';
                        CSVData += ' <Borders>';
                        CSVData += ' <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
                        CSVData += '</Borders>';
                        CSVData += '</Style>';
                        CSVData += '</Styles>';
                        CSVData += '<Worksheet ss:Name="Report">';
                        CSVData += '<Table><Row>';
                        for (var k = 0; k < hardHeaders.length; k++) {
                            CSVData += '<Cell ss:StyleID="s1"><Data ss:Type="String">' + hardHeaders[k] + '</Data></Cell>';
                        }
                        CSVData += '</Row>';
                        var ibsCompleteObj = {}
                        var closingDate, recordType, closingDateObj, closingDateTime, timediff, smallDiff, investee, investeeStatus, investeeText, seriesName, seriesType, seriesTypeText, seriesNameText, postMoney, recordId, baseCurrency, projectManager, registrationNo, ssnUs, logo, webAddress, sector, subSector,
                            description, incorporated, auditors, legalCounsel, initialStage, role, dateCompanyFounded, stealth, stealthFrom, stealthTo, sharesHeldIn;
                        for (line in investeeObjArray) {
                            var investee = investeeObjArray[line].investee;
                            if (investeeObjArray[line].recordType == "Bridge_Promissory_Note") {
                                var index = seriesArr.seriesName.indexOf(investeeObjArray[line].seriesName)
                                investeeObjArray[line].seriesType = seriesArr.seriesType[index]
                            }
                            var ibsLineObject = {
                                investee: investeeObjArray[line].investee,
                                investeeText: investeeObjArray[line].investeeText,
                                seriesName: investeeObjArray[line].seriesName,
                                seriesNameText: investeeObjArray[line].seriesNameText,
                                seriesType: investeeObjArray[line].seriesType,
                                seriesTypeText: investeeObjArray[line].seriesTypeText,
                                closingDate: investeeObjArray[line].closingDate,
                                postMoney: investeeObjArray[line].postMoney,
                                recordId: investeeObjArray[line].recordId,
                                recordType: investeeObjArray[line].recordType,
                                investeeStatus: investeeObjArray[line].investeeStatus,
                                baseCurrency: investeeObjArray[line].baseCurrency,
                                projectManager: investeeObjArray[line].projectManager,
                                registrationNo: investeeObjArray[line].registrationNo,
                                ssnUs: investeeObjArray[line].ssnUs,
                                logo: investeeObjArray[line].logo,
                                webAddress: investeeObjArray[line].webAddress,
                                sector: investeeObjArray[line].sector,
                                subSector: investeeObjArray[line].subSector,
                                description: investeeObjArray[line].description,
                                incorporated: investeeObjArray[line].incorporated,
                                auditors: investeeObjArray[line].auditors,
                                legalCounsel: investeeObjArray[line].legalCounsel,
                                initialStage: investeeObjArray[line].initialStage,
                                role: investeeObjArray[line].role,
                                dateCompanyFounded: investeeObjArray[line].dateCompanyFounded,
                                stealth: investeeObjArray[line].stealth,
                                stealthFrom: investeeObjArray[line].stealthFrom,
                                stealthTo: investeeObjArray[line].stealthTo,
                                sharesHeldIn: investeeObjArray[line].sharesHeldIn,
                            };
                            var a_temp = ibsCompleteObj[investee];
                            if (a_temp) {
                                a_temp.push(ibsLineObject);
                                ibsCompleteObj[investee] = a_temp;
                            } else {
                                ibsCompleteObj[investee] = [ibsLineObject];
                            }
                        }
                        var irkey = Object.keys(ibsCompleteObj);
                        var finalArray = [],
                            finalObj = {};

                        var a = [];
                        if (irkey.length > 0) {
                            for (var t = 0; t < irkey.length; t++) {
                                var oneIRdata = ibsCompleteObj[irkey[t]];
                                timediff = '', smallDiff = '';
                                a.push(oneIRdata[0].investeeText)
                                for (var n = 0; n < oneIRdata.length; n++) {
                                    closingDate = oneIRdata[n].closingDate;
                                    closingDateObj = parseAndFormatDateString(closingDate)
                                    closingDateObj = closingDateObj[0];
                                    closingDateTime = closingDateObj.getTime();
                                    if (closingDateTime <= reportDateTime) {
                                        timediff = Math.abs(reportDateTime - closingDateTime)
                                        investee = oneIRdata[n].investee;
                                        investeeText = oneIRdata[n].investeeText;
                                        seriesName = oneIRdata[n].seriesName;
                                        seriesNameText = oneIRdata[n].seriesNameText;
                                        postMoney = oneIRdata[n].postMoney;
                                        recordId = oneIRdata[n].recordId;
                                        recordType = oneIRdata[n].recordType;
                                        seriesTypeText = oneIRdata[n].seriesTypeText;
                                        seriesType = oneIRdata[n].seriesType;
                                        investeeStatus = oneIRdata[n].investeeStatus;
                                        baseCurrency = oneIRdata[n].baseCurrency;
                                        projectManager = oneIRdata[n].projectManager;
                                        registrationNo = oneIRdata[n].registrationNo;
                                        ssnUs = oneIRdata[n].ssnUs;
                                        logo = oneIRdata[n].logo;
                                        webAddress = oneIRdata[n].webAddress;
                                        sector = oneIRdata[n].sector;
                                        subSector = oneIRdata[n].subSector;
                                        description = oneIRdata[n].description;
                                        incorporated = oneIRdata[n].incorporated;
                                        auditors = oneIRdata[n].auditors;
                                        legalCounsel = oneIRdata[n].legalCounsel;
                                        initialStage = oneIRdata[n].initialStage;
                                        role = oneIRdata[n].role;
                                        dateCompanyFounded = oneIRdata[n].dateCompanyFounded;
                                        stealth = oneIRdata[n].stealth;
                                        stealthFrom = oneIRdata[n].stealthFrom;
                                        stealthTo = oneIRdata[n].stealthTo;
                                        sharesHeldIn = oneIRdata[n].sharesHeldIn;

                                        if (n == 0) {
                                            smallDiff = timediff;
                                            finalObj.investee = "";
                                            finalObj.recordId = "";
                                            finalObj.closingDate = "";
                                            finalObj.investeeText = "";
                                            finalObj.seriesName = "";
                                            finalObj.seriesNameText = "";
                                            finalObj.postMoney = "";
                                            finalObj.seriesType = "";
                                            finalObj.seriesTypeText = "";
                                            finalObj.investee = investee;
                                            finalObj.closingDate = closingDate;
                                            finalObj.investeeText = investeeText;
                                            finalObj.seriesName = seriesName;
                                            finalObj.seriesNameText = seriesNameText;
                                            finalObj.seriesType = seriesType;
                                            finalObj.seriesTypeText = seriesTypeText;
                                            finalObj.postMoney = postMoney;
                                            finalObj.recordId = recordId;
                                            finalObj.recordType = recordType;
                                            finalObj.investeeStatus = investeeStatus;
                                            finalObj.baseCurrency = baseCurrency;
                                            finalObj.projectManager = projectManager;
                                            finalObj.registrationNo = registrationNo;
                                            finalObj.ssnUs = ssnUs;
                                            finalObj.logo = logo;
                                            finalObj.webAddress = webAddress;
                                            finalObj.sector = sector;
                                            finalObj.subSector = subSector;
                                            finalObj.description = description;
                                            finalObj.incorporated = incorporated;
                                            finalObj.auditors = auditors;
                                            finalObj.legalCounsel = legalCounsel;
                                            finalObj.initialStage = initialStage;
                                            finalObj.role = role;
                                            finalObj.dateCompanyFounded = dateCompanyFounded;
                                            finalObj.stealth = stealth;
                                            finalObj.stealthFrom = stealthFrom;
                                            finalObj.stealthTo = stealthTo;
                                            finalObj.sharesHeldIn = sharesHeldIn;

                                        } else if (timediff == smallDiff) {
                                            if (seriesType == 1) {
                                                smallDiff = timediff;
                                                finalObj.investee = "";
                                                finalObj.recordId = "";
                                                finalObj.closingDate = "";
                                                finalObj.investeeText = "";
                                                finalObj.seriesName = "";
                                                finalObj.seriesNameText = "";
                                                finalObj.postMoney = "";
                                                finalObj.seriesType = "";
                                                finalObj.seriesTypeText = "";
                                                finalObj.investee = investee;
                                                finalObj.investeeText = investeeText;
                                                finalObj.closingDate = closingDate;
                                                finalObj.seriesName = seriesName;
                                                finalObj.seriesNameText = seriesNameText;
                                                finalObj.seriesType = seriesType;
                                                finalObj.seriesTypeText = seriesTypeText;
                                                finalObj.postMoney = postMoney;
                                                finalObj.recordId = recordId;
                                                finalObj.recordType = recordType;
                                                finalObj.investeeStatus = investeeStatus;
                                                finalObj.baseCurrency = baseCurrency;
                                                finalObj.projectManager = projectManager;
                                                finalObj.registrationNo = registrationNo;
                                                finalObj.ssnUs = ssnUs;
                                                finalObj.logo = logo;
                                                finalObj.webAddress = webAddress;
                                                finalObj.sector = sector;
                                                finalObj.subSector = subSector;
                                                finalObj.description = description;
                                                finalObj.incorporated = incorporated;
                                                finalObj.auditors = auditors;
                                                finalObj.legalCounsel = legalCounsel;
                                                finalObj.initialStage = initialStage;
                                                finalObj.role = role;
                                                finalObj.dateCompanyFounded = dateCompanyFounded;
                                                finalObj.stealth = stealth;
                                                finalObj.stealthFrom = stealthFrom;
                                                finalObj.stealthTo = stealthTo;
                                                finalObj.sharesHeldIn = sharesHeldIn;

                                            }
                                        } else {
                                            if (timediff < smallDiff) {
                                                smallDiff = timediff;
                                                finalObj.investee = "";
                                                finalObj.recordId = "";
                                                finalObj.closingDate = "";
                                                finalObj.investeeText = "";
                                                finalObj.seriesName = "";
                                                finalObj.seriesNameText = "";
                                                finalObj.postMoney = "";
                                                finalObj.seriesType = "";
                                                finalObj.seriesTypeText = "";
                                                finalObj.investee = investee;
                                                finalObj.investeeText = investeeText;
                                                finalObj.closingDate = closingDate;
                                                finalObj.seriesName = seriesName;
                                                finalObj.seriesNameText = seriesNameText;
                                                finalObj.seriesType = seriesType;
                                                finalObj.seriesTypeText = seriesTypeText;
                                                finalObj.postMoney = postMoney;
                                                finalObj.recordId = recordId;
                                                finalObj.recordType = recordType;
                                                finalObj.investeeStatus = investeeStatus;
                                                finalObj.baseCurrency = baseCurrency;
                                                finalObj.projectManager = projectManager;
                                                finalObj.registrationNo = registrationNo;
                                                finalObj.ssnUs = ssnUs;
                                                finalObj.logo = logo;
                                                finalObj.webAddress = webAddress;
                                                finalObj.sector = sector;
                                                finalObj.subSector = subSector;
                                                finalObj.description = description;
                                                finalObj.incorporated = incorporated;
                                                finalObj.auditors = auditors;
                                                finalObj.legalCounsel = legalCounsel;
                                                finalObj.initialStage = initialStage;
                                                finalObj.role = role;
                                                finalObj.dateCompanyFounded = dateCompanyFounded;
                                                finalObj.stealth = stealth;
                                                finalObj.stealthFrom = stealthFrom;
                                                finalObj.stealthTo = stealthTo;
                                                finalObj.sharesHeldIn = sharesHeldIn;

                                            }
                                        }
                                    }
                                }
                                CSVData += '<Row>';
                                CSVData += '<Cell><Data ss:Type="Number">' + finalObj.recordId + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.investeeText + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.investeeStatus + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.baseCurrency + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.projectManager + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.registrationNo + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.ssnUs + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.webAddress + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.sector + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.subSector + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.description + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.incorporated + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.auditors + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.legalCounsel + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.initialStage + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.role + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.dateCompanyFounded + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.stealth + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.stealthFrom + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.stealthTo + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.sharesHeldIn + '</Data></Cell>';
                                CSVData += '<Cell><Data ss:Type="String">' + finalObj.seriesNameText + '</Data></Cell>';
	                            CSVData += '<Cell><Data ss:Type="String">' + finalObj.closingDate + '</Data></Cell>';
	                            CSVData += '<Cell><Data ss:Type="String">' + finalObj.postMoney + '</Data></Cell>';
                                CSVData += '</Row>';
                            }
                        }
                        CSVData += '</Table></Worksheet></Workbook>';
                        // log.debug('CSVData', CSVData);

                        var base64EncodedString = encode.convert({
                            string: CSVData,
                            inputEncoding: encode.Encoding.UTF_8,
                            outputEncoding: encode.Encoding.BASE_64
                        });

                        var file_obj = file.create({
                            name: 'Portco_Report.xls',
                            fileType: file.Type.EXCEL,
                            contents: base64EncodedString,
                            description: 'Excel file',
                            folder: 1143
                        });
                        fileId = file_obj.save();
                        context.response.writeFile({
                            file: file_obj
                        })
                    } else {
                        context.response.write("PLease Enter Report Date")
                    }
                }

            } catch (error) {
                log.debug('Error in On Request', error)
            }

        }

        function getAccountSeriesList() {
            try {
                let seriesType = [], seriesName = [], seriesArr = {}, seriesTypeText = [], seriesNameText = [];
                var customrecord_acc_series_names_listSearchObj = search.create({
                    type: "customrecord_acc_series_names_list",
                    filters: [],
                    columns: [
                        search.createColumn({ name: "name", sort: search.Sort.ASC, label: "Name" }),
                        search.createColumn({ name: "id", label: "ID" }),
                        search.createColumn({ name: "custrecord_acc_snlist_series_type", label: "Series Type" })
                    ]
                });
                var searchResultCount = customrecord_acc_series_names_listSearchObj.runPaged().count;
                if (searchResultCount > 0) {
                    customrecord_acc_series_names_listSearchObj.run().each(function (result) {
                        seriesTypeText.push(result.getText({ name: 'custrecord_acc_snlist_series_type' })),
                            seriesType.push(result.getValue({ name: 'custrecord_acc_snlist_series_type' })),
                            seriesName.push(result.getValue({ name: 'id' })),
                            seriesNameText.push(result.getText({ name: 'id' }))
                        return true;
                    });
                    seriesArr.seriesType = seriesType;
                    seriesArr.seriesName = seriesName;
                    seriesArr.seriesTypeText = seriesTypeText;
                    seriesArr.seriesNameText = seriesNameText;
                    return seriesArr;
                }
                else {
                    return null;
                }
            } catch (error) {
                log.debug('Error in getAccountSeriesList', error)
            }

        }

        function getBPNsearchResult() {
            try {
                var investee = '', investeeText = '', investeeStatus = '', baseCurrency = '', projectManager = '', registrationNo = '', ssnUs = '', logo = '', webAddress = '', sector = '', subSector = '',
                    description = '', incorporated = '', auditors = '', legalCounsel = '', initialStage = '', role = '', dateCompanyFounded = '', stealth = '', stealthFrom = '', stealthTo = '',
                    sharesHeldIn = '', closingDate = '', seriesName = '', seriesNameText = '', postMoney = '', recordId = '', seriesType = '', seriesTypeText = '';

                var bpnSearch = search.create({
                    type: "customrecord_acc_promissorynotes",
                    filters: [
                        ["custrecord_acc_br_postmoney_val_usd", "greaterthan", "0.00"],
                        "AND",
                        ["custrecord_acc_linked_investordetails_br.custrecord_accbridge_closingdate", "isnotempty", ""]

                    ],
                    columns: [
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        search.createColumn({ name: "custrecord_acc_bridge_promissorynote_inv", sort: search.Sort.ASC, label: "Investee" }),
                        search.createColumn({ name: "custrecord_acc_investee_status", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Investee Status" }),
                        search.createColumn({ name: "custrecord_acc_investee_base_currncy", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Base Currency" }),
                        search.createColumn({ name: "custrecord_acc_investee_project_manager", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Project Manager" }),
                        search.createColumn({ name: "custrecord_acc_innvestee_registration_no", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Registration Number" }),
                        search.createColumn({ name: "custrecord_acc_ssn_for_us_co", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "SSN (for US Co)" }),
                        search.createColumn({ name: "custrecord_acc_investee_logo", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Logo" }),
                        search.createColumn({ name: "custrecord_acc_web_address", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Web Address" }),
                        search.createColumn({ name: "custrecord_acc_investee_sector", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Sector" }),
                        search.createColumn({ name: "custrecord_acc_investee_subsector", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Sub Sector" }),
                        search.createColumn({ name: "custrecord_acc_investee_onelinedes", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "One-Line Description" }),
                        search.createColumn({ name: "custrecord_acc_investee_incorporated", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Incorporated in" }),
                        search.createColumn({ name: "custrecord_acc_investee_auditors", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Auditors" }),
                        search.createColumn({ name: "custrecord_acc_investee_legalcounsel", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Legal Counsel" }),
                        search.createColumn({ name: "custrecord_acc_investee_initialstage", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Initial Stage" }),
                        search.createColumn({ name: "custrecord_acc_investee_role", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Role" }),
                        search.createColumn({ name: "custrecord_acc_investee_datecompanyfound", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Date Company Founded" }),
                        search.createColumn({ name: "custrecord_acc_investee_stealth", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Stealth" }),
                        search.createColumn({ name: "custrecord_acc_investee_stealth_frmdt", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Stealth From Date" }),
                        search.createColumn({ name: "custrecord_acc_investee_stealth_todt", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Stealth To Date" }),
                        search.createColumn({ name: "custrecord_acc_investee_demat", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV", label: "Shares held in" }),
                        search.createColumn({ name: "custrecord_accbridge_closingdate", join: "CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR", label: "Closing Date" }),
                        search.createColumn({ name: "custrecord_acc_bridge_originalseries", join: "CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR", label: "Original Series" }),
                        search.createColumn({ name: "custrecord_acc_br_postmoney_val_usd", label: "POST MONEY VALUATION (USD)" }),
                    ]
                });
                var resultIndexBpn = 0;
                var resultStepBpn = 1000;
                var recentDate, investeeObjArray = [], investeeObj = {}, recordType;
                do {
                    var bpnsearchResult = bpnSearch.run().getRange({ start: resultIndexBpn, end: resultIndexBpn + resultStepBpn });
                    if (bpnsearchResult.length > 0) {
                        for (i in bpnsearchResult) {
                            investee = bpnsearchResult[i].getValue({ name: 'custrecord_acc_bridge_promissorynote_inv' });
                            investeeText = bpnsearchResult[i].getText({ name: 'custrecord_acc_bridge_promissorynote_inv' });
                            investeeStatus = bpnsearchResult[i].getText({ name: "custrecord_acc_investee_status", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            baseCurrency = bpnsearchResult[i].getText({ name: "custrecord_acc_investee_base_currncy", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            projectManager = bpnsearchResult[i].getText({ name: "custrecord_acc_investee_project_manager", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            registrationNo = bpnsearchResult[i].getValue({ name: "custrecord_acc_innvestee_registration_no", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            ssnUs = bpnsearchResult[i].getValue({ name: "custrecord_acc_ssn_for_us_co", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            logo = bpnsearchResult[i].getValue({ name: "custrecord_acc_investee_logo", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            webAddress = bpnsearchResult[i].getValue({ name: "custrecord_acc_web_address", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            sector = bpnsearchResult[i].getText({ name: "custrecord_acc_investee_sector", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            subSector = bpnsearchResult[i].getText({ name: "custrecord_acc_investee_subsector", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            description = bpnsearchResult[i].getValue({ name: "custrecord_acc_investee_onelinedes", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            incorporated = bpnsearchResult[i].getText({ name: "custrecord_acc_investee_incorporated", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            auditors = bpnsearchResult[i].getText({ name: "custrecord_acc_investee_auditors", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            legalCounsel = bpnsearchResult[i].getText({ name: "custrecord_acc_investee_legalcounsel", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            initialStage = bpnsearchResult[i].getText({ name: "custrecord_acc_investee_initialstage", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            role = bpnsearchResult[i].getText({ name: "custrecord_acc_investee_role", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            dateCompanyFounded = bpnsearchResult[i].getValue({ name: "custrecord_acc_investee_datecompanyfound", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            stealth = bpnsearchResult[i].getText({ name: "custrecord_acc_investee_stealth", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            stealthFrom = bpnsearchResult[i].getValue({ name: "custrecord_acc_investee_stealth_frmdt", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            stealthTo = bpnsearchResult[i].getValue({ name: "custrecord_acc_investee_stealth_todt", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            sharesHeldIn = bpnsearchResult[i].getText({ name: "custrecord_acc_investee_demat", join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV" });
                            closingDate = bpnsearchResult[i].getValue({ name: 'custrecord_accbridge_closingdate', join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR' });
                            seriesName = bpnsearchResult[i].getValue({ name: 'custrecord_acc_bridge_originalseries', join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR' });
                            seriesNameText = bpnsearchResult[i].getText({ name: 'custrecord_acc_bridge_originalseries', join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR' });
                            postMoney = bpnsearchResult[i].getValue({ name: "custrecord_acc_br_postmoney_val_usd" });
                            recordId = bpnsearchResult[i].getValue('internalid');
                            recordType = "Bridge_Promissory_Note";
                            investeeObj = {
                                'investee': investee, 'investeeText': investeeText, 'investeeStatus': investeeStatus, 'baseCurrency': baseCurrency, 'projectManager': projectManager,
                                'registrationNo': registrationNo, 'ssnUs': ssnUs, 'logo': logo, 'webAddress': webAddress, 'sector': sector, 'subSector': subSector, 'description': description,
                                'incorporated': incorporated, 'auditors': auditors, 'legalCounsel': legalCounsel, 'initialStage': initialStage, 'role': role, 'dateCompanyFounded': dateCompanyFounded,
                                'stealth': stealth, 'stealthFrom': stealthFrom, 'stealthTo': stealthTo, 'sharesHeldIn': sharesHeldIn, 'closingDate': closingDate, 'seriesName': seriesName,
                                'seriesNameText': seriesNameText, 'seriesType': seriesType, 'seriesTypeText': seriesTypeText, 'postMoney': postMoney, 'recordId': recordId, 'recordType': recordType,
                            };
                            investeeObjArray.push(investeeObj)
                        }
                    }
                    resultIndexBpn = resultIndexBpn + resultStepBpn;
                } while (bpnsearchResult.length !== 0);

                return investeeObjArray;


            } catch (error) {
                log.debug('Error in getBPNsearchResult', error)
            }
        }

        function getTermsheetsearchResult(investeeObjArray) {
            try {
                var investee = '', investeeText = '', investeeStatus = '', baseCurrency = '', projectManager = '', registrationNo = '', ssnUs = '', logo = '', webAddress = '', sector = '', subSector = '',
                    description = '', incorporated = '', auditors = '', legalCounsel = '', initialStage = '', role = '', dateCompanyFounded = '', stealth = '', stealthFrom = '', stealthTo = '',
                    sharesHeldIn = '', closingDate = '', seriesName = '', seriesNameText = '', postMoney = '', recordId = '', seriesType = '', seriesTypeText = '', recordType = 'Termsheet';;

                var trmshtSearch = search.create({
                    type: "customrecord_acc_termsheet",
                    filters: [
                        ["custrecord_termsheetstatus", "anyof", "2"], "AND", ["custrecord_acc_ts_postmoney_valution_usd", "greaterthan", "0.00"], "AND", ["custrecord_acc_invest_termsheet.custrecord_acc_investment_closing_dt", "isnotempty", ""]
                    ],
                    columns: [
                        search.createColumn({ name: "custrecord_acc_companyname", label: "Name of the Company" }),
                        search.createColumn({ name: "custrecord_acc_investee_status", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Investee Status" }),
                        search.createColumn({ name: "custrecord_acc_investee_base_currncy", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Base Currency" }),
                        search.createColumn({ name: "custrecord_acc_investee_project_manager", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Project Manager" }),
                        search.createColumn({ name: "custrecord_acc_innvestee_registration_no", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Registration Number" }),
                        search.createColumn({ name: "custrecord_acc_ssn_for_us_co", join: "CUSTRECORD_ACC_COMPANYNAME", label: "SSN (for US Co)" }),
                        search.createColumn({ name: "custrecord_acc_investee_logo", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Logo" }),
                        search.createColumn({ name: "custrecord_acc_web_address", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Web Address" }),
                        search.createColumn({ name: "custrecord_acc_investee_sector", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Sector" }),
                        search.createColumn({ name: "custrecord_acc_investee_subsector", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Sub Sector" }),
                        search.createColumn({ name: "custrecord_acc_investee_onelinedes", join: "CUSTRECORD_ACC_COMPANYNAME", label: "One-Line Description" }),
                        search.createColumn({ name: "custrecord_acc_investee_incorporated", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Incorporated in" }),
                        search.createColumn({ name: "custrecord_acc_investee_auditors", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Auditors" }),
                        search.createColumn({ name: "custrecord_acc_investee_legalcounsel", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Legal Counsel" }),
                        search.createColumn({ name: "custrecord_acc_investee_initialstage", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Initial Stage" }),
                        search.createColumn({ name: "custrecord_acc_investee_role", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Role" }),
                        search.createColumn({ name: "custrecord_acc_investee_datecompanyfound", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Date Company Founded" }),
                        search.createColumn({ name: "custrecord_acc_investee_stealth", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Stealth" }),
                        search.createColumn({ name: "custrecord_acc_investee_stealth_frmdt", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Stealth From Date" }),
                        search.createColumn({ name: "custrecord_acc_investee_stealth_todt", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Stealth To Date" }),
                        search.createColumn({ name: "custrecord_acc_investee_demat", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Shares held in" }),
                        search.createColumn({ name: "custrecord_acc_investment_closing_dt", join: "CUSTRECORD_ACC_INVEST_TERMSHEET", label: "Closing Date" }),
                        search.createColumn({ name: "custrecord_acc_termsheet_entrseriesname", label: "Series Name" }),
                        search.createColumn({ name: "custrecord_acc_investment_seriestype", join: "CUSTRECORD_ACC_INVEST_TERMSHEET", label: "Series Name" }),
                        search.createColumn({ name: "custrecord_acc_ts_postmoney_valution_usd", label: "Post-Money Capitalization (USD)" }),
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                    ]
                });

                var resultIndexBpn = 0;
                var resultStepBpn = 1000;
                var recentDate, investeeObj = {},
                    recordType;
                do {
                    var trmshtsearchResult = trmshtSearch.run().getRange({
                        start: resultIndexBpn,
                        end: resultIndexBpn + resultStepBpn
                    });
                    if (trmshtsearchResult.length > 0) {
                        for (i in trmshtsearchResult) {
                            investee = trmshtsearchResult[i].getValue({ name: 'custrecord_acc_companyname' });
                            investeeText = trmshtsearchResult[i].getText({ name: 'custrecord_acc_companyname' });
                            investeeStatus = trmshtsearchResult[i].getText({ name: "custrecord_acc_investee_status", join: "CUSTRECORD_ACC_COMPANYNAME", label: "Investee Status" });
                            baseCurrency = trmshtsearchResult[i].getText({ name: "custrecord_acc_investee_base_currncy", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            projectManager = trmshtsearchResult[i].getText({ name: "custrecord_acc_investee_project_manager", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            registrationNo = trmshtsearchResult[i].getValue({ name: "custrecord_acc_innvestee_registration_no", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            ssnUs = trmshtsearchResult[i].getValue({ name: "custrecord_acc_ssn_for_us_co", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            logo = trmshtsearchResult[i].getValue({ name: "custrecord_acc_investee_logo", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            webAddress = trmshtsearchResult[i].getValue({ name: "custrecord_acc_web_address", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            sector = trmshtsearchResult[i].getText({ name: "custrecord_acc_investee_sector", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            subSector = trmshtsearchResult[i].getText({ name: "custrecord_acc_investee_subsector", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            description = trmshtsearchResult[i].getValue({ name: "custrecord_acc_investee_onelinedes", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            incorporated = trmshtsearchResult[i].getText({ name: "custrecord_acc_investee_incorporated", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            auditors = trmshtsearchResult[i].getText({ name: "custrecord_acc_investee_auditors", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            legalCounsel = trmshtsearchResult[i].getText({ name: "custrecord_acc_investee_legalcounsel", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            initialStage = trmshtsearchResult[i].getText({ name: "custrecord_acc_investee_initialstage", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            role = trmshtsearchResult[i].getText({ name: "custrecord_acc_investee_role", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            dateCompanyFounded = trmshtsearchResult[i].getValue({ name: "custrecord_acc_investee_datecompanyfound", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            stealth = trmshtsearchResult[i].getText({ name: "custrecord_acc_investee_stealth", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            stealthFrom = trmshtsearchResult[i].getValue({ name: "custrecord_acc_investee_stealth_frmdt", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            stealthTo = trmshtsearchResult[i].getValue({ name: "custrecord_acc_investee_stealth_todt", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            sharesHeldIn = trmshtsearchResult[i].getText({ name: "custrecord_acc_investee_demat", join: "CUSTRECORD_ACC_COMPANYNAME" });
                            closingDate = trmshtsearchResult[i].getValue({ name: 'custrecord_acc_investment_closing_dt', join: 'CUSTRECORD_ACC_INVEST_TERMSHEET' });
                            seriesName = trmshtsearchResult[i].getValue({ name: "custrecord_acc_termsheet_entrseriesname", });
                            seriesNameText = trmshtsearchResult[i].getText({ name: "custrecord_acc_termsheet_entrseriesname", });
                            seriesType = trmshtsearchResult[i].getValue({ name: 'custrecord_acc_investment_seriestype', join: 'CUSTRECORD_ACC_INVEST_TERMSHEET' });
                            seriesTypeText = trmshtsearchResult[i].getText({ name: 'custrecord_acc_investment_seriestype', join: 'CUSTRECORD_ACC_INVEST_TERMSHEET' });
                            postMoney = trmshtsearchResult[i].getValue({ name: "custrecord_acc_ts_postmoney_valution_usd" });
                            recordId = trmshtsearchResult[i].getValue('internalid'); recordType = "Termsheet"

                            investeeObj = {
                                'investee': investee, 'investeeText': investeeText, 'investeeStatus': investeeStatus, 'baseCurrency': baseCurrency, 'projectManager': projectManager,
                                'registrationNo': registrationNo, 'ssnUs': ssnUs, 'logo': logo, 'webAddress': webAddress, 'sector': sector, 'subSector': subSector, 'description': description,
                                'incorporated': incorporated, 'auditors': auditors, 'legalCounsel': legalCounsel, 'initialStage': initialStage, 'role': role, 'dateCompanyFounded': dateCompanyFounded,
                                'stealth': stealth, 'stealthFrom': stealthFrom, 'stealthTo': stealthTo, 'sharesHeldIn': sharesHeldIn, 'closingDate': closingDate, 'seriesName': seriesName,
                                'seriesNameText': seriesNameText, 'seriesType': seriesType, 'seriesTypeText': seriesTypeText, 'postMoney': postMoney, 'recordId': recordId, 'recordType': recordType,
                            };
                            investeeObjArray.push(investeeObj)
                        }
                    }
                    resultIndexBpn = resultIndexBpn + resultStepBpn;
                } while (trmshtsearchResult.length !== 0);

                return investeeObjArray


            } catch (error) {
                log.debug('Error in getTermsheetsearchResult', error)
            }

        }

        function getSeriesWihtoutTermsheetsearchResult(investeeObjArray) {
            try {
                var investee = '', investeeText = '', investeeStatus = '', baseCurrency = '', projectManager = '', registrationNo = '', ssnUs = '', logo = '', webAddress = '', sector = '', subSector = '',
                    description = '', incorporated = '', auditors = '', legalCounsel = '', initialStage = '', role = '', dateCompanyFounded = '', stealth = '', stealthFrom = '', stealthTo = '',
                    sharesHeldIn = '', closingDate = '', seriesName = '', seriesNameText = '', postMoney = '', recordId = '', seriesType = '', seriesTypeText = '', recordType = "Series_Without_Termsheet";


                var serieswihtouttrmshtSearch = search.create({
                    type: "customrecord_acc_initial_incorporation",
                    filters: [["custrecord_acc_swots_postmoney_value_usd", "greaterthan", "0.00"], "AND", ["custrecord_acc_linked_nonts_investor.custrecord_acc_nonts_closing_date", "isnotempty", ""]],
                    columns: [
                        search.createColumn({ name: "custrecord_acc_com_investee", label: "Investee" }),
                        search.createColumn({ name: "custrecord_acc_investee_status", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Investee Status" }),
                        search.createColumn({ name: "custrecord_acc_investee_base_currncy", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Base Currency" }),
                        search.createColumn({ name: "custrecord_acc_investee_project_manager", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Project Manager" }),
                        search.createColumn({ name: "custrecord_acc_innvestee_registration_no", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Registration Number" }),
                        search.createColumn({ name: "custrecord_acc_ssn_for_us_co", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "SSN (for US Co)" }),
                        search.createColumn({ name: "custrecord_acc_investee_logo", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Logo" }),
                        search.createColumn({ name: "custrecord_acc_web_address", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Web Address" }),
                        search.createColumn({ name: "custrecord_acc_investee_sector", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Sector" }),
                        search.createColumn({ name: "custrecord_acc_investee_subsector", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Sub Sector" }),
                        search.createColumn({ name: "custrecord_acc_investee_onelinedes", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "One-Line Description" }),
                        search.createColumn({ name: "custrecord_acc_investee_incorporated", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Incorporated in" }),
                        search.createColumn({ name: "custrecord_acc_investee_auditors", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Auditors" }),
                        search.createColumn({ name: "custrecord_acc_investee_legalcounsel", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Legal Counsel" }),
                        search.createColumn({ name: "custrecord_acc_investee_initialstage", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Initial Stage" }),
                        search.createColumn({ name: "custrecord_acc_investee_role", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Role" }),
                        search.createColumn({ name: "custrecord_acc_investee_datecompanyfound", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Date Company Founded" }),
                        search.createColumn({ name: "custrecord_acc_investee_stealth", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Stealth" }),
                        search.createColumn({ name: "custrecord_acc_investee_stealth_frmdt", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Stealth From Date" }),
                        search.createColumn({ name: "custrecord_acc_investee_stealth_todt", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Stealth To Date" }),
                        search.createColumn({ name: "custrecord_acc_investee_demat", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Shares held in" }),
                        search.createColumn({ name: "custrecord_acc_nonts_closing_date", join: "CUSTRECORD_ACC_LINKED_NONTS_INVESTOR", label: "Investment Closing Date" }),
                        search.createColumn({ name: "custrecord_acc_swots_postmoney_value_usd", label: "Post-Money Valuation (USD)" }),
                        search.createColumn({ name: "custrecord_acc_commonsharestype", join: "CUSTRECORD_ACC_LINKED_NONTS_INVESTOR", label: "Series Name" }),
                        search.createColumn({ name: "custrecord_accinitialcommseriestype", join: "CUSTRECORD_ACC_LINKED_NONTS_INVESTOR", label: "Series Name" }),
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                    ]
                });
                var investeeStatus = '';
                var resultIndexBpn = 0;
                var resultStepBpn = 1000;
                var recentDate, recordType, investeeObj = {}, investeeObjDetail = [];
                do {
                    var serieswihtouttrmshtSearchResult = serieswihtouttrmshtSearch.run().getRange({ start: resultIndexBpn, end: resultIndexBpn + resultStepBpn });
                    if (serieswihtouttrmshtSearchResult.length > 0) {
                        for (i in serieswihtouttrmshtSearchResult) {
                            investee = serieswihtouttrmshtSearchResult[i].getValue({ name: 'custrecord_acc_com_investee' });
                            investeeText = serieswihtouttrmshtSearchResult[i].getText({ name: 'custrecord_acc_com_investee' });
                            investeeStatus = serieswihtouttrmshtSearchResult[i].getText({ name: "custrecord_acc_investee_status", join: "CUSTRECORD_ACC_COM_INVESTEE", label: "Investee Status" });
                            baseCurrency = serieswihtouttrmshtSearchResult[i].getText({ name: "custrecord_acc_investee_base_currncy", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            projectManager = serieswihtouttrmshtSearchResult[i].getText({ name: "custrecord_acc_investee_project_manager", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            registrationNo = serieswihtouttrmshtSearchResult[i].getValue({ name: "custrecord_acc_innvestee_registration_no", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            ssnUs = serieswihtouttrmshtSearchResult[i].getValue({ name: "custrecord_acc_ssn_for_us_co", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            logo = serieswihtouttrmshtSearchResult[i].getValue({ name: "custrecord_acc_investee_logo", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            webAddress = serieswihtouttrmshtSearchResult[i].getValue({ name: "custrecord_acc_web_address", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            sector = serieswihtouttrmshtSearchResult[i].getText({ name: "custrecord_acc_investee_sector", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            subSector = serieswihtouttrmshtSearchResult[i].getText({ name: "custrecord_acc_investee_subsector", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            description = serieswihtouttrmshtSearchResult[i].getValue({ name: "custrecord_acc_investee_onelinedes", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            incorporated = serieswihtouttrmshtSearchResult[i].getText({ name: "custrecord_acc_investee_incorporated", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            auditors = serieswihtouttrmshtSearchResult[i].getText({ name: "custrecord_acc_investee_auditors", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            legalCounsel = serieswihtouttrmshtSearchResult[i].getText({ name: "custrecord_acc_investee_legalcounsel", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            initialStage = serieswihtouttrmshtSearchResult[i].getText({ name: "custrecord_acc_investee_initialstage", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            role = serieswihtouttrmshtSearchResult[i].getText({ name: "custrecord_acc_investee_role", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            dateCompanyFounded = serieswihtouttrmshtSearchResult[i].getValue({ name: "custrecord_acc_investee_datecompanyfound", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            stealth = serieswihtouttrmshtSearchResult[i].getText({ name: "custrecord_acc_investee_stealth", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            stealthFrom = serieswihtouttrmshtSearchResult[i].getValue({ name: "custrecord_acc_investee_stealth_frmdt", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            stealthTo = serieswihtouttrmshtSearchResult[i].getValue({ name: "custrecord_acc_investee_stealth_todt", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            sharesHeldIn = serieswihtouttrmshtSearchResult[i].getText({ name: "custrecord_acc_investee_demat", join: "CUSTRECORD_ACC_COM_INVESTEE" });
                            closingDate = serieswihtouttrmshtSearchResult[i].getValue({ name: 'custrecord_acc_nonts_closing_date', join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR' });
                            seriesName = serieswihtouttrmshtSearchResult[i].getValue({ name: 'custrecord_acc_commonsharestype', join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR' });
                            seriesNameText = serieswihtouttrmshtSearchResult[i].getText({ name: 'custrecord_acc_commonsharestype', join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR' });
                            seriesType = serieswihtouttrmshtSearchResult[i].getValue({ name: 'custrecord_accinitialcommseriestype', join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR' });
                            seriesTypeText = serieswihtouttrmshtSearchResult[i].getText({ name: 'custrecord_accinitialcommseriestype', join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR' });
                            postMoney = serieswihtouttrmshtSearchResult[i].getValue({ name: "custrecord_acc_swots_postmoney_value_usd" });
                            recordId = serieswihtouttrmshtSearchResult[i].getValue('internalid');
                            investeeObj = {
                                'investee': investee, 'investeeText': investeeText, 'investeeStatus': investeeStatus, 'baseCurrency': baseCurrency, 'projectManager': projectManager,
                                'registrationNo': registrationNo, 'ssnUs': ssnUs, 'logo': logo, 'webAddress': webAddress, 'sector': sector, 'subSector': subSector, description: description,
                                'incorporated': incorporated, 'auditors': auditors, 'legalCounsel': legalCounsel, 'initialStage': initialStage, 'role': role, 'dateCompanyFounded': dateCompanyFounded,
                                'stealth': stealth, 'stealthFrom': stealthFrom, 'stealthTo': stealthTo, 'sharesHeldIn': sharesHeldIn, 'closingDate': closingDate, 'seriesName': seriesName,
                                'seriesNameText': seriesNameText, 'seriesType': seriesType, 'seriesTypeText': seriesTypeText, 'postMoney': postMoney, 'recordId': recordId, 'recordType': recordType,
                            };
                            investeeObjArray.push(investeeObj)
                        }
                    }
                    resultIndexBpn = resultIndexBpn + resultStepBpn;
                } while (serieswihtouttrmshtSearchResult.length !== 0);
                return investeeObjArray;

            } catch (error) {
                log.debug('Error in getSeriesWihtoutTermsheetsearchResult', error)
            }

        }

        function _logValidation(value) {
            if (value != 'null' && value != '' && value != undefined && value != 'NaN') {
                return true;
            } else {
                return false;
            }
        }

        function _nullValidation(val) {
            if (val == null || val == undefined || val == '' || val.toString() == "undefined" || val.toString() == "NaN" || val.toString() == "null") {
                return true;
            } else {
                return false;
            }
        }

        function getDate() {
            var dateObj = new Date();
            dateObj = getCompanyDate()
            var d_invodate = dateObj.getDate();
            var d_invomonth = dateObj.getMonth();
            d_invomonth = Number(d_invomonth) + Number(1);
            if (d_invomonth < 10)
                d_invomonth = '0' + d_invomonth;
            var d_invoyear = dateObj.getFullYear();
            var dateN = d_invomonth + '/' + d_invodate + '/' + d_invoyear;
            return dateN;
        }

        function getCompanyDate() {
            var currentDateTime = new Date();
            var companyTimeZone = config.load({
                type: config.Type.COMPANY_INFORMATION
            }).getText({
                fieldId: 'timezone'
            });
            // var companyTimeZone = nlapiLoadConfiguration('companyinformation').getFieldText('timezone');
            var timeZoneOffSet = (companyTimeZone.indexOf('(GMT)') == 0) ? 0 : new Number(companyTimeZone.substr(4, 6).replace(/\+|:00/gi, '').replace(/:30/gi, '.5'));
            var UTC = currentDateTime.getTime() + (currentDateTime.getTimezoneOffset() * 60000);
            var companyDateTime = UTC + (timeZoneOffSet * 60 * 60 * 1000);
            return new Date(companyDateTime);
        }

        function parseAndFormatDateString(initialFormattedDateString) {
            // Assume Date format is MM/DD/YYYY
            // var initialFormattedDateString = "07/28/2015";
            var parsedDateStringAsRawDateObject = format.parse({
                value: initialFormattedDateString,
                type: format.Type.DATE
            });
            var formattedDateString = format.format({
                value: parsedDateStringAsRawDateObject,
                type: format.Type.DATE
            });
            return [parsedDateStringAsRawDateObject, formattedDateString];
        }

        function formatINR(amount) {
            const formatter = new Intl.NumberFormat('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            return formatter.format(amount);
        }
        return {
            onRequest: onRequest
        }
    });