/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(["N/currentRecord"], function (currentRecord) {
  let pageInit = (scriptContext) => { }

  let fieldChanged = (scriptContext) => {
    let objRecord = scriptContext.currentRecord;
    if (scriptContext.fieldId == 'custpage_investee_name') {
        let investeeName = objRecord.getValue({ fieldId: 'custpage_investee_name' });
        let reloadURL = 'https://5095851.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1848&deploy=1';
        if(!investeeName) window.open(reloadURL, '_self');
        
    }
  }

  let exportReport = () => {
    try {
      const sublistId = "custpage_companies_list";
      const rowCount = nlapiGetLineItemCount(sublistId);
      let csvContent = "ID,Investee Name,Investor Name,Investor Category,Name Of Fund,Phone,Email \n";

      for (let i = 1; i <= rowCount; i++) {
        const id = nlapiGetLineItemValue(sublistId, "custpage_financial_record_id", i) || "";
        const investeeName = nlapiGetLineItemValue(sublistId, "custpage_investee", i) || "";
        const investorName = nlapiGetLineItemValue(sublistId, "custpage_investor", i) || "";
        const investorCategory = nlapiGetLineItemValue(sublistId, "custpage_investor_category", i) || "";
        const nameOfFund = nlapiGetLineItemValue(sublistId, "custpage_name_of_fund", i) || "";
        const phone = nlapiGetLineItemValue(sublistId, "custpage_phone", i) || "";
        const email = nlapiGetLineItemValue(sublistId, "custpage_email", i) || "";
        csvContent += `"${stripHTMLTags(id)}","${investeeName}","${investorName}","${investorCategory}","${nameOfFund}","${phone}","${email}"\n`;

      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "ActiveCompanies_FounderInvestor.csv";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("Error exporting: " + e.message);
    }
  }

  let stripHTMLTags = (input) => {
    if(input != null){ return input.replace(/<[^>]*>/g, '').trim(); } 
    else{ return "" }
   
  }

  let getInvestee = () => {
    try {
      let objRecord = currentRecord.get();
      let investeeName = objRecord.getValue({ fieldId: 'custpage_investee_name' });
      if (investeeName) {
        let reloadURL = 'https://5095851.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1848&deploy=1&investee=' + investeeName;
        window.open(reloadURL, '_self');
      }
      else {
        // alert('Select Investee Name')
        let reloadURL = 'https://5095851.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1848&deploy=1';
        window.open(reloadURL, '_self');
      }

    } catch (e) {
      console.log("Error exporting: " + e.message);
    }
  }



  return {
    pageInit: pageInit,
    fieldChanged: fieldChanged,
    exportReport: exportReport,
    getInvestee: getInvestee
  };
});
