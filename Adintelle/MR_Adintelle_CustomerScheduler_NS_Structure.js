/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/currentRecord', 'N/record', 'N/search', 'N/file', 'N/log'],
    /**
  * @param{currentRecord} currentRecord
  */
    (currentRecord, record, search, file, log) => {

        const getInputData = (inputContext) => {
            try {
                const customerData = getCustomer();
                log.debug('Get Customer to Sync : ', customerData);
                if (customerData != 0) {
                    return customerData;
                } else {
                    return 0;
                }
            } catch (error) {
                log.debug('Error in getInputData : ', error);
            }
        };

        const map = (mapContext) => {
            try {
                const parsed = JSON.parse(mapContext.value);
                const mapValues = parsed.values || {};
                const customerInternalId = _logValidation(mapValues.internalid && mapValues.internalid[0] && mapValues.internalid[0].value) ? mapValues.internalid[0].value : "";
                const customerId = _logValidation(mapValues.entityid) ? mapValues.entityid : "";
                let customerName = "";
                if (mapValues.isperson === false) {
                    customerName += _logValidation(mapValues.companyname) ? mapValues.companyname : "";
                } else {
                    customerName += _logValidation(mapValues.firstname) ? mapValues.firstname + " " : "";
                    customerName += _logValidation(mapValues.middlename) ? mapValues.middlename + " " : "";
                    customerName += _logValidation(mapValues.lastname) ? mapValues.lastname + " " : "";
                    customerName = customerName.trim();
                }
                const customerEmail = _logValidation(mapValues.email) ? mapValues.email : "";
                const customerCurrency = _logValidation(mapValues.currency && mapValues.currency[0] && mapValues.currency[0].text) ? mapValues.currency[0].text : "";
                const customerPanNo = _logValidation(mapValues.custentity_permanent_account_number) ? mapValues.custentity_permanent_account_number : "";
                const customerDefaultTaxRegistration = _logValidation(mapValues.defaulttaxreg) ? mapValues.defaulttaxreg : "";
                const nexusCountry = _logValidation(mapValues["taxRegistration.nexuscountry"]) ? mapValues["taxRegistration.nexuscountry"] : "";
                const nexusState = _logValidation(mapValues["taxRegistration.state"] && mapValues["taxRegistration.state"][0] && mapValues["taxRegistration.state"][0].text) ? mapValues["taxRegistration.state"][0].text : "";
                const taxRegistrationNo = _logValidation(mapValues["taxRegistration.taxregistrationnumber"]) ? mapValues["taxRegistration.taxregistrationnumber"] : "";
                const taxAddressRaw = _logValidation(mapValues["taxRegistration.address"]) ? mapValues["taxRegistration.address"] : "";
                const taxAddress = taxAddressRaw ? removeSpecialCharacters(taxAddressRaw) : "";

                log.debug('mapValues extracted', {
                    customerInternalId,
                    customerId,
                    customerName,
                    customerEmail,
                    customerCurrency,
                    customerPanNo,
                    customerDefaultTaxRegistration,
                    nexusCountry,
                    nexusState,
                    taxRegistrationNo,
                    taxAddress
                });

                const keyObj = {
                    customerInternalId: customerInternalId,
                    customerId: customerId,
                    customerName: customerName,
                    customerEmail: customerEmail,
                    customerCurrency: customerCurrency,
                    customerPanNo: customerPanNo,
                    customerDefaultTaxRegistration: customerDefaultTaxRegistration
                };

                const valueObj = {
                    nexusCountry: nexusCountry,
                    nexusState: nexusState,
                    taxRegistrationNo: taxRegistrationNo,
                    taxAddress: taxAddress
                };

                mapContext.write({
                    key: JSON.stringify(keyObj),
                    value: JSON.stringify(valueObj)
                });

                log.debug('mapContext.write', { key: keyObj, value: valueObj });
            } catch (error) {
                log.debug('Error  : ', error);
            }
        };

        const reduce = (reduceContext) => {
            try {
                log.debug('reduceContext.key (raw)', reduceContext.key);
                log.debug('reduceContext.values', reduceContext.values);
                log.debug('values count', reduceContext.values.length);

                const reduceKey = JSON.parse(reduceContext.key);
                const reduceValue = reduceContext.values.map((v) => {
                    try {
                        return JSON.parse(v);
                    } catch (e) {
                        log.debug('Failed', v);
                        return null;
                    }
                }).filter((v) => v !== null);

                log.debug('parsed reduceKey', reduceKey);
                log.debug('parsed reduceValue', reduceValue);
                const customerJsonStructure = { ...reduceKey, taxDetails: reduceValue };
                log.debug('customerJsonStructure', customerJsonStructure);

                var fileObj = file.create({
                    name: 'adintelle.json',
                    fileType: file.Type.JSON,
                    contents: JSON.stringify(customerJsonStructure),
                    encoding: file.Encoding.UTF8,
                    folder: -15,
                    isOnline: true
                });

                const fileID = fileObj.save();
                log.debug('fileID', fileID);
            } catch (error) {
                log.debug('Error in reduce : ', error);
            }
        };

        const summarize = (summaryContext) => {
        };

        function removeSpecialCharacters(input) {
            let formatString = input.replace(/\n/g, '');
            return formatString.replace(/[^a-zA-Z0-9 ]/g, '');
        }

        const getCustomer = () => {
            const searchFilters = [
                ["custentity_adintelle_external_id", "isempty", ""], "AND", ["custentity_adintelle_sync_date", "isempty", ""], "AND", ["internalidnumber", "equalto", "1575"]
            ];
            const searchColumns = [
                search.createColumn({ name: "datecreated", label: "Date Created", sort: search.Sort.ASC }),
                search.createColumn({ name: "internalid", label: "Internal ID" }),
                search.createColumn({ name: "entityid", label: "Name" }),
                search.createColumn({ name: "isperson", label: "Is Individual" }),
                search.createColumn({ name: "companyname", label: "Company Name" }),
                search.createColumn({ name: "firstname", label: "First Name" }),
                search.createColumn({ name: "middlename", label: "Middle Name" }),
                search.createColumn({ name: "lastname", label: "Last Name" }),
                search.createColumn({ name: "email", label: "Email" }),
                search.createColumn({ name: "defaulttaxreg", label: "Default Tax Reg." }),
                search.createColumn({ name: "currency", label: "Primary Currency" }),
                search.createColumn({ name: "custentity_permanent_account_number", label: "Permanent Account Number (PAN)" }),
                search.createColumn({ name: "nexuscountry", join: "taxRegistration", label: "Country" }),
                search.createColumn({ name: "id", join: "taxRegistration", label: "ID" }),
                search.createColumn({ name: "state", join: "taxRegistration", label: "State/Province/County" }),
                search.createColumn({ name: "taxregistrationnumber", join: "taxRegistration", label: "Tax Reg. Number" }),
                search.createColumn({ name: "address", join: "taxRegistration", label: "Address" })
            ];
            const customerSearchObj = search.create({
                type: "customer",
                filters: searchFilters,
                columns: searchColumns
            });
            const searchResultCount = customerSearchObj.runPaged().count;
            log.debug("customerSearchObj result count", searchResultCount);
            if (searchResultCount > 0) {
                return customerSearchObj.run().getRange(0, 50);
            } else {
                return searchResultCount;
            }
        };

        const _logValidation = (value) => {
            if (
                value !== null &&
                value !== undefined &&
                value !== "" &&
                value !== "null" &&
                value !== "undefined" &&
                value !== "@NONE@" &&
                value !== "NaN" &&
                (typeof value !== 'object' || (value && value.length !== 0))
            ) {
                return true;
            } else {
                return false;
            }
        };

        return { getInputData, map, reduce, summarize };
    });