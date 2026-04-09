/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/record', 'N/search', 'N/query', "./cryptojs",],
    /**
     * @param{currentRecord} currentRecord
     */
    function (currentRecord, record, search, query, cryptojs) {
 
        const NS_PAR_REC = 'customrecord_netsuite_parent_record';
        const FIELD_LINE_ID = 'custrecord_tax_registration_line_id';
        const FIELD_TAX_NO = 'custrecord_tax_registration_number';
        const FIELD_TAX_ADDR = 'custrecord_tax_registration_line_address';
        const FIELD_LAST_SYNC = 'custrecord_last_synced';
        const FIELD_TAX_STATE = 'custrecord_tax_registration_state';
        const FIELD_TAX_COUNTRY = 'custrecord_tax_registration_country';
        const FIELD_NS_PAR_REC_LINK = 'custrecord_parent_record_link';
        const FIELD_NS_CUST = 'custrecord_ns_customer';
        const FIELD_AD_CL_ID = 'custrecord_adintelle_client_id';
        const FIELD_LAST_SYNC_LINE_HASH = 'custrecord_last_sync_line_hash';
        const FIELD_MODF_LINE_HASH = 'custrecord_modified_line_hash';
        const BODY_CUST_SYNC_DATE_FID = 'custentity_adintelle_sync_date';
        const BODY_HASH_PREV_FID = 'custentity_last_sync_body_hash';
        const BODY_HASH_CUR_FID = 'custentity_modified_body_hash';
        const BODY_PAN = 'custentity_permanent_account_number';
        const BODY_DEFAU_TAX = 'defaulttaxreg'
        const BODY_IS_PERSON = 'isperson';
        const BODY_COMP_NAME = 'companyname';
        const BODY_F_NAME = 'firstname';
        const BODY_L_NAME = 'lastname';
        const BODY_EMAIL = 'email';
        const BODY_PHONE = 'phone';
        const CHILD_REC = 'customrecord_adintelle_client_id_record';
        const SUBLIST_AD_MAST_LINK = 'recmachcustrecord_parent_record_link';
        const SUBLIST_TAX_REG = 'taxregistration';
        const INT_NUM = 'internalidnumber';
        const INT_ID = 'internalid';
        const uString = str => (str || '').toString().trim().replace(/\s+/g, ' ').toUpperCase();
        const lString = str => (str || '').toString().trim().toLowerCase();
        const tString = str => (str || '').toString().replace(/\r?\n/g, '').trim();
        const cString = str => (str || "").toString().replace(/\r?\n/g, '').replace(/\s+/g, '').trim()
 
       
        function kal(obj) {
            if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                var keys = Object.keys(obj).sort();
                var temp = {};
                for (var i = 0; i < keys.length; i++) {
                    var a = keys[i];
                    var b = obj[a];
                    temp[a] = (typeof b === 'string') ? b.trim().replace(/\s+/g, ' ') : b;
                }
                return JSON.stringify(temp);
            }
            if (Array.isArray(obj)) {
                return JSON.stringify(obj.map(function (x) { return kal(x); }));
            }
            return (typeof obj === 'string') ? obj.trim().replace(/\s+/g, ' ') : obj;
        }
 
       
        function getKeyByValueFind(mapObj, valueObj) {
            var target = kal(valueObj);
            for (var key in (mapObj || {})) {
                if (kal(mapObj[key]) === target) return key;
            }
            return null;
        }
   
 
        function pageInit(scriptContext) { }
 
        function validateLine(scriptContext) {
            try {
                if (scriptContext.sublistId == 'taxregistration') {
                    let recordObj = currentRecord.get();
                    let recordId = recordObj.id;
                    let bodyHash = recordObj.getValue({ fieldId: 'custentity_last_sync_body_hash' });
                    let syncDate = recordObj.getValue({ fieldId: 'custentity_adintelle_sync_date' });
                    if (recordId && bodyHash && syncDate) {
                        let lineId = recordObj.getCurrentSublistValue({ sublistId: 'taxregistration', fieldId: 'id' });
                        if (lineId) {
                            let curTax = recordObj.getCurrentSublistValue({ sublistId: 'taxregistration', fieldId: 'taxregistrationnumber' });
                            let curState = recordObj.getCurrentSublistValue({ sublistId: 'taxregistration', fieldId: 'nexusstate_display' });
                            let curCountry = recordObj.getCurrentSublistText({ sublistId: 'taxregistration', fieldId: 'nexuscountry' });
                            let curAddress = getAddress(recordId, recordObj.getCurrentSublistText({ sublistId: 'taxregistration', fieldId: 'address' }));
                            let lineHistory = getTaxLineHistory(lineId, recordId);
                            log.debug('line history', lineHistory);
                            if (lineHistory.length == 1) {
                                let childId = lineHistory[0].getValue({ name: INT_ID, join: FIELD_NS_PAR_REC_LINK, label: "Internal ID" });
                                let preTax = lineHistory[0].getValue({ name: FIELD_TAX_NO, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Number" });
                                let preState = lineHistory[0].getValue({ name: FIELD_TAX_STATE, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration State" });
                                let preAddress = lineHistory[0].getValue({ name: FIELD_TAX_ADDR, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Address" });
                                let preCountry = lineHistory[0].getValue({ name: FIELD_TAX_COUNTRY, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Country" });
                                if (cString(curTax) == cString(preTax) && cString(curState) == cString(preState) && cString(curCountry) == cString(preCountry) && cString(curAddress) == cString(preAddress)) {
                                    log.debug('All match')
                                }
                                else {
                                    let lineHashString = `TAX=${curTax}|STATE=${curState}|COUNTRY=${curCountry}|ADDRESS=${curAddress}`;
                                    log.debug('lineHashString', lineHashString)
                                    let newLineHash = hash128Hex(lineHashString, childId);
                                    let updatedChildId = record.submitFields({
                                        type: CHILD_REC,
                                        id: childId,
                                        values: {
                                            [FIELD_TAX_NO]: curTax,
                                            [FIELD_TAX_STATE]: curState,
                                            [FIELD_TAX_ADDR]: curAddress,
                                            [FIELD_TAX_COUNTRY]: curCountry,
                                            [FIELD_MODF_LINE_HASH]: newLineHash
                                        },
                                    });
                                    log.debug('updatedChildId', updatedChildId)
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                log.debug('Error 3', error)
 
            }
            return true;
        }
 
        function validateDelete(scriptContext) {
            return true;
 
        }
 
        function saveRecord(scriptContext) {
            try {
                const recordObj = currentRecord.get();
                const recordId = recordObj.id;
                let bodyHash = recordObj.getValue({
                    fieldId: 'custentity_last_sync_body_hash'
                });
                let syncDate = recordObj.getValue({
                    fieldId: 'custentity_adintelle_sync_date'
                });
                log.debug('record Id', recordId)
                log.debug('bodyHash', bodyHash)
                log.debug('syncDate', syncDate)
 
                if (recordId && bodyHash && syncDate) {
                    //Body Hashing
                    const uString = str => (str || '').toString().trim().replace(/\s+/g, ' ').toUpperCase();
                    const lString = str => (str || '').toString().trim().toLowerCase();
                    const tString = str => (str || '').toString().replace(/\r?\n/g, '').trim();
                    const cString = str => (str || "").toString().replace(/\r?\n/g, '').replace(/\s+/g, '').trim()
                    const bodyHash = recordObj.getValue({ fieldId: BODY_HASH_CUR_FID }).toString();
                    const name = recordObj.getValue({ fieldId: BODY_IS_PERSON }) == 'F' ? uString(recordObj.getValue({ fieldId: BODY_COMP_NAME })) : uString(recordObj.getValue({ fieldId: BODY_F_NAME })) + uString(recordObj.getValue({ fieldId: BODY_L_NAME }))
                    const email = lString(recordObj.getValue({ fieldId: BODY_EMAIL }));
                    const phone = lString(recordObj.getValue({ fieldId: BODY_PHONE }));
                    const pan = uString(recordObj.getValue({ fieldId: BODY_PAN }));
                    const tax = uString(recordObj.getValue({ fieldId: BODY_DEFAU_TAX }));
                    const bodyHashString = `NAME=${name}|EMAIL=${email}|PHONE=${phone}|PAN=${pan}|TAX=${tax}`;
                    log.debug('bodyHashString', bodyHashString)
                    const newBodyHash = hash128Hex(bodyHashString, email);
                    log.debug('newBodyHash', newBodyHash)
                    if (bodyHash !== newBodyHash) {
                        recordObj.setValue({ fieldId: BODY_HASH_CUR_FID, value: newBodyHash });
                    }
                    var taxRegLine = recordObj.getLineCount({
                        sublistId: 'taxregistration'
                    });
                    if (taxRegLine > 0) {
                        let adMaster = getAdMaster(recordId);
                        log.debug('admaster', adMaster);
                        for (let index = 0; index < taxRegLine; index++) {
                            let lineid = recordObj.getSublistValue({ sublistId: 'taxregistration', fieldId: 'id', line: index });
                            let tax = recordObj.getSublistValue({ sublistId: 'taxregistration', fieldId: 'taxregistrationnumber', line: index });
                            let state = recordObj.getSublistValue({ sublistId: 'taxregistration', fieldId: 'nexusstate_display', line: index });
                            let country = recordObj.getSublistText({ sublistId: 'taxregistration', fieldId: 'nexuscountry', line: index });
                            let address = cString(getAddress(recordId, recordObj.getSublistText({ sublistId: 'taxregistration', fieldId: 'address', line: index })));
                            log.debug('', tax + ' ' + state + ' ' + country + ' ' + address);
                            let lineJsonWithId = { "lineid": lineid, "address": address, "country": country, "state": state, "tax": tax };
                            let lineJso
                            log.debug('line JSON', lineJsonWithId);
                            log.debug('adMaster JSON', adMaster);
                            let adMasterId = getKeyByValueFind(adMaster, lineJsonWithId);
                            log.debug('adMasterId', adMasterId);
                            // if(tax,add,country,state,id){
                            //     continue
                            // }
                            // else if(tax,add,country,state){
                            //     set id
                            // }
                            // else{
                            //     create record
                            // }
 
                            //tax state country address lineid : internal id
 
 
                        }
 
                    }
 
 
                }
 
 
            } catch (error) {
                log.debug('Error 1 : ', error);
            }
            return true;
 
        }
 
        const hash128Hex = (input, key) => {
            return cryptojs.HmacSHA256(input, key).toString(cryptojs.enc.Base64).substring(0, 32);;
        }
 
        const _validation = (value) => {
            if (value != null && value != "" && value != "null" && value != undefined && value != "undefined" && value != "@NONE@" && value != "NaN" && value != 0 && (typeof value === 'object' && value.length === 0)) { return true }
            else { return false }
 
        }
 
        const getAddress = (id, label) => {
            let filters = [[INT_NUM, "equalto", id], "AND", ["address.addresslabel", "is", label]];
            let columns = [
                search.createColumn({ name: "address", join: "Address", label: "Address" })
            ];
            var addressObj = loadSearch("customer", filters, columns);
            if (addressObj.length > 0) {
                let address = addressObj[0].getValue({ name: "address", join: "Address", label: "Address" });
                return address;
            }
            return 0;
        }
 
        const getTaxLineHistory = (taxLineId, customerId) => {
            let filters = [[`${FIELD_NS_PAR_REC_LINK}.${FIELD_LINE_ID}`, "is", taxLineId], "AND", [`${FIELD_NS_CUST}.${INT_NUM}`, "equalto", customerId]];
            let columns = [
                search.createColumn({ name: FIELD_NS_CUST, label: "Netsuite Customer" }),
                search.createColumn({ name: FIELD_TAX_ADDR, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Address" }),
                search.createColumn({ name: FIELD_TAX_COUNTRY, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Country" }),
                search.createColumn({ name: FIELD_LINE_ID, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Line ID" }),
                search.createColumn({ name: FIELD_TAX_NO, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Number" }),
                search.createColumn({ name: FIELD_TAX_STATE, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration State" }),
                search.createColumn({ name: FIELD_AD_CL_ID, join: FIELD_NS_PAR_REC_LINK, label: "Adintelle Master ID" }),
                search.createColumn({ name: FIELD_LAST_SYNC_LINE_HASH, join: FIELD_NS_PAR_REC_LINK, label: "Last Sync Line Hash" }),
                search.createColumn({ name: FIELD_LAST_SYNC, join: FIELD_NS_PAR_REC_LINK, label: "Last Sync Time Stamp" }),
                search.createColumn({ name: FIELD_MODF_LINE_HASH, join: FIELD_NS_PAR_REC_LINK, label: "Modified Line Hash" }),
                search.createColumn({ name: INT_ID, join: FIELD_NS_PAR_REC_LINK, label: "Internal ID" })
            ];
            var getTaxLineHistoryObject = loadSearch(NS_PAR_REC, filters, columns)
            return getTaxLineHistoryObject;
        }
 
        const getAdMaster = (customerId) => {
            try {
                let filters = [[FIELD_NS_CUST, "anyof", customerId]];
                let columns = [
                    search.createColumn({ name: FIELD_LINE_ID, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Line ID" }),
                    search.createColumn({ name: FIELD_TAX_NO, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Number" }),
                    search.createColumn({ name: FIELD_TAX_STATE, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration State" }),
                    search.createColumn({ name: FIELD_TAX_COUNTRY, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Country" }),
                    search.createColumn({ name: FIELD_TAX_ADDR, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Address" }),
                    search.createColumn({ name: FIELD_AD_CL_ID, join: FIELD_NS_PAR_REC_LINK, label: "Adintelle Master ID" }),
                    search.createColumn({ name: FIELD_LAST_SYNC, join: FIELD_NS_PAR_REC_LINK, label: "Last Sync Time Stamp" }),
                    search.createColumn({ name: FIELD_LAST_SYNC_LINE_HASH, join: FIELD_NS_PAR_REC_LINK, label: "Last Sync Line Hash" }),
                    search.createColumn({ name: FIELD_MODF_LINE_HASH, join: FIELD_NS_PAR_REC_LINK, label: "Modified Line Hash" }),
                    search.createColumn({ name: INT_ID, join: FIELD_NS_PAR_REC_LINK, label: "Internal ID" })
                ];
                const adMasterResult = loadSearch(NS_PAR_REC, filters, columns);
                if (adMasterResult.length > 0) {
                    let adMasterList = {};
                    adMasterResult.forEach(masterLine => {
                        let intid = masterLine.getValue({ name: INT_ID, join: FIELD_NS_PAR_REC_LINK, label: "Internal ID" });
                        let lineid = masterLine.getValue({ name: FIELD_LINE_ID, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Line ID" });
                        let tax = masterLine.getValue({ name: FIELD_TAX_NO, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Number" });
                        let state = masterLine.getValue({ name: FIELD_TAX_STATE, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration State" });
                        let country = masterLine.getValue({ name: FIELD_TAX_COUNTRY, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Country" });
                        let address = cString(masterLine.getValue({ name: FIELD_TAX_ADDR, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Address" }));
                        adMasterList[intid] = { lineid: lineid, address: address, country: country, state: state, tax: tax };
                    });
                    return adMasterList;
                }
                return 0;
            } catch (error) {
                log.error('Error 2 : ', error);
            }
        }
 
 
        const loadSearch = (type, filters, columns) => {
            let searchObject = search.create({
                type: type,
                filters: filters,
                columns: columns
            });
            let resultCount = searchObject.runPaged().count;
            let searchResult = searchObject.run().getRange(0, 100);
            return searchResult;
        }
 
        return {
            pageInit: pageInit,
            validateLine: validateLine,
            validateDelete: validateDelete,
            saveRecord: saveRecord
        };
 
    });
 
 