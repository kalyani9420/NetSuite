// BEGIN SCRIPT DESCRIPTION BLOCK  ==================================
{
    /*
    	Script Name: ACC_SUT_Compliance_Chklist.js
    	Author:  J Phani Kumar
    	Company: Inspirria Cloudtech
    	Date:  10-12-2018
    	Description: Calling schedule script for OnDemand and Create schedule record for OnSchedule for Compliance checklist


    	Script Modification Log:

    	-- Date --			-- Modified By --				--Requested By--				-- Description --
    24 Feb 2020             Phani Kumar                    Anuradha Mohril                 Add Check List type
    25 Feb 2020             Phani Kumar                    Anuradha Mohril                 Functionality updated for pending Reminders and not filled Buttons

    Below is a summary of the process controls enforced by this script file.  The control logic is described
    more fully, below, in the appropriate function headers and code blocks.


    	 SUITELET
    		- suiteletFunction(request, response)


    	 SUB-FUNCTIONS
    		- The following sub-functions are called by the above core functions in order to maintain code
    			modularization:

    				 - NOT USED

    */
}
// END SCRIPT DESCRIPTION BLOCK  ====================================


// BEGIN SUITELET ==================================================


function accel_cmp_email_alert(request, response) //suitelet for Compliance first screen
{
    if (request.getMethod() == 'GET') {
        try {
            var qrter = request.getParameter('qrter');
            var year = request.getParameter('year');
            var chklist = request.getParameter('chklist');
            var btntype = request.getParameter('btntype');
            var half = request.getParameter('half');
            nlapiLogExecution('debug', 'qrter' + qrter)
            nlapiLogExecution('debug', 'half' + half)

            var recent_sent_investee = [];
            var recent_filled_investee = [];
            var customrecord_acc_compliance_investeeSearch = nlapiSearchRecord("customrecord_acc_compliance_investee", null,
                [
                    ["isinactive", "is", "F"],

                ],
                [

                    new nlobjSearchColumn("internalid").setSort(true),
                    new nlobjSearchColumn("internalid", "custrecord_acc_comp_investee_company_nam"),
                    new nlobjSearchColumn("custrecord_acc_cmp_in_dt_sent"),
                    new nlobjSearchColumn("custrecord_acc_cmp_in_dt_filled"),
                    new nlobjSearchColumn("custrecord_acc_comp_quarter"),
                    new nlobjSearchColumn("custrecord_cc_type")

                ]
            );
            var datesent = {};
            var datefilled = {};
            for (var k = 0; k < customrecord_acc_compliance_investeeSearch.length; k++) {
                if (recent_sent_investee.indexOf(customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "custrecord_acc_comp_investee_company_nam")) == -1) {
                    if (customrecord_acc_compliance_investeeSearch[k].getValue("custrecord_acc_cmp_in_dt_sent")) {
                        recent_sent_investee.push(customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "custrecord_acc_comp_investee_company_nam"))
                        datesent[customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "custrecord_acc_comp_investee_company_nam")] = "<b>" + customrecord_acc_compliance_investeeSearch[k].getValue("custrecord_acc_cmp_in_dt_sent") + "  for the Quarter \n" + customrecord_acc_compliance_investeeSearch[k].getValue("custrecord_acc_comp_quarter") + ' of ' + customrecord_acc_compliance_investeeSearch[k].getText("custrecord_cc_type") + "</b>";
                    }
                }
                if (recent_filled_investee.indexOf(customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "custrecord_acc_comp_investee_company_nam")) == -1) {
                    if (customrecord_acc_compliance_investeeSearch[k].getValue("custrecord_acc_cmp_in_dt_filled")) {
                        recent_filled_investee.push((customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "custrecord_acc_comp_investee_company_nam")));
                        datefilled[customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "custrecord_acc_comp_investee_company_nam")] = "<b>" + customrecord_acc_compliance_investeeSearch[k].getValue("custrecord_acc_cmp_in_dt_filled") + " for the Quarter \n" + customrecord_acc_compliance_investeeSearch[k].getValue("custrecord_acc_comp_quarter") + ' of ' + customrecord_acc_compliance_investeeSearch[k].getText("custrecord_cc_type") + "</b>";
                    }
                }
            }

            var selection_chk = request.getParameter('chk');
            var form_email_alert = nlapiCreateForm('Checklist Reminders', false);
            var ondemand_chk = form_email_alert.addField('custpage_cc_ondemand_chkbox', 'checkbox', 'On Demand').setLayoutType('startrow', 'startcol');
            var schedule_chk = form_email_alert.addField('custpage_cc_schedule_chkbox', 'checkbox', 'Schedule').setLayoutType('startrow');
            ondemand_chk.setDefaultValue('T');

            var o_cc_Checklist = form_email_alert.addField('custpage_on_ccchecklist', 'select', 'Cheklist Type', 'customrecord_acc_cc_checklisttype').setLayoutType('normal', 'startcol'); // Year


            var QuarterList = ["", "March", "June", "September", "December"];
            var halfList = ["", "First Half", "Second Half"]
            var o_cc_quarter = form_email_alert.addField('custpage_on_ccqrtr', 'select', 'QUARTER', 'customlist_acc_quarter_list').setLayoutType('normal', 'startcol'); // Quarter
            var cs_series_names = form_email_alert.addField('custpage_cs_series_names','select', 'SERIES NAMES', 'customlist_cs_series_name').setLayoutType('normal', 'startrow'); // Quarter
            var half_field_sc = form_email_alert.addField('custpage_on_ccschalf', 'select', 'HALF', 'customlist_cc_sc_half_list').setLayoutType('normal', 'startcol'); // Half
            if (qrter) {
                nlapiLogExecution('debug', 'qrter_text' + qrter)
                var quarter_index = QuarterList.indexOf(qrter);
                nlapiLogExecution('debug', 'quarter_index' + quarter_index)
                o_cc_quarter.setDefaultValue(quarter_index);
            }
            if (half) {
                nlapiLogExecution('debug', 'half_text' + half)
                var half_index = halfList.indexOf(half);
                nlapiLogExecution('debug', 'half_index' + half_index)
                half_field_sc.setDefaultValue(half);
            }
            var o_cc_year = form_email_alert.addField('custpage_on_ccyear', 'select', 'YEAR').setLayoutType('normal', 'startcol'); // Year
            calculateYear(o_cc_year);
            if (year) {
                o_cc_year.setDefaultValue(year);
            }

            var o_cc_due_dt = form_email_alert.addField('custpage_reminder_duedt', 'date', 'Due Date'); //DueDate
            o_cc_due_dt.setHelpText('Please select Due date');
            form_email_alert.addSubmitButton('Process')


            if (chklist) {
                if (chklist == '2') //FCPA
                {
                    o_cc_quarter.setDisplayType('disabled');
                    o_cc_quarter.setDefaultValue('');
                    half_field_sc.setDisplayType('disabled');
                    half_field_sc.setDefaultValue('');
                }
                if (chklist == '4') //SC
                {
                    o_cc_quarter.setDisplayType('disabled');
                    o_cc_quarter.setDefaultValue('');

                }
                if (chklist == '1') //QCC
                {
                    half_field_sc.setDisplayType('disabled');
                    half_field_sc.setDefaultValue('');
                }
                if (chklist == '5') //Conditions Subsequent
                {
                    o_cc_quarter.setDisplayType('disabled');
                    o_cc_quarter.setDefaultValue('');
                    half_field_sc.setDisplayType('disabled');
                    half_field_sc.setDefaultValue('');

                }

                o_cc_Checklist.setDefaultValue(chklist);
            } else {
                o_cc_Checklist.setDefaultValue('1'); //QCC
            }

            //					//=============================Pending Last CMP Sent----END======================================//

            var o_Investee = InvsteeSearch_function();

            var invetsee_email_list = form_email_alert.addSubList('custpage_investee_email_sublist', 'list', 'Investee List');
            invetsee_email_list.addMarkAllButtons();
            invetsee_email_list.addButton('custpage_select_pending', 'Initial Reminder', 'select_pending_rminders_tosnt_btn()');
            invetsee_email_list.addButton('custpage_sent_not_fill', 'Follow-up Reminder', 'select_rminders_nofilled_btn()'); //

            //						form_email_alert.setScript('customscript_acc_compliance_email_sent');
            var select_checkbox = invetsee_email_list.addField('custpage_checkbox', 'checkbox', 'Select');
            var investee_name = invetsee_email_list.addField('custpage_invetseename', 'select', 'Investee Company ID');
            investee_name.setDisplayType('hidden');

            var investee_names = invetsee_email_list.addField('custpage_invetseenames', 'text', 'Investee Company Name');

            var investee_ids = invetsee_email_list.addField('custpage_investee_ids', 'text', 'Investee');
            investee_ids.setDisplayType('hidden');

            var o_sblist_lastsent = invetsee_email_list.addField('custpage_lastcc_senton', 'textarea', 'Last Checklist Sent On');
            var o_sblist_lastfilled = invetsee_email_list.addField('custpage_lastcc_filledon', 'textarea', 'Last Checklist Filled On');
            var o_sblist_review = invetsee_email_list.addField('custpage_review_period', 'textarea', 'Review Status');



            if (_nullValidation(qrter) && _nullValidation(half) && _nullValidation(year) && _nullValidation(chklist)) {

                var dt = new Date();
                dt = nlapiDateToString(dt, 'date');

                var InvesteeSearch = InvsteeSearch_function()

                if (InvesteeSearch) {
                    for (var i = 1; i <= InvesteeSearch.length; i++) {
                        invetsee_email_list.setLineItemValue('custpage_investee_ids', i, InvesteeSearch[i - 1].getValue('internalid'));
                        invetsee_email_list.setLineItemValue('custpage_invetseename', i, InvesteeSearch[i - 1].getValue('internalid'));
                        invetsee_email_list.setLineItemValue('custpage_invetseenames', i, InvesteeSearch[i - 1].getValue('name'));
                        //									invetsee_email_list.setLineItemValue('custpage_lastcc_senton', i, InvesteeSearch[i-1].getValue('custrecord_acc_investee_lastcc_senton'));
                        //									invetsee_email_list.setLineItemValue('custpage_lastcc_filledon', i, InvesteeSearch[i-1].getValue('custrecord_acc_investee_lastcc_filledon'));

                        if (datesent[InvesteeSearch[i - 1].getValue('internalid')]) {
                            invetsee_email_list.setLineItemValue('custpage_lastcc_senton', i, datesent[InvesteeSearch[i - 1].getValue('internalid')]);
                        }
                        if (datefilled[InvesteeSearch[i - 1].getValue('internalid')]) {
                            invetsee_email_list.setLineItemValue('custpage_lastcc_filledon', i, datefilled[InvesteeSearch[i - 1].getValue('internalid')]);
                        }

                        var review_details = "<b>" + InvesteeSearch[i - 1].getValue('custrecord_acc_cc_closing_pending') + "</b>";

                        invetsee_email_list.setLineItemValue('custpage_review_period', i, review_details);
                        //								nlapiLogExecution('debug','Line'+InvesteeSearch[i-1].getValue('custrecord_acc_investee_lastcc_senton'))
                    }
                }
            } else if (btntype == 1) {
                select_pending_rminders_tosnt_btn(qrter, half, year, chklist, invetsee_email_list)
            } else if (btntype == 2) {
                select_rminders_nofilled_btn(qrter, half, year, chklist, invetsee_email_list) // select_pending_rminders_filled_btn
            }

            if (selection_chk == '2') // on schedule chk box
            {
                ondemand_chk.setDefaultValue('F');
                schedule_chk.setDefaultValue('T');

                var frequency = form_email_alert.addField('custpage_frequency', 'text', 'Frequency for Schedule').setLayoutType('startrow');
                frequency.setDisplayType('disabled');
                frequency.setDefaultValue('Quarterly');


                var Reminder_sch_quarter = form_email_alert.addField('custpage_sch_hiddenfieldval', 'text', '');
                Reminder_sch_quarter.setDisplayType('hidden');


                var Reminder_sch_periodlbl = form_email_alert.addField('custpage_sch_reminderperiodlbl', 'label', 'Quarter to Start');
                var Reminder_sch_period = form_email_alert.addField('custpage_sch_reminderperiod', 'inlinehtml', 'Quarter'); //,'accountingperiod').setLayoutType('startrow','startcol');

                var dt = new Date();
                var year = dt.getFullYear();

                var quarter_year;
                var prev_year = year - 1;
                var current_mnth = dt.getMonth();
                if (Number(current_mnth) != 0 && Number(current_mnth) != 1) {
                    quarter_year = ['Mar ' + year + '', 'Jun ' + year + '', 'Sep ' + year + '', 'Dec ' + year + ''];
                } else {
                    quarter_year = ['Mar ' + prev_year + '', 'Jun ' + prev_year + '', 'Sep ' + prev_year + '', 'Dec ' + prev_year + ''];
                }

                /**for(var i=0; i<mnth_year.length; i++)
                {
                	Reminder_ondem_period.addSelectOption(i,mnth_year[i]);
                }**/

                var html_qrter_Period = '<html><body>'
                html_qrter_Period += '<select id = "accounting_perio" style="width: 100px"  onchange="fieldChangeSelectTypemonth(this)" select required>' //onChange="fieldChangeSelectTypemonth(this)" select>'   ///

                for (var i = 0; i < quarter_year.length; i++) {
                    if (i == 0) {
                        html_qrter_Period += '<option value="4"></option>'
                    }
                    html_qrter_Period += '<option value="' + i + '">' + quarter_year[i] + '</option>'
                }

                html_qrter_Period += '</select>'
                html_qrter_Period += '</body></html>'

                if (Reminder_sch_periodlbl) {
                    Reminder_sch_periodlbl.setLayoutType('startrow', 'startcol');
                }
                if (Reminder_sch_period) {
                    Reminder_sch_period.setDefaultValue(html_qrter_Period);
                    Reminder_sch_period.setMandatory(true);
                    //Reminder_ondem_period.setLayoutType('normal','startcol');
                }


                var Reminder_dt = form_email_alert.addField('custpage_reminder_dt', 'date', 'Date').setLayoutType('startrow');
                var Reminderdue_schdt = form_email_alert.addField('custpage_reminder_schduedt', 'date', 'Due Date').setLayoutType('startrow');

                invetsee_email_list.setDisplayType('hidden');
                o_cc_quarter.setDisplayType('hidden');
                o_cc_year.setDisplayType('hidden');
                o_cc_due_dt.setDisplayType('hidden');
            }
            form_email_alert.setScript('customscript_acc_compliance_email_sent');
            form_email_alert.addButton('custpage_gohome', 'Refresh', 'gohomescreen()');
            response.writePage(form_email_alert);
        } catch (e) {

            if (e instanceof nlobjError) {
                nlapiLogExecution('DEBUG', 'Get Screen--system error', e.getCode() + '\n' + e.getDetails());
            } else {
                nlapiLogExecution('DEBUG', 'Get Screen--Unexpected error', e.toString());
            }
        }
        //			 catch(error)
        //			 {
        //				 nlapiLogExecution('debug','Get Screen Error',error);
        //				 throw nlapiCreateError("404",error.toString(),true);
        //			 }

    } //  if(request.getMethod()=='GET')
    else //post request method of suitelet
    {
        try {
            var ondemand = request.getParameter('custpage_cc_ondemand_chkbox');
            var scheduled = request.getParameter('custpage_cc_schedule_chkbox');

            if (ondemand == 'T') // Post Method for the On Demand check box
            {
                var cc_quarter = request.getParameter('custpage_on_ccqrtr');
                var cc_year = request.getParameter('custpage_on_ccyear');
                var cc_duedt = request.getParameter('custpage_reminder_duedt');
                var cc_checkList = request.getParameter('custpage_on_ccchecklist');
                var cc_half = request.getParameter('custpage_on_ccschalf');
                var cc_sereies_name = request.getParameter('custpage_cs_series_names');

                var a_months_list = ['', 'mar', 'jun', 'sep', 'dec'];
                var s_qurter_nm = a_months_list[cc_quarter];
                var a_half_list = ["", "First Half", "Second Half"];
                var s_half_nm = a_half_list[cc_half];
                var sublistcount = request.getLineItemCount('custpage_investee_email_sublist');
                //		            nlapiLogExecution('debug','cc_duedt::',cc_duedt);
                var investee_list = [];
                nlapiLogExecution('debug', 'sublistcount', sublistcount);
                for (var m = 1; m <= sublistcount; m++) {
                    var a_cmp_checked = request.getLineItemValue('custpage_investee_email_sublist', 'custpage_checkbox', m);
                    if (a_cmp_checked == 'T') {
						
                        investee_list.push(request.getLineItemValue('custpage_investee_email_sublist', 'custpage_invetseename', m));
                    }
                }
				nlapiLogExecution('debug', '********investee_list*******', investee_list.length);
                var str = JSON.stringify(investee_list);
                var context_obj = nlapiGetContext();
                var current_user_id = context_obj.getUser();


                var i_params = new Array();
                i_params['custscript_acc_con_investeeids_list'] = str;
                i_params['custscript_conditions_chklist'] = 5;

                nlapiLogExecution('debug', 'i_params', JSON.stringify(i_params));
                if (log_Valid(cc_duedt)) {
                    cc_duedt = nlapiStringToDate(cc_duedt);
                    nlapiLogExecution('debug', 'check14__', cc_duedt.getDate());
                    cc_duedt = cc_duedt.getDate() + '/' + (cc_duedt.getMonth() + 1) + '/' + cc_duedt.getFullYear();
                }
                nlapiLogExecution('debug', 'str' + str);
                var params = new Array();
                params['custscript_acc_investeeids_list'] = str;
                params['custscript_compliance_parameter'] = 1;

                if (cc_checkList == '2') // sandbox  if(cc_checkList == '1')
                {
                    params['custscript_acc_cmpquarter'] = cc_year + '_' + cc_duedt;
                } else if (cc_checkList == '1') // sandbox if(cc_checkList == '2')
                {
                    params['custscript_acc_cmpquarter'] = s_qurter_nm + '_' + cc_year + '_' + cc_duedt;
                } else if (cc_checkList == '4') // '5' "Conditions Subsequent" Added By Ganesh Reddy
                {
                    params['custscript_acc_cmpquarter'] = s_half_nm + '_' + cc_year + '_' + cc_duedt;
                }
                else if (cc_checkList == '5' )
                {
                    params['custscript_cs_series_number'] = cc_sereies_name;
                }
                params['custscript_cs_series_number'] = cc_sereies_name;
                params['custscript_slcted_checklist'] = cc_checkList;

                nlapiLogExecution('debug', 'params', JSON.stringify(params));
                nlapiLogExecution('debug', 'investee_list[0]', investee_list[0]);
                nlapiLogExecution('debug', 'cc_sereies_name', cc_sereies_name);
                //response.sendRedirect('SUITELET','customscript_acc_compliance_chklist','customdeploy_acc_compliance_chklist');
                 nlapiLogExecution('debug', 'cc_checkList', cc_checkList);
				 if(!cc_sereies_name){
					 cc_sereies_name=' '
				 }
                if (cc_checkList == '5') {
                       nlapiLogExecution('debug', 'inside if 5', 'inside if');
                    var check_cs_dups = nlapiSearchRecord("customrecord_acc_compliance_investee",null,
                    [
                     ["custrecord_cc_type","anyof","5"],
                     "AND",
                     ["custrecord_acc_comp_investee_company_nam","anyof",investee_list[0]],
                     "AND",
                     ["custrecord28","anyof",cc_sereies_name]
                    ],
                    [

                    ]
                    );

                    nlapiLogExecution('debug', 'check_cs_dups', check_cs_dups);
                    if(check_cs_dups)
                    {
                      var status = nlapiScheduleScript('customscript_acc_sch_mis_maildrop', 'customdeploy_acc_sch_mis_maildrop', params);

                      var form_Compliance = nlapiCreateForm('Compliance Checklist Reminders', true);
                      form_Compliance.addButton('custpage_goback', 'Go Back', 'goback()');
                      var lbl_field = form_Compliance.addField('custpage_labl', 'text', '');
                      lbl_field.setDefaultValue('Compliance Checklist Email Reminder Initiated Successfully');
                      lbl_field.setDisplayType('inline');
                      form_Compliance.setScript('customscript_acc_compliance_email_sent');
                      response.writePage(form_Compliance);

                    }
                    else
                    {
                    nlapiLogExecution('debug', 'enter');
					nlapiLogExecution('debug', 'Investee list' +investee_list);
                    var createReccord = nlapiCreateRecord('customrecord_acc_compliance_investee');
                    //createReccord.setFieldValue('custrecord_acc_comp_nameofsign', name_signatory);
                    //createReccord.setFieldValue('custrecord_acc_comp_designation', designation);
                    createReccord.setFieldValue('custrecord_acc_comp_investee_company_nam', investee_list[0]);
                  createReccord.setFieldValue('custrecord_acc_comp_quarter','Dec2022');
                    //createReccord.setFieldValue('custrecord_acc_comp_du_date', set_duedt);
                    createReccord.setFieldValue('custrecord_acc_compliance_status', 1);
                    createReccord.setFieldValue('custrecord_cc_type', cc_checkList);
                    createReccord.setFieldValue('custrecord28', cc_sereies_name);
                    // createReccord.setFieldValue('custrecord_acc_investee_do_offcr', do_id);
                    var CreatedID = nlapiSubmitRecord(createReccord, true, true);
                    nlapiLogExecution('debug', 'CreatedID:' + CreatedID);

                    var ext_url = "https://5095851-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=801&deploy=1&compid=5095851_SB1&h=de0ca05fa8b9d8c0f054";     
					//"https://5095851.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=801&deploy=1&compid=5095851&h=147d45deff4c7d136e68";
                    i_params['custscript_checklist_for_investee'] = CreatedID;
                    nlapiSetRedirectURL('EXTERNAL', ext_url, 'customdeploy_acc_sut_conditions_subseque', false, i_params);
                    }

                    //nlapiSetRedirectURL('suitelet', nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId());
                } else {

                    var status = nlapiScheduleScript('customscript_acc_sch_mis_maildrop', 'customdeploy_acc_sch_mis_maildrop', params);

                    var form_Compliance = nlapiCreateForm('Compliance Checklist Reminders', true);
                    form_Compliance.addButton('custpage_goback', 'Go Back', 'goback()');
                    var lbl_field = form_Compliance.addField('custpage_labl', 'text', '');
                    lbl_field.setDefaultValue('Compliance Checklist Email Reminder Initiated Successfully');
                    lbl_field.setDisplayType('inline');
                    form_Compliance.setScript('customscript_acc_compliance_email_sent');
                    response.writePage(form_Compliance);


                }


            } // Ends if(ondemand == 'T' )


            if (scheduled == 'T') // Post Method for the On Schedule check box
            {
                var dateis = request.getParameter('custpage_reminder_dt');
                var duedt = request.getParameter('custpage_reminder_schduedt');
                duedt = nlapiStringToDate(duedt);

                nlapiLogExecution('debug', 'dateis:' + dateis);

                var quarter = request.getParameter('custpage_sch_hiddenfieldval');
                nlapiLogExecution('debug', 'quarterselectedNow:' + quarter);
                quarter = Number(quarter);
                var quarters = [2, 5, 8, 11];
                var current_dt = new Date();

                var quarter_year;
                var year = current_dt.getFullYear();
                var prev_year = year - 1;
                var dt = new Date();
                var current_mnth = dt.getMonth();
                if (Number(current_mnth) != 0 && Number(current_mnth) != 1) {
                    QuarterNames = ['Mar ' + year + '', 'Jun ' + year + '', 'Sep ' + year + '', 'Dec ' + year + ''];
                } else {
                    QuarterNames = ['Mar ' + prev_year + '', 'Jun ' + prev_year + '', 'Sep ' + prev_year + '', 'Dec ' + prev_year + ''];
                }
                //		        	var QuarterNames = ['Mar '+current_dt.getFullYear(),'Jun '+current_dt.getFullYear(),'Sept'+current_dt.getFullYear(),'Dec'+current_dt.getFullYear()]
                var quarterName = QuarterNames[Number(quarter)];


                if (quarter != 3) {
                    var quarter_startmnth = Number(quarters[Number(quarter)]);
                    var quarter_endmnth = Number(quarters[Number(quarter)]) + 3;
                    nlapiLogExecution('debug', 'quarter_startmnth:' + quarter_startmnth);
                    nlapiLogExecution('debug', 'quarter_endmnth:' + quarter_endmnth);

                    var schedule_dt = nlapiStringToDate(dateis);
                    nlapiLogExecution('debug', 'schedule_11dt' + schedule_dt);

                    //		            	var firstDay = new Date(current_dt.getFullYear(),quarter_startmnth, 1);
                    //		            	var lastDay = new Date(current_dt.getFullYear(), quarter_endmnth, 0);


                    var current_dt = new Date();
                    var cur_dt = new Date();
                    var chk_mnth = cur_dt.getMonth();
                    if (chk_mnth != 0 && chk_mnth != 1) {
                        var firstDay = new Date(current_dt.getFullYear(), quarter_startmnth, 1);
                        var lastDay = new Date(current_dt.getFullYear(), quarter_endmnth, 0);
                    } else {
                        var firstDay = new Date(current_dt.getFullYear() - 1, quarter_startmnth, 1);
                        var lastDay = new Date(current_dt.getFullYear() - 1, quarter_endmnth, 0);
                    }


                    var firstDay_is = nlapiDateToString(firstDay);
                    var lastDay_is = nlapiDateToString(lastDay);

                    nlapiLogExecution('debug', 'First:' + firstDay_is);
                    nlapiLogExecution('debug', 'Last:' + lastDay_is);
                    firstDay_is = nlapiStringToDate(firstDay_is);
                    lastDay_is = nlapiStringToDate(lastDay_is);
                } else {
                    var quarter_startmnth = Number(quarters[Number(quarter)]);
                    var quarter_endmnth = 2;
                    nlapiLogExecution('debug', 'quarter_startmnth:' + quarter_startmnth);
                    nlapiLogExecution('debug', 'quarter_endmnth:' + quarter_endmnth);


                    var schedule_dt = nlapiStringToDate(dateis);
                    nlapiLogExecution('debug', 'schedule_2dt' + schedule_dt);
                    var current_dt = new Date();
                    var QuarterNames = ['Mar' + current_dt.getFullYear(), 'June' + current_dt.getFullYear(), 'Sept' + current_dt.getFullYear(), 'Dec' + current_dt.getFullYear()]

                    //		            	var firstDay = new Date(current_dt.getFullYear(),quarter_startmnth, 1);
                    //		            	var lastDay = new Date(schedule_dt.getFullYear()+1, quarter_endmnth, 0);

                    var cur_dt = new Date();
                    var chk_mnth = cur_dt.getMonth();
                    if (chk_mnth != 0 && chk_mnth != 1) {
                        var firstDay = new Date(current_dt.getFullYear(), quarter_startmnth, 1);
                        var lastDay = new Date(current_dt.getFullYear() + 1, quarter_endmnth, 0);
                    } else {
                        var firstDay = new Date(current_dt.getFullYear() - 1, quarter_startmnth, 1);
                        var lastDay = new Date(current_dt.getFullYear(), quarter_endmnth, 0);
                    }

                    var firstDay_is = nlapiDateToString(firstDay);
                    var lastDay_is = nlapiDateToString(lastDay);

                    nlapiLogExecution('debug', 'First_third:' + firstDay_is);
                    nlapiLogExecution('debug', 'Last_third:' + lastDay_is);
                    firstDay_is = nlapiStringToDate(firstDay_is);
                    lastDay_is = nlapiStringToDate(lastDay_is);
                }

                nlapiLogExecution('debug', 'entered')
                var filter = [];
                var column = [];
                column.push(new nlobjSearchColumn('internalid'));
                filter.push(new nlobjSearchFilter('custrecord_acc_mis_cc_option', null, 'anyof', '2'));
                filter.push(new nlobjSearchFilter('custrecord_acc_date_for_scheduler', null, 'within', firstDay_is, lastDay_is));
                var Search_CC_Schedule = nlapiSearchRecord('customrecord_acc_mis_cc_scheduler_detail', null, filter, column)
                if (Search_CC_Schedule) {

                    nlapiLogExecution('debug', 'givendt:' + schedule_dt);
                    nlapiLogExecution('debug', 'Search_CC_Schedule' + Search_CC_Schedule.length);

                    var id = Search_CC_Schedule[0].getValue('internalid');
                    var Load_CMP_Scheduler = nlapiLoadRecord('customrecord_acc_mis_cc_scheduler_detail', id);
                    Load_CMP_Scheduler.setFieldValue('custrecord_acc_date_for_scheduler', schedule_dt);
                    Load_CMP_Scheduler.setFieldValue('custrecord_acc_duedt_selected', duedt);
                    Load_CMP_Scheduler.setFieldValue('custrecord_acc_quarter_selected', QuarterNames[Number(quarter)]);
                    Load_CMP_Scheduler.setFieldValue('custrecord_acc_month_selected_for_mis', '');
                    var recdordID = nlapiSubmitRecord(Load_CMP_Scheduler, true, true);
                    nlapiLogExecution('debug', ' recdordUpdatedID' + recdordID);

                    var form_Compliance = nlapiCreateForm('Compliance Checklist Reminders', true);
                    form_Compliance.addButton('custpage_goback', 'Go Back', 'goback()');
                    var lbl_field = form_Compliance.addField('custpage_labl', 'text', '');
                    lbl_field.setDefaultValue('Compliance Checklist Scheduler Date Updated Successfully')
                    lbl_field.setDisplayType('inline');
                    form_Compliance.setScript('customscript_acc_compliance_email_sent');
                    response.writePage(form_Compliance);

                } else {

                    var CMP_ScheduleRecord = nlapiCreateRecord('customrecord_acc_mis_cc_scheduler_detail');
                    CMP_ScheduleRecord.setFieldValue('custrecord_acc_mis_cc_option', '2');
                    CMP_ScheduleRecord.setFieldValue('custrecord_acc_date_for_scheduler', schedule_dt);
                    CMP_ScheduleRecord.setFieldValue('custrecord_acc_duedt_selected', duedt);
                    CMP_ScheduleRecord.setFieldValue('custrecord_acc_month_selected_for_mis', '');
                    CMP_ScheduleRecord.setFieldValue('custrecord_acc_quarter_selected', QuarterNames[Number(quarter)]);
                    var recdordID = nlapiSubmitRecord(CMP_ScheduleRecord, true, true);
                    nlapiLogExecution('debug', ' recdordCreatedID' + recdordID);

                    var form_Compliance = nlapiCreateForm('Compliance Checklist Reminders', true);
                    form_Compliance.addButton('custpage_goback', 'Go Back', 'goback()');
                    var lbl_field = form_Compliance.addField('custpage_labl', 'text', '');
                    lbl_field.setDefaultValue('Compliance Checklist Scheduler Date Created Successfully')
                    lbl_field.setDisplayType('inline');
                    form_Compliance.setScript('customscript_acc_compliance_email_sent');
                    response.writePage(form_Compliance);
                }

            } // Ends if(scheduled == 'T')

        } // Ends try block
        catch (error) {
            nlapiLogExecution('debug', 'Post Submission Error', error.toString());
            throw nlapiCreateError("404", error.toString(), true);
        }

    } // Ends Post Block
}

// END SUITELET ====================================================




function select_pending_rminders_tosnt_btn(i_cc_quarter, i_cc_half, i_cc_year, i_cc_checklisttype, invetsee_email_list) {
    try {
        var o_inv_Search = InvsteeSearch_function()
        if (i_cc_checklisttype == '2' || i_cc_checklisttype == '4' || i_cc_checklisttype == '5') //FCPA
        {
            i_cc_quarter = "dummy";
        }
        if (log_Valid(i_cc_quarter) && log_Valid(i_cc_year) && (i_cc_checklisttype)) {
            nlapiLogExecution('debug', 'select_pending_rmder***i_cc_year***', i_cc_year)

            var cmp_qrtr_year;
            if (i_cc_checklisttype == '1') //qcc
            {
                var quarter_listoption = i_cc_quarter.toString()
                quarter_listoption = quarter_listoption.substring(0, 3);
                cmp_qrtr_year = quarter_listoption + i_cc_year;
            } else if (i_cc_checklisttype == '2') //fcpa
            {
                cmp_qrtr_year = i_cc_year;
            }
            if (i_cc_checklisttype == '4' || i_cc_checklisttype == '5') // '5' 'Conditions Subsequent' Added By Ganesh Reddy
            {

                if (i_cc_half == 1) {
                    var icc_half_string = 'firsthalf';
                }
                if (i_cc_half == 2) {
                    var icc_half_string = 'secondhalf';
                }
                cmp_qrtr_year = icc_half_string + i_cc_year;

            }
            nlapiLogExecution('debug', 'select_pending_rmder***cmp_qrtr_year***', cmp_qrtr_year)
            var a_checklist = [];
            a_checklist.push(i_cc_checklisttype)
            var a_investee_List = [];
            var o_sentdate_btn = {};
            var o_filleddate_btn = {};
            var o_review_status = {};
            var customrecord_acc_compliance_investeeSearch = nlapiSearchRecord("customrecord_acc_compliance_investee", null,
                [
                    ["custrecord_acc_comp_quarter", "is", cmp_qrtr_year.toString()],
                    "AND",
                    ["custrecord_cc_type", "anyof", a_checklist[0]],
					 "AND", 
                    ["custrecord_acc_compliance_status","noneof","2"]
                ],
                [
                    new nlobjSearchColumn("name", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM").setSort(false),
                    new nlobjSearchColumn("internalid", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM"),
                    new nlobjSearchColumn("custrecord_acc_cmp_in_dt_filled"),
                    new nlobjSearchColumn("custrecord_acc_cmp_in_dt_sent"),
                    new nlobjSearchColumn("custrecord_acc_cmp_final_review_done")

                ]
            );


            nlapiLogExecution('debug', 'customrecord_acc_compliance_investeeSearch***', customrecord_acc_compliance_investeeSearch)
            if (log_Valid(customrecord_acc_compliance_investeeSearch)) {
                for (var k = 0; k < customrecord_acc_compliance_investeeSearch.length; k++) {
                    if (a_investee_List.indexOf(customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM")) == -1) {
                        if (customrecord_acc_compliance_investeeSearch[k].getValue("custrecord_acc_cmp_in_dt_sent")) {
                            o_sentdate_btn[customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM")] = customrecord_acc_compliance_investeeSearch[k].getValue("custrecord_acc_cmp_in_dt_sent") + ' for the Quarter ' + cmp_qrtr_year;
                            if (customrecord_acc_compliance_investeeSearch[k].getValue("custrecord_acc_cmp_in_dt_filled")) {
                                o_filleddate_btn[customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM")] = customrecord_acc_compliance_investeeSearch[k].getValue("custrecord_acc_cmp_in_dt_filled") + ' for the Quarter ' + cmp_qrtr_year;
                            } else {
                                o_filleddate_btn[customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM")] = " ";
                            }
                            a_investee_List.push(customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM"))
                            if (customrecord_acc_compliance_investeeSearch[k].getValue("custrecord_acc_cmp_in_dt_sent") == true) {
                                o_review_status[customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM")] = ' (Closed) ' + cmp_qrtr_year;
                            } else {
                                o_review_status[customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM")] = ' (Pending) ' + cmp_qrtr_year;
                            }

                        }
                    }
                }
            }
            nlapiLogExecution('debug', 'Select_tobe_sent_o_inv_Search', o_inv_Search.length)
            //		    		var sublistlineCount = nlapiGetLineItemCount('custpage_investee_email_sublist');
            for (var j = 1; j <= o_inv_Search.length; j++) {
                var i_investee_id = o_inv_Search[j - 1].getId();
              nlapiLogExecution('debug', 'i_investee_id', i_investee_id)
				var checkCountry = nlapiLookupField('customrecord_acc_investee', i_investee_id, 'custrecord_acc_investee_incorporated');
				nlapiLogExecution('debug', 'checkCountry*****105****India', checkCountry)

                if (a_investee_List.indexOf(i_investee_id) == -1) {
                  if(checkCountry==105){
                    invetsee_email_list.setLineItemValue('custpage_checkbox', j, 'T');
                  }
                    invetsee_email_list.setLineItemValue('custpage_investee_ids', j, o_inv_Search[j - 1].getValue('internalid'));
                    invetsee_email_list.setLineItemValue('custpage_invetseename', j, o_inv_Search[j - 1].getValue('internalid'));
                    invetsee_email_list.setLineItemValue('custpage_invetseenames', j, o_inv_Search[j - 1].getValue('name'));
                    //
                    invetsee_email_list.setLineItemValue('custpage_lastcc_senton', j, " ");
                    invetsee_email_list.setLineItemValue('custpage_lastcc_filledon', j, " ");
                    invetsee_email_list.setLineItemValue('custpage_review_period', j, " ");
                } else if (a_investee_List.indexOf(i_investee_id) >= 0) {
                    invetsee_email_list.setLineItemValue('custpage_checkbox', j, 'F');

                    invetsee_email_list.setLineItemValue('custpage_investee_ids', j, o_inv_Search[j - 1].getValue('internalid'));
                    invetsee_email_list.setLineItemValue('custpage_invetseename', j, o_inv_Search[j - 1].getValue('internalid'));
                    invetsee_email_list.setLineItemValue('custpage_invetseenames', j, o_inv_Search[j - 1].getValue('name'));

                    invetsee_email_list.setLineItemValue('custpage_lastcc_senton', j, o_sentdate_btn[i_investee_id]);
                    invetsee_email_list.setLineItemValue('custpage_lastcc_filledon', j, o_filleddate_btn[i_investee_id]);
                    invetsee_email_list.setLineItemValue('custpage_review_period', j, o_review_status[i_investee_id]);
                }

            } // Ends for(var j=1;j<=o_inv_Search.length;j++)

        } // Ends if(log_Valid(i_cc_quarter) && log_Valid(i_cc_year) && (i_cc_checklisttype))

    } // Ends try block
    catch (error) {
        nlapiLogExecution('debug', 'Select Pending Reminders Error', error.tostring());
        throw nlapiCreateError("404", error.toString(), true);
    }

} //Ends Pending REminders sending  function()


function select_rminders_nofilled_btn(i_cc_quarter, i_cc_half, i_cc_year, i_cc_checklisttype, invetsee_email_list) {
    try {
        var o_inv_Search = InvsteeSearch_function();
        if (i_cc_checklisttype == '2' || i_cc_checklisttype == '4' || i_cc_checklisttype == '5') {
            i_cc_quarter = "dummy";
        }
        if (log_Valid(i_cc_quarter) && log_Valid(i_cc_year) && (i_cc_checklisttype)) {
            var cmp_qrtr_year;
            if (i_cc_checklisttype == '1') // QC Compliance
            {
                var quarter_listoption = i_cc_quarter.toString()
                quarter_listoption = quarter_listoption.substring(0, 3);
                cmp_qrtr_year = quarter_listoption + i_cc_year;
            } else if (i_cc_checklisttype == '2') // FCPA
            {
                cmp_qrtr_year = i_cc_year;
            }
            if (i_cc_checklisttype == '4' || i_cc_checklisttype == '5') // '5' 'Conditions Subsequent' Added By Ganesh Reddy
            {
                if (i_cc_half == 1) {
                    var icc_half_string = 'firsthalf';
                }
                if (i_cc_half == 2) {
                    var icc_half_string = 'secondhalf';
                }
                cmp_qrtr_year = icc_half_string + i_cc_year;

            }
            nlapiLogExecution('debug', 'cmp_qrtr_year***', cmp_qrtr_year)

            var a_checklist = [];
            a_checklist.push(i_cc_checklisttype);
            var a_investee_List = [];
            var o_sentdate_btn = {};
            var o_filleddate_btn = {};
            var o_review_status = {};
            nlapiLogExecution('debug',"a_checklist",a_checklist[0])
            var customrecord_acc_compliance_investeeSearch = nlapiSearchRecord("customrecord_acc_compliance_investee", null,
                [
                    ["custrecord_acc_comp_quarter", "is", cmp_qrtr_year.toString()],
                    "AND",
                    ["custrecord_cc_type", "anyof", a_checklist[0]],
                    "AND", 
                    ["custrecord_acc_compliance_status","noneof","2"]

                ],
                [

                    new nlobjSearchColumn("name", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM").setSort(false),
                    new nlobjSearchColumn("internalid", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM"),
                    new nlobjSearchColumn("custrecord_acc_cmp_in_dt_filled"),
                    new nlobjSearchColumn("custrecord_acc_cmp_in_dt_sent"),
                    new nlobjSearchColumn("custrecord_acc_cmp_final_review_done"),

                ]
            );
            nlapiLogExecution('debug', 'customrecord_acc_compliance_investeeSearch', customrecord_acc_compliance_investeeSearch.length);
            if (customrecord_acc_compliance_investeeSearch) {
                for (var k = 0; k < customrecord_acc_compliance_investeeSearch.length; k++) {
                    if (a_investee_List.indexOf(customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM")) == -1) {
                        if (customrecord_acc_compliance_investeeSearch[k].getValue("custrecord_acc_cmp_in_dt_sent")) {
                            o_sentdate_btn[customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM")] = customrecord_acc_compliance_investeeSearch[k].getValue("custrecord_acc_cmp_in_dt_sent") + ' for the Quarter ' + cmp_qrtr_year;
                        }

                        if (customrecord_acc_compliance_investeeSearch[k].getValue("custrecord_acc_cmp_in_dt_filled")) {
                            o_filleddate_btn[customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM")] = customrecord_acc_compliance_investeeSearch[k].getValue("custrecord_acc_cmp_in_dt_filled") + ' for the Quarter ' + cmp_qrtr_year;
                        }

                        a_investee_List.push(customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM"))
                        if (customrecord_acc_compliance_investeeSearch[k].getValue("custrecord_acc_cmp_in_dt_sent") == true) {
                            o_review_status[customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM")] = ' (Closed) ' + cmp_qrtr_year;
                        } else {
                            o_review_status[customrecord_acc_compliance_investeeSearch[k].getValue("internalid", "CUSTRECORD_ACC_COMP_INVESTEE_COMPANY_NAM")] = ' (Pending) ' + cmp_qrtr_year;
                        }

                    }

                } // Ends for(var k=0;k<customrecord_acc_compliance_investeeSearch.length;k++)

            } // Ends if(customrecord_acc_compliance_investeeSearch)


            nlapiLogExecution('debug', 'Select_tobe_FILLED_o_inv_Search', o_inv_Search.length)
            for (j = 1; j <= o_inv_Search.length; j++) {
                var i_investee_id = o_inv_Search[j - 1].getId();

                if (a_investee_List.indexOf(i_investee_id) == -1) {
                    invetsee_email_list.setLineItemValue('custpage_checkbox', j, 'F');
                    invetsee_email_list.setLineItemValue('custpage_investee_ids', j, o_inv_Search[j - 1].getValue('internalid'));
                    invetsee_email_list.setLineItemValue('custpage_invetseename', j, o_inv_Search[j - 1].getValue('internalid'));
                    invetsee_email_list.setLineItemValue('custpage_invetseenames', j, o_inv_Search[j - 1].getValue('name'));
                    //
                    invetsee_email_list.setLineItemValue('custpage_lastcc_senton', j, " ");
                    invetsee_email_list.setLineItemValue('custpage_lastcc_filledon', j, " ");
                    invetsee_email_list.setLineItemValue('custpage_review_period', j, " ");
                } else if (a_investee_List.indexOf(i_investee_id) >= 0) {
                    invetsee_email_list.setLineItemValue('custpage_checkbox', j, 'T');

                    invetsee_email_list.setLineItemValue('custpage_investee_ids', j, o_inv_Search[j - 1].getValue('internalid'));
                    invetsee_email_list.setLineItemValue('custpage_invetseename', j, o_inv_Search[j - 1].getValue('internalid'));
                    invetsee_email_list.setLineItemValue('custpage_invetseenames', j, o_inv_Search[j - 1].getValue('name'));

                    invetsee_email_list.setLineItemValue('custpage_lastcc_senton', j, o_sentdate_btn[i_investee_id]);
                    invetsee_email_list.setLineItemValue('custpage_lastcc_filledon', j, " ");
                    invetsee_email_list.setLineItemValue('custpage_review_period', j, o_review_status[i_investee_id]);
                }

            } // ENDs for(j=1;j<=o_inv_Search.length;j++)

        } // Ends  if(log_Valid(i_cc_quarter) && log_Valid(i_cc_year) && (i_cc_checklisttype))

    } // Ends try block
    catch (error) {
        nlapiLogExecution('debug', 'Select Pending Reminders Error', error.tostring());
        throw nlapiCreateError("404", error.toString(), true);
    } // Ends Catch Block

} //Ends Select sent but not filled function()

function InvsteeSearch_function() {
    var column = [];
    column.push(new nlobjSearchColumn('name'));
    column.push(new nlobjSearchColumn('internalid'));
    column.push(new nlobjSearchColumn('custrecord_acc_cc_closing_pending'));
    var filter = [];
    filter.push(new nlobjSearchFilter("isinactive", null, "is", "F"))
    filter.push(new nlobjSearchFilter("custrecord_acc_investee_status", null, "anyof", "10"))
    var o_InvesteeSearch = nlapiSearchRecord('customrecord_acc_investee', null, filter, column)
    nlapiLogExecution('debug', 'o_InvesteeSearch***', o_InvesteeSearch.length);
    return o_InvesteeSearch;

} // Ends Investee Search Function


function Complience_Checklist() {
    var customrecord_acc_cc_checklisttypeSearch = nlapiSearchRecord("customrecord_acc_cc_checklisttype", null,
        [
            ["isinactive", "is", "F"]
        ],
        [
            new nlobjSearchColumn("name").setSort(false)
        ]
    );
    return customrecord_acc_cc_checklisttypeSearch;
}

function calculateYear(ccyear) {
    ccyear.addSelectOption("", "");
    var array = [];
    for (var i = 0; i < 5; i++) {
        var date = new Date();
        var datayear = date.getFullYear() - i;
        array.push(datayear);
    }
    for (var i = 1; i < 3; i++) {
        var date = new Date();
        var datayear = date.getFullYear() + i;
        array.push(datayear);
    }
    array.sort();
    for (var i = 0; i < array.length; i++) {
        ccyear.addSelectOption(array[i], array[i]);
    }
} // Ends calculateYear function()

function log_Valid(value) {
    if (value != null && value != '' && value != undefined && value.toString() != 'NaN') {
        return true;
    } else {
        return false;
    }
}




function _nullValidation(val) {
    if (val == null || val == undefined || val == '' || val.toString() == "undefined" || val.toString() == "NaN" || val.toString() == "null" || val.toString() == NaN) {
        return true;
    } else {
        return false;
    }
}