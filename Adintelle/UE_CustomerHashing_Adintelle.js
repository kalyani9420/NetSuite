/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/file', 'N/crypto', 'N/search'],
    (record, file, crypto, search) => {

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
        const SUBLIST_AD_MAST_LINK = 'recmachcustrecord_parent_record_link';
        const SUBLIST_TAX_REG = 'taxregistration'
        const AD_MAST_LINK_REC = 'custrecord_parent_record_link';



        const beforeLoad = (scriptContext) => {
            log.debug('beforeLoad', 'beforeLoad')
        }


        const afterSubmit = (scriptContext) => {
            try {
                const recordObj = scriptContext.newRecord;
                const recordId = recordObj.id;
                log.debug('recordId', recordId)

                if (recordId) {
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
                    const newBodyHash = hash128Hex(bodyHashString);
                    log.debug('newBodyHash', newBodyHash)
                    if (bodyHash !== newBodyHash) {
                        recordObj.setValue({ fieldId: BODY_HASH_CUR_FID, value: newBodyHash });
                    }

                    //Line Hashing
                    const taxRegList = getTaxRegistrations(recordId);
                    log.debug('taxRegList', taxRegList)
                    const adMasterList = getAdMaster(recordId);
                    log.debug('adMasterList', adMasterList)

                    if (taxRegList != 0) {
                        if (adMasterList != 0) {
                            Object.keys(taxRegList).forEach(lineId => {
                                log.debug(lineId, taxRegList)
                                if (lineId in adMasterList) {
                                    log.debug(adMasterList, adMasterList[lineId])
                                    log.debug('', tString(taxRegList[lineId].tax) + ' ' + tString(adMasterList[lineId].tax) + ' ' + tString(taxRegList[lineId].state) + ' ' + tString(adMasterList[lineId].state) + ' ' + tString(taxRegList[lineId].country) + ' ' + tString(adMasterList[lineId].country) + ' ' + cString(taxRegList[lineId].address) + ' ' + cString(adMasterList[lineId].address))
                                    if (tString(taxRegList[lineId].tax) != tString(adMasterList[lineId].tax) || tString(taxRegList[lineId].state) != tString(adMasterList[lineId].state) || tString(taxRegList[lineId].country) != tString(adMasterList[lineId].country) || cString(taxRegList[lineId].address) != cString(adMasterList[lineId].address)) {
                                        log.debug('Line Unmatch', 'Line Unmatch');
                                        let lineHashString = `TAX=${taxRegList[lineId].tax}|STATE=${taxRegList[lineId].state}|COUNTRY=${taxRegList[lineId].country}|ADDRESS=${tString(taxRegList[lineId].address)}`;
                                        let newLineHash = hash128Hex(lineHashString);
                                        log.debug('lineHashString',lineHashString)
                                        var adMasterUpdatRecord = record.submitFields({
                                            type: AD_MAST_LINK_REC,
                                            id: adMasterList[lineId].internalid,
                                            values: {
                                                FIELD_TAX_NO: taxRegList[lineId].tax,
                                                FIELD_TAX_STATE: taxRegList[lineId].state,
                                                FIELD_TAX_COUNTRY: taxRegList[lineId].country,
                                                FIELD_TAX_ADDR: tString(taxRegList[lineId].address),
                                                FIELD_MODF_LINE_HASH: newLineHash
                                            }
                                        });
                                        log.debug('adMasterUpdatRecord' , adMasterUpdatRecord)

                                    }
                                }
                                else {
                                    //append line
                                }
                            });
                        }
                        else {
                            log.audit('Note :', 'No Adintelle master record found for' + name + 'customer')
                        }
                    }
                    else if (taxRegList == 0 && adMasterList != 0) {
                        //delete master lines
                        //pending - if any line get remove from customer
                    }
                    else {
                        log.audit('Note :', 'No tax registration found for' + name + 'customer')

                    }

                    // if (taxRegList.length > 0) {
                    //     const adMaster = getAdMaster(recordId);
                    //     log.debug('adMaster', 'adMaster')
                    //     if(adMaster)

                    //     // for (let index = 0; index < taxRegLineNo; index++) {
                    //     //     let = recordObj.getSublistValue({ sublistId: SUBLIST_TAX_REG, fieldId: 'item', line: index });

                    //     //     let adMasterRecord = record.create({ type: NS_PAR_REC, isDynamic: true });
                    //     //     adMasterRecord.setValue({ fieldId: FIELD_NS_CUST, value: recordId });
                    //     //     adMasterRecord.selectNewLine({ sublistId: SUBLIST_AD_MAST_LINK });
                    //     //     adMasterRecord.setCurrentSublistValue({
                    //     //         sublistId: SUBLIST_AD_MAST_LINK,
                    //     //         fieldId: FIELD_LINE_ID,
                    //     //         value: '001',
                    //     //     });
                    //     //     adMasterRecord.commitLine({ sublistId: SUBLIST_AD_MAST_LINK });
                    //     //     let adMasterRecordId = adMasterRecord.save();
                    //     //     log.debug('adMasterRecordId', adMasterRecordId)

                    //     // }
                    //     // if (_validation(adMaster)) {

                    //     // }
                    //     // else {

                    //     // }

                    // }
                    // else{
                    //     log.audit('Note :' , 'No tax registration found for' + name + 'customer')
                    // }
                }
            } catch (error) {
                log.error('Error 1 : ', error);
            }

        }


        const hash128Hex = (input) => {
            const h = crypto.createHash({ algorithm: crypto.HashAlg.SHA256 });
            h.update({ input: input || '' });
            return h.digest({ outputEncoding: crypto.Encoding.HEX }).substring(0, 32);
        }

        const _validation = (value) => {
            if (value != null && value != "" && value != "null" && value != undefined && value != "undefined" && value != "@NONE@" && value != "NaN" && value != 0 && (typeof value === 'object' && value.length === 0)) { return true }
            else { return false }

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
                    search.createColumn({ name: 'internalid', join: FIELD_NS_PAR_REC_LINK, label: "Internal ID" })
                ];
                const adMasterResult = loadSearch(NS_PAR_REC, filters, columns);
                if (adMasterResult.length > 0) {
                    let adMasterList = {};
                    adMasterResult.forEach(masterLine => {
                        let internalid = masterLine.getValue({ name: FIELD_MODF_LINE_HASH, join: FIELD_NS_PAR_REC_LINK, label: "Internal ID" });
                        let id = masterLine.getValue({ name: FIELD_LINE_ID, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Line ID" });
                        let tax = masterLine.getValue({ name: FIELD_TAX_NO, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Number" });
                        let state = masterLine.getValue({ name: FIELD_TAX_STATE, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration State" });
                        let country = masterLine.getValue({ name: FIELD_TAX_COUNTRY, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Country" });
                        let address = masterLine.getValue({ name: FIELD_TAX_ADDR, join: FIELD_NS_PAR_REC_LINK, label: "Tax Registration Address" });
                        adMasterList[id] = { internalid: internalid, address: address, country: country, state: state, tax: tax };
                    });
                    return adMasterList;
                }
                return 0;
            } catch (error) {
                log.error('Error 2 : ', error);
            }
        }

        const getTaxRegistrations = (customerId) => {
            try {
                let filters = [["internalidnumber", "equalto", customerId], "AND", ["taxregistration.address", "isnotempty", ""]];
                let columns = [
                    search.createColumn({ name: "address", join: SUBLIST_TAX_REG, label: "Address" }),
                    search.createColumn({ name: "nexuscountry", join: SUBLIST_TAX_REG, label: "Country" }),
                    search.createColumn({ name: "id", join: SUBLIST_TAX_REG, label: "ID" }),
                    search.createColumn({ name: "state", join: SUBLIST_TAX_REG, label: "State/Province/country" }),
                    search.createColumn({ name: "taxregistrationnumber", join: SUBLIST_TAX_REG, label: "Tax Reg. Number" })
                ];
                const taxRegistrationResult = loadSearch('customer', filters, columns);
                if (taxRegistrationResult.length > 0) {
                    let taxRegistrationList = {};
                    taxRegistrationResult.forEach(taxLine => {
                        let id = taxLine.getValue({ name: "id", join: SUBLIST_TAX_REG, label: "ID" });
                        let address = taxLine.getValue({ name: "address", join: SUBLIST_TAX_REG, label: "Address" });
                        let country = taxLine.getValue({ name: "nexuscountry", join: SUBLIST_TAX_REG, label: "Country" });
                        let state = taxLine.getText({ name: "state", join: SUBLIST_TAX_REG, label: "State/Province/country" });
                        let tax = taxLine.getValue({ name: "taxregistrationnumber", join: SUBLIST_TAX_REG, label: "Tax Reg. Number" });
                        taxRegistrationList[id] = { address: address, country: country, state: state, tax: tax };
                    });
                    return taxRegistrationList;
                }
                return 0;

            } catch (error) {
                log.error('Error 3 : ', error);
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

        return { beforeLoad, afterSubmit }

    });
