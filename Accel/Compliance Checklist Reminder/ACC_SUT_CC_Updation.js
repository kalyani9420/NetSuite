//BEGIN SCRIPT DESCRIPTION BLOCK  ==================================
{
    /*
    		    	Script Name: ACC_SUT_CC_Updation.js
    		    	Author:  J Phani Kunar
    		    	Company: Inspirria Cloudtech
    		    	Date:  10-12-2018
    		    	Description:  Compliance Checklist record creation by suitelet

    		    	Script Modification Log:

    		    	-- Date --			-- Modified By --				--Requested By--				-- Description --
    			     17 April 2019		 	Anuradha						Amit J 					Added code to getting parameter and storing in hidden  filed.
    			     27 Feb 2020			Phani Kumar					Anuradha Mohril					Try Catch Blocks Updated



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
//END SCRIPT DESCRIPTION BLOCK  ====================================



//BEGIN GLOBAL VARIABLE BLOCK  =====================================
{
    //  Initialize any Global Variables, in particular, debugging variables...

}
//END GLOBAL VARIABLE BLOCK  =======================================


//BEGIN SUITELET ==================================================


function accel_sample_investee(request, response)
{
    nlapiLogExecution('debug', 'OUTSIDE-start-execution  51', request.getMethod())
    if (request.getMethod() == 'GET')
	{
        nlapiLogExecution('debug', 'START Execution-request  54', request);
        var duedt = request.getParameter('duedt');
        nlapiLogExecution('debug', 'GET START Execution-duedt 56', duedt);
      if(duedt){
        var dateArray=duedt.split('\/')
        nlapiLogExecution('debug', 'dateArray 59',dateArray);
        var dateString=''+dateArray[2]+'/'+dateArray[1]+'/'+dateArray[0]
        nlapiLogExecution('debug', 'dateString 61',dateString);
         duedt=new Date(dateString);

               /*  var today = new Date();

         if(today > duedt){
            throw "link has expired on "+ duedt;
         }*/
      }
       // duedt = nlapiStringToDate(duedt);
        nlapiLogExecution('debug', 'GET START Execution-duedt after 65',duedt);
        var emailis = request.getParameter('mail');
        nlapiLogExecution('debug', 'START Execution-emailis 67', emailis);


        var investee = request.getParameter('inv');
        nlapiLogExecution('debug', 'START Execution-investee 71', investee);

        var cmpqrtr = request.getParameter('period');
        nlapiLogExecution('debug', 'START Execution-cmpqrtr 74', cmpqrtr);

        var compliancechecklisttype = request.getParameter('cclist');
        nlapiLogExecution('debug', 'START Execution--- compliancechecklisttype id  77', compliancechecklisttype);
        var i_chklist_5 = request.getParameter('cc_checkList');
        nlapiLogExecution('debug', 'i_chklist_5  79', i_chklist_5);



        //================Added By Ganesh Reddy (16-09-2020)=======================

        if (compliancechecklisttype == 1) {
            compliancechecklisttype = 'Quarterly Compliance'
                      var today = new Date();

           /* if(today > duedt){
               throw "link has expired on "+ duedt;
            }*/
        }
        if (compliancechecklisttype == 2) {
            compliancechecklisttype = 'FCPA'
        }
        if (compliancechecklisttype == 4) {
            compliancechecklisttype = 'Subsidiary Confirmation'
        }
		if (compliancechecklisttype == 5) {
            compliancechecklisttype = 'Conditions Subsequent'
        }
        //======================END(16-09-2020)============================
        ///17-Apr-2019
        var s_salutaion = request.getParameter('nm');
        var c_user = request.getParameter('user');

if(compliancechecklisttype == 5)
{
	nlapiLogExecution('debug', 'compliancechecklisttype  104', compliancechecklisttype);
            try {

                var ddt = request.getParameter('ddt');
                nlapiLogExecution('debug', 'chklist5:GET-ELSE-ddt :  108', ddt)


                var cmpqrtr = request.getParameter('period');
                nlapiLogExecution('debug', 'chklist5:GET-ELSE-cmpqrtr :  112', cmpqrtr)

                var compliancechecklisttype = request.getParameter('cclist');
                nlapiLogExecution('debug', 'chklist5:GET-ELSE-chklisttype :  115', compliancechecklisttype)



                var form_cc = nlapiCreateForm('Conditions Subsequent', true);

                var do_id_fld = form_cc.addField('custpage_do_id', 'text', 'do_id');
                if(do_id)
                do_id_fld.setDefaultValue(do_id);
                do_id_fld.setDisplayType('hidden');

                // nlapiLogExecution('debug', '171 - cmpqrtr' + cmpqrtr);
                //			            nlapiLogExecution('debug', 'ddt' + ddt);

                var duedate_fld = form_cc.addField('custpage_ddt', 'text', 'Due Date');
                duedate_fld.setDefaultValue(ddt);
                duedate_fld.setDisplayType('hidden');

                // var linecount = form_cc.addField('custpage_cc_line_count', 'text', 'line count');
                 // linecount.setDisplayType('hidden');
                var Name_signatory = form_cc.addField('custpage_name_signatory', 'text', 'Name of Signatory');
                //								Name_signatory.setHelpText('Here, user would enter the Signatory Person from the Company.Shown to Investee.');
                Name_signatory.setLayoutType('startrow', 'startcol');
                Name_signatory.setMandatory(true);

                // var current_assets_help = form_cc.addField('custpage_on_current_assets_help', 'inlinehtml', 'RevenueHelp'); //
                // var tooltip_string = '<html> <style> .tooltip {   position: relative;   display: inline-block;   border-bottom: 1px dotted black; }  .tooltip .tooltiptext {   visibility: hidden;   width: 120px;   background-color: #555;   color: #fff;   text-align: center;   border-radius: 6px;   padding: 5px 0;   position: absolute;   z-index: 1;   bottom: 125%;   left: 50%;   margin-left: -60px;   opacity: 0;   transition: opacity 0.3s; }  .tooltip .tooltiptext::after {   content: "";   position: absolute;   top: 100%;   left: 50%;   margin-left: -5px;   border-width: 5px;   border-style: solid;   border-color: #555 transparent transparent transparent; }  .tooltip:hover .tooltiptext {   visibility: visible;   opacity: 1; } </style> <body style="text-align:center;">  <div class="tooltip" >Help? <span class="tooltiptext">Here, user would enter the Signatory Person from the Company.Shown to Investee.</span> </div>  </body> </html>';
                // current_assets_help.setDefaultValue(tooltip_string);
                // current_assets_help.setLayoutType('midrow', 'startcol');



                // var Name_Designation = form_cc.addField('custpage_name_designation', 'text', 'Designation');
                // //								Name_Designation.setHelpText('Here, user would enter the Signatory Person’s Designation.Shown to Investee.');
                // Name_Designation.setLayoutType('startrow', 'startcol');
                // Name_Designation.setMandatory(true);


                // var fixed_assets_help = form_cc.addField('custpage_on_fixed_assets_help', 'inlinehtml', 'RevenueHelp'); //
                // var tooltip_string = '<html> <style> .tooltip {   position: relative;   display: inline-block;   border-bottom: 1px dotted black; }  .tooltip .tooltiptext {   visibility: hidden;   width: 120px;   background-color: #555;   color: #fff;   text-align: center;   border-radius: 6px;   padding: 5px 0;   position: absolute;   z-index: 1;   bottom: 125%;   left: 50%;   margin-left: -60px;   opacity: 0;   transition: opacity 0.3s; }  .tooltip .tooltiptext::after {   content: "";   position: absolute;   top: 100%;   left: 50%;   margin-left: -5px;   border-width: 5px;   border-style: solid;   border-color: #555 transparent transparent transparent; }  .tooltip:hover .tooltiptext {   visibility: visible;   opacity: 1; } </style> <body style="text-align:center;">  <div class="tooltip" >Help? <span class="tooltiptext">Here, user would enter the Signatory Person’s Designation.Shown to Investee.</span> </div>  </body> </html>';
                // fixed_assets_help.setDefaultValue(tooltip_string);
                // fixed_assets_help.setLayoutType('midrow', 'startcol');


                // var cc_investee = form_cc.addField('custpage_name_companyname', 'select', 'Company Name', 'customrecord_acc_investee');
                // cc_investee.setLayoutType('startrow', 'startcol');

                form_cc.addSubmitButton();

                response.writePage(form_cc);
            } catch (error) {
                nlapiLogExecution('ERROR', 'chklist5:Compliance Sublist Screen   166', error.toString());
                throw nlapiCreateError("404", error.toString(), false);
            }
            nlapiLogExecution('debug', 'chklist5:GET Method ELSE part -- Ends Here  169');
}
   /*    else if (log_Valid(emailis) && !_nullValidation(emailis)) // OTP SCreen     
        {
            nlapiLogExecution('debug', 'INSIDE-IF-Method :', request.getMethod())
            try {
                var Current_Dt = new Date();
                //				            if (duedt.getTime() > Current_Dt.getTime())
                //							{
	//=================Added By Ganesh Reddy(27-10-2020)=====================
			var cclist = request.getParameter('cclist');

				if(cclist == '4')
				{
					var form_name = 'Subsidiary Confirmation ';
				}
				if(cclist == '2')
				{
						var form_name = 'FCPA Questionnaire';
				}
				if(cclist == '1')
				{
						var form_name = 'Compliance Checklist';
				}
				if(cclist == '5')
				{
					var form_name = 'Conditions Subsequent';
				}
	//========================(27-10-2020)======================
                /*var form_cc_otp = nlapiCreateForm(form_name, true);

                var duedate = form_cc_otp.addField('custpage_duedt', 'date', 'Due Date');
                nlapiLogExecution('debug', 'dueDate to set on field', duedt);
               duedate.setDefaultValue(duedt);
                //duedate.setDisplayType('hidden');

                nlapiLogExecution('debug', 'OTP Screen ---INVESTEE', investee);

                var context = nlapiGetContext();
                var cmpqrtr = request.getParameter('period');
                var d_id = request.getParameter('i_do_id');
                nlapiLogExecution('debug', 'd_id-3',d_id);
                var val = Math.random();
                var vals = String(val)
                var otpchecking_val = vals.split('.')[1];
                otpchecking_val = otpchecking_val.substr(0, 6);
                nlapiLogExecution('debug', 'OTP Screen --- Password is', otpchecking_val);
                var investee = request.getParameter('inv');
                var emailis = request.getParameter('mail');
                //var cclist = request.getParameter('cclist');
                nlapiLogExecution('debug', 'OTP Screen ---cclist for test', cclist);
                //	var cmp_mnth = request.getParameter('mnth');
                //=====================Added By Ganesh Reddy (16-09-2020)============================
            /*    var cc_otp_group = form_cc_otp.addFieldGroup('ccotpfieldgroup', 'An OTP has been sent to your mail, Please enter OTP and click on "CLICK HERE TO PROCEED" button to Complete ' + compliancechecklisttype );
                //================END (16-09-2020)=========================
                cc_otp_group.setSingleColumn(true);

                // var OTP_Label =  form_cc_otp.addField('custpage_ccotp_label','label','An OTP sent on your email id, lease enter OTP to go to the Compliance Checklist.').setLayoutType('startrow','startcol');
                var OTP = form_cc_otp.addField('custpage_ccotp', 'password', 'OTP', null, 'ccotpfieldgroup');
                OTP.setMandatory(true);
                var OTP_Check = form_cc_otp.addField('custpage_ccotp_chk', 'password', 'OTP Check');
                //	OTP_Label.setDisplayType('inline');

                form_cc_otp.addButton('custpage_validate', 'CLICK HERE TO PROCEED', 'validationotp()');
                var OTP_cmp_mnth = form_cc_otp.addField('custpage_ccqrtrmnth', 'text', 'mnth');
                OTP_cmp_mnth.setDefaultValue(cmpqrtr);

                var OTP_Mail = form_cc_otp.addField('custpage_otpccmail', 'text', 'Mail');
                var OTP_investee = form_cc_otp.addField('custpage_otpccinvestee', 'select', 'investee', 'customrecord_acc_investee');
                var otp_cclist = form_cc_otp.addField('custpage_cclist', 'text', 'cclist')
                ///17-Apr-2019
                var OTP_salutation = form_cc_otp.addField('custpage_ccsalutation', 'text', 'salutation');
                var field_id = form_cc_otp.addField('custpage_d_id', 'text', 'Director');
                nlapiLogExecution('debug', 'd_id',d_id);
                field_id.setDisplayType('hidden');
                if(d_id)
                field_id.setDefaultValue(d_id);
                if (investee) {
                    OTP_investee.setDefaultValue(investee);
                }

                OTP_Check.setDefaultValue(otpchecking_val);
                OTP_Mail.setDefaultValue(emailis);
                OTP_Check.setDisplayType('hidden');
                OTP_cmp_mnth.setDisplayType('hidden');
                OTP_Mail.setDisplayType('hidden');
                OTP_investee.setDisplayType('hidden');
                ///17/apr/2019
                OTP_salutation.setDefaultValue(s_salutaion);
                OTP_salutation.setDisplayType('hidden');
                otp_cclist.setDefaultValue(cclist);
                otp_cclist.setDisplayType('hidden');
                form_cc_otp.setScript('customscript_acc_cli_cc_updation');


                if (investee) {
                    var records = new Object();
                    records['recordtype'] = 3;
                    records['record'] = investee;
                }
                if (emailis && records) {

                    var strVar = '';
                    strVar += '<html><body>';
                    strVar += '<p>Hello ' + s_salutaion + ',</p>';
                    strVar += '<p>Your OTP is ' + otpchecking_val + '</p>';
                    strVar += '</body></html>';
                    nlapiLogExecution('debug', 'OTPSCreen ... strVar :', strVar);

                    nlapiSendEmail(374, emailis, 'Compliance Checklist OTP Verification', strVar, null, null, records, null, true, null, null); ////role_id
                    nlapiLogExecution('debug', 'OTPSCreen ... MAil sent to :', emailis);

                }

                nlapiLogExecution('debug', 'OTP Screen ENDS');
                response.writePage(form_cc_otp); 

            } // Ends try
            catch (error) {
                nlapiLogExecution('ERROR', 'Process Error in OTP Screen', error.toString());
                throw nlapiCreateError("404", error.toString(), false);
            }

        } */// ENDs ... OTP Screen
        else {
            nlapiLogExecution('debug', 'GET-ELSE-Method :  294', request.getMethod())
            try {

                var ddt = request.getParameter('duedt');
                nlapiLogExecution('debug', 'GET-ELSE-ddt :  298', ddt)


                var cmpqrtr = request.getParameter('period');
                nlapiLogExecution('debug', 'GET-ELSE-cmpqrtr :  302', cmpqrtr)

                var compliancechecklisttype = request.getParameter('cclist');
                nlapiLogExecution('debug', 'GET-ELSE-chklisttype :  305', compliancechecklisttype)

                var do_id =request.getParameter('do_id');
                nlapiLogExecution('debug', 'do_id -1   308' + do_id);
                if(compliancechecklisttype == '4')
				{
					var form_name = 'Subsidiary Confirmation';
				}
				if(compliancechecklisttype == '2')
				{
						var form_name = 'FCPA Questionnaire';
				}
				if(compliancechecklisttype == '1')
				{
						var form_name = 'Compliance Checklist';
				}
				if(compliancechecklisttype == '5')
				{
					var form_name = 'Conditions Subsequent';
				}

                var form_cc = nlapiCreateForm(form_name, true);

                var do_id_fld = form_cc.addField('custpage_do_id', 'text', 'do_id');
                if(do_id)
                do_id_fld.setDefaultValue(do_id);
                do_id_fld.setDisplayType('hidden');

                // nlapiLogExecution('debug', '171 - cmpqrtr' + cmpqrtr);
                //			            nlapiLogExecution('debug', 'ddt' + ddt);

                var duedate_fld = form_cc.addField('custpage_ddt', 'text', 'Due Date');
                duedate_fld.setDefaultValue(ddt);
                duedate_fld.setDisplayType('hidden');

                var linecount = form_cc.addField('custpage_cc_line_count', 'text', 'line count');
                 linecount.setDisplayType('hidden');
                var Name_signatory = form_cc.addField('custpage_name_signatory', 'text', 'Name of Signatory');
                //								Name_signatory.setHelpText('Here, user would enter the Signatory Person from the Company.Shown to Investee.');
                Name_signatory.setLayoutType('startrow', 'startcol');
                Name_signatory.setMandatory(true);

                var current_assets_help = form_cc.addField('custpage_on_current_assets_help', 'inlinehtml', 'RevenueHelp'); //
                var tooltip_string = '<html> <style> .tooltip {   position: relative;   display: inline-block;   border-bottom: 1px dotted black; }  .tooltip .tooltiptext {   visibility: hidden;   width: 120px;   background-color: #555;   color: #fff;   text-align: center;   border-radius: 6px;   padding: 5px 0;   position: absolute;   z-index: 1;   bottom: 125%;   left: 50%;   margin-left: -60px;   opacity: 0;   transition: opacity 0.3s; }  .tooltip .tooltiptext::after {   content: "";   position: absolute;   top: 100%;   left: 50%;   margin-left: -5px;   border-width: 5px;   border-style: solid;   border-color: #555 transparent transparent transparent; }  .tooltip:hover .tooltiptext {   visibility: visible;   opacity: 1; } </style> <body style="text-align:center;">  <div class="tooltip" >Help? <span class="tooltiptext">Here, user would enter the Signatory Person from the Company.Shown to Investee.</span> </div>  </body> </html>';
                current_assets_help.setDefaultValue(tooltip_string);
                current_assets_help.setLayoutType('midrow', 'startcol');



                var Name_Designation = form_cc.addField('custpage_name_designation', 'text', 'Designation');
                //								Name_Designation.setHelpText('Here, user would enter the Signatory Person’s Designation.Shown to Investee.');
                Name_Designation.setLayoutType('startrow', 'startcol');
                Name_Designation.setMandatory(true);


                var fixed_assets_help = form_cc.addField('custpage_on_fixed_assets_help', 'inlinehtml', 'RevenueHelp'); //
                var tooltip_string = '<html> <style> .tooltip {   position: relative;   display: inline-block;   border-bottom: 1px dotted black; }  .tooltip .tooltiptext {   visibility: hidden;   width: 120px;   background-color: #555;   color: #fff;   text-align: center;   border-radius: 6px;   padding: 5px 0;   position: absolute;   z-index: 1;   bottom: 125%;   left: 50%;   margin-left: -60px;   opacity: 0;   transition: opacity 0.3s; }  .tooltip .tooltiptext::after {   content: "";   position: absolute;   top: 100%;   left: 50%;   margin-left: -5px;   border-width: 5px;   border-style: solid;   border-color: #555 transparent transparent transparent; }  .tooltip:hover .tooltiptext {   visibility: visible;   opacity: 1; } </style> <body style="text-align:center;">  <div class="tooltip" >Help? <span class="tooltiptext">Here, user would enter the Signatory Person’s Designation.Shown to Investee.</span> </div>  </body> </html>';
                fixed_assets_help.setDefaultValue(tooltip_string);
                fixed_assets_help.setLayoutType('midrow', 'startcol');


                var cc_investee = form_cc.addField('custpage_name_companyname', 'select', 'Company Name', 'customrecord_acc_investee');
                cc_investee.setLayoutType('startrow', 'startcol');

                if (investee) {
                    cc_investee.setDefaultValue(investee);
                    cc_investee.setDisplayType('disabled');
                }

                //			            if(compliancechecklisttype == '1')
                //			            {
                //			            	 var quarter_listshow = form_cc.addField('custpage_frequency_schedule', 'date', 'Date');
                //					            quarter_listshow.setLayoutType('startrow', 'startcol');
                //			            }
                //			            else
                //			            {

                if (compliancechecklisttype == '1') {
                    var quarter_listshow = form_cc.addField('custpage_frequency_schedule', 'text', 'Quarter Ending');
                } else {
                    var quarter_listshow = form_cc.addField('custpage_frequency_schedule', 'text', 'Checklist Period');
                }
                quarter_listshow.setDefaultValue(cmpqrtr);

                quarter_listshow.setLayoutType('startrow', 'startcol');
                var dt = new Date();
                var year = dt.getFullYear();
                var prev_year = year - 1;
                var current_mnth = dt.getMonth();
                quarter_listshow.setDisplayType('disabled');
                //			            }

                form_cc.setScript('customscript_acc_cli_cc_updation');


                var obj_Act_Laws = getAllActsAndLaws(compliancechecklisttype);
                if (compliancechecklisttype == '2') // FCPA
                {
                    var s_fcpa_text_bfore_sublist = obj_Act_Laws[0].getValue('custrecord_text_fcpa_bfr_tble', 'custrecord_compliance_checklist_type')
                    if (s_fcpa_text_bfore_sublist) {
                        var fcpa_text_bfore_sublist = form_cc.addField('custpage_fcpa_text_bfore_sublist', 'textarea', '');
                        fcpa_text_bfore_sublist.setDefaultValue(s_fcpa_text_bfore_sublist);
                        fcpa_text_bfore_sublist.setDisplayType('readonly');
                        //				            	fcpa_text_bfore_sublist.setDisplayType('disabled');
                        fcpa_text_bfore_sublist.setLayoutType('outsidebelow', 'startrow');
                        fcpa_text_bfore_sublist.setDisplaySize(180, 3)
                    }
                }

                nlapiLogExecution('debug', 'compliancechecklisttype cclist for test   414', compliancechecklisttype);
                var otp_cclist = form_cc.addField('custpage_cclist', 'text', 'cclist')
                otp_cclist.setDefaultValue(compliancechecklisttype);
                otp_cclist.setDisplayType('hidden');
                form_cc.addSubmitButton();



                //===******** Adding Sublist ***********=====//

                if (compliancechecklisttype == "4" || compliancechecklisttype == "5") {

                  //  form_cc.addButton('custpage_addnewline', 'Add New Subsidary', 'addsub()');
                    var invetsee_email_list = form_cc.addSubList('custpage_cmp_sub_conf_sublist', 'inlineeditor', 'Subsidiary Confirmation');
                    //s_no.setDisplayType('entry');
                    nlapiLogExecution('debug', 'Subsidiary Confirmation Sublist added  429');
                    var s_no = invetsee_email_list.addField('custpage_cmp_sc_sno', 'text', 'S.No');
                    //s_no.setDisplayType('disabled');
                    //s_no.setDisplayType('entry');
                    var id = invetsee_email_list.addField('custpage_cmp_sc_investee_sub_id', 'text', 'ID');
                    id.setDisplayType('hidden');
                    nlapiLogExecution('debug', 'All Fields Added1  435');
                    var name_of_sub = invetsee_email_list.addField('custpage_cmp_sc_sub', 'text', 'Name of Subsidiary');
                    name_of_sub.setMandatory(true);
                    //name_of_sub.setDisplayType('disabled');
                    var date_of_incorporation = invetsee_email_list.addField('custpage_cmp_sc_date_inc', 'date', 'Date of Incorporation');
                    //date_of_incorporation.setDisplayType('disabled');
                    nlapiLogExecution('debug', 'All Fields Added2  441');
		 // ==============Added By Ganesh Reddy    (07-10-2020)=================
             // var o_subRec = nlapiLoadRecord('subsidiary',1);
			var o_subRec= nlapiCreateRecord('customrecord_acc_investee_subs_details');
			var o_currenyObj = o_subRec.getField('custrecord_acc_investeesuncountry');
			var options = o_currenyObj.getSelectOptions();
			var country_of_incorporation = invetsee_email_list.addField('custpage_cmp_sc_cntry_inc', 'select', 'Country of Incorporation');
			country_of_incorporation.addSelectOption("","");
			var date_of_seizing = invetsee_email_list.addField('custpage_cmp_sc_date_of_seizing', 'date', 'Date of Seizing');
			//date_of_seizing.setDisplayType('disabled');
			if(options)
			{
			for(var m =0 ; m<options.length ; m++)
			{
			country_of_incorporation.addSelectOption(options[m].getId(),options[m].getText());

			}
			}



		//==============(07-10-2020)
                    //country_of_incorporation.setDisplayType('disabled');
                    var responsex = invetsee_email_list.addField('custpage_cmp_sc_res', 'select', 'Response');
                    responsex.addSelectOption(1, "");
                    responsex.addSelectOption(2, 'Correct');
                    responsex.addSelectOption(3, 'Incorrect');
                    responsex.setDisplayType('entry');
                    responsex.setMandatory(true);
                    var additional_comment = invetsee_email_list.addField('custpage_cmp_sc_comment', 'text', 'Additional Comment')
                    additional_comment.setDisplayType('entry');
                    var add_files = invetsee_email_list.addField('custpage_cmp_sc_addfiles', 'text', 'Add Files')
                    add_files.setDisplayType('entry');
		//============Added By Ganesh Reddy (29-09-2020)====================
                    add_files.setDefaultValue("CLICK HERE TO ADD FILES");
		//===============(29-09-2020)============================
                    var supprt_doc = invetsee_email_list.addField('custpage_cmp_suprt_docs', 'textarea', 'Supporting Documents');
                    supprt_doc.setDisplayType('entry');
                    supprt_doc.setDisplayType('disabled');
                    var id_vals_field = invetsee_email_list.addField('custpage_cmp_idvals', 'textarea');
                    id_vals_field.setDisplayType('entry');
                    id_vals_field.setDisplayType('hidden');
                    nlapiLogExecution('debug', 'All Fields Added  483');
                    var inv_sub = nlapiSearchRecord("customrecord_acc_investee_subs_details", null,
                        [],
                        [
                            new nlobjSearchColumn("custrecord_acc_investeesuncountry")
                        ]
                    );
                    var countryArr = [];
                    country_of_incorporation.addSelectOption('-1',"");
                    for (k in inv_sub) {

                        if (countryArr.indexOf(inv_sub[k].getValue('custrecord_acc_investeesuncountry')) == '-1' && inv_sub[k].getValue('custrecord_acc_investeesuncountry')) {
                            country_of_incorporation.addSelectOption(inv_sub[k].getValue('custrecord_acc_investeesuncountry'), inv_sub[k].getText('custrecord_acc_investeesuncountry'));
                            countryArr.push(inv_sub[k].getValue('custrecord_acc_investeesuncountry'))
                        }
                    }
                    nlapiLogExecution('debug', 'test1  499');
                    nlapiLogExecution('debug', 'test3  500');
                    var investee_subs_detailsSearch = nlapiSearchRecord("customrecord_acc_investee_subs_details", null,
                        [
                            ["custrecord_inv_subsidiary_investee", "anyof", investee]
                        ],
                        [
                            new nlobjSearchColumn("internalid"),
                            new nlobjSearchColumn("custrecord_inv_subsidiary_investee"),
                            new nlobjSearchColumn("custrecord_acc_nameofsubsidiary"),
                            new nlobjSearchColumn("custrecord_acc_dateofincorportation"),
							new nlobjSearchColumn("custrecord_inv_sub_date_of_seizing"),
							new nlobjSearchColumn("custrecord_acc_investeesuncountry")
                        ]
                    );
                    nlapiLogExecution('debug', 'test4   514');
                    if(investee_subs_detailsSearch)
                    	{
                    var j, len = Number(investee_subs_detailsSearch.length);

                    for (i = 0; i < len; i++) {
                        j = Number(i) + Number(1);
                        if (i < investee_subs_detailsSearch.length) {
                            invetsee_email_list.setLineItemValue('custpage_cmp_sc_investee_sub_id', j, investee_subs_detailsSearch[i].getValue('internalid'));
                            invetsee_email_list.setLineItemValue('custpage_cmp_sc_sub', j, investee_subs_detailsSearch[i].getValue('custrecord_acc_nameofsubsidiary'));
                            invetsee_email_list.setLineItemValue('custpage_cmp_sc_date_inc', j, investee_subs_detailsSearch[i].getValue('custrecord_acc_dateofincorportation'));
                            invetsee_email_list.setLineItemValue('custpage_cmp_sc_date_of_seizing', j, investee_subs_detailsSearch[i].getValue('custrecord_inv_sub_date_of_seizing'));
                            invetsee_email_list.setLineItemValue('custpage_cmp_sc_cntry_inc', j, investee_subs_detailsSearch[i].getValue('custrecord_acc_investeesuncountry'));
                            //invetsee_email_list.setLineItemValue('custpage_cmp_sc_res',j, 1);
                            //nlapiLogExecution('debug','test',i);
                            invetsee_email_list.setLineItemValue('custpage_cmp_sc_sno', j, j.toFixed(0));
                        }

                    }
                    	}
                    linecount.setDefaultValue(Number(len));
                    nlapiLogExecution('debug', 'All Fields Values Set  535');

                } else {

                      if (compliancechecklisttype == '1'){
                       var certification = form_cc.addFieldGroup('certification','Certification');
                     /*  var checkBox_i = form_cc.addField('custpage_confirmation', 'checkbox', '','', 'certification').setMandatory(true);
                       var inlineHtmlFld = form_cc.addField('custpage_inlinehtml', 'inlinehtml', '','', 'certification');
                       //inlineHtmlFld.setDisplaySize(1,100)
                       var htmlTable = "<html>"
                       htmlTable += "<body>"   
                       htmlTable += "<style>"
                       htmlTable += "#totaltable {"
                        htmlTable += "font-family: Arial, Helvetica, sans-serif;"
                        htmlTable += "border-collapse: collapse;"
                        htmlTable += "width: 450px;"
                        htmlTable += "}"
                        htmlTable += "</style>"   

                        htmlTable += "<table id='totaltable'>"
                        htmlTable += "<tr>"
                        htmlTable += "<th>'I hereby certify that the Company has duly complied with all statutory laws, orders, regulations and legal requirements of the Central/State and other Government and Local Authorities concerning business and affairs of the Company.'</th>"
                        htmlTable += "</tr>"
                        htmlTable += "</table>"
                        htmlTable += "</body>"
                        htmlTable += "</html>"

                       inlineHtmlFld.setDefaultValue(htmlTable)*/
                      // var signature_i = form_cc.addField('custpage_signature', 'text', 'Signature','', 'certification')
                      // var designation_i = form_cc.addField('custpage_designation', 'text', 'Designation/Title','', 'certification')
                       var date_i = form_cc.addField('custpage_date_cer', 'date', 'Date','', 'certification')

                    }

                  
                    var invetsee_email_list = form_cc.addSubList('custpage_cmp_email_sublist', 'list', 'Investee checklist');
                    var select_checkbox = invetsee_email_list.addField('custpage_cmp_sno', 'text', 'S.No');
                    // select_checkbox.setDisplayType('disabled');
                    var ID = invetsee_email_list.addField('custpage_cmp_id', 'text', 'id');
                    ID.setDisplayType('hidden');
                    var flag_line = invetsee_email_list.addField('custpage_cmp_flag', 'text', 'flag');
                    flag_line.setDisplayType('hidden');
                    if (compliancechecklisttype == '1') {
                        var act_law = invetsee_email_list.addField('custpage_acc_chklist_particulars', 'textarea', 'Compliance Under');
                    } else {
                        var act_law = invetsee_email_list.addField('custpage_acc_chklist_particulars', 'textarea', 'Particulars');
                    }

                    act_law.setDisplayType('disabled');
                    //    act_law.setMandatory(true);
                    var s_details = invetsee_email_list.addField('custpage_acc_chklist_details', 'textarea', 'Details');
                    if (compliancechecklisttype == '1') {
                        s_details.setDisplayType('disabled');
                    } else {
                        s_details.setDisplayType('hidden');
                    }

                    //					    var complaince_answer_list = [' ','Yes', 'No']; // 'N/A'];
                    if (compliancechecklisttype == '1') {
                        var compliant_answers = invetsee_email_list.addField('custpage_acc_chklist_status', 'select', 'Status');
                    } else {
                        var compliant_answers = invetsee_email_list.addField('custpage_acc_chklist_status', 'select', 'Response');
                    }

                    compliant_answers.addSelectOption(3, ' ');
                    compliant_answers.addSelectOption(1, 'Yes');
                    compliant_answers.addSelectOption(2, 'No');

                    //
                    //					    for (var k = 0; k < complaince_answer_list.length; k++)
                    //					    {
                    ////					        if (k + 1 == 1)
                    ////					        {
                    ////					            compliant_answers.addSelectOption(k + 1, complaince_answer_list[k], true);
                    ////					        } else if(k + 1 == 2) {
                    //					            compliant_answers.addSelectOption(k, complaince_answer_list[k]);
                    ////					        }
                    //					//        compliant_answers.addSelectOption(0, complaince_answer_list[k]);
                    //
                    //					    }
                    var fld_comment = invetsee_email_list.addField('custpage_cmp_suppt_actlaw_cmnt', 'textarea', 'Additional Details');
                    fld_comment.setDisplayType('entry');
                    var AddFiles_btn = invetsee_email_list.addField('custpage_cmp_atttch_btn', 'text', 'Add Files');
                    AddFiles_btn.setDisplayType('entry');
                    var fld_text_area = invetsee_email_list.addField('custpage_cmp_suprt_docs', 'textarea', 'Supporting Documents');
                    fld_text_area.setDisplayType('entry');
                    fld_text_area.setDisplayType('disabled');
                    var id_vals_field = invetsee_email_list.addField('custpage_cmp_idvals', 'textarea');
                    id_vals_field.setDisplayType('entry');
                    id_vals_field.setDisplayType('hidden');
                    /**   for(var j=1; j<11; j++)
                    					    {
                    	//			    	    invetsee_email_list.setLineItemValue('custpage_cmp_suprt_docs', j, 'The Value which is given to the Investee');
                    					    }	*/
                    //compliancechecklisttype =3

                    //					    nlapiLogExecution('debug', 'obj_Act_Laws' + obj_Act_Laws);
                    if (obj_Act_Laws) {
                        //					        nlapiLogExecution('debug', 'obj_Act_Laws.length' + obj_Act_Laws.length);
                        for (var i = 0; i < obj_Act_Laws.length; i++)
						{
                            var i_Sr_No = obj_Act_Laws[i].getValue('custrecord_sr_no');
                            var s_Particulars = obj_Act_Laws[i].getValue('custrecord_acc_chklist_particulars');
                            var s_Details = obj_Act_Laws[i].getValue('custrecord_acc_chklist_details');
                            //					            var s_Status = obj_Act_Laws[i].getValue('custrecord_acc_chklist_status');   // s_Details yes or no
                            var s_id = obj_Act_Laws[i].getId();
                            var ij = Number(i) + 1;

                            invetsee_email_list.setLineItemValue('custpage_cmp_sno', i + 1, i_Sr_No);
                            invetsee_email_list.setLineItemValue('custpage_cmp_flag', i + 1, parseInt(ij));
                            invetsee_email_list.setLineItemValue('custpage_acc_chklist_particulars', i + 1, s_Particulars);
                            invetsee_email_list.setLineItemValue('custpage_acc_chklist_details', i + 1, s_Details);
                            invetsee_email_list.setLineItemValue('custpage_cmp_atttch_btn', i + 1, 'Add Files');
                            //					            invetsee_email_list.setLineItemValue('custpage_acc_chklist_status', i + 1, s_Status); //custpage_cmp_id
                            invetsee_email_list.setLineItemValue('custpage_cmp_id', i + 1, s_id);
                            //    	var s_Details = "That all the cheques issued by the Company were encashed/will be encashed and no legal cases has been filed by any party against the Company under Section 138 of the Negotiable Instrument Act, 1989 from the date of last Board Meeting up to the date of this Board Meeting. It is further certified that the Company has sufficient resources to honour the cheques issued on or before the date of this Board Meeting.";
                            //	   	invetsee_email_list.setLineItemValue('custpage_cmp_suppt_actlaw_cmnt', j, 'The Value which is given to the Investee');
                        } // end of for
                        //        invetsee_email_list.setLineItemValue('custpage_cmp_flag', obj_Act_Laws.length + 1,parseInt(obj_Act_Laws.length+1) );
                        linecount.setDefaultValue(obj_Act_Laws.length);
                        	linecount.setDisplayType('hidden');

                        if (compliancechecklisttype == '2') // FCPA
                        {
                            var s_fcpa_text_after_sublist = obj_Act_Laws[0].getValue('custrecord_text_fcpa_after_tble', 'custrecord_compliance_checklist_type')
                            if (s_fcpa_text_after_sublist)
							{
                                var fcpa_text_after_sublist = form_cc.addField('custrecord_text_fcpa_aftr_tble', 'textarea', '');
                                fcpa_text_after_sublist.setDefaultValue(s_fcpa_text_after_sublist);
                                fcpa_text_after_sublist.setDisplayType('readonly');
                                //					            	fcpa_text_bfore_sublist.setDisplayType('disabled');
                                fcpa_text_after_sublist.setLayoutType('outsidebelow', 'startrow');
                                fcpa_text_after_sublist.setDisplaySize(180, 1)
                            }
                        }


                    } //end of if(obj_Act_Laws)
                }
                form_cc.setScript('customscript_acc_cli_cc_updation');
                nlapiLogExecution('debug', 'check list Screen Ends Here  643');
                response.writePage(form_cc);
            } catch (error) {
                nlapiLogExecution('ERROR', 'Compliance Sublist Screen  647', error.toString());
                throw nlapiCreateError("404", error.toString(), false);
            }
            nlapiLogExecution('debug', 'GET Method ELSE part -- Ends Here  649');
        } // ENDs   ...   Compliance Sublist SCreen


    } //end of Get
    else //post method in suitelet
    {
        try {
            nlapiLogExecution('debug', 'INSIDE- POST-METHOD Is :  657', request.getMethod())
            var cclist = request.getParameter('custpage_cclist');
            nlapiLogExecution('debug', 'cclist;;  659',  cclist);
            var name_signatory = request.getParameter('custpage_name_signatory');
            nlapiLogExecution('debug', 'name_signatory  661', name_signatory);
            var do_id = request.getParameter('custpage_do_id');
            nlapiLogExecution('debug', 'do_id;  664', do_id);
            var duedt_val = request.getParameter('custpage_ddt');
			nlapiLogExecution('debug', 'duedt_val;  665', duedt_val + "  "+ typeof(duedt_val))
			var duedt_val_array = duedt_val.split('/');
			duedt_val = duedt_val_array[1] + '/' + duedt_val_array[0] +'/'+duedt_val_array[2];
            var set_duedt = new Date(duedt_val) //nlapiStringToDate(duedt_val);//new Date(duedt_val);
			nlapiLogExecution('debug', 'set_duedt;  667', set_duedt);
            var designation = request.getParameter('custpage_name_designation');
            nlapiLogExecution('debug', 'designation  669', designation);

            var company_name = request.getParameter('custpage_name_companyname');
            nlapiLogExecution('debug', 'company_name  672', company_name);

            var quarter = request.getParameter('custpage_frequency_schedule');
            nlapiLogExecution('debug', 'quarter  675', quarter);

            var currentDate = getCompanyCurrentDateTime();
            var current_dt = nlapiDateToString(currentDate);
            nlapiLogExecution('debug', 'currentdt_asofnow  679', current_dt);

            if (company_name && quarter) {
                var Search_CC_Update = nlapiSearchRecord("customrecord_acc_compliance_investee", null,
                    [
                        ["custrecord_acc_comp_investee_company_nam.internalidnumber", "equalto", company_name],
                        "AND",
                        ["custrecord_acc_comp_quarter", "is", quarter.toString()],
                        "AND",
                        ["custrecord_cc_type", 'anyof', cclist]
                        //						   "AND",
                        //						   ["custrecord_acc_cmp_final_review_done","is","F"]
                    ],
                    [
                        new nlobjSearchColumn("internalid"),
                        new nlobjSearchColumn("custrecord_acc_cmp_final_review_done")
                    ]
                );

                if (Search_CC_Update) {
                    var record_cmp_id = Search_CC_Update[0].getId();
                    nlapiLogExecution('debug', 'record_cmp_id  700', record_cmp_id);
                    nlapiLogExecution('debug', 'Search_CC_Update  701', Search_CC_Update.length);
                    var finalreview = Search_CC_Update[0].getValue('custrecord_acc_cmp_final_review_done');
                    nlapiLogExecution('debug', 'finalreview 703', finalreview);
                    var Updated_Id = "";
                    if (finalreview == 'F')
					{
                        var cc_rec_id = Search_CC_Update[0].getValue('internalid');
                        nlapiLogExecution('debug', 'cc_rec_id  708', cc_rec_id);
                        var Load_cc_Reccord = nlapiLoadRecord('customrecord_acc_compliance_investee', cc_rec_id);
                        nlapiLogExecution('debug', 'custpage_ddt  710',request.getParameter('custpage_ddt'));
                        nlapiLogExecution('debug', 'cclist   711',cclist);
                        if (cclist == "4") {
                            nlapiLogExecution('debug', 'Subsidiary Confirmation checklistype:  713', cclist);
                            var sublistcount_cmprpt = Load_cc_Reccord.getLineItemCount('recmachcustrecord_checklist_sc_linked')
                            nlapiLogExecution('debug', 'Checklist of Investee Linecount:  715', sublistcount_cmprpt);
                            var sublistcount = request.getLineItemCount('custpage_cmp_sub_conf_sublist');
                            nlapiLogExecution('debug', 'Suitelet LineCount  717', sublistcount);
                            if (sublistcount_cmprpt <= 0)
							{
                                nlapiLogExecution('debug', 'SChecklist of Investee Linecount< = 0   720');
                                createNewChecklist(request, Load_cc_Reccord)
                            } else {
                                if (sublistcount > sublistcount_cmprpt) {

                                    Load_cc_Reccord.setFieldValue('custrecord_acc_comp_nameofsign', request.getParameter('custpage_name_signatory'));
                                    Load_cc_Reccord.setFieldValue('custrecord_acc_comp_designation', request.getParameter('custpage_name_designation'));
                                    Load_cc_Reccord.setFieldValue('custrecord_acc_comp_investee_company_nam', request.getParameter('custpage_name_companyname'));
                                    Load_cc_Reccord.setFieldValue('custrecord_acc_comp_quarter', request.getParameter('custpage_frequency_schedule'));
                                    Load_cc_Reccord.setFieldValue('custrecord_acc_comp_du_date', set_duedt);
                                    Load_cc_Reccord.setFieldValue('custrecord_acc_compliance_status', 2);
                                    Load_cc_Reccord.setFieldValue('custrecord_acc_investee_do_offcr', do_id);
                                    Load_cc_Reccord.setFieldValue('custrecord_cc_type', request.getParameter('custpage_cclist'));


                                    nlapiLogExecution('debug', '  Suitelet LineCount > Checklist of Investee Linecount   735');


                                    for (var m = 1; m <= sublistcount; m++) {
                                        var ID = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_investee_sub_id', m);
                                        var search_value = Load_cc_Reccord.findLineItemValue("recmachcustrecord_checklist_sc_linked", "custrecord_sc_investee_sub_id", ID)
                                        //nlapiLogExecution('debug', 'search_value&&&:' + search_value);
                                        nlapiLogExecution('debug', 'ID&&&:   742', ID);

                                        if (search_value == -1) {
                                            //Load_cc_Reccord.selectLineItem('recmachcustrecord_checklist_sc_linked',m);
                                            Load_cc_Reccord.selectNewLineItem('recmachcustrecord_checklist_sc_linked');
                                            m = createandupdateNewChecklist(request, Load_cc_Reccord, m)

                                        } else {
                                            Load_cc_Reccord.selectLineItem('recmachcustrecord_checklist_sc_linked', m);
                                            m = createandupdateNewChecklist(request, Load_cc_Reccord, m)
                                            //var Updated_Id = nlapiSubmitRecord(Load_cc_Reccord, true, true);
                                        }
                                    }

                                    var Updated_Id = nlapiSubmitRecord(Load_cc_Reccord, true, true);

                                } else if (sublistcount <= sublistcount_cmprpt) {
                                    nlapiLogExecution('debug', ' Suitelet LineCount <= Checklist of Investee Linecount 759');
                                    var a_delete_records = [];
                                    var a_Search_ID = [];
                                    var a_ID = [];


                                    Load_cc_Reccord.setFieldValue('custrecord_acc_comp_nameofsign', request.getParameter('custpage_name_signatory'));
                                    Load_cc_Reccord.setFieldValue('custrecord_acc_comp_designation', request.getParameter('custpage_name_designation'));
                                    Load_cc_Reccord.setFieldValue('custrecord_acc_comp_investee_company_nam', request.getParameter('custpage_name_companyname'));
                                    Load_cc_Reccord.setFieldValue('custrecord_acc_comp_quarter', request.getParameter('custpage_frequency_schedule'));
                                    Load_cc_Reccord.setFieldValue('custrecord_acc_comp_du_date', set_duedt);
                                    Load_cc_Reccord.setFieldValue('custrecord_acc_compliance_status', 2);
                                    Load_cc_Reccord.setFieldValue('custrecord_cc_type', request.getParameter('custpage_cclist'));
                                    Load_cc_Reccord.setFieldValue('custrecord_acc_investee_do_offcr', do_id);
                                    for (var m = 1; m <= sublistcount_cmprpt; m++) {
                                        var match_Id = [];
                                        var Search_ID = Load_cc_Reccord.getLineItemValue("recmachcustrecord_checklist_sc_linked", "custrecord_sc_investee_sub_id", m);
                                        a_Search_ID.push(Search_ID);
                                        var report_id = Load_cc_Reccord.getLineItemValue("recmachcustrecord_checklist_sc_linked", "id", m);
                                        nlapiLogExecution('debug', 'report_id:  778', report_id);
                                        for (var u = 1; u <= sublistcount; u++) {
                                            var ID = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_investee_sub_id', u);
                                            a_ID.push(ID);
                                            if (Number(Search_ID) == Number(ID)) {
                                                match_Id.push(Search_ID);
                                            }
                                        }
                                        nlapiLogExecution('debug', 'match_Id:  786', match_Id);
                                        nlapiLogExecution('debug', 'match_Id.length:  787', match_Id.length);
                                        if (match_Id.length == 0) {
                                            a_delete_records.push(report_id);
                                        }
                                    }
                                    if (a_delete_records.length == 0) {
                                        for (var mm = 1; mm <= sublistcount; mm++) {
                                            var ID = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_investee_sub_id', mm);
                                            var search_value = Load_cc_Reccord.findLineItemValue("recmachcustrecord_checklist_sc_linked", "custrecord_sc_investee_sub_id", ID)
                                            nlapiLogExecution('debug', 'search_value&&&:   796', search_value);
                                            nlapiLogExecution('debug', 'ID&&&:   797', ID);
                                            if (search_value > 0) {

                                                //Load_cc_Reccord.selectNewLineItem('recmachcustrecord_checklist_sc_linked');
                                                Load_cc_Reccord.selectLineItem('recmachcustrecord_checklist_sc_linked', mm);
                                                m = createandupdateNewChecklist(request, Load_cc_Reccord, mm)
                                                nlapiLogExecution('debug', 'm:   803', m);
                                            }
                                        }
                                    }
                                    var Updated_Id = nlapiSubmitRecord(Load_cc_Reccord, true, true);

                                    nlapiLogExecution('debug', 'a_Search_ID:   809', a_Search_ID);
                                    nlapiLogExecution('debug', 'a_ID:  810', a_ID);
                                    try {
                                        if (a_delete_records != null) {
                                            nlapiLogExecution('debug', 'a_delete_records', a_delete_records);
                                            for (var z = 0; z < a_delete_records.length; z++) {
                                                nlapiDeleteRecord('customrecord_sub_confirm_rec', a_delete_records[z]);
                                            }
                                        }
                                    } catch (error) {
                                        nlapiLogExecution('ERROR', 'REcords Modification Block   819', error.toString());
                                        throw nlapiCreateError("404", error.toString(), true);
                                    }
                                }
                                //	Load_cc_Reccord.setFieldValue('custrecord_acc_comp_exception',true);
                                if (!log_Valid(Updated_Id)) {
                                    var Updated_Id = nlapiSubmitRecord(Load_cc_Reccord, true, true);
                                }

                                if (multipleIDs) {
                                    Idarray = multipleIDs.split(',');
                                    nlapiLogExecution('debug', 'Idarray  830', Idarray.length);
                                    for (var k = 0; k < Idarray.length; k++) {
                                        nlapiLogExecution('debug', 'val  832', Idarray[k]);
                                        nlapiAttachRecord('file', Idarray[k], 'customrecord_acc_compliance_investee', Updated_Id);
                                        nlapiLogExecution('debug', 'val_isnow   834', Idarray[k]);
                                    }
                                }

                                nlapiLogExecution('debug', 'Updated_Id:  838', Updated_Id);
                                response.write('Compliance Checklist Updated Successfully');
                            }
                        } else {
                            Load_cc_Reccord.setFieldValue('custrecord_acc_comp_nameofsign', name_signatory);
                            Load_cc_Reccord.setFieldValue('custrecord_acc_comp_designation', designation);
                            Load_cc_Reccord.setFieldValue('custrecord_acc_comp_investee_company_nam', company_name);
                            Load_cc_Reccord.setFieldValue('custrecord_acc_comp_quarter', quarter);
                            nlapiLogExecution('debug', 'set_duedt:  846', set_duedt);
                            nlapiLogExecution('debug', 'set_duedt typeof:  847', typeof set_duedt);
                            Load_cc_Reccord.setFieldValue('custrecord_acc_comp_du_date', set_duedt);
                            Load_cc_Reccord.setFieldValue('custrecord_acc_compliance_status', 2);
                            Load_cc_Reccord.setFieldValue('custrecord_cc_type', cclist);
                            Load_cc_Reccord.setFieldValue('custrecord_acc_investee_do_offcr', do_id);
                            nlapiLogExecution('debug', 'do_id:  85', do_id);
                            var sublistcount = request.getLineItemCount('custpage_cmp_email_sublist');
                            nlapiLogExecution('debug', 'sublistcount  854', sublistcount);
                            var multipleIDs;
                            //				 		var check_exception =0;
                            //				 		nlapiLogExecution('debug','***Final',Load_cc_Reccord.getLineItemCount('recmachcustrecord_acc_cmprprt_cmplianceparent'));
                            var sublistcount_cmprpt = Load_cc_Reccord.getLineItemCount('recmachcustrecord_acc_cmprprt_cmplianceparent')
                            nlapiLogExecution('debug', 'sublistcount_cmprpt::  859', sublistcount_cmprpt);
                            if (sublistcount_cmprpt <= 0)
							{
                                // for(var m = 1; m <= sublistcount; m++)
                                //{
                                //nlapiRemoveLineItemOption('custpage_cmp_email_sublist', 'recmachcustrecord_acc_cmprprt_cmplianceparent', m)
                                //}
                                for (var m = 1; m <= sublistcount; m++) {
                                    var i_snum = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_sno', m);
                                    nlapiLogExecution('debug', 'i_snum_updated2::   868', i_snum);
                                    var act = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_acc_chklist_particulars', m);
                                    var s_Details = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_acc_chklist_details', m);
                                    //					 	 		var chk = request.getLineItemValue('custpage_cmp_email_sublist','custpage_cmp_check',m);
                                    var s_status = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_acc_chklist_status', m);

                                    var actlaw_comment = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_suppt_actlaw_cmnt', m);
                                    nlapiLogExecution('debug', 'actlaw_comment & actlaw_comment   875', s_status + ' #' + actlaw_comment);
                                    var doc_links = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_suprt_docs', m);
                                    var ID_values = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_idvals', m);
                                    var ID = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_id', m);
                                    nlapiLogExecution('debug', 'ID::   879' + ID);

                                    //custrecordcc_id
                                    Load_cc_Reccord.selectNewLineItem('recmachcustrecord_acc_cmprprt_cmplianceparent');
                                    Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_sno_cmp_rep', i_snum);
                                    Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_chk_report_details', s_Details);
                                    Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_chklistype_particulars', act);
                                    Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_chk_report_status', s_status);

                                    //				 			createReccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent','custrecord_acc_cmprprt_cmpliant',chk);
                                    Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_cmprprt_supprtdetails', actlaw_comment);
                                    Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_cmprprt_documents', doc_links);
                                    Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecordcc_id', ID);
                                    Load_cc_Reccord.commitLineItem('recmachcustrecord_acc_cmprprt_cmplianceparent');
                                    if (ID_values) {
                                        if (multipleIDs) {
                                            multipleIDs = multipleIDs + ',' + ID_values;
                                            //										nlapiLogExecution('debug','testmultipleIDs:'+multipleIDs);

                                        } else {
                                            multipleIDs = ID_values;
                                            //										nlapiLogExecution('debug','multipleIDs:'+multipleIDs);

                                        }
                                    }
                                }
                                //var Updated_Id = nlapiSubmitRecord(Load_cc_Reccord, true, true);

                            } // ENDs  ...  	if (sublistcount_cmprpt <= 0)
                            else {
                                if (sublistcount > sublistcount_cmprpt)
								{
                                    for (var m = 1; m <= sublistcount; m++) {
                                        var ID = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_id', m);
                                        var search_value = Load_cc_Reccord.findLineItemValue("recmachcustrecord_acc_cmprprt_cmplianceparent", "custrecordcc_id", ID)
                                        //nlapiLogExecution('debug', 'search_value&&&:' + search_value);
                                        nlapiLogExecution('debug', 'ID   915', ID);

                                        if (search_value == -1) {
                                            var ii_sno = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_sno', m);
                                            nlapiLogExecution('debug', 'ii_sno_updated1:::  919', ii_sno);
                                            var act = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_acc_chklist_particulars', m);
                                            var s_Details = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_acc_chklist_details', m);
                                            //				 	 		var chk = request.getLineItemValue('custpage_cmp_email_sublist','custpage_cmp_check',m);
                                            var s_status = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_acc_chklist_status', m);
                                            var actlaw_comment = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_suppt_actlaw_cmnt', m);
                                            var doc_links = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_suprt_docs', m);
                                            var ID_values = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_idvals', m);
                                            nlapiLogExecution('debug', 'doc_links::  927', doc_links);
                                            nlapiLogExecution('debug', 'actlaw_comment & actlaw_comment  928', s_status + ' #' + actlaw_comment);

                                            Load_cc_Reccord.selectNewLineItem('recmachcustrecord_acc_cmprprt_cmplianceparent');
                                            Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_sno_cmp_rep', ii_sno);
                                            Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_chk_report_details', s_Details);
                                            Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_chklistype_particulars', act);
                                            Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_chk_report_status', s_status);

                                            //				 			createReccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent','custrecord_acc_cmprprt_cmpliant',chk);
                                            Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_cmprprt_supprtdetails', actlaw_comment);
                                            Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_cmprprt_documents', doc_links);
                                            Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecordcc_id', ID);
                                            Load_cc_Reccord.commitLineItem('recmachcustrecord_acc_cmprprt_cmplianceparent');



                                            if (ID_values) {
                                                if (multipleIDs) {
                                                    multipleIDs = multipleIDs + ',' + ID_values;
                                                    nlapiLogExecution('debug', 'testmultipleIDs:  947' + multipleIDs);

                                                } else {
                                                    multipleIDs = ID_values;
                                                    nlapiLogExecution('debug', 'multipleIDs:  951', multipleIDs);

                                                }
                                            }
                                        }
                                    }
                                    var Updated_Id = nlapiSubmitRecord(Load_cc_Reccord, true, true);

                                } // ENDs  ....  if (sublistcount > sublistcount_cmprpt)
                                else if (sublistcount <= sublistcount_cmprpt)
								{
                                    var a_delete_records = [];
                                    var a_Search_ID = [];
                                    var a_ID = [];

                                    for (var m = 1; m <= sublistcount_cmprpt; m++)
									{
                                        var match_Id = [];

                                        //var ID = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_id', m);
                                        var Search_ID = Load_cc_Reccord.getLineItemValue("recmachcustrecord_acc_cmprprt_cmplianceparent", "custrecordcc_id", m);
                                        a_Search_ID.push(Search_ID);
                                        var report_id = Load_cc_Reccord.getLineItemValue("recmachcustrecord_acc_cmprprt_cmplianceparent", "id", m);
                                        nlapiLogExecution('debug', 'report_id:  974', report_id);
                                        for (var u = 1; u <= sublistcount; u++) {

                                            var ID = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_id', u);
                                            a_ID.push(ID);
                                            if (Number(Search_ID) == Number(ID)) {

                                                match_Id.push(Search_ID);
                                            }

                                        }
                                        nlapiLogExecution('debug', 'match_Id:   985', match_Id);
                                        nlapiLogExecution('debug', 'match_Id.length:  986', match_Id.length);

                                        if (match_Id.length == 0) {
                                            a_delete_records.push(report_id);
                                        }
                                    }
                                    if (a_delete_records.length == 0)
									{
                                        for (var mm = 1; mm <= sublistcount; mm++) {
                                            var ID = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_id', mm);
                                            var search_value = Load_cc_Reccord.findLineItemValue("recmachcustrecord_acc_cmprprt_cmplianceparent", "custrecordcc_id", ID)
                                            //nlapiLogExecution('debug', 'search_value&&&:' + search_value);
                                            nlapiLogExecution('debug', 'ID&&&:  998', ID);

                                            if (search_value > 0)
											{
                                                var ii_sno = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_sno', mm);
                                                nlapiLogExecution('debug', 'ii_sno_updated::  1003', ii_sno);
                                                var act = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_acc_chklist_particulars', mm);
                                                var s_Details = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_acc_chklist_details', mm);
                                                //				 	 		var chk = request.getLineItemValue('custpage_cmp_email_sublist','custpage_cmp_check',m);
                                                var s_status = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_acc_chklist_status', mm);
                                                var actlaw_comment = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_suppt_actlaw_cmnt', mm);
                                                var doc_links = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_suprt_docs', mm);
                                                var ID_values = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_idvals', mm);
                                                nlapiLogExecution('debug', 'doc_links::  1011', doc_links);
                                                nlapiLogExecution('debug', 'actlaw_comment & actlaw_comment  1012', s_status + ' #' + actlaw_comment);
                                                Load_cc_Reccord.selectLineItem('recmachcustrecord_acc_cmprprt_cmplianceparent', mm);
                                                Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_sno_cmp_rep', ii_sno);
                                                Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_chk_report_details', s_Details);
                                                Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_chklistype_particulars', act);
                                                Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_chk_report_status', s_status);

                                                //				 			createReccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent','custrecord_acc_cmprprt_cmpliant',chk);
                                                Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_cmprprt_supprtdetails', actlaw_comment);
                                                Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_cmprprt_documents', doc_links);
                                                Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecordcc_id', ID);
                                                Load_cc_Reccord.commitLineItem('recmachcustrecord_acc_cmprprt_cmplianceparent');

                                                if (ID_values) {
                                                    if (multipleIDs) {
                                                        multipleIDs = multipleIDs + ',' + ID_values;
                                                        nlapiLogExecution('debug', 'testmultipleIDs:  1028', multipleIDs);

                                                    } else {
                                                        multipleIDs = ID_values;
                                                        nlapiLogExecution('debug', 'multipleIDs:  1032',   multipleIDs);

                                                    }
                                                }
                                            }
                                        }
                                    }
                                    var Updated_Id = nlapiSubmitRecord(Load_cc_Reccord, true, true);
                                    nlapiLogExecution('debug', 'a_Search_ID:  1040', a_Search_ID);
                                    nlapiLogExecution('debug', 'a_ID:  1041', a_ID);
                                    try {
                                        if (a_delete_records != null) {
                                            nlapiLogExecution('debug', 'a_delete_records  1044', a_delete_records);
                                            for (var z = 0; z < a_delete_records.length; z++) {
                                                nlapiDeleteRecord('customrecord_acc_compliance_report', a_delete_records[z]);
                                            }
                                        }
                                    } catch (error) {

                                        nlapiLogExecution('ERROR', 'REcords Modification Block  1051', error.toString());
                                        throw nlapiCreateError("404", error.toString(), true);
                                    }

                                } // ENDs   ...  	else if (sublistcount <= sublistcount_cmprpt)


                            } //  ENDs  ...  ELSE  .... of..  if (sublistcount_cmprpt <= 0)




                            //	Load_cc_Reccord.setFieldValue('custrecord_acc_comp_exception',true);
                            if (!log_Valid(Updated_Id)) {
                                var Updated_Id = nlapiSubmitRecord(Load_cc_Reccord, true, true);
                            }

                            if (multipleIDs) {
                                Idarray = multipleIDs.split(',');
                                nlapiLogExecution('debug', 'Idarray  1070', Idarray.length);
                                for (var k = 0; k < Idarray.length; k++) {
                                    nlapiLogExecution('debug', 'val  1072', Idarray[k]);
                                    nlapiAttachRecord('file', Idarray[k], 'customrecord_acc_compliance_investee', Updated_Id);
                                    nlapiLogExecution('debug', 'val_isnow  1073', Idarray[k]);
                                }
                            }

                            nlapiLogExecution('debug', 'Updated_Id:   1078', Updated_Id);
                            response.write('Compliance Checklist Updated Successfully');
                        }
                    } else {
                        response.write('Compliance Checklist Cannot be Updated as Final Review done for this Quarter');
                    }

                } //  ENDs ....   if (Search_CC_Update)
                else //Create New ComplianceChecklist  //else for no records found in search
                {
                    var rec = '';
                    if (cclist == "4") {
                        createNewChecklist(request, rec)
                    } else {
                        nlapiLogExecution('debug', 'Entered TO create   1092', "Entered TO NEW");
                        var createReccord = nlapiCreateRecord('customrecord_acc_compliance_investee');
                        createReccord.setFieldValue('custrecord_acc_comp_nameofsign', name_signatory);
                        createReccord.setFieldValue('custrecord_acc_comp_designation', designation);
                        createReccord.setFieldValue('custrecord_acc_comp_investee_company_nam', company_name);
                        createReccord.setFieldValue('custrecord_acc_comp_quarter', quarter);
                        createReccord.setFieldValue('custrecord_acc_comp_du_date', set_duedt);
                        createReccord.setFieldValue('custrecord_acc_compliance_status', 2);
                        createReccord.setFieldValue('custrecord_cc_type', cclist);
                        createReccord.setFieldValue('custrecord_acc_investee_do_offcr', do_id);

                        //					createReccord.setFieldValue('custrecord_acc_comp_quarter',quarter_name);

                        var sublistcount = request.getLineItemCount('custpage_cmp_email_sublist');
                        nlapiLogExecution('debug', 'sublistcount  1106', sublistcount);
                        var multipleIDs;
                        for (var m = 1; m <= sublistcount; m++)
						{
                            var serial_num = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_sno', m);
                            nlapiLogExecution('debug', 'serial_num_compliance_report   1111',  serial_num);
                            var act = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_acc_chklist_particulars', m);
                            var s_Details = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_acc_chklist_details', m);
                            //			 	 		var chk = request.getLineItemValue('custpage_cmp_email_sublist','custpage_cmp_check',m);
                            var s_status = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_acc_chklist_status', m);

                            var actlaw_comment = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_suppt_actlaw_cmnt', m);
                            var doc_links = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_suprt_docs', m);
                            var ID_values = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_idvals', m);
                            var ID = request.getLineItemValue('custpage_cmp_email_sublist', 'custpage_cmp_id', m);
                            createReccord.selectNewLineItem('recmachcustrecord_acc_cmprprt_cmplianceparent');
                            createReccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_sno_cmp_rep', serial_num);
                            createReccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_chk_report_details', s_Details);
                            createReccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_chklistype_particulars', act);
                            createReccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_chk_report_status', s_status);

                            //			 			createReccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent','custrecord_acc_cmprprt_cmpliant',chk);
                            createReccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_cmprprt_supprtdetails', actlaw_comment);
                            createReccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecord_acc_cmprprt_documents', doc_links);
                            createReccord.setCurrentLineItemValue('recmachcustrecord_acc_cmprprt_cmplianceparent', 'custrecordcc_id', ID);
                            createReccord.commitLineItem('recmachcustrecord_acc_cmprprt_cmplianceparent');

                            if (ID_values) {
                                if (multipleIDs) {
                                    multipleIDs = multipleIDs + ',' + ID_values;
                                } else {
                                    nlapiLogExecution('debug', 'ID_values:  1137', ID_values);
                                    multipleIDs = ID_values;
                                }
                            }

                        }
                        var CreatedID = nlapiSubmitRecord(createReccord, true, true);
                        nlapiLogExecution('debug', 'CreatedID:  1144', CreatedID);

                        if (multipleIDs) {
                            Idarray = multipleIDs.split(',');
                            for (var i = 0; i < Idarray.length; i++) {
                                nlapiAttachRecord('file', Idarray[i], 'customrecord_acc_compliance_investee', CreatedID);
                            }
                        }
                        response.write('Compliance Checklist created Successfully');
                    }
                } //   ENDs  ....   else  ..of...  //Create New ComplianceChecklist

                var Load_REcord = nlapiLoadRecord('customrecord_acc_investee', company_name);
                nlapiLogExecution('debug', 'Load_REcord:  1157', Load_REcord);
                Load_REcord.setFieldValue('custrecord_acc_investee_lastcc_filledon', current_dt + '\xa0' + 'for the \n Quarter' + '\xa0(' + quarter + ')');
                var investee_id = nlapiSubmitRecord(Load_REcord, true, true);
                nlapiLogExecution('debug', 'investee_id:  1160', investee_id);
            }

        } catch (error) {
            nlapiLogExecution('ERROR', 'POST Block Submission Error  1164', error.toString());
            throw nlapiCreateError("404", error.toString(), false);
        }

        //			nlapiSubmitField('customrecord_acc_investee',company_name,'custrecord_acc_investee_lastcc_filledon',currentDate)
        //   	    response.write('<html><body><script language="JavaScript" type="text/javascript">self.close();</script></body></html>');

    } // ENDs   ....  post method in suitelet

} // ENDs Suitelet function


//END SUITELET ====================================================




function getCompanyCurrentDateTime() {
    var currentDateTime = new Date();
    var companyTimeZone = nlapiLoadConfiguration('companyinformation').getFieldText('timezone');
    var timeZoneOffSet = (companyTimeZone.indexOf('(GMT)') == 0) ? 0 : new Number(companyTimeZone.substr(4, 6).replace(/\+|:00/gi, '').replace(/:30/gi, '.5'));
    var UTC = currentDateTime.getTime() + (currentDateTime.getTimezoneOffset() * 60000);
    var companyDateTime = UTC + (timeZoneOffSet * 60 * 60 * 1000);

    return new Date(companyDateTime);
}



function log_Valid(value) {
    if (value != null && value != '' && value != undefined && value.toString() != 'NaN') {
        return true;
    } else {
        return false;
    }
}


function getAllActsAndLaws(compliancechecklisttype) {

    try {
        nlapiLogExecution('debug', 'function compliancechecklisttype;;;  1205', compliancechecklisttype)
        var customrecord_acc_acts_laws_for_ccSearch = nlapiSearchRecord("customrecord_acc_acts_laws_for_cc", null,
            [
                ["custrecord_compliance_checklist_type", "anyof", compliancechecklisttype]
            ],
            [
                new nlobjSearchColumn("custrecord_sr_no").setSort(false),
                new nlobjSearchColumn("custrecord_acc_chklist_particulars"), // particulars
                new nlobjSearchColumn("custrecord_acc_chklist_details"), // details
                new nlobjSearchColumn("custrecord_acc_chklist_status"), // s_Details yes or no
                new nlobjSearchColumn("custrecord_acc_comp_comment_required"),
                new nlobjSearchColumn("custrecord_compliance_checklist_type"),
                new nlobjSearchColumn("custrecord_acc_cklistype_response"),
                new nlobjSearchColumn("custrecord_text_fcpa_after_tble", "custrecord_compliance_checklist_type"),
                new nlobjSearchColumn("custrecord_text_fcpa_bfr_tble", "custrecord_compliance_checklist_type")


            ]
        );
        return customrecord_acc_acts_laws_for_ccSearch;
    } catch (error) {
        nlapiLogExecution('ERROR', 'getAllActsAndLaws FUnction Block Error  1226', error.toString());
        throw nlapiCreateError("404", error.toString(), false);
    }


} //  ENDs   ...   function getAllActsAndLaws()


function _nullValidation(val) {
    if (val == null || val == undefined || val == '' || val.toString() == "undefined" || val.toString() == "NaN" || val.toString() == "null" || val.toString() == NaN) {
        return true;
    } else {
        return false;
    }
}

function createNewChecklist(request, Load_cc_Reccord) {

    nlapiLogExecution('debug', 'Inside Create New Checklist function   1244')
    var cclist = request.getParameter('custpage_cclist');
    nlapiLogExecution('debug', 'cclist;;  1246', cclist);
    var name_signatory = request.getParameter('custpage_name_signatory');
    nlapiLogExecution('debug', 'name_signatory  1248', name_signatory);

    var duedt_val = request.getParameter('custpage_ddt');
    //var set_duedt = nlapiStringToDate(duedt_val);
    //nlapiLogExecution('debug', 'set_duedt' + set_duedt);
    var setdateArray=duedt_val.split('\/')
    nlapiLogExecution('debug', 'setdateArray  1254',setdateArray);
    var setdateString=''+setdateArray[2]+'/'+setdateArray[1]+'/'+setdateArray[0]
    nlapiLogExecution('debug', 'setdateString  1256',setdateString);
   var set_duedt=new Date(setdateString);
   nlapiLogExecution('debug', 'set_duedt1258', set_duedt);
    var designation = request.getParameter('custpage_name_designation');
    nlapiLogExecution('debug', 'designation  1260', designation);

    var company_name = request.getParameter('custpage_name_companyname');
    nlapiLogExecution('debug', 'company_name  1263', company_name);

    var quarter = request.getParameter('custpage_frequency_schedule');
    nlapiLogExecution('debug', 'quarter  1266', quarter);

    var multipleIDs;

    var currentDate = getCompanyCurrentDateTime();
    var current_dt = nlapiDateToString(currentDate);
    nlapiLogExecution('debug', 'currentdt_asofnow 1272',  current_dt);

    var createReccord;
    if (Load_cc_Reccord)
        createReccord = Load_cc_Reccord;
    else
        createReccord = nlapiCreateRecord('customrecord_acc_compliance_investee');

    createReccord.setFieldValue('custrecord_acc_comp_nameofsign', name_signatory);
    createReccord.setFieldValue('custrecord_acc_comp_designation', designation);
    createReccord.setFieldValue('custrecord_acc_comp_investee_company_nam', company_name);
    createReccord.setFieldValue('custrecord_acc_comp_quarter', quarter);
    createReccord.setFieldValue('custrecord_acc_comp_du_date', set_duedt);
    createReccord.setFieldValue('custrecord_acc_compliance_status', 2);
    createReccord.setFieldValue('custrecord_cc_type', cclist);

    //					createReccord.setFieldValue('custrecord_acc_comp_quarter',quarter_name);
    nlapiLogExecution('debug', 'Header Level Set  1289');
    var sublistcount = request.getLineItemCount('custpage_cmp_sub_conf_sublist');
    for (var m = 1; m <= sublistcount; m++) {

        var sno = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_sno', m);
        var name_of_sub = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_sub', m);
        var date_of_incorporation = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_date_inc', m);
		var date_of_seizing = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_date_of_seizing', m);
		nlapiLogExecution('debug','date_of_seizing  1297',date_of_seizing);
		var country_of_incorporation = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_cntry_inc', m);
        var resp = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_res', m);
        if (resp == "2")
            resp = "Correct";
        if (resp == "3")
            resp = "Incorrect";
        var additional_comment = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_comment', m);
        var fileIds = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_addfiles', m);
        var inv_sub_id = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_investee_sub_id', m);
        var ID_values = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_idvals', m);
        var suprt_docs = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_suprt_docs', m);


        nlapiLogExecution('debug', 'sno  1311', sno);
        nlapiLogExecution('debug', 'name_of_sub  1312', name_of_sub);
        nlapiLogExecution('debug', 'date_of_incorporation  1313', date_of_incorporation);
        nlapiLogExecution('debug', 'resp  1314', resp);
        nlapiLogExecution('debug', 'additional_comment  1315', additional_comment);
        nlapiLogExecution('debug', 'ID_values  1316', ID_values);


        createReccord.selectNewLineItem('recmachcustrecord_checklist_sc_linked');
        createReccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sc_sr_no', sno);
        createReccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sub_conf_name_of_sub', name_of_sub);
        createReccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sub_conf_date_of_inc', date_of_incorporation);
        createReccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_country_of_inc', country_of_incorporation);
		createReccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sub_conf_date_of_seizing', date_of_seizing);
		createReccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sc_response', resp);
        createReccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sc_comments', additional_comment);
        //createReccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sc_file_id', fileIds);
        createReccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sc_investee_sub_id', inv_sub_id);
        createReccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sc_file_id', suprt_docs);

        createReccord.commitLineItem('recmachcustrecord_checklist_sc_linked');

        if (ID_values) {
            if (multipleIDs) {
                multipleIDs = multipleIDs + ',' + ID_values;
            } else {
                nlapiLogExecution('debug', 'ID_values:  1337', ID_values);
                multipleIDs = ID_values;
            }
        }
    }
    nlapiLogExecution('debug', 'All Line Set   1342');
    var CreatedID = nlapiSubmitRecord(createReccord, true, true);
    nlapiLogExecution('debug', 'CreatedID:   1344', CreatedID);

    if (multipleIDs) {
        Idarray = multipleIDs.split(',');
        for (var i = 0; i < Idarray.length; i++) {
            nlapiAttachRecord('file', Idarray[i], 'customrecord_acc_compliance_investee', CreatedID);
        }
    }
    response.write('Compliance Checklist created Successfully');
}

function createandupdateNewChecklist(request, Load_cc_Reccord, m) {

    nlapiLogExecution('debug', 'Inside Create and Update Checklist function   1357')
    var sno = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_sno', m);
    var name_of_sub = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_sub', m);
    var date_of_incorporation = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_date_inc', m);
    var country_of_incorporation = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_cntry_inc', m);
	var i_date_of_seizing = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_date_of_seizing', m);
	var resp = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_res', m);
    var additional_comment = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_comment', m);
    var fileIds = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_addfiles', m);
    var inv_sub_id = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_sc_investee_sub_id', m);
    var ID_values = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_idvals', m);
    var suprt_docs = request.getLineItemValue('custpage_cmp_sub_conf_sublist', 'custpage_cmp_suprt_docs', m);



    if (resp == 2)
        resp = "Correct";
    if (resp == 3)
        resp = "Incorrect";
    nlapiLogExecution('debug', 'resp   1376', resp);
    var multipleIDs;
    Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sc_sr_no', sno);
    Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sub_conf_name_of_sub', name_of_sub);
    Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sub_conf_date_of_inc', date_of_incorporation);
    Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_country_of_inc', country_of_incorporation);
	Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sub_conf_date_of_seizing', i_date_of_seizing);
	 Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sc_response', resp);
    Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sc_comments', additional_comment);
    //	Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sc_file_id', fileIds);
    Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sc_investee_sub_id', inv_sub_id);
    Load_cc_Reccord.setCurrentLineItemValue('recmachcustrecord_checklist_sc_linked', 'custrecord_sc_file_id', suprt_docs);
    Load_cc_Reccord.commitLineItem('recmachcustrecord_checklist_sc_linked');

    if (ID_values) {
        if (multipleIDs) {
            multipleIDs = multipleIDs + ',' + ID_values;
            nlapiLogExecution('debug', 'testmultipleIDs:  1393', multipleIDs);

        } else {
            multipleIDs = ID_values;
            nlapiLogExecution('debug', 'multipleIDs:   1397', multipleIDs);

        }
    }
    nlapiLogExecution('debug', 'multipleIDs  1401', multipleIDs);
    if (multipleIDs) {
        Idarray = multipleIDs.split(',');
        for (var i = 0; i < Idarray.length; i++) {
            nlapiLogExecution('debug', 'Idarray[i]  1405', Idarray[i]);
            nlapiAttachRecord('file', Idarray[i], 'customrecord_acc_compliance_investee', Load_cc_Reccord.getFieldValue('id'));
        }
    }
    nlapiLogExecution('debug', 'inside create and update  1409', m);
    return m;

}
