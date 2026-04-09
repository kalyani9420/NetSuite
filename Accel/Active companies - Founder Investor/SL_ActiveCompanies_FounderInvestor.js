/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/ui/serverWidget", "N/search"], /**
  * @param{currentRecord} currentRecord
  */ (serverWidget, search) => {

    const onRequest = (scriptContext) => {
      try {
        if (scriptContext.request.method === "GET") {
          let investeeName = scriptContext.request.parameters.investee;
          let getAllActiveCompanies = fetchActiveCompanies(investeeName);

          if (getAllActiveCompanies != null) {

            let investorMap = {};
            let getInvestorEmailPhone = fetchInvestorEmailPhone();
            if (getInvestorEmailPhone != null) {
              getInvestorEmailPhone.forEach(investor => {
                let investorInternalId = investor.getValue({ name: "internalid", label: "Internal ID" });
                let investorName = _logValidation(investor.getValue({ name: "entityid", label: "Name" })) ? investor.getValue({ name: "entityid", label: "Name" }) : null;
                let investorEmail = _logValidation(investor.getValue({ name: "email", label: "Email" })) ? investor.getValue({ name: "email", label: "Email" }) : null;
                let investorPhone = _logValidation(investor.getValue({ name: "phone", label: "Phone" })) ? investor.getValue({ name: "phone", label: "Phone" }) : null;
                investorMap[investorInternalId] = { name: investorName, email: investorEmail, phone: investorPhone };
              });
            }



            var form = serverWidget.createForm({ title: "Active Companies - Founder Investor" });
            form.clientScriptModulePath = 'SuiteScripts/CL_ActiveCompanies_FounderInvestor.js';
            let investeeField = form.addField({ id: "custpage_investee_name", label: "Investee Name", type: serverWidget.FieldType.SELECT, source: "customrecord_acc_investee" });
            if (investeeName) {
              investeeField.defaultValue = investeeName;
            }
            form.addButton({ id: 'getinvestee', label: 'Filter', functionName: 'getInvestee()' });
            form.addButton({ id: "Export Excel", label: "Export Report", functionName: "exportReport()" });
            form.addSubtab({ id: "custpage_active_companies", label: "Active Companies" });
            var sublist = form.addSublist({ id: "custpage_companies_list", type: serverWidget.SublistType.LIST, tab: "custpage_active_companies", label: "Active Companies" });
            sublist.addField({ id: "custpage_financial_record_id", type: serverWidget.FieldType.TEXT, label: "ID" });
            sublist.addField({ id: "custpage_investee", type: serverWidget.FieldType.TEXT, label: "Investee Name" });
            sublist.addField({ id: "custpage_investor", type: serverWidget.FieldType.TEXT, label: "Investor Name" });
            sublist.addField({ id: "custpage_investor_category", type: serverWidget.FieldType.TEXT, label: "Investor Category" });
            sublist.addField({ id: "custpage_name_of_fund", type: serverWidget.FieldType.TEXT, label: "Name Of Fund" });
            sublist.addField({ id: "custpage_phone", type: serverWidget.FieldType.TEXT, label: "Investor Phone" });
            sublist.addField({ id: "custpage_email", type: serverWidget.FieldType.TEXT, label: "Investor Email" });


            for (let index = 0; index < getAllActiveCompanies.length; index++) {

              let investorDetails = _logValidation(getAllActiveCompanies[index].getValue({ name: "custrecord_investor_subfinrec", join: "CUSTRECORD_FINANCIALREC_LINK_SUBFINREC", label: "Investor" })) ? investorMap[getAllActiveCompanies[index].getValue({ name: "custrecord_investor_subfinrec", join: "CUSTRECORD_FINANCIALREC_LINK_SUBFINREC", label: "Investor" })] : null;
              sublist.setSublistValue({ id: "custpage_financial_record_id", line: index, value: _logValidation(getAllActiveCompanies[index].getValue({ name: "internalid", label: "Internal ID" })) ? '<a href=https://5095851.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=188&id=' + getAllActiveCompanies[index].getValue({ name: "internalid", label: "Internal ID" }) + '>' + getAllActiveCompanies[index].getValue({ name: "internalid", label: "Internal ID" }) + '</a>' : null });
              sublist.setSublistValue({ id: "custpage_investee", line: index, value: _logValidation(getAllActiveCompanies[index].getText({ name: "custrecord_investee_finrec", label: "Investee" })) ? getAllActiveCompanies[index].getText({ name: "custrecord_investee_finrec", label: "Investee" }) : null });
              sublist.setSublistValue({ id: "custpage_investor", line: index, value: _logValidation(getAllActiveCompanies[index].getText({ name: "custrecord_investor_subfinrec", join: "CUSTRECORD_FINANCIALREC_LINK_SUBFINREC", label: "Investor" })) ? getAllActiveCompanies[index].getText({ name: "custrecord_investor_subfinrec", join: "CUSTRECORD_FINANCIALREC_LINK_SUBFINREC", label: "Investor" }) : null });
              sublist.setSublistValue({ id: "custpage_investor_category", line: index, value: _logValidation(getAllActiveCompanies[index].getText({ name: "custrecord_inves_catgory_subfinrec", join: "CUSTRECORD_FINANCIALREC_LINK_SUBFINREC", label: "Investor Category" })) ? getAllActiveCompanies[index].getText({ name: "custrecord_inves_catgory_subfinrec", join: "CUSTRECORD_FINANCIALREC_LINK_SUBFINREC", label: "Investor Category" }) : null });
              sublist.setSublistValue({ id: "custpage_name_of_fund", line: index, value: _logValidation(getAllActiveCompanies[index].getText({ name: "custrecord_name_of_fund_finrec", label: "Name of Fund" })) ? getMainSubsidiary(getAllActiveCompanies[index].getText({ name: "custrecord_name_of_fund_finrec", label: "Name of Fund" })) : null });
              sublist.setSublistValue({ id: "custpage_email", line: index, value: _logValidation(investorDetails) ? investorDetails.email : null });
              sublist.setSublistValue({ id: "custpage_phone", line: index, value: _logValidation(investorDetails) ? investorDetails.phone : null });

            }

          }
          else {
            scriptContext.response.writePage(`<html lang="en"><head><title>No Result Found</title></head><body>`);
          }

          scriptContext.response.writePage(form);
        } else {

        }

      } catch (error) {
        log.debug('Error in OnRequest : ', error);

      }
    };



    let _logValidation = (value) => {
      if (value != null && value != "" && value != "null" && value != undefined && value != "undefined" && value != "@NONE@" && value != "NaN") {
        return true;
      } else {
        return false;
      }
    }

    let getMainSubsidiary = (input) => {
      if (!input) return "";

      const parts = input.split(":");
      return parts[parts.length - 1].trim();
    }

    let fetchActiveCompanies = (investeeName) => {
      try {
        let filter = [
          ["isinactive", "is", "F"], "AND", ["custrecord_investee_finrec.custrecord_acc_investee_status", "anyof", "10"],
          "AND", ["custrecord_financialrec_link_subfinrec.custrecord_inves_catgory_subfinrec", "anyof", "2"],
        ];

        investeeName ? filter.push("AND", ["custrecord_investee_finrec", "anyof", investeeName]) : filter.push("AND", ["custrecord_investee_finrec", "anyof", "@ALL@"]);
        const financialrecordsSearch = search.create({
          type: "customrecord_financialrecords",
          filters: filter,
          columns:
            [
              search.createColumn({ name: "internalid", label: "Internal ID" }),
              search.createColumn({ name: "custrecord_investee_finrec", label: "Investee" }),
              search.createColumn({ name: "custrecord_investor_subfinrec", join: "CUSTRECORD_FINANCIALREC_LINK_SUBFINREC", label: "Investor" }),
              search.createColumn({ name: "custrecord_inves_catgory_subfinrec", join: "CUSTRECORD_FINANCIALREC_LINK_SUBFINREC", label: "Investor Category" }),
              search.createColumn({ name: "custrecord_name_of_fund_finrec", label: "Name of Fund" })
            ]
        });
        const searchResultCount = financialrecordsSearch.runPaged().count;
        log.debug('fetchActiveCompanies Count', searchResultCount)
        return searchResultCount > 0 ? getAllResult(financialrecordsSearch) : null;
      } catch (error) {
        log.debug('Error in fetchActiveCompanies : ', error);
      }

    }


    let fetchInvestorEmailPhone = () => {
      try {
        const partnerSearchObj = search.create({
          type: "partner",
          filters: ["NOT", [["email", "isempty", ""], "AND", ["phone", "isempty", ""]]],
          columns:
            [
              search.createColumn({ name: "internalid", label: "Internal ID" }),
              search.createColumn({ name: "entityid", label: "Name" }),
              search.createColumn({ name: "email", label: "Email" }),
              search.createColumn({ name: "phone", label: "Phone" })
            ]
        });
        const searchResultCount = partnerSearchObj.runPaged().count;
        log.debug('fetchInvestorEmailPhone Count', searchResultCount)
        return searchResultCount > 0 ? getAllResult(partnerSearchObj) : null;
      } catch (error) {
        log.debug('Error in fetchInvestorEmailPhone : ', error);
      }
    }

    let getAllResult = (customSearch) => {
      let searchResultCount = customSearch.runPaged().count;
      let allResults = [];
      let [start, end, limit] = [0, 1000, searchResultCount];
      while (start < limit) {
        allResults.push(...customSearch.run().getRange(start, end));
        start += 1000;
        end += 1000;
      }
      return allResults;
    };


    return { onRequest };
  });

