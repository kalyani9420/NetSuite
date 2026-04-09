/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/currentRecord', 'N/email', 'N/search', 'N/encode', 'N/file'],
    /**
 * @param{currentRecord} currentRecord
 */
    (currentRecord, email, search, encode, file) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {

            try {

                let getAllActiveCompanies = fetchActiveCompanies();
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

                    let fileName = "ActiveCompanies_FounderInvestor_" + getCurrentDateTimeFormatted() + ".csv"
                    let file_obj = file.create({ name: fileName, fileType: file.Type.CSV, contents: 'ID,Investee Name,Investor Name,Investor Category,Name Of Fund,Investee Email,Investee Phone\n', folder: 3192, });

                    for (let index = 0; index < getAllActiveCompanies.length; index++) {
                        let investorId = getAllActiveCompanies[index].getValue({ name: "custrecord_investor_subfinrec", join: "CUSTRECORD_FINANCIALREC_LINK_SUBFINREC", label: "Investor" });
                        let investorDetails = _logValidation(investorId) && (investorId in investorMap) ? investorMap[investorId] : null;

                        file_obj.appendLine({
                            value: [_logValidation(getAllActiveCompanies[index].getValue({ name: "internalid", label: "Internal ID" })) ? getAllActiveCompanies[index].getValue({ name: "internalid", label: "Internal ID" }) : '',
                            _logValidation(getAllActiveCompanies[index].getText({ name: "custrecord_investee_finrec", label: "Investee" })) ? getAllActiveCompanies[index].getText({ name: "custrecord_investee_finrec", label: "Investee" }) : '',
                            _logValidation(getAllActiveCompanies[index].getText({ name: "custrecord_investor_subfinrec", join: "CUSTRECORD_FINANCIALREC_LINK_SUBFINREC", label: "Investor" })) ? getAllActiveCompanies[index].getText({ name: "custrecord_investor_subfinrec", join: "CUSTRECORD_FINANCIALREC_LINK_SUBFINREC", label: "Investor" }) : '',
                            _logValidation(getAllActiveCompanies[index].getText({ name: "custrecord_inves_catgory_subfinrec", join: "CUSTRECORD_FINANCIALREC_LINK_SUBFINREC", label: "Investor Category" })) ? getAllActiveCompanies[index].getText({ name: "custrecord_inves_catgory_subfinrec", join: "CUSTRECORD_FINANCIALREC_LINK_SUBFINREC", label: "Investor Category" }) : '',
                            _logValidation(getAllActiveCompanies[index].getText({ name: "custrecord_name_of_fund_finrec", label: "Name of Fund" })) ? getMainSubsidiary(getAllActiveCompanies[index].getText({ name: "custrecord_name_of_fund_finrec", label: "Name of Fund" })) : '',
                            _logValidation(investorDetails) && (investorId in investorMap) ? investorDetails.email : '',
                            _logValidation(investorDetails) && (investorId in investorMap) ? investorDetails.phone : '']
                        });
                    }
                    let fileId = file_obj.save();
                    log.debug("fileId", fileId);
                    if (fileId) {
                        let senderId = 4327;
                        // 'nikkhhil.singhaal@accel.com' , 'lgovin@accel.com' , 'akulshrestha@accel.com'
                        let recipientId = ['kalyani.chaudhari@theblueflamelabs.com']
                        let fileObj = file.load({ id: fileId });
                        let reportLink = 'https://5095851.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1848&deploy=1';
                        let emailSubject = 'Report Reminder - Active companies';
                        let emailbody = `<p>Hello,</p><p>Here is the report on active companies categorized under Founder Investor.</p><p>Thank you.</p><br><a href=${reportLink}>View Report</a>`
                        email.send({
                            author: senderId,
                            recipients: recipientId,
                            subject: emailSubject,
                            body: emailbody,
                            attachments: [fileObj],
                        });
                        log.debug('Mail sent');
                    }



                }

            } catch (error) {
                log.debug('Error : ', error)

            }

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

        let getCurrentDateTimeFormatted = () => {
            const now = new Date();
            let dd = now.getDate();
            let mm = now.getMonth() + 1;
            const yyyy = now.getFullYear();
            if (dd < 10) dd = '0' + dd;
            if (mm < 10) mm = '0' + mm;
            let hh = now.getHours();
            let min = now.getMinutes();
            let sec = now.getSeconds();
            if (hh < 10) hh = '0' + hh;
            if (min < 10) min = '0' + min;
            if (sec < 10) sec = '0' + sec;
            const formattedDateTime = `${dd}/${mm}/${yyyy}_${hh}.${min}.${sec}`;
            return formattedDateTime;
        }

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


        return { execute }

    });
