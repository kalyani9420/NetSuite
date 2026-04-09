	/**
	 * @NApiVersion 2.x
	 * @NScriptType Suitelet
	 * @NModuleScope SameAccount
	 */
	define(['N/ui/serverWidget', 'N/search', 'N/file', 'N/encode', 'N/format', 'N/url', 'N/config'],
	    function(serverWidget, search, file, encode, format, url, config) {
	        function getList() {
	            var seriesType = [],
	                seriesName = [],
	                seriesArr = {},
	                seriesTypeText = [],
	                seriesNameText = [];
	            var customrecord_acc_series_names_listSearchObj = search.create({
	                type: "customrecord_acc_series_names_list",
	                filters: [],
	                columns: [
	                    search.createColumn({
	                        name: "name",
	                        sort: search.Sort.ASC,
	                        label: "Name"
	                    }),
	                    search.createColumn({
	                        name: "id",
	                        label: "ID"
	                    }),
	                    search.createColumn({
	                        name: "custrecord_acc_snlist_series_type",
	                        label: "Series Type"
	                    })
	                ]
	            });
	            var searchResultCount = customrecord_acc_series_names_listSearchObj.runPaged().count;
	            customrecord_acc_series_names_listSearchObj.run().each(function(result) {
	                seriesTypeText.push(result.getText({
	                    name: 'custrecord_acc_snlist_series_type'
	                }))
	                seriesType.push(result.getValue({
	                    name: 'custrecord_acc_snlist_series_type'
	                }))
	                seriesName.push(result.getValue({
	                    name: 'id'
	                }))
	                seriesNameText.push(result.getText({
	                    name: 'id'
	                }))
	                return true;
	            });
	            seriesArr.seriesType = seriesType;
	            seriesArr.seriesName = seriesName;
	            seriesArr.seriesTypeText = seriesTypeText;
	            seriesArr.seriesNameText = seriesNameText;
	            return seriesArr;
	        }

	        function getBPNsearchResult() {
	            var investee = '';
	            var investeeText = '';
	            var closingDate = '';
	            var seriesName = '';
	            var seriesText = '';
	            var postMoney = '';
	            var recordId = '';
	            var seriesType = '';
	            var seriesTypeText = '';
	            var investeeStatus = '';

	            var bpnSearch = search.create({
	                type: "customrecord_acc_promissorynotes",
	                filters: [
	                    ["custrecord_acc_br_postmoney_val_usd", "greaterthan", "0.00"],
	                    "AND",
	                    ["custrecord_acc_linked_investordetails_br.custrecord_accbridge_closingdate", "isnotempty", ""]

	                ],
	                columns: [
	                    search.createColumn({
	                        name: "custrecord_acc_bridge_promissorynote_inv",
	                        sort: search.Sort.ASC,
	                        label: "Investee"
	                    }),
	                    search.createColumn({
	                        name: "custrecord_accbridge_closingdate",
	                        join: "CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR",
	                        label: "Closing Date"
	                    }),
	                    search.createColumn({
	                        name: "custrecord_acc_bridge_originalseries",
	                        join: "CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR",
	                        label: "Original Series"
	                    }),
	                    search.createColumn({
	                        name: "custrecord_acc_br_postmoney_val_usd",
	                        label: "POST MONEY VALUATION (USD)"
	                    }),
	                    search.createColumn({
	                        name: "internalid",
	                        label: "Internal ID"
	                    }),
	                    search.createColumn({
	                        name: "internalid",
	                        label: "Internal ID"
	                    }),
	                    search.createColumn({
	                        name: "custrecord_acc_investee_status",
	                        join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV",
	                        label: "Investee Status"
	                    })
	                ]
	            });
	            var resultIndexBpn = 0;
	            var resultStepBpn = 1000;
	            var recentDate, investeeObjArray = [],
	                investeeObj = {},
	                recordType;
	            do {
	                var bpnsearchResult = bpnSearch.run().getRange({
	                    start: resultIndexBpn,
	                    end: resultIndexBpn + resultStepBpn
	                });
	                if (bpnsearchResult.length > 0) {
	                    for (i in bpnsearchResult) {
	                        investee = bpnsearchResult[i].getValue({
	                            name: 'custrecord_acc_bridge_promissorynote_inv'
	                        });
	                        investeeText = bpnsearchResult[i].getText({
	                            name: 'custrecord_acc_bridge_promissorynote_inv'
	                        });
	                        closingDate = bpnsearchResult[i].getValue({
	                            name: 'custrecord_accbridge_closingdate',
	                            join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'
	                        });
	                        seriesName = bpnsearchResult[i].getValue({
	                            name: 'custrecord_acc_bridge_originalseries',
	                            join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'
	                        });
	                        seriesNameText = bpnsearchResult[i].getText({
	                            name: 'custrecord_acc_bridge_originalseries',
	                            join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'
	                        });
	                        postMoney = bpnsearchResult[i].getValue({
	                            name: "custrecord_acc_br_postmoney_val_usd"
	                        });
	                        recordId = bpnsearchResult[i].getValue('internalid');
	                        recordType = "Bridge_Promissory_Note";
	                        investeeStatus = bpnsearchResult[i].getText({
	                            name: "custrecord_acc_investee_status",
	                            join: "CUSTRECORD_ACC_BRIDGE_PROMISSORYNOTE_INV",
	                            label: "Investee Status"
	                        });
	                        log.debug('investeeStatus', investeeStatus);

	                        investeeObj = {
	                            'investee': investee,
	                            'investeeText': investeeText,
	                            'closingDate': closingDate,
	                            'seriesName': seriesName,
	                            'seriesNameText': seriesNameText,
	                            'seriesType': seriesType,
	                            'seriesTypeText': seriesTypeText,
	                            'postMoney': postMoney,
	                            'recordId': recordId,
	                            'recordType': recordType,
	                            'investeeStatus': investeeStatus

	                        };
	                        investeeObjArray.push(investeeObj)
	                    }
	                }
	                resultIndexBpn = resultIndexBpn + resultStepBpn;
	            } while (bpnsearchResult.length !== 0);

	            //log.debug('investeeObjArray',investeeObjArray);
	            return investeeObjArray;
	        }

	        function getTermsheetsearchResult(investeeObjArray) {
	            var investee = '';
	            var investeeText = '';
	            var closingDate = '';
	            var seriesName = '';
	            var seriesText = '';
	            var seriesType = '';
	            var seriesTypeText = '';
	            var postMoney = '';
	            var recordId = '';
	            var recordType = 'Termsheet';
	            var investeeStatus = '';

	            var trmshtSearch = search.create({
	                type: "customrecord_acc_termsheet",
	                filters: [
	                    ["custrecord_termsheetstatus", "anyof", "2"],
	                    "AND",
	                    ["custrecord_acc_ts_postmoney_valution_usd", "greaterthan", "0.00"],
	                    "AND",
	                    ["custrecord_acc_invest_termsheet.custrecord_acc_investment_closing_dt", "isnotempty", ""]
	                ],
	                columns: [
	                    search.createColumn({
	                        name: "custrecord_acc_companyname",
	                        label: "Name of the Company"
	                    }),
	                    search.createColumn({
	                        name: "custrecord_acc_investment_closing_dt",
	                        join: "CUSTRECORD_ACC_INVEST_TERMSHEET",
	                        label: "Closing Date"
	                    }),
	                    search.createColumn({
	                        name: "custrecord_acc_termsheet_entrseriesname",
	                        label: "Series Name"
	                    }),
	                    search.createColumn({
	                        name: "custrecord_acc_investment_seriestype",
	                        join: "CUSTRECORD_ACC_INVEST_TERMSHEET",
	                        label: "Series Name"
	                    }),
	                    search.createColumn({
	                        name: "custrecord_acc_ts_postmoney_valution_usd",
	                        label: "Post-Money Capitalization (USD)"
	                    }),
	                    search.createColumn({
	                        name: "internalid",
	                        label: "Internal ID"
	                    }),
	                    search.createColumn({
	                        name: "custrecord_acc_investee_status",
	                        join: "CUSTRECORD_ACC_COMPANYNAME",
	                        label: "Investee Status"
	                    })
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
	                        investee = trmshtsearchResult[i].getValue({
	                            name: 'custrecord_acc_companyname'
	                        });
	                        investeeText = trmshtsearchResult[i].getText({
	                            name: 'custrecord_acc_companyname'
	                        });
	                        closingDate = trmshtsearchResult[i].getValue({
	                            name: 'custrecord_acc_investment_closing_dt',
	                            join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'
	                        });
	                        seriesName = trmshtsearchResult[i].getValue({
	                           name: "custrecord_acc_termsheet_entrseriesname",
	                        });
	                        seriesNameText = trmshtsearchResult[i].getText({
								name: "custrecord_acc_termsheet_entrseriesname",
	                        });
	                        seriesType = trmshtsearchResult[i].getValue({
	                            name: 'custrecord_acc_investment_seriestype',
	                            join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'
	                        });
	                        seriesTypeText = trmshtsearchResult[i].getText({
	                            name: 'custrecord_acc_investment_seriestype',
	                            join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'
	                        });
	                        postMoney = trmshtsearchResult[i].getValue({
	                            name: "custrecord_acc_ts_postmoney_valution_usd"
	                        });
	                        recordId = trmshtsearchResult[i].getValue('internalid');
	                        recordType = "Termsheet"
	                        investeeStatus = trmshtsearchResult[i].getText({
	                            name: "custrecord_acc_investee_status",
	                            join: "CUSTRECORD_ACC_COMPANYNAME",
	                            label: "Investee Status"
	                        });
	                        investeeObj = {
	                            'investee': investee,
	                            'investeeText': investeeText,
	                            'closingDate': closingDate,
	                            'seriesName': seriesName,
	                            'seriesNameText': seriesNameText,
	                            'seriesType': seriesType,
	                            'seriesTypeText': seriesTypeText,
	                            'postMoney': postMoney,
	                            'recordId': recordId,
	                            'recordType': recordType,
	                            'investeeStatus': investeeStatus

	                        };
	                        investeeObjArray.push(investeeObj)
	                    }
	                }
	                resultIndexBpn = resultIndexBpn + resultStepBpn;
	            } while (trmshtsearchResult.length !== 0);

				log.debug('testlog investeeObj.length' , investeeObjArray.length)
				log.debug('testlog investeeObj.length' , investeeObjArray[2705])




	            return investeeObjArray
	        }

	        function getSeriesWihtoutTermsheetsearchResult(investeeObjArray) {

	            var serieswihtouttrmshtSearch = search.create({
	                type: "customrecord_acc_initial_incorporation",
	                filters: [
	                    ["custrecord_acc_swots_postmoney_value_usd", "greaterthan", "0.00"],
	                    "AND",
	                    ["custrecord_acc_linked_nonts_investor.custrecord_acc_nonts_closing_date", "isnotempty", ""]
	                ],
	                columns: [
	                    search.createColumn({
	                        name: "custrecord_acc_com_investee",
	                        label: "Investee"
	                    }),
	                    search.createColumn({
	                        name: "custrecord_acc_nonts_closing_date",
	                        join: "CUSTRECORD_ACC_LINKED_NONTS_INVESTOR",
	                        label: "Investment Closing Date"
	                    }),
	                    search.createColumn({
	                        name: "custrecord_acc_swots_postmoney_value_usd",
	                        label: "Post-Money Valuation (USD)"
	                    }),
	                    search.createColumn({
	                        name: "custrecord_acc_commonsharestype",
	                        join: "CUSTRECORD_ACC_LINKED_NONTS_INVESTOR",
	                        label: "Series Name"
	                    }),
	                    search.createColumn({
	                        name: "custrecord_accinitialcommseriestype",
	                        join: "CUSTRECORD_ACC_LINKED_NONTS_INVESTOR",
	                        label: "Series Name"
	                    }),
	                    search.createColumn({
	                        name: "internalid",
	                        label: "Internal ID"
	                    }),
	                    search.createColumn({
	                        name: "custrecord_acc_investee_status",
	                        join: "CUSTRECORD_ACC_COM_INVESTEE",
	                        label: "Investee Status"
	                    })
	                ]
	            });
	            var investeeStatus = '';
	            var resultIndexBpn = 0;
	            var resultStepBpn = 1000;
	            var recentDate, recordType, investeeObj = {},
	                investeeObjDetail = [],
	                investee, investeeText, seriesNameText, closingDate, seriesName, postMoney;
	            do {
	                var serieswihtouttrmshtSearchResult = serieswihtouttrmshtSearch.run().getRange({
	                    start: resultIndexBpn,
	                    end: resultIndexBpn + resultStepBpn
	                });
	                if (serieswihtouttrmshtSearchResult.length > 0) {
	                    for (i in serieswihtouttrmshtSearchResult) {
	                        investee = serieswihtouttrmshtSearchResult[i].getValue({
	                            name: 'custrecord_acc_com_investee'
	                        });
	                        investeeText = serieswihtouttrmshtSearchResult[i].getText({
	                            name: 'custrecord_acc_com_investee'
	                        });

	                        //log.debug('investee',investee+'investeeText'+investeeText);
	                        closingDate = serieswihtouttrmshtSearchResult[i].getValue({
	                            name: 'custrecord_acc_nonts_closing_date',
	                            join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'
	                        });
	                        seriesName = serieswihtouttrmshtSearchResult[i].getValue({
	                            name: 'custrecord_acc_commonsharestype',
	                            join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'
	                        });
	                        seriesNameText = serieswihtouttrmshtSearchResult[i].getText({
	                            name: 'custrecord_acc_commonsharestype',
	                            join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'
	                        });
	                        seriesType = serieswihtouttrmshtSearchResult[i].getValue({
	                            name: 'custrecord_accinitialcommseriestype',
	                            join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'
	                        });
	                        seriesTypeText = serieswihtouttrmshtSearchResult[i].getText({
	                            name: 'custrecord_accinitialcommseriestype',
	                            join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'
	                        });
	                        postMoney = serieswihtouttrmshtSearchResult[i].getValue({
	                            name: "custrecord_acc_swots_postmoney_value_usd"
	                        });
	                        recordId = serieswihtouttrmshtSearchResult[i].getValue('internalid');
	                        recordType = "Series_Without_Termsheet";
	                        investeeStatus = serieswihtouttrmshtSearchResult[i].getText({
	                            name: "custrecord_acc_investee_status",
	                            join: "CUSTRECORD_ACC_COM_INVESTEE",
	                            label: "Investee Status"
	                        });
	                        investeeObj = {
	                            'investee': investee,
	                            'investeeText': investeeText,
	                            'closingDate': closingDate,
	                            'seriesName': seriesName,
	                            'seriesNameText': seriesNameText,
	                            'seriesType': seriesType,
	                            'seriesTypeText': seriesTypeText,
	                            'postMoney': postMoney,
	                            'recordId': recordId,
	                            'recordType': recordType,
	                            'investeeStatus': investeeStatus

	                        };
	                        investeeObjArray.push(investeeObj)
	                    }
	                }
	                resultIndexBpn = resultIndexBpn + resultStepBpn;
	            } while (serieswihtouttrmshtSearchResult.length !== 0);
	            return investeeObjArray;
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
	            //var dateN = d_invodate + '/' + d_invomonth + '/' + d_invoyear;
	            var dateN = d_invomonth + '/' + d_invodate + '/' + d_invoyear;
	            log.debug('dateN ', dateN);
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
	            log.debug('companyDateTime ', companyDateTime);
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

	        function onRequest(context) {
	            var seriesArr = getList()
	            var bpn_Data = {},
	                investeeArr = [],
	                seriesNameArr = [],
	                closingDateArr = [],
	                postMoneyArr = [],
	                investee, closingDate, seriesName, postMoney;
	            if (context.request.method == 'GET') {
	                var form = serverWidget.createForm({
	                    title: 'Latest Post Money Valuation',
	                    hideNavBar: false
	                });
	                form.clientScriptModulePath = 'SuiteScripts/ACC_CLI_GetDate_trnsactnreprt2.js';
	                var reportDateField = form.addField({
	                    id: 'custpage_reportdate',
	                    label: 'Report Date',
	                    type: serverWidget.FieldType.DATE
	                });


	                form.addButton({
	                    id: 'custpage_show',
	                    label: 'Show',
	                    functionName: 'getReportDate()'
	                });

	                var cf = 1;

	                form.addSubmitButton({
	                    label: 'Export To Excel'
	                });

	                var reportDate = context.request.parameters.reportDate;
	                log.debug('reportDate ', reportDate);
	                //log.debug('responseDate ',responseDate);

	                if (reportDate) {
	                    reportDateField.defaultValue = reportDate;
	                    var reportDateObj = parseAndFormatDateString(reportDate)
	                    reportDateObj = reportDateObj[0]
	                    var reportDateTime = reportDateObj.getTime();
	                } else {
	                    reportDateField.defaultValue = getDate()
	                    var reportDateObj = parseAndFormatDateString(getDate())
	                    reportDateObj = reportDateObj[0];
	                    var reportDateTime = reportDateObj.getTime();
	                }

	                var sublist = form.addSublist({
	                    id: 'custpage_sublist',
	                    label: '.',
	                    type: serverWidget.SublistType.LIST
	                });
	                sublist.addField({
	                    id: 'custpage_recordid',
	                    label: 'Record Id',
	                    type: serverWidget.FieldType.TEXT
	                });
	                sublist.addField({
	                    id: 'custpage_investee',
	                    label: 'Investee',
	                    type: serverWidget.FieldType.SELECT,
	                    source: 'customrecord_acc_investee'
	                }).updateDisplayType({
	                    displayType: serverWidget.FieldDisplayType.INLINE
	                });
	                sublist.addField({
	                    id: 'custpage_investeestatus',
	                    label: 'Investee Status',
	                    type: serverWidget.FieldType.TEXT
	                });
	                sublist.addField({
	                    id: 'custpage_seriesname',
	                    label: 'Series Name',
	                    type: serverWidget.FieldType.SELECT,
	                    source: 'customrecord_acc_series_names_list'
	                }).updateDisplayType({
	                    displayType: serverWidget.FieldDisplayType.INLINE
	                });
	                sublist.addField({
	                    id: 'custpage_closingdate',
	                    label: 'Closing Date',
	                    type: serverWidget.FieldType.TEXT
	                });
	                sublist.addField({
	                    id: 'custpage_postmoney',
	                    label: 'Post Money',
	                    type: serverWidget.FieldType.TEXT
	                });
	                /*	sublist.addField({
						id: 'custpage_recordtype',
						label: 'Record Type',
						type: serverWidget.FieldType.TEXT
					}).updateDisplayType({
		                displayType: serverWidget.FieldDisplayType.NORMAL
		            }); */

	                /*	   sublist.addField({
						id: 'custpage_url',
						label: 'Record Id URL',
						type: serverWidget.FieldType.TEXT
					}).updateDisplayType({
		                displayType: serverWidget.FieldDisplayType.INLINE
		            }); */
	                var investeeObjArray = getBPNsearchResult()
	                investeeObjArray = getTermsheetsearchResult(investeeObjArray)
	                investeeObjArray = getSeriesWihtoutTermsheetsearchResult(investeeObjArray)
	                log.debug('investeeObjArray', investeeObjArray);
	                var smallDiff;
	                var closingDate, recordType, closingDateObj, ibsCompleteObj = {},
	                    closingDateTime, timediff, smallDiff, investee, investeeText, seriesName, seriesType, seriesTypeText, seriesNameText, postMoney, recordId;
	                for (line in investeeObjArray) {
	                    var investee = investeeObjArray[line].investee;
	                    //	log.debug('investeeObjArray[line].recordType',investeeObjArray[line].recordType);		

	                    if (investeeObjArray[line].recordType == "Bridge_Promissory_Note") {
	                        //log.debug('seriesName',investeeObjArray[line].seriesName);
	                        var index = seriesArr.seriesName.indexOf(investeeObjArray[line].seriesName)
	                        //log.debug('index',index);
	                        investeeObjArray[line].seriesType = seriesArr.seriesType[index]
	                        //log.debug('seriesType',investeeObjArray[line].seriesType);
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
	                        investeeStatus: investeeObjArray[line].investeeStatus

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
	                    //log.debug('reportDateTime',reportDateTime );
	                    for (var t = 0; t < irkey.length; t++) 
						{
	                        var oneIRdata = ibsCompleteObj[irkey[t]];
	                        timediff = '', smallDiff = '';
	                        a.push(oneIRdata[0].investeeText)
	                        //	log.debug('oneIRdata[n].investeeText',oneIRdata[0].investeeText);
	                        for (var n = 0; n < oneIRdata.length; n++) 
							{
	                            closingDate = oneIRdata[n].closingDate;
	                            closingDateObj = parseAndFormatDateString(closingDate)
	                            closingDateObj = closingDateObj[0];
	                            closingDateTime = closingDateObj.getTime();
								if(closingDateTime <=reportDateTime)
								{
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

									if (recordId == '89') {
										/*log.debug('seriesType',seriesType);
										log.debug('seriesNameText',seriesNameText);
										log.debug('seriesName',seriesName);
										log.debug('seriesTypeText',seriesTypeText);*/

									}

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

									} else if (timediff == smallDiff) {
										if (seriesType == "1") {
											//	log.debug('date match -record ID',recordId);
											if (recordId == '89') {
												/*log.debug('seriesType',seriesType);
												log.debug('seriesNameText',seriesNameText);
												log.debug('seriesName',seriesName);
												log.debug('seriesTypeText',seriesTypeText);*/

											}
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

										}
									}
								}
	                        }
	                        /*	if(finalObj.recordId)
	                        	sublist.setSublistValue({
	                        	    id : 'custpage_recordid',
	                        	    line : t,
	                        	    value : finalObj.recordId
	                        	});*/

	                        if (finalObj.investee)
	                            sublist.setSublistValue({
	                                id: 'custpage_investee',
	                                line: t,
	                                value: finalObj.investee
	                            });
	                        //	log.debug('finalObj.seriesName',finalObj.seriesName);
	                        if (finalObj.closingDate)
	                            sublist.setSublistValue({
	                                id: 'custpage_closingdate',
	                                line: t,
	                                value: finalObj.closingDate
	                            });
	                        if (finalObj.postMoney)
	                            sublist.setSublistValue({
	                                id: 'custpage_postmoney',
	                                line: t,
	                                value: (finalObj.postMoney).split('.')[0]
	                            });
	                        if (finalObj.seriesName)
	                            sublist.setSublistValue({
	                                id: 'custpage_seriesname',
	                                line: t,
	                                value: finalObj.seriesName
	                            });
	                        if (finalObj.investeeStatus)
	                            sublist.setSublistValue({
	                                id: 'custpage_investeestatus',
	                                line: t,
	                                value: finalObj.investeeStatus
	                            });

	                        /*		if(finalObj.recordType)
	                        	sublist.setSublistValue({
	                        	    id : 'custpage_recordtype',
	                        	    line : t,
	                        	    value : finalObj.recordType
	                        	}); */
	                        if (finalObj.recordType == "Bridge_Promissory_Note")
	                            var recordTypeURL = 'customrecord_acc_promissorynotes';
	                        if (finalObj.recordType == "Termsheet")
	                            var recordTypeURL = 'customrecord_acc_termsheet';
	                        if (finalObj.recordType == "Series_Without_Termsheet")
	                            var recordTypeURL = 'customrecord_acc_initial_incorporation';
	                        if (finalObj.recordId) {
	                            var output = url.resolveRecord({
	                                recordType: recordTypeURL,
	                                recordId: finalObj.recordId,
	                                isEditMode: false
	                            });
	                            var netsuiteurl = 'https://5095851-sb1.app.netsuite.com';
	                            var finalUrl = netsuiteurl + output;
	                            sublist.setSublistValue({
	                                id: 'custpage_recordid',
	                                line: t,
	                                value: '<a href=' + finalUrl + '>' + finalObj.recordId + '</a>'
	                            });
	                        }

	                    }
	                }
	                context.response.writePage(form);
	            } else {
	                var seriesArr = getList()
	                var reportDate = context.request.parameters.custpage_reportdate;
	                if (reportDate) 
					{
	                    var reportDateObj = parseAndFormatDateString(reportDate)
	                    reportDateObj = reportDateObj[0]
	                    log.debug('reportDateObj', reportDateObj);
	                    var reportDateTime = reportDateObj.getTime();
	                    var investeeObjArray = getBPNsearchResult()
	                    investeeObjArray = getTermsheetsearchResult(investeeObjArray)
	                    investeeObjArray = getSeriesWihtoutTermsheetsearchResult(investeeObjArray)
	                    log.debug('investeeObjArray ', investeeObjArray);
	                    var smallDiff;
	                    var hardHeaders = ["Record Id", "Investee", "investee Status", "Series Name", "Closing Date", "Post Money"];
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
	                    var closingDate, recordType, closingDateObj, ibsCompleteObj = {},
	                        closingDateTime, timediff, smallDiff, investee, investeeText, seriesName, seriesNameText, postMoney, recordId;
	                    for (line in investeeObjArray) {
	                        var investee = investeeObjArray[line].investee;
	                        if (investeeObjArray[line].recordType == "Bridge_Promissory_Note") {
	                            //log.debug('seriesName',investeeObjArray[line].seriesName);
	                            var index = seriesArr.seriesName.indexOf(investeeObjArray[line].seriesName)
	                            //log.debug('index',index);
	                            investeeObjArray[line].seriesType = seriesArr.seriesType[index]
	                            //log.debug('seriesType',investeeObjArray[line].seriesType);
	                        }
	                        var ibsLineObject = {
	                            investee: investeeObjArray[line].investee,
	                            investeeText: investeeObjArray[line].investeeText,
	                            seriesName: investeeObjArray[line].seriesName,
	                            seriesNameText: investeeObjArray[line].seriesNameText,
	                            closingDate: investeeObjArray[line].closingDate,
	                            postMoney: investeeObjArray[line].postMoney,
	                            recordId: investeeObjArray[line].recordId,
	                            recordType: investeeObjArray[line].recordType,
	                            seriesTypeText: investeeObjArray[line].seriesTypeText,
	                            seriesType: investeeObjArray[line].seriesType,
	                            investeeStatus: investeeObjArray[line].investeeStatus

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
	                    //log.debug('irkey.length',irkey.length);
	                    //log.debug('ibsCompleteObj',ibsCompleteObj);
	                    var a = [];
	                    if (irkey.length > 0) {
	                        for (var t = 0; t < irkey.length; t++) {
	                            var oneIRdata = ibsCompleteObj[irkey[t]];
	                            timediff = '', smallDiff = '';
	                            a.push(oneIRdata[0].investeeText)
	                            //	log.debug('oneIRdata[n].investeeText',oneIRdata[0].investeeText);
	                            for (var n = 0; n < oneIRdata.length; n++) 
								{
	                                closingDate = oneIRdata[n].closingDate;
	                                //closingDateObj=new Date(closingDate)
	                                closingDateObj = parseAndFormatDateString(closingDate)
	                                closingDateObj = closingDateObj[0];
	                                closingDateTime = closingDateObj.getTime();
									if(closingDateTime <=reportDateTime)
									{
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

										//log.debug('recordType',recordType);
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

										} else if (timediff == smallDiff) {
											if (seriesType == 1) {
												//log.debug('date match -record ID',recordId);
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

											}
										}
									}
	                            }
	                            CSVData += '<Row>';
	                            CSVData += '<Cell><Data ss:Type="Number">' + finalObj.recordId + '</Data></Cell>';
	                            CSVData += '<Cell><Data ss:Type="String">' + finalObj.investeeText + '</Data></Cell>';
	                            CSVData += '<Cell><Data ss:Type="String">' + finalObj.investeeStatus + '</Data></Cell>';
	                            CSVData += '<Cell><Data ss:Type="String">' + finalObj.seriesNameText + '</Data></Cell>';
	                            CSVData += '<Cell><Data ss:Type="String">' + finalObj.closingDate + '</Data></Cell>';
	                            CSVData += '<Cell><Data ss:Type="Number">' + finalObj.postMoney + '</Data></Cell>';
	                            //CSVData += '<Cell><Data ss:Type="String">'+finalObj.recordType+'</Data></Cell>';
	                            CSVData += '</Row>';
	                        }
	                    }
	                    CSVData += '</Table></Worksheet></Workbook>';
	                    log.debug('CSVData', CSVData);

	                    var base64EncodedString = encode.convert({
	                        string: CSVData,
	                        inputEncoding: encode.Encoding.UTF_8,
	                        outputEncoding: encode.Encoding.BASE_64
	                    });

	                    var file_obj = file.create({
	                        name: 'transactionreport.xls',
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
	        }
	        return {
	            onRequest: onRequest
	        }
	    });