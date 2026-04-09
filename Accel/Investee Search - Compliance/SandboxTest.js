/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/ui/serverWidget", "N/search", "N/redirect" , "N/encode" , "N/file"], /**
 * @param{currentRecord} currentRecord
 */ (serverWidget, search, redirect , encode , file) => {
  /**
   * Defines the Suitelet script trigger point.
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request - Incoming request
   * @param {ServerResponse} scriptContext.response - Suitelet response
   * @since 2015.2
   */
  const onRequest = (scriptContext) => {
    if (scriptContext.request.method === "GET") {
      var InvesteeResult = getInvesteeDetails();

    //   log.debug("InvesteeResult.length", InvesteeResult.length);
    //   log.debug("InvesteeResult", InvesteeResult);

      var form = serverWidget.createForm({
        title: "Investee Search - Compliance",
      });

      form.addSubtab({
        id: "custpage_investee",
        label: "Investee",
      });

      var sublist = form.addSublist({
        id: "custpage_investeelist",
        type: serverWidget.SublistType.LIST,
        tab: "custpage_investee",
        label: "Investee",
      });
      sublist.addField({
        id: "custpage_investeeview",
        type: serverWidget.FieldType.TEXT,
        label: "View",
      });
      sublist.addField({
        id: "custpage_investeename",
        type: serverWidget.FieldType.TEXT,
        label: "Investee Name",
      });
      sublist.addField({
        id: "custpage_investeestatus",
        type: serverWidget.FieldType.TEXT,
        label: "Investee Status",
      });
      sublist.addField({
        id: "custpage_projectmanager",
        type: serverWidget.FieldType.TEXT,
        label: "Project Manager",
      });
      sublist.addField({
        id: "custpage_sector",
        type: serverWidget.FieldType.TEXT,
        label: "Sector",
      });
      sublist.addField({
        id: "custpage_onelinedescription",
        type: serverWidget.FieldType.TEXT,
        label: "Description",
      });
      sublist.addField({
        id: "custpage_incorporatein",
        type: serverWidget.FieldType.TEXT,
        label: "Incorporate In",
      });
      sublist.addField({
        id: "custpage_companyfounded",
        type: serverWidget.FieldType.TEXT,
        label: "Company Founded",
      });
      sublist.addField({
        id: "custpage_fundname",
        type: serverWidget.FieldType.TEXT,
        label: "Fund Name",
      });
      sublist.addField({
        id: "custpage_doname",
        type: serverWidget.FieldType.TEXT,
        label: "D/O Name",
      });
      sublist.addField({
        id: "custpage_doappoint",
        type: serverWidget.FieldType.TEXT,
        label: "Date of Appointment",
      });
      sublist.addField({
        id: "custpage_doresign",
        type: serverWidget.FieldType.TEXT,
        label: "Date of Resignation",
      });
      sublist.addField({
        id: "custpage_sharesheldin",
        type: serverWidget.FieldType.TEXT,
        label: "Shares Held In",
      });
      form.addSubmitButton({
        label: "Export to Excel",
      });

      for (var index = 0; index < InvesteeResult.length; index++) {
        sublist.setSublistValue({
          id: "custpage_investeeview",
          line: index,
          value:
            "<a href=https://5095851-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=3&id=" +
            InvesteeResult[index].InvesteeID +
            ">" +
            "View" +
            "</a>",
        });
        sublist.setSublistValue({
          id: "custpage_investeename",
          line: index,
          value: InvesteeResult[index].investeeName,
        });
        sublist.setSublistValue({
          id: "custpage_investeestatus",
          line: index,
          value: InvesteeResult[index].investeeStatus,
        });
        sublist.setSublistValue({
          id: "custpage_projectmanager",
          line: index,
          value: InvesteeResult[index].projectManager,
        });
        sublist.setSublistValue({
          id: "custpage_sector",
          line: index,
          value: InvesteeResult[index].sector,
        });
        sublist.setSublistValue({
          id: "custpage_onelinedescription",
          line: index,
          value: InvesteeResult[index].oneLineDescription,
        });
        sublist.setSublistValue({
          id: "custpage_incorporatein",
          line: index,
          value: InvesteeResult[index].incorporateIn,
        });
        sublist.setSublistValue({
          id: "custpage_companyfounded",
          line: index,
          value: InvesteeResult[index].companyFounded,
        });
        sublist.setSublistValue({
          id: "custpage_fundname",
          line: index,
          value: InvesteeResult[index].fundName,
        });
        sublist.setSublistValue({
          id: "custpage_doname",
          line: index,
          value: InvesteeResult[index].directorName,
        });
        sublist.setSublistValue({
          id: "custpage_doappoint",
          line: index,
          value: InvesteeResult[index].dateOfAppoint,
        });
        sublist.setSublistValue({
          id: "custpage_doresign",
          line: index,
          value: InvesteeResult[index].dateOfResignation,
        });
        sublist.setSublistValue({
          id: "custpage_sharesheldin",
          line: index,
          value: InvesteeResult[index].sharesHeldIn,
        });
      }
    //   log.debug("Investee : ", InvesteeResult);

      scriptContext.response.writePage(form);
    } else {
      log.debug("In post");
      var InvesteeResult = getInvesteeDetails();

      log.debug(" POST InvesteeResult.length", InvesteeResult.length);
      log.debug("POSt InvesteeResult", InvesteeResult);

      var CSVData =
        '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
      CSVData +=
        '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
      CSVData += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
      CSVData += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
      CSVData += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
      CSVData += 'xmlns:html="http://www.w3.org/TR/REC-html40">';
      CSVData += "<Styles>";
      CSVData += '<Style ss:ID="s1">';
      CSVData += '<Font ss:Bold="1" ss:Underline="Single"/>';
      CSVData += '<Interior ss:Color="#CCFFFF" ss:Pattern="Solid"/>';
      CSVData += " <Borders>";
      CSVData +=
        ' <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>';
      CSVData += "</Borders>";
      CSVData += "</Style>";
      CSVData += "</Styles>";
      CSVData += '<Worksheet ss:Name="Report">';
      CSVData += "<Table><Row>";
      CSVData +=
        '<Cell ss:StyleID="s1"><Data ss:Type="String">' +
        'Investee Name' +
        '</Data></Cell>';
      CSVData +=
        '<Cell ss:StyleID="s1"><Data ss:Type="String">' +
        'Investee Status' +
        '</Data></Cell>';
      CSVData +=
        '<Cell ss:StyleID="s1"><Data ss:Type="String">' +
        'Project Manager' +
        '</Data></Cell>';
      CSVData +=
        '<Cell ss:StyleID="s1"><Data ss:Type="String">' +
        'Sector' +
        '</Data></Cell>';
      CSVData +=
        '<Cell ss:StyleID="s1"><Data ss:Type="String">' +
        'Description' +
        '</Data></Cell>';
      CSVData +=
        '<Cell ss:StyleID="s1"><Data ss:Type="String">' +
        'Incorporate In' +
        '</Data></Cell>';
      CSVData +=
        '<Cell ss:StyleID="s1"><Data ss:Type="String">' +
        'Company Founded' +
        '</Data></Cell>';
      CSVData +=
        '<Cell ss:StyleID="s1"><Data ss:Type="String">' +
        'Fund Name' +
        '</Data></Cell>';
      CSVData +=
        '<Cell ss:StyleID="s1"><Data ss:Type="String">' +
        'D/o Name' +
        '</Data></Cell>';
      CSVData +=
        '<Cell ss:StyleID="s1"><Data ss:Type="String">' +
        'Date Of Appointment' +
        '</Data></Cell>';
      CSVData +=
        '<Cell ss:StyleID="s1"><Data ss:Type="String">' +
        'Date Of Resignation' +
        '</Data></Cell>';
        CSVData +=
        '<Cell ss:StyleID="s1"><Data ss:Type="String">' +
        'Share Held In' +
        '</Data></Cell>';
      CSVData += "</Row>";
      for (var index = 0; index < InvesteeResult.length; index++) {
        CSVData += "<Row>";
        CSVData += '<Cell><Data ss:Type="String">' + InvesteeResult[index].investeeName + '</Data></Cell>';
        CSVData += '<Cell><Data ss:Type="String">' + InvesteeResult[index].investeeStatus + '</Data></Cell>';
        CSVData += '<Cell><Data ss:Type="String">' + InvesteeResult[index].projectManager + '</Data></Cell>';
        CSVData += '<Cell><Data ss:Type="String">' + InvesteeResult[index].sector + '</Data></Cell>';
        CSVData += '<Cell><Data ss:Type="String">' + InvesteeResult[index].oneLineDescription + '</Data></Cell>';
        CSVData += '<Cell><Data ss:Type="String">' + InvesteeResult[index].incorporateIn + '</Data></Cell>';
        CSVData += '<Cell><Data ss:Type="String">' + InvesteeResult[index].companyFounded + '</Data></Cell>';
        CSVData += '<Cell><Data ss:Type="String">' + InvesteeResult[index].fundName + '</Data></Cell>';
        CSVData += '<Cell><Data ss:Type="String">' + InvesteeResult[index].directorName + '</Data></Cell>';
        CSVData += '<Cell><Data ss:Type="String">' + InvesteeResult[index].dateOfAppoint + '</Data></Cell>';
        CSVData += '<Cell><Data ss:Type="String">' + InvesteeResult[index].dateOfResignation + '</Data></Cell>';
        CSVData += '<Cell><Data ss:Type="String">' + InvesteeResult[index].sharesHeldIn + '</Data></Cell>';
        CSVData += "</Row>";        
      }
      CSVData += "</Table></Worksheet></Workbook>";

      log.debug("CSVData", CSVData);

      var base64EncodedString = encode.convert({
        string: CSVData,
        inputEncoding: encode.Encoding.UTF_8,
        outputEncoding: encode.Encoding.BASE_64,
      });

      var file_obj = file.create({
        name: "transactionreport.xls",
        fileType: file.Type.EXCEL,
        contents: base64EncodedString,
        description: "Excel file",
        folder: 2551,
      });
      var fileId = file_obj.save();
      log.debug("fileId", fileId);
      scriptContext.response.writeFile({
        file: file_obj,
      });

    //   redirect.toSuitelet({
    //     scriptId: "934",
    //     deploymentId: "2",
    //   });
    }
  };

  function getInvesteeDetails() {
    var InvesteeObject = [];
    var currentObj;

    var directObj = getDirectorDetails();
    // log.debug("directObj", directObj);
    // log.debug("directObj.length 1 ", Object.keys(directObj).length);
    // log.debug("directObj.length 2 ", directObj["2"].length);
    // log.debug("directObj.length 3 ", directObj["9"].length);

    var customrecord_acc_investeeSearchObj = search.create({
      type: "customrecord_acc_investee",
      filters: [],
      columns: [
        search.createColumn({ name: "internalid", label: "Internal ID" }),
        search.createColumn({ name: "name", label: "Name" }),
        search.createColumn({
          name: "custrecord_acc_investee_status",
          label: "Investee Status",
        }),
        search.createColumn({
          name: "custrecord_acc_investee_project_manager",
          label: "Project Manager",
        }),
        search.createColumn({
          name: "custrecord_acc_investee_sector",
          label: "Sector",
        }),
        search.createColumn({
          name: "custrecord_acc_investee_onelinedes",
          label: "One-Line Description",
        }),
        search.createColumn({
          name: "custrecord_acc_investee_incorporated",
          label: "Incorporated in",
        }),
        search.createColumn({
          name: "custrecord_acc_investee_datecompanyfound",
          label: "Date Company Founded",
        }),
        search.createColumn({
          name: "custrecord_acc_investee_demat",
          label: "Shares held in",
        }),
      ],
    });
    var searchResultCount = customrecord_acc_investeeSearchObj.runPaged().count;
    // log.debug(
    //   "customrecord_acc_investeeSearchObj result count",
    //   searchResultCount
    // );
    var searchResult = customrecord_acc_investeeSearchObj
      .run()
      .getRange(0, 1000);

    // log.debug("searchResult", searchResult);

    // log.debug("InvesteeResult 1", searchResult[0]);
    // log.debug("InvesteeResult 1", searchResult[0].values);

    var InvesteeIdArr = [];

    for (var index = 0; index < searchResult.length; index++) {
      var InvesteeID = searchResult[index].getValue({
        name: "internalid",
        label: "Internal ID",
      });
      InvesteeIdArr.push(InvesteeID);

      var investeeName = _logValidation(
        searchResult[index].getValue({ name: "name", label: "Name" })
      )
        ? searchResult[index].getValue({ name: "name", label: "Name" })
        : "null";

      var investeeStatus = _logValidation(
        searchResult[index].getText({
          name: "custrecord_acc_investee_status",
          label: "Investee Status",
        })
      )
        ? searchResult[index].getText({
            name: "custrecord_acc_investee_status",
            label: "Investee Status",
          })
        : "null";

      var projectManager = _logValidation(
        searchResult[index].getText({
          name: "custrecord_acc_investee_project_manager",
          label: "Project Manager",
        })
      )
        ? searchResult[index].getText({
            name: "custrecord_acc_investee_project_manager",
            label: "Project Manager",
          })
        : "null";

      var sector = _logValidation(
        searchResult[index].getText({
          name: "custrecord_acc_investee_sector",
          label: "Sector",
        })
      )
        ? searchResult[index].getText({
            name: "custrecord_acc_investee_sector",
            label: "Sector",
          })
        : "null";

      var oneLineDescription = _logValidation(
        searchResult[index].getValue({
          name: "custrecord_acc_investee_onelinedes",
          label: "One-Line Description",
        })
      )
        ? searchResult[index].getValue({
            name: "custrecord_acc_investee_onelinedes",
            label: "One-Line Description",
          })
        : "null";

      var incorporateIn = _logValidation(
        searchResult[index].getText({
          name: "custrecord_acc_investee_incorporated",
          label: "Incorporated in",
        })
      )
        ? searchResult[index].getText({
            name: "custrecord_acc_investee_incorporated",
            label: "Incorporated in",
          })
        : "null";

      var companyFounded = _logValidation(
        searchResult[index].getValue({
          name: "custrecord_acc_investee_datecompanyfound",
          label: "Date Company Founded",
        })
      )
        ? searchResult[index].getValue({
            name: "custrecord_acc_investee_datecompanyfound",
            label: "Date Company Founded",
          })
        : "null";

      var sharesHeldIn = _logValidation(
        searchResult[index].getText({
          name: "custrecord_acc_investee_demat",
          label: "Shares held in",
        })
      )
        ? searchResult[index].getText({
            name: "custrecord_acc_investee_demat",
            label: "Shares held in",
          })
        : "null";

      if (InvesteeID in directObj) {
        var directArr = directObj[InvesteeID];
        // log.debug("directArr", typeof directArr);

        if (directObj[InvesteeID].length === 3) {
        //   log.debug("directObj[InvesteeID]", directArr);
        //   log.debug("directObj[InvesteeID]", directArr[0]);
          currentObj = {
            InvesteeID: InvesteeID,
            investeeName: investeeName,
            investeeStatus: investeeStatus,
            projectManager: projectManager,
            sector: sector,
            oneLineDescription: oneLineDescription,
            incorporateIn: incorporateIn,
            companyFounded: companyFounded,
            directorName: directArr[0],
            dateOfAppoint: directArr[1],
            dateOfResignation: directArr[2],
            sharesHeldIn: sharesHeldIn,
          };
          InvesteeObject.push(currentObj);
        } else if (directObj[InvesteeID].length > 3) {
        //   log.debug("testing....");
        //   log.debug("testing....", directArr.length / 3);
          var flag = -1;
          var noOfDirector = directArr.length / 3;
        //   log.debug("noOfDirector", noOfDirector);
          var i = 0;
          while (i < noOfDirector) {
            // log.debug("while..", i);
            var currentObj = {
              InvesteeID: InvesteeID,
              investeeName: investeeName,
              investeeStatus: investeeStatus,
              projectManager: projectManager,
              sector: sector,
              oneLineDescription: oneLineDescription,
              incorporateIn: incorporateIn,
              companyFounded: companyFounded,
              directorName: directArr[flag + 1],
              dateOfAppoint: directArr[flag + 2],
              dateOfResignation: directArr[flag + 3],
              sharesHeldIn: sharesHeldIn,
            };
            i++;
            flag += 3;
            InvesteeObject.push(currentObj);
          }
        }
      } else {
        currentObj = {
          InvesteeID: InvesteeID,
          investeeName: investeeName,
          investeeStatus: investeeStatus,
          projectManager: projectManager,
          sector: sector,
          oneLineDescription: oneLineDescription,
          incorporateIn: incorporateIn,
          companyFounded: companyFounded,
          directorName: "null",
          dateOfAppoint: "null",
          dateOfResignation: "null",
          sharesHeldIn: sharesHeldIn,
        };
        InvesteeObject.push(currentObj);
      }
    }

    // log.debug("InvesteeObject length", InvesteeObject.length);

    var FundName = getFundName(InvesteeIdArr);
    // log.debug("Fund Name ", FundName);
    // log.debug("Fund Name ", Object.keys(FundName).length);

    InvesteeObject.forEach((inObj) => {
      var key = inObj.InvesteeID;
      if (key in FundName) {
        inObj["fundName"] = FundName[key];
      } else {
        inObj["fundName"] = "null";
      }
    });

    return InvesteeObject;
  }

  function getFundName(InvesteeIdArr) {
    // log.debug("Investee Id", InvesteeIdArr);
    var fundNameObj = {};

    var customrecord_financialrecordsSearchObj = search.create({
      type: "customrecord_financialrecords",
      filters: [
        ["custrecord_investee_finrec", "anyof", InvesteeIdArr],
        "AND",
        ["custrecord_name_of_fund_finrec", "noneof", "@NONE@"],
      ],
      columns: [
        search.createColumn({
          name: "internalid",
          join: "CUSTRECORD_INVESTEE_FINREC",
          label: "Internal ID",
        }),
        search.createColumn({
          name: "custrecord_name_of_fund_finrec",
          label: "Name of Fund",
        }),
      ],
    });
    var searchResultCount =
      customrecord_financialrecordsSearchObj.runPaged().count;
    // log.debug(
    //   "customrecord_financialrecordsSearchObj result count",
    //   searchResultCount
    // );
    var searchResult = customrecord_financialrecordsSearchObj
      .run()
      .getRange(0, 1000);

    for (var index = 0; index < searchResultCount; index++) {
      var InvesteeID = searchResult[index].getValue({
        name: "internalid",
        join: "CUSTRECORD_INVESTEE_FINREC",
        label: "Internal ID",
      });
      var FundName = searchResult[index].getText({
        name: "custrecord_name_of_fund_finrec",
        label: "Name of Fund",
      });

      if (InvesteeID in fundNameObj != true) {
        fundNameObj[InvesteeID] = FundName;
      }
    }

    return fundNameObj;
  }

  function getDirectorDetails() {
    var directorObject = {};
    var temp;
    var tempArr;
    var customrecord_acc_financialdata_contactSearchObj = search.create({
      type: "customrecord_acc_financialdata_contact",
      filters: [
        [
          "custrecord_acc_dd_parent_ref.custrecord_acc_dd_designation",
          "anyof",
          "1",
        ],
      ],
      columns: [
        search.createColumn({
          name: "custrecord__acc_dd_investee",
          join: "CUSTRECORD_ACC_DD_PARENT_REF",
          label: "Investee Name",
        }),
        search.createColumn({
          name: "custrecord_acc_finacedata_officers",
          label: "D/O Name",
        }),
        search.createColumn({
          name: "custrecord_acc_dd_date_of_appointment",
          join: "CUSTRECORD_ACC_DD_PARENT_REF",
          label: "Date of Appointment",
        }),
        search.createColumn({
          name: "custrecord_acc_dd_date_of_resignation",
          join: "CUSTRECORD_ACC_DD_PARENT_REF",
          label: "Date of Resignation",
        }),
      ],
    });
    var searchResultCount =
      customrecord_acc_financialdata_contactSearchObj.runPaged().count;
    // log.debug(
    //   "customrecord_acc_financialdata_contactSearchObj result count",
    //   searchResultCount
    // );
    var searchResult = customrecord_acc_financialdata_contactSearchObj
      .run()
      .getRange(0, 100);
    // log.debug("directorDetails", searchResult);

    for (var index = 0; index < searchResultCount; index++) {
      var InvesteeID = searchResult[index].getValue({
        name: "custrecord__acc_dd_investee",
        join: "CUSTRECORD_ACC_DD_PARENT_REF",
        label: "Investee Name",
      });

      var doname = _logValidation(
        searchResult[index].getValue({
          name: "custrecord_acc_finacedata_officers",
          label: "D/O Name",
        })
      )
        ? searchResult[index].getValue({
            name: "custrecord_acc_finacedata_officers",
            label: "D/O Name",
          })
        : "null";

      var doa = _logValidation(
        searchResult[index].getValue({
          name: "custrecord_acc_dd_date_of_appointment",
          join: "CUSTRECORD_ACC_DD_PARENT_REF",
          label: "Date of Appointment",
        })
      )
        ? searchResult[index].getValue({
            name: "custrecord_acc_dd_date_of_appointment",
            join: "CUSTRECORD_ACC_DD_PARENT_REF",
            label: "Date of Appointment",
          })
        : "null";
      var dor = _logValidation(
        searchResult[index].getValue({
          name: "custrecord_acc_dd_date_of_resignation",
          join: "CUSTRECORD_ACC_DD_PARENT_REF",
          label: "Date of Resignation",
        })
      )
        ? searchResult[index].getValue({
            name: "custrecord_acc_dd_date_of_resignation",
            join: "CUSTRECORD_ACC_DD_PARENT_REF",
            label: "Date of Resignation",
          })
        : "null";

      if (InvesteeID in directorObject != true) {
        temp = [doname, doa, dor];
        directorObject[InvesteeID] = temp;
      } else {
        tempArr = directorObject[InvesteeID];
        tempArr.push(doname);
        tempArr.push(doa);
        tempArr.push(dor);
        directorObject[InvesteeID] = tempArr;
      }
    }

    return directorObject;
  }

  function _logValidation(value) {
    if (
      value != null &&
      value != "" &&
      value != "null" &&
      value != undefined &&
      value != "undefined" &&
      value != "@NONE@" &&
      value != "NaN"
    ) {
      return true;
    } else {
      return false;
    }
  }

  return { onRequest };
});

// [{"recordType":"customrecord_acc_investee",
//   "id":"454",
//   "values":
//   {"name":"100MS Inc.","custrecord_acc_investee_status":[{"value":"10","text":"Portfolio-Active"}],"custrecord_acc_investee_project_manager":[{"value":"66","text":"Abhinav Chaturvedi"}],"custrecord_acc_investee_sector":[{"value":"20","text":"SaaS"}],
// "custrecord_acc_investee_onelinedes":"API business to create and embed real-time video engagement applications","custrecord_acc_investee_incorporated":[{"value":"230","text":"United States"}],"custrecord_acc_investee_datecompanyfound":"11/09/2020","custrecord_acc_investee_demat":[{"value":"3","text":"Carta"}]
// }},
