/**
 *@NApiVersion 2.1
 *@NScriptType suitelet
 */
 define(["N/record", "N/runtime", "N/search", "N/email", "N/ui/serverWidget", "N/url", "N/https", "N/format",'N/config','N/file','N/encode'],
 function (record, runtime, search, email, serverWidget, url, https, format,config,file,encode) {

	 function accel_captable_test_pro(context) {
		if (context.request.method == 'GET') {
			log.debug('Inside Get   11')

			var a_optionPool_list = [];
			var f_options_share_total = 0;
			var f_init_comn_shares_total = 0;
			var f_init_comn_costINR_total = 0;
			var f_init_comn_cost_usd_total = 0;


			var scriptcontext = context.request
			var parameters = scriptcontext.parameters;
			var filter_investee = parameters.custscript_frm_investee;
			var filter_todt = parameters.custscript_todt;
			var simplify_chkbox = parameters.custscript_simplifiedcheckbox
			log.debug('simplify_chkbox   25' , simplify_chkbox);
			log.debug('filter_todt   26' , filter_todt);
			log.debug('filter_investee   27' , filter_investee);

			var form_captable = serverWidget.createForm({title: "Cap Table Information",hideNavBar: true});

			var Investee = form_captable.addField({id: "custpage_captable_slct_investee",type: serverWidget.FieldType.SELECT,label: "Investee",source: "customrecord_acc_investee"});
			//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			//filter_investee = 538;//only for testing++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			if (filter_investee) {Investee.defaultValue = filter_investee;}
			Investee.updateLayoutType({layoutType: serverWidget.FieldLayoutType.STARTROW});

			var todat = form_captable.addField({id: "custpage_captable_todt",type: serverWidget.FieldType.DATE,label: "To Date"});
			if (filter_todt) {todat.defaultValue = filter_todt;}
			todat.updateLayoutType({layoutType: serverWidget.FieldLayoutType.MIDROW});


			var simplified_captable = form_captable.addField({id: "custpage_simplified_captable",type: serverWidget.FieldType.CHECKBOX,label: "Simplified"});
			simplified_captable.updateLayoutType({layoutType: serverWidget.FieldLayoutType.ENDROW});
			if (simplify_chkbox) {simplified_captable.defaultValue = simplify_chkbox;}


			var f_total_shares = 0.00;


			if (!log_Valid(filter_todt)) {
				filter_todt = new Date();
				filter_todt = format.format({value: filter_todt,type: format.Type.DATE})
				todat.defaultValue = filter_todt;
				log.debug('current_dt 52', filter_todt);
			}

			log.debug('(filter_investee) &&(filter_todt)', filter_investee+'  &&  '+filter_todt)
			if (simplify_chkbox != 'T') {
				if (log_Valid(filter_investee) && log_Valid(filter_todt)) {

					var g_currency = search.lookupFields({type:'customrecord_acc_investee', id:filter_investee, columns:'custrecord_acc_investee_base_currncy'});
					g_currency = g_currency.custrecord_acc_investee_base_currncy;
					log.debug( 'First+g_currency  61', g_currency);
					var currencyforms = [' ', 'USD', 'INR', 'CAD', 'EUR', 'GBP', 'SGD'];

					g_currency = currencyforms[g_currency];

					var a_investers_list = [];
					var inv_List = [];

					//Get the ESOP Details=====================================================
					var a_optionPool_Investors = [];
					var a_optionPool_shrs_issued = [];
					var a_option_Filter_array = [];
					var a_option_Column_array = [];
					var object_investor_total = {};
					var i_ESOP_outstanding_shrs = 0;
					var o_option_category_outstand = {};
					var ESOP_CAtegory_List = [];


					var customrecord_acc_esopSearchObj = search.create({
						type: "customrecord_acc_esop",
						filters:
						[
						   ["custrecord_acc_date_addpool","onorbefore",filter_todt], 
						   "AND", 
						   ["custrecord_acc_esop_investee","anyof",filter_investee]
						],
						columns:
						[
						   search.createColumn({name: "custrecord_acc_date_addpool", label: "Option Pool added Date"}),
						   search.createColumn({name: "custrecord_acc_esop_investors",join: "CUSTRECORD_ACC_LINKED_ESOP_INVESTOR",label: "Investors"}),
						   search.createColumn({name: "custrecord_acc_esop_inv_category",join: "CUSTRECORD_ACC_LINKED_ESOP_INVESTOR",label: "Category"}),
						   search.createColumn({name: "custrecord_acc_esop_shares_issued",join: "CUSTRECORD_ACC_LINKED_ESOP_INVESTOR",label: "Options Issued"})
						]
					 });
					var SearchESOP = getMoreRecords(customrecord_acc_esopSearchObj);
					log.debug('SearchESOP   88', JSON.stringify(SearchESOP))
					//Take the latest ESOP record only
					if (SearchESOP) {
						var i_latest_esop = 0;
						for (var h = 0; h < SearchESOP.length; h++) {
							var invester = SearchESOP[h].getValue({ name: "custrecord_acc_esop_investors", join: "custrecord_acc_linked_esop_investor" });

							log.debug( 'ESOP__invester**   94', invester);

							var invester_name = SearchESOP[h].getText({ name: "custrecord_acc_esop_investors", join: "custrecord_acc_linked_esop_investor" });
							var categoryID = SearchESOP[h].getValue({ name: "custrecord_acc_esop_inv_category", join: "custrecord_acc_linked_esop_investor" });
							var categoryText = SearchESOP[h].getText({ name: "custrecord_acc_esop_inv_category", join: "custrecord_acc_linked_esop_investor" });

							a_optionPool_list.push(SearchESOP[h].getValue({ name: "custrecord_acc_esop_investors", join: "custrecord_acc_linked_esop_investor" }));
							a_optionPool_Investors.push(SearchESOP[h].getText({ name: "custrecord_acc_esop_investors", join: "custrecord_acc_linked_esop_investor" }));

							if (SearchESOP[h].getValue({ name: "custrecord_acc_esop_shares_issued", join: "custrecord_acc_linked_esop_investor" })) {
								if (_nullValidation(object_investor_total[invester])) {
									object_investor_total[invester] = parseInt(SearchESOP[h].getValue({ name: "custrecord_acc_esop_shares_issued", join: "custrecord_acc_linked_esop_investor" }));
									log.debug( 'ESOPSHAREs[invester]    106', SearchESOP[h].getValue({ name: "custrecord_acc_esop_shares_issued", join: "custrecord_acc_linked_esop_investor" }));
								} else {

									log.debug( 'ESOPTOTAL**   109', SearchESOP[h].getValue({ name: "custrecord_acc_esop_shares_issued", join: "custrecord_acc_linked_esop_investor" }));
									object_investor_total[invester] = parseInt(object_investor_total[invester]) + parseInt(SearchESOP[h].getValue({ name: "custrecord_acc_esop_shares_issued", join: "custrecord_acc_linked_esop_investor" }));
								}
							}


							if (log_Valid(SearchESOP[h].getValue({ name: "custrecord_acc_esop_shares_issued", join: "custrecord_acc_linked_esop_investor" }))) {
								a_optionPool_shrs_issued.push(SearchESOP[h].getValue({ name: "custrecord_acc_esop_shares_issued", join: "custrecord_acc_linked_esop_investor" }));
							}


							if (log_Valid(SearchESOP[h].getValue({ name: "custrecord_acc_esop_shares_issued", join: "custrecord_acc_linked_esop_investor" }))) {
								var f_shares_options = SearchESOP[h].getValue({ name: "custrecord_acc_esop_shares_issued", join: "custrecord_acc_linked_esop_investor" });
								i_ESOP_outstanding_shrs = i_ESOP_outstanding_shrs + Number(SearchESOP[h].getValue({ name: "custrecord_acc_esop_shares_issued", join: "custrecord_acc_linked_esop_investor" }));
								f_total_shares = parseFloat(f_total_shares) + parseFloat(f_shares_options);
							}

							if (inv_List.indexOf(invester) == -1) {
								inv_List.push(invester);
								a_investers_list.push(invester + '^' + invester_name + '^' + categoryID + '^' + categoryText);
							}

							if (ESOP_CAtegory_List.indexOf(categoryID) == -1) {
								ESOP_CAtegory_List.push(categoryID);
							}

							if (_logValidation(SearchESOP[h].getValue({ name: "custrecord_acc_esop_shares_issued", join: "custrecord_acc_linked_esop_investor" }))) {
								log.debug( 'ESOPCHECK  136', o_option_category_outstand[categoryID]);
								if (_nullValidation(o_option_category_outstand[categoryID])) {

									o_option_category_outstand[categoryID] = parseFloat(SearchESOP[h].getValue({ name: "custrecord_acc_esop_shares_issued", join: "custrecord_acc_linked_esop_investor" }));
									log.debug( 'ESOPCAtegory   140', o_option_category_outstand[categoryID]);
								} else {
									o_option_category_outstand[categoryID] = parseFloat(o_option_category_outstand[categoryID]) + parseFloat(SearchESOP[h].getValue({ name: "custrecord_acc_esop_shares_issued", join: "custrecord_acc_linked_esop_investor" }));
								}

							}


						}
					} // ===End of IF condition for ESOP Search	


					//==================================================Bridge Promissorry Notes=====================================================================//


					var o_bridge_snm_dt_ctime_fx = {};
					var o_bridge_snm_dt_ctime_ppsusd = {};
					var o_bridge_snm_dt_ctime_ppsinr = {};
					var category_bridge_usd_total = {};
					var o_bridge_snm_dt_ctime_usd = {};
					var category_bridge_native_total = {};
					var o_bridge_snm_dt_ctime_inr = {};
					var category_pricecpershr_bridge_total = {};
					var o_bridge_snm_dt_ctime_shr = {};
					var o_bridge_new_shares = {}; //. 13012021
					var category_pricecpershr_bridge_total_new_shares = {} //. 13012021
					var o_number_shares_NEW = {}; //. 13012021
					var i_bps_total_num_shares = {}; // .  04042022
					
					var i_bridge_total_num_of_shares = {} // . 04042022
					var i_total_number_shares = {}; // . 04042022
					var a_bridge_SeresNM_Dt_list = [];
					var a_bridge_snm_dt_ctime = [];

					var o_number_shares = {};
					var o_original_number_shares = {};
					var o_investmnt_amnt = {};
					var o_investmnt_amnt_currency = {};
					var o_investmnt_amnt_usd = {};
					var o_cmn_snm_dt_ctime_tempstr = {};
					var o_bridge_snm_dt_ctime_original_shr = {};
					var category_pricecpershr_original_total = {};

					var o_br_Premoney_native = {};
					var o_br_Postmoney_native = {};
					var o_br_Premoney_usd = {};
					var o_br_Postmoney_usd = {};

					var a_bridge_orig_conv_dt_list = [];
					
					var a_search_Bridge_PromissoryNotesobj = search.create({
						type: 'customrecord_acc_promissorynotes',
						id: 'customsearch_my_second_so_search',
						columns: [
							{name: 'internalid'}, 
							{name: 'custrecord_acc_br_premoney_val_native'}, 
							{name: 'custrecord_acc_br_postmoney_val_native'}, 
							{name: 'custrecord_acc_br_premoney_val_usd'}, 
							{name: 'custrecord_acc_br_postmoney_val_usd'}, 
							{name: 'custrecord_accbridge_closingdate',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR',sort: search.Sort.DESC},
							{name: 'custrecord_acc_bridge_originalseries',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}, 
							{name: 'custrecord_acc_bridge_convertedseries',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}, 
							{name: 'custrecord_acc_bridge_investors',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}, 
							{name: 'custrecord_acc_bp_inv_category',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}, 
							{name: 'custrecord_acc_brdigeinvdetails_shares',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}, 
							{name: 'custrecord_acc_brdigeinv_convertedshares',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}, 
							{name: 'custrecord_acc_bridge_fxrate',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'},
							{name: 'custrecord_acc_bridge_investmentnative',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'},
							{name: 'custrecord_acc_bridgeamountinvested_usd',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'},
							{name: 'custrecord_acc_brdige_pricepershare',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'},
							{name: 'custrecord_acc_brdige_pricepershare_usd',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}, 
							{name: 'custrecord_share_affecting_bps_newshare',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'},
							{name: 'custrecord_bps_total_num_of_shares',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'},
							{name: 'custrecord_acc_convertible_date'}, 
							{name: 'custrecord_acc_promissorynoteconvertible'},
							{name: 'custrecord_acc_brideg_interest',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}
								  ],
						filters: [
							{name: 'custrecord_acc_bridge_promissorynote_inv',operator: 'anyof',values: filter_investee}, 
							{name: 'custrecord_accbridge_closingdate',operator: 'onorbefore',values: filter_todt,join: 'custrecord_acc_linked_investordetails_br'}
								 ]
					});
					var a_search_Bridge_PromissoryNotes = getMoreRecords(a_search_Bridge_PromissoryNotesobj);
					log.debug('a_search_Bridge_PromissoryNotes     223', JSON.stringify(a_search_Bridge_PromissoryNotes))
					var additional_key = {};
					if (a_search_Bridge_PromissoryNotes) {
						for (var i = 0; i < a_search_Bridge_PromissoryNotes.length; i++) 
						{

							var Brdge_prom_id = a_search_Bridge_PromissoryNotes[i].getValue({name: 'internalid'});
							log.debug( 'Brdge_prom_id***  230', Brdge_prom_id);
							var invester = a_search_Bridge_PromissoryNotes[i].getValue({name: 'custrecord_acc_bridge_investors',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});
							var invester_name = a_search_Bridge_PromissoryNotes[i].getText({name: 'custrecord_acc_bridge_investors',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});

							var categoryID = a_search_Bridge_PromissoryNotes[i].getValue({name: 'custrecord_acc_bp_inv_category',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});
							var categoryText = a_search_Bridge_PromissoryNotes[i].getText({name: 'custrecord_acc_bp_inv_category',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});


							var i_premoney_native = a_search_Bridge_PromissoryNotes[i].getValue({name: 'custrecord_acc_br_premoney_val_native'});
							var i_postmoney_native = a_search_Bridge_PromissoryNotes[i].getValue({name: 'custrecord_acc_br_postmoney_val_native'});
							var i_premoney_usd = a_search_Bridge_PromissoryNotes[i].getValue({name: 'custrecord_acc_br_premoney_val_usd'});
							var i_postmoney_usd = a_search_Bridge_PromissoryNotes[i].getValue({name: 'custrecord_acc_br_postmoney_val_usd'});

							var converted_seriesName = a_search_Bridge_PromissoryNotes[i].getText({name: 'custrecord_acc_bridge_convertedseries',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});
							var closedt = a_search_Bridge_PromissoryNotes[i].getValue({name: 'custrecord_accbridge_closingdate',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});
							var cl_time;
							if (closedt)
								cl_time = format.parse({ value: closedt, type: format.Type.DATE }).getTime();
							var seriesName = a_search_Bridge_PromissoryNotes[i].getText({name: 'custrecord_acc_bridge_originalseries',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});
							var amnt_dollars = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridgeamountinvested_usd',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});
							var num_shares = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brdigeinv_convertedshares',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});

							var pref_inr = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brdige_pricepershare',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'})
							var pref_usd = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brdige_pricepershare_usd',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'})
							var fx_rate = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridge_fxrate',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'})
							var bps_newshare = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_share_affecting_bps_newshare',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}) //. 15012021
							var bps_total_num_of_shares = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_bps_total_num_of_shares',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}) //. 04042022
							var g_converted_dt = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_convertible_date'});
							var g_converted_chkbox = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_promissorynoteconvertible'});
							var i_interest_rate = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brideg_interest', join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});



							if (_logValidation(num_shares)) {
								f_total_shares = parseFloat(f_total_shares) + parseFloat(num_shares) + parseFloat(bps_newshare);;
							}

							if (inv_List.indexOf(invester) == -1) {
								inv_List.push(invester);
								a_investers_list.push(invester + '^' + invester_name + '^' + categoryID + '^' + categoryText);
							}

							if (_nullValidation(converted_seriesName)) {
								converted_seriesName = 'y';
							}
							if (_nullValidation(cl_time)) {
								cl_time = 't';
							}
							if (_nullValidation(seriesName)) {
								seriesName = 'z';
							}
							var bridge_SeresNM_Dt = seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time + '^' + converted_seriesName;
							if (a_bridge_SeresNM_Dt_list.indexOf(bridge_SeresNM_Dt) == -1) {
								a_bridge_SeresNM_Dt_list.push(bridge_SeresNM_Dt);
							}

							if (_nullValidation(g_converted_dt)) {
								g_converted_dt = 'n';
							}
							var bridge_orig_conv_dt = seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time + '^' + converted_seriesName + '^' + g_converted_dt + '^' + g_converted_chkbox;
							log.debug( 'bridge_orig_conv_dt :::  300', bridge_orig_conv_dt);

							if (a_bridge_orig_conv_dt_list.indexOf(bridge_orig_conv_dt) == -1) {
								a_bridge_orig_conv_dt_list.push(bridge_orig_conv_dt);
							}

							if (log_Valid(a_search_Bridge_PromissoryNotes[i].getValue('custrecord_acc_br_premoney_val_native'))) {
								o_br_Premoney_native[bridge_orig_conv_dt] = a_search_Bridge_PromissoryNotes[i].getValue('custrecord_acc_br_premoney_val_native');
							}

							if (log_Valid(a_search_Bridge_PromissoryNotes[i].getValue('custrecord_acc_br_postmoney_val_native'))) {
								o_br_Postmoney_native[bridge_orig_conv_dt] = a_search_Bridge_PromissoryNotes[i].getValue('custrecord_acc_br_postmoney_val_native');
							}

							if (log_Valid(a_search_Bridge_PromissoryNotes[i].getValue('custrecord_acc_br_premoney_val_usd'))) {
								o_br_Premoney_usd[bridge_orig_conv_dt] = a_search_Bridge_PromissoryNotes[i].getValue('custrecord_acc_br_premoney_val_usd');
							}

							if (log_Valid(a_search_Bridge_PromissoryNotes[i].getValue('custrecord_acc_br_postmoney_val_usd'))) {
								o_br_Postmoney_usd[bridge_orig_conv_dt] = a_search_Bridge_PromissoryNotes[i].getValue('custrecord_acc_br_postmoney_val_usd');
							}


							var s_base_str = invester + '^' + bridge_SeresNM_Dt;
							var s_orig_conv_base_str = invester + '^' + bridge_orig_conv_dt;


							if (a_bridge_snm_dt_ctime.indexOf(seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time) == -1) {
								a_bridge_snm_dt_ctime.push(seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time);
								additional_key[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time] = converted_seriesName + '^' + g_converted_dt + '^' + g_converted_chkbox;
							}


							if (log_Valid(a_search_Bridge_PromissoryNotes[i].getValue('custrecord_acc_brdigeinv_convertedshares', 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'))) {
								if (o_bridge_snm_dt_ctime_shr[bridge_orig_conv_dt] == 0 || !o_bridge_snm_dt_ctime_shr[bridge_orig_conv_dt]) {
									o_bridge_snm_dt_ctime_shr[bridge_orig_conv_dt] = parseFloat(a_search_Bridge_PromissoryNotes[i].getValue('custrecord_acc_brdigeinv_convertedshares', 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'));
								} else {
									o_bridge_snm_dt_ctime_shr[bridge_orig_conv_dt] = o_bridge_snm_dt_ctime_shr[bridge_orig_conv_dt] + parseFloat(a_search_Bridge_PromissoryNotes[i].getValue('custrecord_acc_brdigeinv_convertedshares', 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'));
								}

								if (category_pricecpershr_bridge_total[bridge_orig_conv_dt + '^' + categoryID] == 0 || !category_pricecpershr_bridge_total[bridge_orig_conv_dt + '^' + categoryID]) {
									category_pricecpershr_bridge_total[bridge_orig_conv_dt + '^' + categoryID] = parseFloat(a_search_Bridge_PromissoryNotes[i].getValue('custrecord_acc_brdigeinv_convertedshares', 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'));
								} else {
									category_pricecpershr_bridge_total[bridge_orig_conv_dt + '^' + categoryID] = category_pricecpershr_bridge_total[bridge_orig_conv_dt + '^' + categoryID] + parseFloat(a_search_Bridge_PromissoryNotes[i].getValue('custrecord_acc_brdigeinv_convertedshares', 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'));
								}
								//.....category calculation.....ends....//							
							}

							log.debug( 'newshares', a_search_Bridge_PromissoryNotes[i].getValue('custrecord_share_affecting_bps_newshare', 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'))
							if (log_Valid(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_share_affecting_bps_newshare',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))) {

								if (o_bridge_new_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time] == 0 || !o_bridge_new_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time]) {
									o_bridge_new_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time] = parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_share_affecting_bps_newshare',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
								} else {
									o_bridge_new_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time] = o_bridge_new_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time] + parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_share_affecting_bps_newshare',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
								}


								if (category_pricecpershr_bridge_total_new_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time + '^' + categoryID] == 0 || !category_pricecpershr_bridge_total_new_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time + '^' + categoryID]) {
									category_pricecpershr_bridge_total_new_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_share_affecting_bps_newshare',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
								} else {
									category_pricecpershr_bridge_total_new_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = category_pricecpershr_bridge_total_new_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time + '^' + categoryID] + parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_share_affecting_bps_newshare',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
								}

							}

							 //========Start Total Number of shares=========================================================================
							log.debug( 'newshares   368', a_search_Bridge_PromissoryNotes[i].getValue({name: 'custrecord_bps_total_num_of_shares',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))
							if (log_Valid(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_bps_total_num_of_shares',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))) {

								if (i_bps_total_num_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time] == 0 || !i_bps_total_num_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time]) {
									i_bps_total_num_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time] = parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_share_affecting_bps_newshare',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
								} else {
									i_bps_total_num_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time] = i_bps_total_num_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time] + parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_share_affecting_bps_newshare',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
								}


								if (i_bridge_total_num_of_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time + '^' + categoryID] == 0 || !i_bridge_total_num_of_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time + '^' + categoryID]) {
									i_bridge_total_num_of_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_share_affecting_bps_newshare',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
								} else {
									i_bridge_total_num_of_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = i_bridge_total_num_of_shares[seriesName + '^' + Brdge_prom_id + '^' + closedt + '^' + cl_time + '^' + categoryID] + parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_share_affecting_bps_newshare',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
								}

							}
							//End Total Number of shares===========================================================================



							if (log_Valid(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brdigeinvdetails_shares',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))) {
								if (o_bridge_snm_dt_ctime_original_shr[bridge_orig_conv_dt] == 0 || !o_bridge_snm_dt_ctime_original_shr[bridge_orig_conv_dt]) {
									o_bridge_snm_dt_ctime_original_shr[bridge_orig_conv_dt] = parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brdigeinvdetails_shares',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
								} else {
									o_bridge_snm_dt_ctime_original_shr[bridge_orig_conv_dt] = o_bridge_snm_dt_ctime_original_shr[bridge_orig_conv_dt] + parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brdigeinvdetails_shares',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
								}

								//.....category calculation.....starts....//
								if (category_pricecpershr_original_total[bridge_orig_conv_dt + '^' + categoryID] == 0 || !category_pricecpershr_original_total[bridge_orig_conv_dt + '^' + categoryID]) {
									category_pricecpershr_original_total[bridge_orig_conv_dt + '^' + categoryID] = parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brdigeinvdetails_shares',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
								} else {
									category_pricecpershr_original_total[bridge_orig_conv_dt + '^' + categoryID] = category_pricecpershr_original_total[bridge_orig_conv_dt + '^' + categoryID] + parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brdigeinvdetails_shares', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
								}
								//.....category calculation.....ends....//							

							}

							if (log_Valid(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridge_investmentnative',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))) {

								if (a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridge_investmentnative',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}) == 'undefined') {
									log.debug( 'chkVALUE::' + a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridge_investmentnative',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))
								}


								if (o_bridge_snm_dt_ctime_inr[bridge_orig_conv_dt] == 0 || !o_bridge_snm_dt_ctime_inr[bridge_orig_conv_dt]) {
									o_bridge_snm_dt_ctime_inr[bridge_orig_conv_dt] = parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridge_investmentnative',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
								} else {
									o_bridge_snm_dt_ctime_inr[bridge_orig_conv_dt] = o_bridge_snm_dt_ctime_inr[bridge_orig_conv_dt] + parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridge_investmentnative', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
								}


								//.....category calculation.....starts....//
								if (category_bridge_native_total[bridge_orig_conv_dt + '^' + categoryID] == 0 || !category_bridge_native_total[bridge_orig_conv_dt + '^' + categoryID]) {
									category_bridge_native_total[bridge_orig_conv_dt + '^' + categoryID] = parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridge_investmentnative',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
								} else {
									category_bridge_native_total[bridge_orig_conv_dt + '^' + categoryID] = category_bridge_native_total[bridge_orig_conv_dt + '^' + categoryID] + parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridge_investmentnative',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
								}

								//.....category calculation.....ends....//							

							}


							if (log_Valid(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridgeamountinvested_usd',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))) {

								log.debug( 'WHER_SrchVAl', a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridgeamountinvested_usd', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))

								if (o_bridge_snm_dt_ctime_usd[bridge_orig_conv_dt] == 0 || !o_bridge_snm_dt_ctime_usd[bridge_orig_conv_dt]) {
									o_bridge_snm_dt_ctime_usd[bridge_orig_conv_dt] = parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridgeamountinvested_usd', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
									log.debug( 'USD_bridgeSrchVAl', o_bridge_snm_dt_ctime_usd[bridge_orig_conv_dt])
								} else {
									o_bridge_snm_dt_ctime_usd[bridge_orig_conv_dt] = o_bridge_snm_dt_ctime_usd[bridge_orig_conv_dt] + parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridgeamountinvested_usd', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
									log.debug( 'NXT_bridgeSrchVAl', o_bridge_snm_dt_ctime_usd[bridge_orig_conv_dt])
								}

								var o_bridge_total = o_bridge_snm_dt_ctime_usd[bridge_orig_conv_dt];
								if(o_bridge_total)
								{
									o_bridge_total = parseFloat(o_bridge_total);
								}else{
									o_bridge_total = 0;
								}
								
								if(i_interest_rate)
								{
									i_interest_rate = parseFloat(i_interest_rate);
								}else
								{
									i_interest_rate = 0;
								}
								
									var grand_total = parseFloat(o_bridge_total)+parseFloat(i_interest_rate)
									o_bridge_snm_dt_ctime_usd[bridge_orig_conv_dt] = grand_total ;
									
										 log.debug( 'grand_total',grand_total)
															 

								//.....category calculation.....starts....//
								if (category_bridge_usd_total[bridge_orig_conv_dt + '^' + categoryID] == 0 || !category_bridge_usd_total[bridge_orig_conv_dt + '^' + categoryID]) {
									category_bridge_usd_total[bridge_orig_conv_dt + '^' + categoryID] = parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridgeamountinvested_usd', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))+parseFloat(i_interest_rate);
								} else {
									category_bridge_usd_total[bridge_orig_conv_dt + '^' + categoryID] = category_bridge_usd_total[bridge_orig_conv_dt + '^' + categoryID] + parseFloat(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridgeamountinvested_usd', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))+parseFloat(i_interest_rate);
								}
								//.....category calculation.....Ênds....//
							}



							//====START===  Preferred share Price Per Share Calculated values//
						  if (_logValidation(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brdige_pricepershare', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))) {
								o_bridge_snm_dt_ctime_ppsinr[bridge_orig_conv_dt] = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brdige_pricepershare', join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});
							} else {
								o_bridge_snm_dt_ctime_ppsinr[bridge_orig_conv_dt] = 0;
							}


							if (_logValidation(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brdige_pricepershare_usd', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))) {
								o_bridge_snm_dt_ctime_ppsusd[bridge_orig_conv_dt] = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brdige_pricepershare_usd',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});
							} else {
								o_bridge_snm_dt_ctime_ppsusd[bridge_orig_conv_dt] = 0;
							}


							if (_logValidation(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridge_fxrate', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))) {
								o_bridge_snm_dt_ctime_fx[bridge_orig_conv_dt] = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridge_fxrate', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});
							} else {
								o_bridge_snm_dt_ctime_fx[bridge_orig_conv_dt] = 0;
							}


							if (log_Valid(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brdigeinvdetails_shares', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))) {
								o_original_number_shares[s_orig_conv_base_str] = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brdigeinvdetails_shares', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});
							} else {
								o_original_number_shares[s_orig_conv_base_str] = 0;
							}

							if (log_Valid(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brdigeinv_convertedshares', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))) {
								o_number_shares[s_orig_conv_base_str] = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_brdigeinv_convertedshares', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});
							} else {
								o_number_shares[s_orig_conv_base_str] = 0;
							}

							if (log_Valid(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_share_affecting_bps_newshare', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))) {
								o_number_shares_NEW[s_base_str] = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_share_affecting_bps_newshare', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});
							} else {
								o_number_shares_NEW[s_base_str] = 0;
							}
							
							//Start Total Number of shares=====================================================================================
							if (log_Valid(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_bps_total_num_of_shares',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))) {
								i_total_number_shares[s_base_str] = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_bps_total_num_of_shares', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});
							} else {
								i_total_number_shares[s_base_str] = 0;
							}
							//END =======================================================================================
							
							
							if (log_Valid(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridge_investmentnative', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))) {
								o_investmnt_amnt[s_orig_conv_base_str] = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridge_investmentnative',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});
							} else {
								o_investmnt_amnt[s_orig_conv_base_str] = 0;
							}

							if (log_Valid(a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridgeamountinvested_usd', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}))) {
								o_investmnt_amnt_usd[s_orig_conv_base_str] = a_search_Bridge_PromissoryNotes[i].getValue({name:'custrecord_acc_bridgeamountinvested_usd', join:'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'});
							} else {
								o_investmnt_amnt_usd[s_orig_conv_base_str] = 0;
							}
							
						
							
							var total_amount = parseFloat(o_investmnt_amnt_usd[s_orig_conv_base_str])+parseFloat(i_interest_rate)
									o_investmnt_amnt_usd[s_orig_conv_base_str] = total_amount ;
									log.debug('o_investmnt_amnt_usd[s_orig_conv_base_str] 552',o_investmnt_amnt_usd[s_orig_conv_base_str]);

						}
					log.debug('o_bridge_snm_dt_ctime_shr_main',JSON.stringify(o_bridge_snm_dt_ctime_shr));

					} //======== ENDS--- if(a_search_Bridge_PromissoryNotes)

					log.debug('o_bridge_snm_dt_ctime_original_shr_main',JSON.stringify(o_bridge_snm_dt_ctime_original_shr));

					var i_Total_outstanding_shrs = 0;
					var venture_warrant_name = [];
					var venture_warrants_outstand = {};
					var venture_Filter_array = [];
					var venture_Column = [];
					var o_warrants_category_outstand = {};
					var a_VEnture_warrant_category_list = [];

					//CR 24/05/2019 : as of date filter added
					venture_Filter_array.push(search.createFilter({ name: 'custrecord_acc_vendebt_closedt', operator: search.Operator.ONORBEFORE, values: filter_todt }));
					venture_Filter_array.push(search.createFilter({ name: 'internalidnumber', join: 'custrecord_acc_vendebt_investee', operator: search.Operator.EQUALTO, values: filter_investee }));
					venture_Filter_array.push(search.createFilter({ name: 'custrecord_acc_equity_components', operator: search.Operator.NONEOF, values: 2 }));
					venture_Column.push(search.createColumn({ name: "custrecord_acc_vendebt_lender" }));
					venture_Column.push(search.createColumn({ name: "custrecord_acc_vdebt_inv_category" }));
					venture_Column.push(search.createColumn({ name: "custrecord_acc_warrant_name", join: "custrecord_acc_linkedvendebt" }));
					venture_Column.push(search.createColumn({ name: "custrecord_acc_warrant_outstanding", join: "custrecord_acc_linkedvendebt" }));
					var SearchVentureDebtobj = search.create({type: "customrecord_acc_venturedebt", filters: venture_Filter_array, columns: venture_Column});
					var SearchVentureDebt = getMoreRecords(SearchVentureDebtobj);
					log.debug('SearchVentureDebt   571', SearchVentureDebt)
					if (SearchVentureDebt) {
						log.debug( 'CheckVDLength:   573', SearchVentureDebt.length);
						for (var h = 0; h < SearchVentureDebt.length; h++) {

							var invester = SearchVentureDebt[h].getValue({name:'custrecord_acc_vendebt_lender'});
							var invester_name = SearchVentureDebt[h].getText({name:'custrecord_acc_vendebt_lender'});
							var categoryID = SearchVentureDebt[h].getValue({name:'custrecord_acc_vdebt_inv_category'});
							var categoryText = SearchVentureDebt[h].getText({name:'custrecord_acc_vdebt_inv_category'});

							if (_logValidation(SearchVentureDebt[h].getValue({name:'custrecord_acc_warrant_outstanding',join: 'custrecord_acc_linkedvendebt'}))) {
								if (_nullValidation(venture_warrants_outstand[invester])) {
									venture_warrants_outstand[invester] = parseInt(SearchVentureDebt[h].getValue({name:'custrecord_acc_warrant_outstanding',join: 'custrecord_acc_linkedvendebt'}));
									var x = venture_warrants_outstand[invester];
								} else {
									venture_warrants_outstand[invester] = parseInt(venture_warrants_outstand[invester]) + parseInt(SearchVentureDebt[h].getValue({name:'custrecord_acc_warrant_outstanding', join:'custrecord_acc_linkedvendebt'}));
									log.debug( 'venturedbtYYY:  587', venture_warrants_outstand[invester]);

								}

							}

							if (_logValidation(SearchVentureDebt[h].getValue({name:'custrecord_acc_warrant_outstanding',join: 'custrecord_acc_linkedvendebt'}))) {
								i_Total_outstanding_shrs = i_Total_outstanding_shrs + parseFloat(SearchVentureDebt[h].getValue({name:'custrecord_acc_warrant_outstanding',join: 'custrecord_acc_linkedvendebt'}));
								var f_shares_wrants = SearchVentureDebt[h].getValue({name:'custrecord_acc_warrant_outstanding',join: 'custrecord_acc_linkedvendebt'});
								f_total_shares = parseFloat(f_total_shares) + parseFloat(f_shares_wrants);
							}


							if (inv_List.indexOf(invester) == -1) {
								inv_List.push(invester);
								a_investers_list.push(invester + '^' + invester_name + '^' + categoryID + '^' + categoryText);
							}

							if (a_VEnture_warrant_category_list.indexOf(categoryID) == -1) {
								a_VEnture_warrant_category_list.push(categoryID);
							}


							if (_logValidation(SearchVentureDebt[h].getValue({name:'custrecord_acc_warrant_outstanding', join: 'custrecord_acc_linkedvendebt'}))) {
								if (_nullValidation(o_warrants_category_outstand[categoryID])) {
									o_warrants_category_outstand[categoryID] = parseInt(SearchVentureDebt[h].getValue({name:'custrecord_acc_warrant_outstanding', join: 'custrecord_acc_linkedvendebt'}));
								} else {
									o_warrants_category_outstand[categoryID] = parseInt(o_warrants_category_outstand[categoryID]) + parseInt(SearchVentureDebt[h].getValue({name:'custrecord_acc_warrant_outstanding',join: 'custrecord_acc_linkedvendebt'}));
								}
							}

						}

					} //====ENDS if(SearchVentureDebt) VentureDEbt	

					// ============Termsheet==================
					var colors = ['#dff9fb', '#F8EFBA'] //,'#ff7979','#D3D3D3']


					a_Global_Common_sring = [];


					var o_Premoney_native = {};
					var o_Premoney_usd = {};
					var o_Postmoney_native = {};
					var o_Postmoney_usd = {};


					var a_com_SeresNM_Dt = [];


					var o_term_new_shares = {}; 
					var o_term_total_num_new_shares = {}; 
					
					var category_pricecpershr_term_total_new_shares = {} 
					var i_category_term_total_new_shares = {} 
					

					var a_pri_SeresNM_Dt_list = [];
					var a_sec_SeresNM_Dt_list = [];
					var finaltermId_ref_fr_clsdt = [];

					var temp;
					var tempstr;
					var tempvar;

					var category_pricecpershr_total = {};

					var category_pricecpershr_totalnewShareTotal = {};
					var category_total_number_ShareTotal = {}; 
					
					var category_native_total = {}
					var category_usd_total = {}

					var a_pre_snm_dt_ctime = [];
					var a_cmn_snm_dt_ctime = [];

					var o_pre_snm_dt_ctime_shr = {};

					var o_pre_snm_dt_ctime_shr_newShares = {}; 
					var o_pre_snm_total_num_newShares = {}; 
					
					var o_pre_snm_dt_ctime_inr = {};
					var o_pre_snm_dt_ctime_usd = {};

					var o_pre_snm_dt_ctime_ppsinr = {};
					var o_pre_snm_dt_ctime_ppsusd = {};
					var o_pre_snm_dt_ctime_fx = {};
					var o_pre_snm_dt_ctime_type = {};

					var o_cmn_snm_dt_ctime_shr = {};

					var o_cmn_snm_dt_ctime_shr_newShare = {}; 
					var o_cmn_snm_total_num_newShare = {}; 
					
					var o_cmn_snm_dt_ctime_inr = {};
					var o_cmn_snm_dt_ctime_usd = {};

					var o_cmn_snm_dt_ctime_ppsinr = {};
					var o_cmn_snm_dt_ctime_ppsusd = {};
					var o_cmn_snm_dt_ctime_fx = {};
					var o_cmn_snm_dt_ctime_type = {};


					var last_prefe_share_price = 0;
					var last_prefe_usd = 0;

					var investee_name;
					var categoryID;
					var categoryText;
					var objCategory = {};
					var aray_categry_list = [];
					//		var a_cl_dts = [];
					var comn_category_pricecpershr_total = {};
					var term_share_affecting_new_shares = {}; 
					var comn_category_native_total = {};
					var comn_category_usd_total = {};

					var a_Search_captablesobj = search.create({
						type: 'customrecord_acc_termsheet',
						id: 'customsearch_one',
						columns: [
							{name: 'internalid',sort: search.Sort.ASC}, 
							{name: 'custrecord_acc_investment_closing_dt',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET',sort: search.Sort.ASC},
							{name: 'custrecord_acc_investment_seriestype',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET',sort: search.Sort.DESC},
							{name: 'custrecord__acc_invest_invester',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'},
							{name: 'custrecord_acc_ts_inv_category',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'},
							{name: 'custrecord_acc_invest_seriesname',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'},
							{name: 'custrecord_acc_investment_amnt_usd',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'},
							{name: 'custrecord_acc_invest_amntof_investment',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'},
							{name: 'custrecord_acc_investment_exch_usd_nativ',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'},
							{name: 'custrecord_investment_amnt_exch',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'},
							{name: 'custrecord_acc_invest_currency',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'},
							{name: 'custrecord__acc_invest_invester',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'},
							{name: 'custrecord__acc_invest_no_of_shares',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'},
							{name: 'custrecord_acc_invest_pricefor_share',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'},
							{name: 'custrecord_acc_invest_pricepr_natv_share',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'},
							{name: 'custrecord_acc_invest_seriesname',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'},
							{name: 'custrecord_acc_investment_typeof_tran',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'},
							{name: 'custrecord_share_affecting_term_newshare',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'},
							{name: 'custrecord_ts_total_num_of_shares',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET'},
							{name: 'custrecord_acc_ts_investee_currency'},
							{name: 'custrecord_acc_ts_premoney_valuation'},
							{name: 'custrecord_acc_ts_postmoney_valuation'},
							{name: 'custrecord_acc_ts_premoney_valuation_usd'},
							{name: 'custrecord_acc_ts_postmoney_valution_usd'},
						],
						filters: [
							{name: 'custrecord_termsheetstatus',operator: 'anyof',values: 2}, 
							{name: 'custrecord_acc_companyname',operator: 'anyof',values: filter_investee},
							{name: 'custrecord_acc_ts_tsreference',operator: 'noneof',values: "@NONE@"}, 
							{name: 'custrecord_acc_investment_closing_dt',operator: 'onorbefore',values: filter_todt,join: 'custrecord_acc_invest_termsheet'}
						]
					});
					var a_Search_captables = getMoreRecords(a_Search_captablesobj);

					log.debug('a_Search_captables   743', a_Search_captables)
					if (a_Search_captables) {
						for (var i = 0; i < a_Search_captables.length; i++) {

							var investee_id = a_Search_captables[0].getValue({name:'custrecord_acc_companyname'});
							investee_name = a_Search_captables[0].getText({name:'custrecord_acc_companyname'});

							var Finalterm_id = a_Search_captables[i].getValue({name:'internalid'});
							log.debug( 'Finalterm_id***' + Finalterm_id);
							var invester = a_Search_captables[i].getValue({name:'custrecord__acc_invest_invester',join: 'custrecord_acc_invest_termsheet'});
							var invester_name = a_Search_captables[i].getText({name:'custrecord__acc_invest_invester', join: 'custrecord_acc_invest_termsheet'});

							var categoryID = a_Search_captables[i].getValue({name:'custrecord_acc_ts_inv_category',join: 'custrecord_acc_invest_termsheet'});
							var categoryText = a_Search_captables[i].getText({name:'custrecord_acc_ts_inv_category', join:'custrecord_acc_invest_termsheet'});


							var seriesType = a_Search_captables[i].getValue({name:'custrecord_acc_investment_seriestype', join:'custrecord_acc_invest_termsheet'});
							var closedt = a_Search_captables[i].getValue({name:'custrecord_acc_investment_closing_dt', join:'custrecord_acc_invest_termsheet'});
							//============. (17-07-2020)===========
							var cl_time;
							if (closedt)
								cl_time =format.parse({ value: closedt, type: format.Type.DATE }).getTime();// nlapiStringToDate(closedt).getTime();
							//========= (17-07-2020)===============
							var seriesName = a_Search_captables[i].getText({name:'custrecord_acc_invest_seriesname', join:'custrecord_acc_invest_termsheet'});
							var seriesType_Name = a_Search_captables[i].getText({name:'custrecord_acc_investment_seriestype',join: 'custrecord_acc_invest_termsheet'});
							var tran_type = a_Search_captables[i].getText({name:'custrecord_acc_investment_typeof_tran',join: 'custrecord_acc_invest_termsheet'});
							var amnt_dollars = a_Search_captables[i].getValue({name:'custrecord_acc_investment_amnt_usd', join:'custrecord_acc_invest_termsheet'});
							var num_shares = a_Search_captables[i].getValue({name:'custrecord__acc_invest_no_of_shares', join:'custrecord_acc_invest_termsheet'});

							var pref_inr = a_Search_captables[i].getValue({name:'custrecord_acc_invest_pricefor_share', join:'custrecord_acc_invest_termsheet'})
							var pref_usd = a_Search_captables[i].getValue({name:'custrecord_acc_invest_pricepr_natv_share', join:'custrecord_acc_invest_termsheet'})
							var fx_rate = a_Search_captables[i].getValue({name:'custrecord_investment_amnt_exch', join:'custrecord_acc_invest_termsheet'})
							var term_newshare = a_Search_captables[i].getValue({name:'custrecord_share_affecting_term_newshare', join:'custrecord_acc_invest_termsheet'})
							log.debug( 'term_newshare    776', term_newshare);
						   var term_total_num_newshare = a_Search_captables[i].getValue({name:'custrecord_ts_total_num_of_shares', join:'custrecord_acc_invest_termsheet'})
							log.debug( 'term_newshare    778', term_newshare);

							if (_logValidation(num_shares)) {
								f_total_shares = parseFloat(f_total_shares) + parseFloat(num_shares);
							}
							log.debug( 'tran_type  783', tran_type);

							if (inv_List.indexOf(invester) == -1) {
								inv_List.push(invester);
								a_investers_list.push(invester + '^' + invester_name + '^' + categoryID + '^' + categoryText);
							}

							if (_nullValidation(cl_time)) {
								cl_time = 't';
							}

							if (aray_categry_list.indexOf(categoryText + '^' + invester + '^' + categoryID) == -1) {
								if (parseInt(objCategory[categoryText]) == 0 || !objCategory[categoryText]) {
									objCategory[categoryText] = 1;
								} else {
									objCategory[categoryText] = parseInt(objCategory[categoryText]) + 1;
								}
								aray_categry_list.push(categoryText + '^' + invester + '^' + categoryID);
							}



							if (seriesType_Name == 'Preferred') {
								var pri_SeresNM_Dt = seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time;
								if (a_pri_SeresNM_Dt_list.indexOf(pri_SeresNM_Dt) == -1) {
									a_pri_SeresNM_Dt_list.push(pri_SeresNM_Dt);
								}
								var s_base_str = invester + '^' + pri_SeresNM_Dt;

								if (a_pre_snm_dt_ctime.indexOf(seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time) == -1) {
									a_pre_snm_dt_ctime.push(seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time);
								}

								if (log_Valid(a_Search_captables[i].getValue({name:'custrecord__acc_invest_no_of_shares', join:'custrecord_acc_invest_termsheet'}))) {
									if (o_pre_snm_dt_ctime_shr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] == 0 || !o_pre_snm_dt_ctime_shr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time]) {
										o_pre_snm_dt_ctime_shr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = parseFloat(a_Search_captables[i].getValue({name:'custrecord__acc_invest_no_of_shares', join:'custrecord_acc_invest_termsheet'}));
									} else {
										o_pre_snm_dt_ctime_shr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = o_pre_snm_dt_ctime_shr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] + parseFloat(a_Search_captables[i].getValue({name:'custrecord__acc_invest_no_of_shares', join:'custrecord_acc_invest_termsheet'}));
									}

									//Start . ========================================================================================
									if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_share_affecting_term_newshare',join: 'custrecord_acc_invest_termsheet'}))) {
										if (o_pre_snm_dt_ctime_shr_newShares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] == 0 || !o_pre_snm_dt_ctime_shr_newShares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time]) {
											o_pre_snm_dt_ctime_shr_newShares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = parseFloat(a_Search_captables[i].getValue({name:'custrecord_share_affecting_term_newshare', join:'custrecord_acc_invest_termsheet'}));
										} else {
											o_pre_snm_dt_ctime_shr_newShares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = o_pre_snm_dt_ctime_shr_newShares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] + parseFloat(a_Search_captables[i].getValue({name:'custrecord_share_affecting_term_newshare',join: 'custrecord_acc_invest_termsheet'}));
										}
									}

									if (category_pricecpershr_totalnewShareTotal[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] == 0 || _nullValidation(category_pricecpershr_totalnewShareTotal[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID])) {
										category_pricecpershr_totalnewShareTotal[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = parseFloat(a_Search_captables[i].getValue({name:'custrecord_share_affecting_term_newshare', join:'custrecord_acc_invest_termsheet'}));
									} else {
										category_pricecpershr_totalnewShareTotal[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = category_pricecpershr_totalnewShareTotal[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] + parseFloat(a_Search_captables[i].getValue({name:'custrecord_share_affecting_term_newshare', join:'custrecord_acc_invest_termsheet'}));
									}


									//End . ==========================================================================================


									//.....category calculation.....starts....//
									if (category_pricecpershr_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] == 0 || _nullValidation(category_pricecpershr_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID])) {
										category_pricecpershr_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = parseFloat(a_Search_captables[i].getValue({name:'custrecord__acc_invest_no_of_shares', join: 'custrecord_acc_invest_termsheet'}));
									} else {
										category_pricecpershr_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = category_pricecpershr_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] + parseFloat(a_Search_captables[i].getValue({name:'custrecord__acc_invest_no_of_shares',join: 'custrecord_acc_invest_termsheet'}));
									}
									//.....category calculation.....ends....//							

								}

								log.debug( 'termsheet_newshares', a_Search_captables[i].getValue({name:'custrecord_share_affecting_term_newshare', join:'custrecord_acc_invest_termsheet'}))
								if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_share_affecting_term_newshare',join: 'custrecord_acc_invest_termsheet'}))) {

									if (o_term_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] == 0 || !o_term_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time]) {
										o_term_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = parseFloat(a_Search_captables[i].getValue({name:'custrecord_share_affecting_term_newshare',join: 'custrecord_acc_invest_termsheet'}));
									} else {
										o_term_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = o_term_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] + parseFloat(a_Search_captables[i].getValue({name:'custrecord_share_affecting_term_newshare', join:'custrecord_acc_invest_termsheet'}));
									}


									if (category_pricecpershr_term_total_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] == 0 || !category_pricecpershr_term_total_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID]) {
										category_pricecpershr_term_total_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = parseFloat(a_Search_captables[i].getValue({name:'custrecord_share_affecting_term_newshare', join:'custrecord_acc_invest_termsheet'}));
									} else {
										category_pricecpershr_term_total_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = category_pricecpershr_term_total_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] + parseFloat(a_Search_captables[i].getValue({name:'custrecord_share_affecting_term_newshare',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
									}

								}

									 //=============Start Total Number of shares =========================================================================
								log.debug( 'termsheet_newshares', a_Search_captables[i].getValue({name:'custrecord_ts_total_num_of_shares', join:'custrecord_acc_invest_termsheet'}))
								if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_ts_total_num_of_shares', join:'custrecord_acc_invest_termsheet'}))) {

									if (o_term_total_num_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] == 0 || !o_term_total_num_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time]) {
										o_term_total_num_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = parseFloat(a_Search_captables[i].getValue({name:'custrecord_ts_total_num_of_shares', join:'custrecord_acc_invest_termsheet'}));
									} else {
										o_term_total_num_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = o_term_total_num_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] + parseFloat(a_Search_captables[i].getValue({name:'custrecord_ts_total_num_of_shares', join:'custrecord_acc_invest_termsheet'}));
									}


									if (i_category_term_total_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] == 0 || !i_category_term_total_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID]) {
										i_category_term_total_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = parseFloat(a_Search_captables[i].getValue({name:'custrecord_ts_total_num_of_shares', join:'custrecord_acc_invest_termsheet'}));
									} else {
										i_category_term_total_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = i_category_term_total_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] + parseFloat(a_Search_captables[i].getValue({name:'custrecord_ts_total_num_of_shares',join: 'CUSTRECORD_ACC_LINKED_INVESTORDETAILS_BR'}));
									}

								}
								//End Start Total Number of shares  . 07042022 ===========================================================================

								if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_acc_invest_amntof_investment',join: 'custrecord_acc_invest_termsheet'}))) {

									if (a_Search_captables[i].getValue({name:'custrecord_acc_invest_amntof_investment',join: 'custrecord_acc_invest_termsheet'}) == 'undefined') {
										log.debug( 'chkVALUE::   893', a_Search_captables[i].getValue({name:'custrecord_acc_invest_amntof_investment',join: 'custrecord_acc_invest_termsheet'}))
									}



									if (o_pre_snm_dt_ctime_inr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] == 0 || !o_pre_snm_dt_ctime_inr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time]) {
										o_pre_snm_dt_ctime_inr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_invest_amntof_investment', join:'custrecord_acc_invest_termsheet'}));
									} else {
										o_pre_snm_dt_ctime_inr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = o_pre_snm_dt_ctime_inr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] + parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_invest_amntof_investment',join: 'custrecord_acc_invest_termsheet'}));
									}


									//.....category calculation.....starts....//
									if (category_native_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] == 0 || !category_native_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID]) {
										category_native_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_invest_amntof_investment', join: 'custrecord_acc_invest_termsheet'}));
									} else {
										category_native_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = category_native_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] + parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_invest_amntof_investment', join:'custrecord_acc_invest_termsheet'}));
									}
									//							log.debug('category_native_total',category_native_total[seriesName+'^'+Finalterm_id+'^'+closedt+'^'+cl_time+'^'+categoryID ])

									//.....category calculation.....ends....//							

								}


								if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_acc_investment_amnt_usd', join:'custrecord_acc_invest_termsheet'}))) {
									if (o_pre_snm_dt_ctime_usd[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] == 0 || !o_pre_snm_dt_ctime_usd[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time]) {
										o_pre_snm_dt_ctime_usd[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_investment_amnt_usd',join: 'custrecord_acc_invest_termsheet'}));
										//						log.debug('USDSrchVAl',o_cmn_snm_dt_ctime_usd[seriesName+'^'+Finalterm_id+'^'+closedt+'^'+cl_time])
									} else {
										o_pre_snm_dt_ctime_usd[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = o_pre_snm_dt_ctime_usd[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] + parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_investment_amnt_usd',join: 'custrecord_acc_invest_termsheet'}));
										//								log.debug('NXTSrchVAl',o_cmn_snm_dt_ctime_usd[seriesName+'^'+Finalterm_id+'^'+closedt+'^'+cl_time])
									}


									//.....category calculation.....starts....//
									if (category_usd_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] == 0 || !category_usd_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID]) {
										category_usd_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_investment_amnt_usd',join: 'custrecord_acc_invest_termsheet'}));
										//						log.debug('USDSrchVAl',o_cmn_snm_dt_ctime_usd[seriesName+'^'+Finalterm_id+'^'+closedt+'^'+cl_time])
									} else {
										category_usd_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = category_usd_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] + parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_investment_amnt_usd',join: 'custrecord_acc_invest_termsheet'}));
										//								log.debug('category_usd_total',category_usd_total[categoryID])
									}
									//.....category calculation.....Ênds....//


								}

								//+'^'+pref_inr+'^'+pref_usd+'^'+'ft'+'^'+fx_rate;


								//******************====START===******************  Preferred share Price Per Share Calculated values************=======************************
								if (_logValidation(a_Search_captables[i].getValue({name:'custrecord_acc_invest_pricefor_share',join: 'custrecord_acc_invest_termsheet'}))) {
									o_pre_snm_dt_ctime_ppsinr[pri_SeresNM_Dt] = a_Search_captables[i].getValue({name:'custrecord_acc_invest_pricefor_share',join: 'custrecord_acc_invest_termsheet'});
								} else {
									o_pre_snm_dt_ctime_ppsinr[pri_SeresNM_Dt] = 0;
								}


								if (_logValidation(a_Search_captables[i].getValue({name:'custrecord_acc_invest_pricepr_natv_share',join: 'custrecord_acc_invest_termsheet'}))) {
									o_pre_snm_dt_ctime_ppsusd[pri_SeresNM_Dt] = a_Search_captables[i].getValue({name:'custrecord_acc_invest_pricepr_natv_share',join: 'custrecord_acc_invest_termsheet'});
								} else {
									o_pre_snm_dt_ctime_ppsusd[pri_SeresNM_Dt] = 0;
								}


								if (_logValidation(a_Search_captables[i].getValue({name:'custrecord_investment_amnt_exch',join: 'custrecord_acc_invest_termsheet'}))) {
									o_pre_snm_dt_ctime_fx[pri_SeresNM_Dt] = a_Search_captables[i].getValue({name:'custrecord_investment_amnt_exch',join: 'custrecord_acc_invest_termsheet'});
								} else {
									o_pre_snm_dt_ctime_fx[pri_SeresNM_Dt] = 0;
								}

								o_pre_snm_dt_ctime_type[pri_SeresNM_Dt] = 'ft';


							} else if (seriesType_Name == 'Common') {

								if (a_cmn_snm_dt_ctime.indexOf(seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time) == -1) {
									a_cmn_snm_dt_ctime.push(seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time);
								}


								if (log_Valid(a_Search_captables[i].getValue({name:'custrecord__acc_invest_no_of_shares',join: 'custrecord_acc_invest_termsheet'}))) {

									if (a_Search_captables[i].getValue({name:'custrecord__acc_invest_no_of_shares',join: 'custrecord_acc_invest_termsheet'}) == 'undefined') {
										log.debug( '2ndchkVALUE::   978', a_Search_captables[i].getValue({name:'custrecord__acc_invest_no_of_shares',join: 'custrecord_acc_invest_termsheet'}))
									}


									if (o_cmn_snm_dt_ctime_shr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] == 0 || !o_cmn_snm_dt_ctime_shr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time]) {
										o_cmn_snm_dt_ctime_shr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = parseFloat(a_Search_captables[i].getValue({name:'custrecord__acc_invest_no_of_shares',join: 'custrecord_acc_invest_termsheet'}));
									} else {
										o_cmn_snm_dt_ctime_shr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = parseFloat(o_cmn_snm_dt_ctime_shr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time]) + parseFloat(a_Search_captables[i].getValue({name:'custrecord__acc_invest_no_of_shares',join: 'custrecord_acc_invest_termsheet'}));
									}

									if (o_cmn_snm_dt_ctime_shr_newShare[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] == 0 || !o_cmn_snm_dt_ctime_shr_newShare[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time]) {
										o_cmn_snm_dt_ctime_shr_newShare[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = parseFloat(a_Search_captables[i].getValue({name:'custrecord_share_affecting_term_newshare', join:'custrecord_acc_invest_termsheet'}));
									} else {
										o_cmn_snm_dt_ctime_shr_newShare[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = parseFloat(o_cmn_snm_dt_ctime_shr_newShare[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time]) + parseFloat(a_Search_captables[i].getValue({name:'custrecord_share_affecting_term_newshare',join: 'custrecord_acc_invest_termsheet'}));
									}

									//.....category calculation.....starts....//
									if (comn_category_pricecpershr_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] == 0 || !comn_category_pricecpershr_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID]) {
										comn_category_pricecpershr_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = parseFloat(a_Search_captables[i].getValue({name:'custrecord__acc_invest_no_of_shares',join: 'custrecord_acc_invest_termsheet'}));
									} else {
										comn_category_pricecpershr_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = comn_category_pricecpershr_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] + parseFloat(a_Search_captables[i].getValue({name:'custrecord__acc_invest_no_of_shares', join: 'custrecord_acc_invest_termsheet'}));
									}
									//.....category calculation.....ends....//

									//. 20012021.....New Shares calculation.....starts....//
									if (term_share_affecting_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] == 0 || !term_share_affecting_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID]) {
										term_share_affecting_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = parseFloat(a_Search_captables[i].getValue({name:'category_pricecpershr_term_total_new_shares',join: 'custrecord_acc_invest_termsheet'}));
									} else {
										term_share_affecting_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = term_share_affecting_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] + parseFloat(a_Search_captables[i].getValue({name:'category_pricecpershr_term_total_new_shares',join: 'custrecord_acc_invest_termsheet'}));
									}
									//.....END New shares  calculation.....ends....//							
									log.debug( term_share_affecting_new_shares, JSON.stringify(term_share_affecting_new_shares));

								}


								if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_acc_invest_amntof_investment',join: 'custrecord_acc_invest_termsheet'}))) {
									if (o_cmn_snm_dt_ctime_inr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] == 0 || !o_cmn_snm_dt_ctime_inr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time]) {
										o_cmn_snm_dt_ctime_inr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_invest_amntof_investment',join: 'custrecord_acc_invest_termsheet'}));
									} else {
										o_cmn_snm_dt_ctime_inr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = parseFloat(o_cmn_snm_dt_ctime_inr[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time]) + parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_invest_amntof_investment',jon: 'custrecord_acc_invest_termsheet'}));
									}



									//.....category calculation.....starts....//
									if (comn_category_native_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] == 0 || _nullValidation(comn_category_native_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID])) {
										comn_category_native_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_invest_amntof_investment',join: 'custrecord_acc_invest_termsheet'}));
									} else {
										comn_category_native_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = parseFloat(comn_category_native_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID]) + parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_invest_amntof_investment',join: 'custrecord_acc_invest_termsheet'}));
									}

								}


								if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_acc_investment_amnt_usd', join:'custrecord_acc_invest_termsheet'}))) {
									if (o_cmn_snm_dt_ctime_usd[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] == 0 || !o_cmn_snm_dt_ctime_usd[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time]) {

										o_cmn_snm_dt_ctime_usd[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_investment_amnt_usd',join: 'custrecord_acc_invest_termsheet'}));

									} else {
										o_cmn_snm_dt_ctime_usd[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time] = parseFloat(o_cmn_snm_dt_ctime_usd[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time]) + parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_investment_amnt_usd',join: 'custrecord_acc_invest_termsheet'}));

									}


									if (comn_category_usd_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] == 0 || !comn_category_usd_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID]) {
										comn_category_usd_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_investment_amnt_usd',jon: 'custrecord_acc_invest_termsheet'}));
									} else {
										comn_category_usd_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] = parseFloat(comn_category_usd_total[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID]) + parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_investment_amnt_usd',join: 'custrecord_acc_invest_termsheet'}));
									}

								}


								var com_SeresNM_Dt = seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time; //+'^'+pref_inr+'^'+pref_usd+'^'+'ft'+'^'+fx_rate;
								var s_base_str = invester + '^' + com_SeresNM_Dt;
								a_Global_Common_sring.push(s_base_str);

								if (a_com_SeresNM_Dt.indexOf(com_SeresNM_Dt) == -1) {
									a_com_SeresNM_Dt.push(com_SeresNM_Dt);
								}


								//======***START****==========Preice per share INR USD and FX Values================================================================//							

								if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_acc_invest_pricefor_share', join:'custrecord_acc_invest_termsheet'}))) {
									o_cmn_snm_dt_ctime_ppsinr[com_SeresNM_Dt] = a_Search_captables[i].getValue({name:'custrecord_acc_invest_pricefor_share',join: 'custrecord_acc_invest_termsheet'});
								} else {
									o_cmn_snm_dt_ctime_ppsinr[com_SeresNM_Dt] = 0;
								}

								if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_acc_invest_pricepr_natv_share', join:'custrecord_acc_invest_termsheet'}))) {
									o_cmn_snm_dt_ctime_ppsusd[com_SeresNM_Dt] = a_Search_captables[i].getValue({name:'custrecord_acc_invest_pricepr_natv_share',join: 'custrecord_acc_invest_termsheet'});
								} else {
									o_cmn_snm_dt_ctime_ppsusd[com_SeresNM_Dt] = 0;
								}

								if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_investment_amnt_exch',join: 'custrecord_acc_invest_termsheet'}))) {
									o_cmn_snm_dt_ctime_fx[com_SeresNM_Dt] = a_Search_captables[i].getValue({name:'custrecord_investment_amnt_exch',join: 'custrecord_acc_invest_termsheet'});
								} else {
									o_cmn_snm_dt_ctime_fx[com_SeresNM_Dt] = 0;
								}
								//	======**ENDs****==========Preice per share INR USD and FX Values================================================================//								
								o_cmn_snm_dt_ctime_type[com_SeresNM_Dt] = 'ft';

							}

							//=========***START****==========Investor Shares..INR..USD vaues================================================================//							

							if (a_Search_captables[i].getValue({name:'custrecord_acc_invest_currency',join: 'custrecord_acc_invest_termsheet'})) {
								o_investmnt_amnt_currency[s_base_str] = a_Search_captables[i].getValue({name:'custrecord_acc_invest_currency',join: 'custrecord_acc_invest_termsheet'});
							}


							if (log_Valid(a_Search_captables[i].getValue({name:'custrecord__acc_invest_no_of_shares',join: 'custrecord_acc_invest_termsheet'}))) {
								var term_temp_obj = o_number_shares[s_base_str];
								if (term_temp_obj) {
									o_number_shares[s_base_str] = parseFloat(o_number_shares[s_base_str]) + parseFloat(a_Search_captables[i].getValue({name:'custrecord__acc_invest_no_of_shares',join: 'custrecord_acc_invest_termsheet'}));
								} else {
									o_number_shares[s_base_str] = a_Search_captables[i].getValue({name:'custrecord__acc_invest_no_of_shares',join: 'custrecord_acc_invest_termsheet'});
								}
							} else {
								o_number_shares[s_base_str] = 0;
							}


							if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_share_affecting_term_newshare',join: 'custrecord_acc_invest_termsheet'}))) {
								o_number_shares_NEW[s_base_str] = a_Search_captables[i].getValue({name:'custrecord_share_affecting_term_newshare',join: 'custrecord_acc_invest_termsheet'});
							} else {
								o_number_shares_NEW[s_base_str] = 0;
							}

							log.debug( 'o_number_shares_NEW' + JSON.stringify(o_number_shares_NEW));
							if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_ts_total_num_of_shares',join: 'custrecord_acc_invest_termsheet'}))) {
								i_total_number_shares[s_base_str] = a_Search_captables[i].getValue({name:'custrecord_ts_total_num_of_shares',join: 'custrecord_acc_invest_termsheet'});
							} else {
								i_total_number_shares[s_base_str] = 0;
							}


							if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_acc_invest_amntof_investment',join: 'custrecord_acc_invest_termsheet'}))) {
								var term_temp_inr_obj = o_investmnt_amnt[s_base_str];
								if (term_temp_inr_obj) {
									o_investmnt_amnt[s_base_str] = parseFloat(o_investmnt_amnt[s_base_str]) + parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_invest_amntof_investment',join: 'custrecord_acc_invest_termsheet'}));
								} else {
									o_investmnt_amnt[s_base_str] = a_Search_captables[i].getValue({name:'custrecord_acc_invest_amntof_investment',join: 'custrecord_acc_invest_termsheet'});
								}
							} else {
								o_investmnt_amnt[s_base_str] = 0;
							}

							if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_acc_investment_amnt_usd',join: 'custrecord_acc_invest_termsheet'}))) {
								var term_temp_usd_obj = o_investmnt_amnt_usd[s_base_str];
								if (term_temp_usd_obj) {
									o_investmnt_amnt_usd[s_base_str] = parseFloat(o_investmnt_amnt_usd[s_base_str]) + parseFloat(a_Search_captables[i].getValue({name:'custrecord_acc_investment_amnt_usd',join: 'custrecord_acc_invest_termsheet'}));
								} else {
									o_investmnt_amnt_usd[s_base_str] = a_Search_captables[i].getValue({name:'custrecord_acc_investment_amnt_usd',join: 'custrecord_acc_invest_termsheet'});
								}
							} else {
								o_investmnt_amnt_usd[s_base_str] = 0;
							}
							//=========***ENDS****==========Investor Shares..INR..USD vaues================================================================//							


							if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_acc_ts_premoney_valuation'}))) {
								o_Premoney_native[seriesName + '^' + Finalterm_id] = a_Search_captables[i].getValue({name:'custrecord_acc_ts_premoney_valuation'});
								log.debug( 'Pre - Native Currency**', o_Premoney_native[seriesName + '^' + Finalterm_id]);
							} else {
								o_Premoney_native[seriesName + '^' + Finalterm_id] = 0;
							}

							if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_acc_ts_postmoney_valuation'}))) {
								o_Postmoney_native[seriesName + '^' + Finalterm_id] = a_Search_captables[i].getValue({name:'custrecord_acc_ts_postmoney_valuation'});
								log.debug( 'Post - Native Currency**', o_Postmoney_native[seriesName + '^' + Finalterm_id]);
							} else {
								o_Postmoney_native[seriesName + '^' + Finalterm_id] = 0;
							}

							if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_acc_ts_premoney_valuation_usd'}))) {
								o_Premoney_usd[seriesName + '^' + Finalterm_id] = a_Search_captables[i].getValue({name:'custrecord_acc_ts_premoney_valuation_usd'});
								log.debug( 'Pre - USD Currency**', o_Premoney_usd[seriesName + '^' + Finalterm_id]);
							} else {
								o_Premoney_usd[seriesName + '^' + Finalterm_id] = 0;
							}

							if (log_Valid(a_Search_captables[i].getValue({name:'custrecord_acc_ts_postmoney_valution_usd'}))) {
								o_Postmoney_usd[seriesName + '^' + Finalterm_id] = a_Search_captables[i].getValue({name:'custrecord_acc_ts_postmoney_valution_usd'});
								log.debug( 'Post - USD Currency**', o_Postmoney_usd[seriesName + '^' + Finalterm_id]);
							} else {
								o_Postmoney_usd[seriesName + '^' + Finalterm_id] = 0;
							}


						} //End of For loop TErmSheet For loop 

					} // End of Final Terms Record search



					//Get the initial common shares=============================
					var o_series_new_shares = {};
					var category_pricecpershr_series_total_new_shares = {}

					var o_series_total_num_new_shares = {};
					var category_series_total_num_new_shares = {}

					var a_init_comn_invst = [];
					var a_init_comn_invst_nm = [];
					var a_init_comn_invst_shares = [];
					var a_init_comn_Filter_array = [];
					var a_init_comn_Column_array = [];
					var a_init_comn_invst_cost_inr = [];
					var a_init_comn_invst_cost_USD = [];


					var a_Search_captablesobj = search.create({
						type: 'customrecord_acc_initial_incorporation',
						columns: [
							{name: 'internalid'}, 
							{name: 'custrecord_accinitialcommseriestype',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR',sort: search.Sort.DESC},
							{name: 'custrecord_acc_nonts_closing_date',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR',sort: search.Sort.ASC},
							{name: 'custrecord_acc_linked_nontsinvestor',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'},
							{name: 'custrecord_acc_commonsharestype',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'},
							{name: 'custrecord_acc_nonts_pricepershare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'},
							{name: 'custrecord_acc_nonts_pricepershare_usd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'},
							{name: 'custrecord_acc_exchangerate_usdtonative',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'},
							{name: 'custrecord_acc_commonsharestype',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'},
							{name: 'custrecord_acc_shares_issued',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'},
							{name: 'custrecord_acc_nontscommonamount_native',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'},
							{name: 'custrecord_acc_nonts_amountinusd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'},
							{name: 'custrecord_acc_swot_inv_category',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'},
							{name: 'custrecord_share_affecting_swot_newshare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'},
							{name: 'custrecord_share_affect_swot_total_share',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'},
							{name: 'custrecord_acc_swots_premoney_valuation'},
							{name: 'custrecord_acc_swots_postmoney_valuation'},
							{name: 'custrecord_acc_swots_premoney_value_usd'},
							{name: 'custrecord_acc_swots_postmoney_value_usd'},
						],
						filters: [
							{name: 'custrecord_acc_com_investee',operator: 'anyof',values: filter_investee}, 
							{name: 'custrecord_acc_nonts_closing_date',operator: 'onorbefore',values: filter_todt,join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}
					]
					});


					var o_search_init_comn = getMoreRecords(a_Search_captablesobj);
					log.debug('o_search_init_comn  1225', o_search_init_comn)


					var o_termsheetID = {};
					var swo_Id_ref_fr_clsdt = [];
					var a_icmn_cmn_ID = [];
					var icmn_cmndt = [];
					var icmn_prefdt = [];
					var icmn_cmn_inr = [];
					var icmn_cmn_usd = [];
					var icmn_pref_inr = [];
					var icmn_pref_usd = [];
					var nxt_id = 0;
					var icmn_cmn_nmdt_list = [];
					var icmn_pref_nmdt_list = [];
					if (o_search_init_comn) {

						var i_latest_init_comn = 0;
						for (var h = 0; h < o_search_init_comn.length; h++) {
							var i_cmn_id = o_search_init_comn[h].getValue({name:'internalid'});
							log.debug( 'SWOTID   1245', i_cmn_id)

							var icmn_seriestype = o_search_init_comn[h].getText({name:'custrecord_accinitialcommseriestype', join:'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'});

							var icmn_seiesnm = o_search_init_comn[h].getText({name:'custrecord_acc_commonsharestype',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'})
							var icmn_invester = o_search_init_comn[h].getValue({name:'custrecord_acc_linked_nontsinvestor',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'})
							var icmn_clsingdt = o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_closing_date',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'})
							var cl_time;
							if (icmn_clsingdt)
								cl_time = format.parse({ value: icmn_clsingdt, type: format.Type.DATE }).getTime();//nlapiStringToDate(icmn_clsingdt).getTime();
							var icmn_invester_name = o_search_init_comn[h].getText({name:'custrecord_acc_linked_nontsinvestor',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'})
							var icmn_inr = o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_pricepershare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'})
							var icmn_usd = o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_pricepershare_usd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'})
							var fx_rate = o_search_init_comn[h].getValue({name:'custrecord_acc_exchangerate_usdtonative',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'})
							var series_newshares = o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'})
							var series_total_num_shares = o_search_init_comn[h].getValue({name:'custrecord_share_affect_swot_total_share', join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'})
							
							var categoryID = o_search_init_comn[h].getValue({name:'custrecord_acc_swot_inv_category',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'})
							var categoryText = o_search_init_comn[h].getText({name:'custrecord_acc_swot_inv_category',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'})

							log.debug( 'a_investers_list_check_shekhar_category  1265', icmn_invester + '^' + icmn_invester_name + '^' + categoryID + '^' + categoryText)

							if (inv_List.indexOf(icmn_invester) == -1) {
								inv_List.push(icmn_invester);
								a_investers_list.push(icmn_invester + '^' + icmn_invester_name + '^' + categoryID + '^' + categoryText);

								log.debug( 'a_investers_list_check_shekhar  1271', icmn_invester + '^' + icmn_invester_name + '^' + categoryID + '^' + categoryText)

							}
							if (_nullValidation(cl_time)) {
								cl_time = 't';
							}

							if (aray_categry_list.indexOf(categoryText + '^' + icmn_invester + '^' + categoryID) == -1) {
								if (objCategory[categoryText] == 0 || !objCategory[categoryText]) {
									objCategory[categoryText] = 1;
								} else {
									objCategory[categoryText] = objCategory[categoryText] + 1;
								}
								aray_categry_list.push(categoryText + '^' + icmn_invester + '^' + categoryID)

							}

							if (icmn_seriestype == 'Preferred') {

								var s_series_id_dt_string = icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time; //+'^'+icmn_inr+'^'+icmn_usd+'^'+'st'+'^'+fx_rate; 
								var s_base_str = icmn_invester + '^' + s_series_id_dt_string;
								if (a_pri_SeresNM_Dt_list.indexOf(s_series_id_dt_string) == -1) {
									a_pri_SeresNM_Dt_list.push(s_series_id_dt_string);
								}

								if (a_pre_snm_dt_ctime.indexOf(icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time) == -1) {
									a_pre_snm_dt_ctime.push(icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time);
								}

								//========**START**===========================PRice per share INR..USD and FX VAlues====================================================//					
								if (_logValidation(o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_pricepershare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
									o_pre_snm_dt_ctime_ppsinr[s_series_id_dt_string] = o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_pricepershare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'});
								} else {
									o_pre_snm_dt_ctime_ppsinr[s_series_id_dt_string] = 0;
								}

								if (_logValidation(o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_pricepershare_usd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
									o_pre_snm_dt_ctime_ppsusd[s_series_id_dt_string] = o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_pricepershare_usd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'});
								} else {
									o_pre_snm_dt_ctime_ppsusd[s_series_id_dt_string] == 0;
								}

								if (_logValidation(o_search_init_comn[h].getValue({name:'custrecord_acc_exchangerate_usdtonative',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
									o_pre_snm_dt_ctime_fx[s_series_id_dt_string] = o_search_init_comn[h].getValue({name:'custrecord_acc_exchangerate_usdtonative',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'});
								} else {
									o_pre_snm_dt_ctime_fx[s_series_id_dt_string] = 0;
								}

								o_pre_snm_dt_ctime_type[s_series_id_dt_string] = 'st';


								//========**ENDS**===========================PRice per share INR..USD and FX VAlues====================================================//							

								if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
									if (o_pre_snm_dt_ctime_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] == 0 || !o_pre_snm_dt_ctime_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) {

										o_pre_snm_dt_ctime_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										o_pre_snm_dt_ctime_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_pre_snm_dt_ctime_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}

									log.debug( 'Number_of_shares_swot:::' + o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									//						

									//.....category calculation.....starts....//
									if (category_pricecpershr_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] == 0 || !category_pricecpershr_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) {
										category_pricecpershr_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										category_pricecpershr_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(category_pricecpershr_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued', join:'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}
									//.....category calculation.....ends....//	


								}

								if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
									if (o_pre_snm_dt_ctime_shr_newShares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] == 0 || !o_pre_snm_dt_ctime_shr_newShares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) {
										o_pre_snm_dt_ctime_shr_newShares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										o_pre_snm_dt_ctime_shr_newShares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_pre_snm_dt_ctime_shr_newShares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}



									//.....category calculation.....starts....//
									if (category_pricecpershr_totalnewShareTotal[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] == 0 || !category_pricecpershr_totalnewShareTotal[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) {
										category_pricecpershr_totalnewShareTotal[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										category_pricecpershr_totalnewShareTotal[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(category_pricecpershr_totalnewShareTotal[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare', join:'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}
									//.....category calculation.....ends....//		

								}

								   //====SWOT TOTAL Number of Shares Start================================================================================================
								if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_share_affect_swot_total_share', join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) 
								{
									if (o_pre_snm_total_num_newShares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] == 0 || !o_pre_snm_total_num_newShares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) {
										o_pre_snm_total_num_newShares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affect_swot_total_share',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										o_pre_snm_total_num_newShares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_pre_snm_total_num_newShares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affect_swot_total_share',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}



									//.....category calculation.....starts....//
									if (category_total_number_ShareTotal[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] == 0 || !category_total_number_ShareTotal[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) {
										category_total_number_ShareTotal[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affect_swot_total_share',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										category_total_number_ShareTotal[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(category_total_number_ShareTotal[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affect_swot_total_share',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}
									//.....category calculation.....ends....//		

								}
								//END SWOT . 04042022================================================================================================

								 
								if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
									if (o_pre_snm_dt_ctime_inr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] == 0 || !o_pre_snm_dt_ctime_inr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) {
										o_pre_snm_dt_ctime_inr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										o_pre_snm_dt_ctime_inr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_pre_snm_dt_ctime_inr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}


									//.....category calculation.....starts....//
									if (category_native_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] == 0 || !(category_native_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID])) {
										category_native_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										category_native_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(category_native_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nontscommonamount_native', join:'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}

									//.....category calculation.....ends....//		


								}


								if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
									if (o_pre_snm_dt_ctime_usd[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] == 0 || !o_pre_snm_dt_ctime_usd[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) {
										o_pre_snm_dt_ctime_usd[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										o_pre_snm_dt_ctime_usd[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_pre_snm_dt_ctime_usd[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}



									//.....category calculation.....starts....//
									if (category_usd_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] == 0 || !category_usd_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) {
										category_usd_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										category_usd_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = category_usd_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}
									//.....category calculation.....Ênds....//


								}


							} else if (icmn_seriestype == 'Common') {

								var s_series_id_dt_string = icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time; //+'^'+icmn_inr+'^'+icmn_usd+'^'+'st'+'^'+fx_rate; 
								//					log.debug('i_CMN_val'+s_series_id_dt_string);
								var s_base_str = icmn_invester + '^' + s_series_id_dt_string;
								a_Global_Common_sring.push(s_base_str);

								if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_pricepershare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
									o_cmn_snm_dt_ctime_ppsinr[s_series_id_dt_string] = o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_pricepershare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'});
								} else {
									o_cmn_snm_dt_ctime_ppsinr[s_series_id_dt_string] = 0;
								}

								if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_pricepershare_usd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
									o_cmn_snm_dt_ctime_ppsusd[s_series_id_dt_string] = o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_pricepershare_usd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'});
								} else {
									o_cmn_snm_dt_ctime_ppsusd[s_series_id_dt_string] = 0;
								}


								if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_acc_exchangerate_usdtonative',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
									o_cmn_snm_dt_ctime_fx[s_series_id_dt_string] = o_search_init_comn[h].getValue({name:'custrecord_acc_exchangerate_usdtonative',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'});
								} else {
									o_cmn_snm_dt_ctime_fx[s_series_id_dt_string] = 0;
								}
								o_cmn_snm_dt_ctime_type[s_series_id_dt_string] = 'st';



								if (a_com_SeresNM_Dt.indexOf(s_series_id_dt_string) == -1) {
									a_com_SeresNM_Dt.push(s_series_id_dt_string);
								}


								if (a_cmn_snm_dt_ctime.indexOf(icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time) == -1) {
									a_cmn_snm_dt_ctime.push(icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time);
								}


								if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
									if (o_cmn_snm_dt_ctime_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] == 0 || !o_cmn_snm_dt_ctime_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) {
										if (o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}) == 'undefined') {
											log.debug( '4thCheckVal',  o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
										}
										o_cmn_snm_dt_ctime_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										o_cmn_snm_dt_ctime_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_cmn_snm_dt_ctime_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}

									if (o_cmn_snm_dt_ctime_shr_newShare[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] == 0 || !o_cmn_snm_dt_ctime_shr_newShare[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) {
										if (o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}) == 'undefined') {
											log.debug( '4thCheckVal' + o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
										}
										o_cmn_snm_dt_ctime_shr_newShare[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare', join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										o_cmn_snm_dt_ctime_shr_newShare[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_cmn_snm_dt_ctime_shr_newShare[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare', join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}


									//.....category calculation.....starts....//
									if (comn_category_pricecpershr_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] == 0 || !comn_category_pricecpershr_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) {
										comn_category_pricecpershr_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										comn_category_pricecpershr_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = comn_category_pricecpershr_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}
									//.....category calculation.....ends....//	
								}


								log.debug( 'swot_newshares', o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))
								if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {

									if (o_series_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] == 0 || !o_series_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) {
										o_series_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										o_series_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = o_series_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}


									if (category_pricecpershr_series_total_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] == 0 || !category_pricecpershr_series_total_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) {
										category_pricecpershr_series_total_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										category_pricecpershr_series_total_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = category_pricecpershr_series_total_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}

								}

							   //========= SWOT TOTAL NUMBER OF SHARES Start=========================================================================
								log.debug( 'swot_newshares', o_search_init_comn[h].getValue({name:'custrecord_share_affect_swot_total_share', join:'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))
								if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_share_affect_swot_total_share',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {

									if (o_series_total_num_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] == 0 || !o_series_total_num_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) {
										o_series_total_num_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affect_swot_total_share',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										o_series_total_num_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = o_series_total_num_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affect_swot_total_share',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}


									if (category_series_total_num_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] == 0 || !category_series_total_num_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) {
										category_series_total_num_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affect_swot_total_share',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										category_series_total_num_new_shares[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = category_series_total_num_new_shares[seriesName + '^' + Finalterm_id + '^' + closedt + '^' + cl_time + '^' + categoryID] + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_share_affect_swot_total_share',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}

								}

								//End SWOT TOTAL NUMBER OF SHARES===========================================================================

						  

								if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
									if (o_cmn_snm_dt_ctime_inr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] == 0 || !o_cmn_snm_dt_ctime_inr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) {
										o_cmn_snm_dt_ctime_inr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										o_cmn_snm_dt_ctime_inr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_cmn_snm_dt_ctime_inr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}




									if (comn_category_native_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] == 0 || !comn_category_native_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) {
										comn_category_native_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										comn_category_native_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = comn_category_native_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}

								}


								if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
									if (o_cmn_snm_dt_ctime_usd[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] == 0 || !o_cmn_snm_dt_ctime_usd[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) {
										o_cmn_snm_dt_ctime_usd[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {
										o_cmn_snm_dt_ctime_usd[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_cmn_snm_dt_ctime_usd[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}


									if (comn_category_usd_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] == 0 || !comn_category_usd_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) {
										comn_category_usd_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									} else {

										comn_category_usd_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = comn_category_usd_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
									}

								}

							}



							//======------Starts....... Values of Investor-----SHARES..INR and ..USD---------------------==============================// 

							//===Shares
							if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued', join:'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
								var temp_obj = o_number_shares[s_base_str]
								if (temp_obj) {
									o_number_shares[s_base_str] = parseFloat(o_number_shares[s_base_str]) + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
								} else {
									o_number_shares[s_base_str] = o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'});
								}
							} else {
								o_number_shares[s_base_str] = 0;
							}

							//===INR
							if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
								var inr_temp_obj = o_investmnt_amnt[s_base_str]
								if (inr_temp_obj) {
									o_investmnt_amnt[s_base_str] = parseFloat(o_investmnt_amnt[s_base_str]) + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
								} else {
									o_investmnt_amnt[s_base_str] = o_search_init_comn[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'});
								}
							} else {
								o_investmnt_amnt[s_base_str] = 0;
							}

							//===USD
							if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
								var usd_temp_obj = o_investmnt_amnt_usd[s_base_str];
								if (usd_temp_obj) {
									o_investmnt_amnt_usd[s_base_str] = parseFloat(o_investmnt_amnt_usd[s_base_str]) + parseFloat(o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}));
								} else {
									o_investmnt_amnt_usd[s_base_str] = o_search_init_comn[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'});
								}
							} else {
								o_investmnt_amnt_usd[s_base_str] = 0;
							}

							if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
								o_number_shares_NEW[s_base_str] = o_search_init_comn[h].getValue({name:'custrecord_share_affecting_swot_newshare', join:'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'});
							} else {
								o_number_shares_NEW[s_base_str] = 0;
							}

							//=========SWOT TOTAL NUMBER OF SHARES Start=====================================================================================
							if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_share_affect_swot_total_share',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'}))) {
								i_total_number_shares[s_base_str] = o_search_init_comn[h].getValue({name:'custrecord_share_affect_swot_total_share',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'});
							} else {
								i_total_number_shares[s_base_str] = 0;
							}
							//===================END SWOT TOTAL NUMBER OF SHARES=======================================================================================



							if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_acc_swots_premoney_valuation'}))) {
								o_Premoney_native[icmn_seiesnm + '^' + i_cmn_id] = o_search_init_comn[h].getValue({name:'custrecord_acc_swots_premoney_valuation'});
							} else {
								o_Premoney_native[icmn_seiesnm + '^' + i_cmn_id] = 0;
							}

							if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_acc_swots_postmoney_valuation'}))) {
								o_Postmoney_native[icmn_seiesnm + '^' + i_cmn_id] = o_search_init_comn[h].getValue({name:'custrecord_acc_swots_postmoney_valuation'});
							} else {
								o_Postmoney_native[icmn_seiesnm + '^' + i_cmn_id] = 0;
							}

							if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_acc_swots_premoney_value_usd'}))) {
								o_Premoney_usd[icmn_seiesnm + '^' + i_cmn_id] = o_search_init_comn[h].getValue({name:'custrecord_acc_swots_premoney_value_usd'});
							} else {
								o_Premoney_usd[icmn_seiesnm + '^' + i_cmn_id] = 0;
							}

							if (log_Valid(o_search_init_comn[h].getValue({name:'custrecord_acc_swots_postmoney_value_usd'}))) {
								o_Postmoney_usd[icmn_seiesnm + '^' + i_cmn_id] = o_search_init_comn[h].getValue({name:'custrecord_acc_swots_postmoney_value_usd'});
							} else {
								o_Postmoney_usd[icmn_seiesnm + '^' + i_cmn_id] = 0;
							}



							//==============------ENDs....... Values of Investor-----SHARES..INR and ..USD---------------------==============================//				


							var f_shares_options = o_search_init_comn[h].getValue({name:'custrecord_acc_shares_issued',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR'});
							if (_nullValidation(f_shares_options)) {
								f_shares_options = 0;
							}
							f_total_shares = parseFloat(f_total_shares) + parseFloat(f_shares_options);
							log.debug( 'serieswithout_number_of_shares', f_total_shares);
						}

					}
					log.debug( 'o_number_shares::: 1708', JSON.stringify(o_number_shares));
				   
					//==============---------------------Series Without TermSheet--------------------ENDS========================//			



					//.................................VENTURE DEBT__PARTLY PAID SHARES........STARTS...........................................// 

					var o_vdebt_number_shares = {};
					var o_vdebt_investmnt_amnt = {};
					var o_vdebt_investmnt_amnt_usd = {};


					var swo_Id_ref_fr_clsdt = [];
					var a_search_venture_partly = [];
					var a_vdebt_shrs_list = [];

					var o_vdebt_shrs_ppsinr = {};
					var o_vdebt_shrs_ppsusd = {};
					var o_vdebt_shrs_fx = {};

					var o_vdebt_partlypaid_shr = {};
					var o_vdebt_partlypaid_inr = {};
					var o_vdebt_partlypaid_usd = {};

					var category_vdebt_pricecpershr_total = {};
					var category_vdebt_native_total = {};
					var category_vdebt_usd_total = {};


					var a_Search_captablesobj = search.create({
						type: 'customrecord_acc_venturedebt',
						columns: [
							{name: 'internalid'}, 
							{name: 'custrecord_accinitialcommseriestype',join: 'custrecord_acc_swot_inv_vdebtlink',sort: search.Sort.DESC},
							{name: 'custrecord_acc_nonts_closing_date',join: 'custrecord_acc_swot_inv_vdebtlink',sort: search.Sort.ASC},
							{name: 'custrecord_acc_linked_nontsinvestor',join: 'custrecord_acc_swot_inv_vdebtlink'},
							{name: 'custrecord_acc_commonsharestype',join: 'custrecord_acc_swot_inv_vdebtlink'},
							{name: 'custrecord_acc_nonts_pricepershare',join: 'custrecord_acc_swot_inv_vdebtlink'},
							{name: 'custrecord_acc_nonts_pricepershare_usd',join: 'custrecord_acc_swot_inv_vdebtlink'},
							{name: 'custrecord_acc_exchangerate_usdtonative',join: 'custrecord_acc_swot_inv_vdebtlink'},
							{name: 'custrecord_acc_commonsharestype',join: 'custrecord_acc_swot_inv_vdebtlink'},
							{name: 'custrecord_acc_shares_issued',join: 'custrecord_acc_swot_inv_vdebtlink'},
							{name: 'custrecord_acc_nontscommonamount_native',join: 'custrecord_acc_swot_inv_vdebtlink'},
							{name: 'custrecord_acc_nonts_amountinusd',join: 'custrecord_acc_swot_inv_vdebtlink'},
							{name: 'custrecord_acc_swot_inv_category',join: 'custrecord_acc_swot_inv_vdebtlink'}
							
						],
						filters: [
							{name: 'custrecord_acc_vendebt_investee',operator: 'anyof',values: filter_investee}, 
							{name: 'custrecord_acc_nonts_closing_date',operator: 'onorbefore',values: filter_todt,join: 'custrecord_acc_swot_inv_vdebtlink'}
					]
					})
					var a_Search_captables = getMoreRecords(a_Search_captablesobj);

					log.debug('a_Search_captables   1727', a_Search_captables)


					if (a_search_venture_partly) {
						log.debug( 'TESTVEnture', a_search_venture_partly);
						var i_latest_venture_partly = 0;
						for (var h = 0; h < a_search_venture_partly.length; h++) {
							var i_cmn_id = a_search_venture_partly[h].getValue({name:'internalid'});

							var icmn_seriestype = a_search_venture_partly[h].getText({name:'custrecord_accinitialcommseriestype',join: 'custrecord_acc_swot_inv_vdebtlink'});

							var icmn_seiesnm = a_search_venture_partly[h].getText({name:'custrecord_acc_commonsharestype',join: 'custrecord_acc_swot_inv_vdebtlink'})
							var icmn_invester = a_search_venture_partly[h].getValue({name:'custrecord_acc_linked_nontsinvestor',join: 'custrecord_acc_swot_inv_vdebtlink'})
							var icmn_clsingdt = a_search_venture_partly[h].getValue({name:'custrecord_acc_nonts_closing_date',join: 'custrecord_acc_swot_inv_vdebtlink'})
							var cl_time;
							if (icmn_clsingdt)
								cl_time = format.parse({ value: icmn_clsingdt, type: format.Type.DATE }).getTime();//nlapiStringToDate(icmn_clsingdt).getTime();

							var icmn_invester_name = a_search_venture_partly[h].getText({name:'custrecord_acc_linked_nontsinvestor',join: 'custrecord_acc_swot_inv_vdebtlink'})
							var icmn_inr = a_search_venture_partly[h].getValue({name:'custrecord_acc_nonts_pricepershare',join: 'custrecord_acc_swot_inv_vdebtlink'})
							var icmn_usd = a_search_venture_partly[h].getValue({name:'custrecord_acc_nonts_pricepershare_usd',join: 'custrecord_acc_swot_inv_vdebtlink'})
							var fx_rate = a_search_venture_partly[h].getValue({name:'custrecord_acc_exchangerate_usdtonative',join: 'custrecord_acc_swot_inv_vdebtlink'})

							var categoryID = a_search_venture_partly[h].getValue({name:'custrecord_acc_swot_inv_category',join: 'custrecord_acc_swot_inv_vdebtlink'})
							var categoryText = a_search_venture_partly[h].getText({name:'custrecord_acc_swot_inv_category',join: 'custrecord_acc_swot_inv_vdebtlink'})


							if (inv_List.indexOf(icmn_invester) == -1) {
								inv_List.push(icmn_invester);
								a_investers_list.push(icmn_invester + '^' + icmn_invester_name + '^' + categoryID + '^' + categoryText);
							}

							if (_nullValidation(cl_time)) {
								cl_time = 't';
							}

							var f_shares_options = a_search_venture_partly[h].getValue({name:'custrecord_acc_shares_issued',join: 'custrecord_acc_swot_inv_vdebtlink'});
							if (_nullValidation(f_shares_options)) {
								f_shares_options = 0;
							}
							f_total_shares = parseFloat(f_total_shares) + parseFloat(f_shares_options);

							var s_series_id_dt_string = icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time; //+'^'+icmn_inr+'^'+icmn_usd+'^'+'st'+'^'+fx_rate; 
							var s_base_str = icmn_invester + '^' + s_series_id_dt_string;
							if (a_vdebt_shrs_list.indexOf(s_series_id_dt_string) == -1) {
								a_vdebt_shrs_list.push(s_series_id_dt_string);
							}


							//========**START**===========================PRice per share INR..USD and FX VAlues====================================================//					

							if (_logValidation(a_search_venture_partly[h].getValue({name:'custrecord_acc_nonts_pricepershare', join:'custrecord_acc_swot_inv_vdebtlink'}))) {
								o_vdebt_shrs_ppsinr[s_series_id_dt_string] = a_search_venture_partly[h].getValue({name:'custrecord_acc_nonts_pricepershare',join: 'custrecord_acc_swot_inv_vdebtlink'});
							} else {
								o_vdebt_shrs_ppsinr[s_series_id_dt_string] = 0;
							}

							if (_logValidation(a_search_venture_partly[h].getValue({name:'custrecord_acc_nonts_pricepershare_usd',join: 'custrecord_acc_swot_inv_vdebtlink'}))) {
								o_vdebt_shrs_ppsusd[s_series_id_dt_string] = a_search_venture_partly[h].getValue({name:'custrecord_acc_nonts_pricepershare_usd',join: 'custrecord_acc_swot_inv_vdebtlink'});
							} else {
								o_vdebt_shrs_ppsusd[s_series_id_dt_string] == 0;
							}

							if (_logValidation(a_search_venture_partly[h].getValue({name:'custrecord_acc_exchangerate_usdtonative',join: 'custrecord_acc_swot_inv_vdebtlink'}))) {
								o_vdebt_shrs_fx[s_series_id_dt_string] = a_search_venture_partly[h].getValue({name:'custrecord_acc_exchangerate_usdtonative',join: 'custrecord_acc_swot_inv_vdebtlink'});
							} else {
								o_vdebt_shrs_fx[s_series_id_dt_string] = 0;
							}


							//========**ENDS**===========================PRice per share INR..USD and FX VAlues====================================================//							


							if (log_Valid(a_search_venture_partly[h].getValue({name:'custrecord_acc_shares_issued',join: 'custrecord_acc_swot_inv_vdebtlink'}))) {
								if (o_vdebt_partlypaid_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] == 0 || !o_vdebt_partlypaid_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) {
									if (o_vdebt_partlypaid_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] == 'undefined') {
										log.debug( '3rdCheckVal', o_vdebt_partlypaid_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]);
									}
									o_vdebt_partlypaid_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(a_search_venture_partly[h].getValue({name:'custrecord_acc_shares_issued',join: 'custrecord_acc_swot_inv_vdebtlink'}));
								} else {
									o_vdebt_partlypaid_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_vdebt_partlypaid_shr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) + parseFloat(a_search_venture_partly[h].getValue({name:'custrecord_acc_shares_issued',join: 'custrecord_acc_swot_inv_vdebtlink'}));
								}



								//.....category calculation.....starts....//
								if (category_vdebt_pricecpershr_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] == 0 || !(category_vdebt_pricecpershr_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID])) {
									category_vdebt_pricecpershr_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(a_search_venture_partly[h].getValue({name:'custrecord_acc_shares_issued',join: 'custrecord_acc_swot_inv_vdebtlink'}));
									log.debug( 'Needed_DEBT****  1815', category_vdebt_pricecpershr_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID])
								} else {
									category_vdebt_pricecpershr_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(category_vdebt_pricecpershr_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) + parseFloat(a_search_venture_partly[h].getValue({name:'custrecord_acc_shares_issued',join: 'custrecord_acc_swot_inv_vdebtlink'}));
								}
								//.....category calculation.....ends....//		

							}



							if (log_Valid(a_search_venture_partly[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'custrecord_acc_swot_inv_vdebtlink'}))) {
								if (o_vdebt_partlypaid_inr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] == 0 || !o_vdebt_partlypaid_inr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) {
									o_vdebt_partlypaid_inr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(a_search_venture_partly[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'custrecord_acc_swot_inv_vdebtlink'}));
								} else {
									o_vdebt_partlypaid_inr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_vdebt_partlypaid_inr[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) + parseFloat(a_search_venture_partly[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'custrecord_acc_swot_inv_vdebtlink'}));
								}


								//.....category calculation.....starts....//
								if (category_vdebt_native_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] == 0 || !(category_vdebt_native_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID])) {
									category_vdebt_native_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(a_search_venture_partly[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'custrecord_acc_swot_inv_vdebtlink'}));

									log.debug( 'CAtegory-333wiseTOTAL', icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID);


								} else {
									category_vdebt_native_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(category_vdebt_native_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) + parseFloat(a_search_venture_partly[h].getValue({name:'custrecord_acc_nontscommonamount_native', join:'custrecord_acc_swot_inv_vdebtlink'}));
								}
								//									log.debug('category_native_total',category_native_total[icmn_seiesnm+'^'+i_cmn_id+'^'+icmn_clsingdt+'^'+cl_time+'^'+categoryID ])

								//.....category calculation.....ends....//		
							}


							if (log_Valid(a_search_venture_partly[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'custrecord_acc_swot_inv_vdebtlink'}))) {
								if (o_vdebt_partlypaid_usd[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] == 0 || !o_vdebt_partlypaid_usd[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) {
									o_vdebt_partlypaid_usd[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(a_search_venture_partly[h].getValue({name:'custrecord_acc_nonts_amountinusd', join:'custrecord_acc_swot_inv_vdebtlink'}));
								} else {
									o_vdebt_partlypaid_usd[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time] = parseFloat(o_vdebt_partlypaid_usd[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time]) + parseFloat(a_search_venture_partly[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'custrecord_acc_swot_inv_vdebtlink'}));
								}

								//.....category calculation.....starts....//
								if (category_vdebt_usd_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] == 0 || !category_vdebt_usd_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) {
									category_vdebt_usd_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(a_search_venture_partly[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'custrecord_acc_swot_inv_vdebtlink'}));
								} else {
									category_vdebt_usd_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID] = parseFloat(category_vdebt_usd_total[icmn_seiesnm + '^' + i_cmn_id + '^' + icmn_clsingdt + '^' + cl_time + '^' + categoryID]) + parseFloat(a_search_venture_partly[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'custrecord_acc_swot_inv_vdebtlink'}));
								}
								//.....category calculation.....Ênds....//
							}


							if (log_Valid(a_search_venture_partly[h].getValue({name:'custrecord_acc_shares_issued', join:'custrecord_acc_swot_inv_vdebtlink'}))) {
								o_vdebt_number_shares[s_base_str] = a_search_venture_partly[h].getValue({name:'custrecord_acc_shares_issued',join: 'custrecord_acc_swot_inv_vdebtlink'});
							} else {
								o_vdebt_number_shares[s_base_str] = 0;
							}

							//===INR
							if (log_Valid(a_search_venture_partly[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'custrecord_acc_swot_inv_vdebtlink'}))) {
								o_vdebt_investmnt_amnt[s_base_str] = a_search_venture_partly[h].getValue({name:'custrecord_acc_nontscommonamount_native',join: 'custrecord_acc_swot_inv_vdebtlink'});
							} else {
								o_vdebt_investmnt_amnt[s_base_str] = 0;
							}

							//===USD
							if (log_Valid(a_search_venture_partly[h].getValue({name:'custrecord_acc_nonts_amountinusd', join:'custrecord_acc_swot_inv_vdebtlink'}))) {
								o_vdebt_investmnt_amnt_usd[s_base_str] = a_search_venture_partly[h].getValue({name:'custrecord_acc_nonts_amountinusd',join: 'custrecord_acc_swot_inv_vdebtlink'});
							} else {
								o_vdebt_investmnt_amnt_usd[s_base_str] = 0;
							}

						}
					}


					//::::::::::::::::::::::::::::::::::::Venture Debt Partly Paid Shares:::::::::::::::::ENDS :::::::::::://




					//======================== GROUP Ist and 2nd Close=========================// 			

					var a_Search_captablesobj = search.create({
						type: 'customrecord_acc_termsheet',
						columns: [
							{name: 'internalid',summary:search.Summary.GROUP}, 
							{name: 'custrecord_acc_investment_closing_dt',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET',summary:search.Summary.GROUP,sort: search.Sort.ASC},
						],
						filters: [
							{name: 'custrecord_termsheetstatus',operator: 'anyof',values: "2"},
							{name: 'custrecord_acc_companyname',operator: 'anyof',values: filter_investee},
							{name: 'custrecord_acc_ts_tsreference',operator: 'noneof',values: "@NONE@"},
							{name: 'custrecord_acc_investment_closing_dt',operator: 'onorbefore',values: filter_todt,join: 'custrecord_acc_invest_termsheet'},
							{name: 'custrecord_acc_investment_seriestype',operator: 'anyof',values: "1",join: 'custrecord_acc_invest_termsheet'}
					]
					})
					var customrecord_ts_group_Search_obj = getMoreRecords(a_Search_captablesobj);
					log.debug('customrecord_ts_group_Search_obj   1912', customrecord_ts_group_Search_obj)



					if (customrecord_ts_group_Search_obj) {

						for (var h = 0; h < customrecord_ts_group_Search_obj.length; h++) {
							var i_cmn_id = customrecord_ts_group_Search_obj[h].getValue({name: 'internalid',summary:search.Summary.GROUP});
							var icmn_clsingdt = customrecord_ts_group_Search_obj[h].getValue({name: 'custrecord_acc_investment_closing_dt',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET',summary:search.Summary.GROUP})
							var cl_time;
							if (icmn_clsingdt){
								cl_time = format.parse({ value: closedt, type: format.Type.DATE }).getTime();//nlapiStringToDate(icmn_clsingdt).getTime();
							}

							if (_nullValidation(cl_time)) {
								cl_time = 't';
							}

							if (h + 1 < customrecord_ts_group_Search_obj.length) {
								var v = h + 1;
								var nxt_id = customrecord_ts_group_Search_obj[v].getValue({name: 'internalid',summary:search.Summary.GROUP});
								var nxt_clsingdt = customrecord_ts_group_Search_obj[v].getValue({name: 'custrecord_acc_investment_closing_dt',join: 'CUSTRECORD_ACC_INVEST_TERMSHEET',summary:search.Summary.GROUP})
								var nxt_cl_time = format.parse({ value: nxt_clsingdt, type: format.Type.DATE }).getTime();//nlapiStringToDate(nxt_clsingdt).getTime();
							}

							if (swo_Id_ref_fr_clsdt.indexOf(i_cmn_id) == -1) {
								swo_Id_ref_fr_clsdt.push(i_cmn_id);
								if (nxt_id && nxt_id != 0) {
									temp = 1;
									if (nxt_id == i_cmn_id && nxt_cl_time != cl_time) {

										tempstr = temp + "st Close";
										o_cmn_snm_dt_ctime_tempstr['FT' + '^' + i_cmn_id + '^' + icmn_clsingdt] = tempstr;
									} else {
										o_cmn_snm_dt_ctime_tempstr['FT' + '^' + i_cmn_id + '^' + icmn_clsingdt] = "x";
									}
								}

							} else {
								if (!_logValidation(o_cmn_snm_dt_ctime_tempstr['FT' + '^' + i_cmn_id + '^' + icmn_clsingdt])) {

									temp = temp + 1;
									if (temp == 2) {
										tempstr = temp + "nd Close"
									} else if (temp == 3) {
										tempstr = temp + "rd Close"
									} else if (temp > 3) {
										tempstr = temp + "th Close"
									}
									o_cmn_snm_dt_ctime_tempstr['FT' + '^' + i_cmn_id + '^' + icmn_clsingdt] = tempstr;

								}
							}
						}

					}

			
					var a_Search_captablesobj = search.create({
						type: 'customrecord_acc_initial_incorporation',
						columns: [
							{name: 'internalid',summary:search.Summary.GROUP}, 
							{name: 'custrecord_acc_nonts_closing_date',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR',summary:search.Summary.GROUP,sort: search.Sort.ASC}
						],
						filters: [
							{name: 'custrecord_acc_com_investee',operator: 'anyof',values: filter_investee},
							{name: 'custrecord_acc_nonts_closing_date',operator: 'onorbefore',values: filter_todt,join: 'custrecord_acc_linked_nonts_investor'},
							{name: 'custrecord_acc_nonts_closing_date',operator: 'isnotempty',values: "",join: 'custrecord_acc_linked_nonts_investor'},
							{name: 'custrecord_accinitialcommseriestype',operator: 'anyof',values: "1",join: 'custrecord_acc_linked_nonts_investor'}
					]
					})
					var customrecord_acc_initial_incorporation_groupSearch = getMoreRecords(a_Search_captablesobj);
					log.debug('customrecord_acc_initial_incorporation_groupSearch     1984', customrecord_acc_initial_incorporation_groupSearch)

					if (customrecord_acc_initial_incorporation_groupSearch) {

						for (var h = 0; h < customrecord_acc_initial_incorporation_groupSearch.length; h++) {
							var i_cmn_id = customrecord_acc_initial_incorporation_groupSearch[h].getValue({name: 'internalid',summary:search.Summary.GROUP});
							var icmn_clsingdt = customrecord_acc_initial_incorporation_groupSearch[h].getValue({name: 'custrecord_acc_nonts_closing_date',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR',summary:search.Summary.GROUP})
							var cl_time = format.parse({ value: icmn_clsingdt, type: format.Type.DATE }).getTime();//nlapiStringToDate(icmn_clsingdt).getTime();


							if (h + 1 < customrecord_acc_initial_incorporation_groupSearch.length) {
								var v = h + 1;
								var nxt_id = customrecord_acc_initial_incorporation_groupSearch[v].getValue({name: 'internalid',summary:search.Summary.GROUP});
								var nxt_clsingdt = customrecord_acc_initial_incorporation_groupSearch[v].getValue({name: 'custrecord_acc_nonts_closing_date',join: 'CUSTRECORD_ACC_LINKED_NONTS_INVESTOR',summary:search.Summary.GROUP})
								var nxt_cl_time = format.parse({ value: nxt_clsingdt, type: format.Type.DATE }).getTime();//nlapiStringToDate(nxt_clsingdt).getTime();
							}

							if (swo_Id_ref_fr_clsdt.indexOf(i_cmn_id) == -1) {

								if (nxt_id && nxt_id != 0) {
									temp = 1;
									if (nxt_id == i_cmn_id && nxt_cl_time != cl_time){
										swo_Id_ref_fr_clsdt.push(i_cmn_id);
										tempstr = temp + "st Close";
										o_cmn_snm_dt_ctime_tempstr['ST' + '^' + i_cmn_id + '^' + icmn_clsingdt] = tempstr;
									} else {
										o_cmn_snm_dt_ctime_tempstr['ST' + '^' + i_cmn_id + '^' + icmn_clsingdt] = "x";
									}
								}

							} else {
								if (!_logValidation(o_cmn_snm_dt_ctime_tempstr['ST' + '^' + i_cmn_id + '^' + icmn_clsingdt])) {

									temp = temp + 1;
									if (temp == 2) {
										tempstr = temp + "nd Close"
									} else if (temp == 3) {
										tempstr = temp + "rd Close"
									} else if (temp > 3) {
										tempstr = temp + "th Close"
									}
									o_cmn_snm_dt_ctime_tempstr['ST' + '^' + i_cmn_id + '^' + icmn_clsingdt] = tempstr;

								}
							}
						}

					}


					log.debug( '========', JSON.stringify(a_pri_SeresNM_Dt_list));
					a_pri_SeresNM_Dt_list.sort(preferred_Array_sort)

					a_com_SeresNM_Dt.sort(Common_Array_sort)
					log.debug( '*^^^*', JSON.stringify(a_com_SeresNM_Dt));

					a_investers_list.sort(sortNumberArray);
					log.debug( '********', JSON.stringify(a_investers_list));


					a_pre_snm_dt_ctime.sort(preferred_Array_sort);
					a_cmn_snm_dt_ctime.sort(Common_Array_sort);




					if (_nullValidation(g_currency)) {
						g_currency = "INR";
					}
					log.debug( 'g_currency:*************:2053', g_currency);

					if (log_Valid(o_search_init_comn) || log_Valid(SearchVentureDebt) || log_Valid(SearchESOP) || log_Valid(a_Search_captables) || log_Valid(a_search_venture_partly) || log_Valid(a_search_Bridge_PromissoryNotes)) {
						var CapTabl_html = '';
						CapTabl_html += '<html>';
						CapTabl_html += '<body>'; //D3D3D3
						CapTabl_html += "<style>.view {";
						CapTabl_html += "	margin: auto;";
						//CapTabl_html += "   width: 500px;";
						CapTabl_html += "   ";
						CapTabl_html += "}";
						CapTabl_html += "";
						CapTabl_html += ".wrapper {";
						CapTabl_html += "	position: relative;";
						CapTabl_html += "	overflow: auto;";
						//CapTabl_html += "   	border: 1px solid black;";
						//CapTabl_html += "  	white-space: nowrap;";
						CapTabl_html += "}";
						CapTabl_html += "";
						CapTabl_html += ".inv_sticky-col {";
						CapTabl_html += "    position: sticky;";
						CapTabl_html += "    position: -webkit-sticky;    ";
						CapTabl_html += "    border-right:0px; border-bottom:0px;";
						//		 CapTabl_html +="color:#f5f6fa;"
						CapTabl_html += "}";
						CapTabl_html += "  ";
						CapTabl_html += ".inv_first-col {";
						//		 CapTabl_html +="color:#f5f6fa;"
						CapTabl_html += "	width: 150px;";
						CapTabl_html += "    min-width: 150px;";
						CapTabl_html += "    max-width: 150px;";
						CapTabl_html += "	left: 0px;    ";
						//		 CapTabl_html += "    border-right:0px; border-bottom:0px;";
						CapTabl_html += "    border-color:#576574; ";
						CapTabl_html += "}";

						CapTabl_html += "table {";
						CapTabl_html += "border-color:#576574;";
						CapTabl_html += " }";



						CapTabl_html += ".sticky-col {";
						CapTabl_html += "    position: sticky;";
						CapTabl_html += "    position: -webkit-sticky;    ";
						CapTabl_html += "    background-color: #576574;";
						CapTabl_html += "color:#ffffff;"
						CapTabl_html += "    border-color:#576574; ";

						CapTabl_html += "}";
						CapTabl_html += "  ";
						CapTabl_html += ".first-col {";
						CapTabl_html += "color:#ffffff;"
						CapTabl_html += "	width: 150px;";
						CapTabl_html += "    min-width: 150px;";
						CapTabl_html += "    max-width: 150px;";
						CapTabl_html += "	left: 0px;    ";
						CapTabl_html += "    border-color:#576574; ";

						//		 CapTabl_html += "    border-right:0px; border-bottom:0px;";

						CapTabl_html += "}";
						CapTabl_html += "";
						CapTabl_html += ".inv_second-col {";
						CapTabl_html += "	width: 150px;";
						CapTabl_html += "    min-width: 150px;";
						CapTabl_html += "    max-width: 150px;";
						CapTabl_html += "	left: 150px;    ";

						CapTabl_html += "    border-color:#576574; ";

						CapTabl_html += "}";
						CapTabl_html += ".second-col {";
						CapTabl_html += "	width: 150px;";
						CapTabl_html += "    min-width: 150px;";
						CapTabl_html += "    max-width: 150px;";
						CapTabl_html += "	left: 150px;    ";
						CapTabl_html += "    border-color:#576574; ";

						CapTabl_html += "}<\/style>";
						CapTabl_html += "<style>.uir-outside-fields-table {width:100%;}</style><table width=\"100%\" bgcolor=\"#ffffff\" border=\"1\" cellspacing=\"0\" cellpadding=\"3\" style=\" border-collapse:collapse; margin-top:30px; border:1px solid white; padding-bottom:10px;\">";
						CapTabl_html += "<html>";

						CapTabl_html += "<div class=\"view\"><div class=\"wrapper\"><table  id=\"fixed_hdr1\" width=\"100%\" bgcolor=\"#f7f1e3\" border=\"1\" cellspacing=\"10\" cellpadding=\"5\" style=\" font-size:12px; border-collapse:collapse; margin-top:10px; border:1px solid #576574; padding-bottom:10px;\">";


						CapTabl_html += "<thead>"; // style=\"display:block; width:100%;\"  >";

						var venturedebt_partly_lrngth;
						if (_nullValidation(a_search_venture_partly)) {
							venturedebt_partly_lrngth = 0
						} else {
							venturedebt_partly_lrngth = a_search_venture_partly.length;
						}


						var tbl_series_cnt = a_pri_SeresNM_Dt_list.length + a_com_SeresNM_Dt.length + a_bridge_orig_conv_dt_list.length + venturedebt_partly_lrngth;
						var without_BRidge_tbl_series_cnt = a_pri_SeresNM_Dt_list.length + a_com_SeresNM_Dt.length;
						var bridgeCount = a_bridge_orig_conv_dt_list.length;
						var cnt = tbl_series_cnt * 4;
						cnt = cnt + 6;


							   //=======START-----------INVESTEE NAME showing=========================//
							
						if (!log_Valid(investee_name)) {
							investee_name = search.lookupFields({type:'customrecord_acc_investee', id:filter_investee, columns:'name'});
							investee_name = investee_name.name
						}

						CapTabl_html += "<tr>";
						CapTabl_html += "<td colspan=\"2\" class=\"inv_sticky-col inv_first-col\" bgcolor=\"#f7f1e3\" style=\"border-right-style:none; white-space: nowrap; max-width:100%\" ><b>" + investee_name + "</b></td>";
						CapTabl_html += "<td  colspan=" + cnt + " align=\"center\"></td>";
						CapTabl_html += "</tr>";
							
							   //=======ENDS-----------INVESTEE NAME showing=========================//
							  
									
							   //=======START-----------PRICE per SHARE and VALUES showing=========================//
							 
								
						var colour = 0;
						CapTabl_html += "<tr>";
						CapTabl_html += "<td colspan=\"2\" class=\"sticky-col first-col\" width=\"15%\">\xa0</td>";
						//			   	CapTabl_html +="<td class=\"sticky-col second-col\">\xa0</td>";
						for (var k = 0; k < a_pri_SeresNM_Dt_list.length; k++) {

							if (colour > 1) {
								colour = 0
							}

							if (_nullValidation(o_pre_snm_dt_ctime_ppsinr[a_pri_SeresNM_Dt_list[k]])) {
								o_pre_snm_dt_ctime_ppsinr[a_pri_SeresNM_Dt_list[k]] = 0;
							}
							last_prefe_share_price = parseFloat(o_pre_snm_dt_ctime_ppsinr[a_pri_SeresNM_Dt_list[k]]);

							if (_nullValidation(o_pre_snm_dt_ctime_ppsusd[a_pri_SeresNM_Dt_list[k]])) {
								o_pre_snm_dt_ctime_ppsusd[a_pri_SeresNM_Dt_list[k]] = 0;
							}
							last_prefe_usd = parseFloat(o_pre_snm_dt_ctime_ppsusd[a_pri_SeresNM_Dt_list[k]]);

							if (g_currency.toString() == "USD") {
								CapTabl_html += "<td  colspan=\"3\"align=\"center\" bgcolor=" + colors[colour] + ">Price per Share</td>";
								//					CapTabl_html += "<td  align=\"center\" bgcolor="+colors[colour]+">"+g_currency+"\xa0"+formatNumber(last_prefe_share_price.toFixed(2))+"</td>";
								CapTabl_html += "<td  colspan=\"2\" align=\"center\" bgcolor=" + colors[colour] + ">$" + formatNumber(last_prefe_usd.toFixed(2)) + "</td>";
							} else {
								CapTabl_html += "<td  colspan=\"3\"align=\"center\" bgcolor=" + colors[colour] + ">Price per Share</td>";
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + ">" + g_currency + "\xa0" + formatNumber(last_prefe_share_price.toFixed(2)) + "</td>";
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + ">$" + formatNumber(last_prefe_usd.toFixed(2)) + "</td>";
							}

							colour++;
						}

						if (a_pri_SeresNM_Dt_list.length % 2 == 0) {
							colour = 0;
						} else {
							colour = 1;
						}
						//    var colour  = 0;

						for (var k = 0; k < a_com_SeresNM_Dt.length; k++) {
							if (colour > 1) {
								colour = 0
							}
							if (_nullValidation(o_cmn_snm_dt_ctime_ppsinr[a_com_SeresNM_Dt[k]])) {
								o_cmn_snm_dt_ctime_ppsinr[a_com_SeresNM_Dt[k]] = 0;
							}
							if (_nullValidation(o_cmn_snm_dt_ctime_ppsusd[a_com_SeresNM_Dt[k]])) {
								o_cmn_snm_dt_ctime_ppsusd[a_com_SeresNM_Dt[k]] = 0;
							}
							var cmn_share_price = parseFloat(o_cmn_snm_dt_ctime_ppsinr[a_com_SeresNM_Dt[k]]);
							var cmn_share_usd = parseFloat(o_cmn_snm_dt_ctime_ppsusd[a_com_SeresNM_Dt[k]]);

							if (g_currency.toString() == "USD") {
								CapTabl_html += "<td  colspan=\"3\" align=\"center\" bgcolor=" + colors[colour] + ">Price per Share</td>";
								//					CapTabl_html += "<td  align=\"center\" bgcolor="+colors[colour]+">"+g_currency+"\xa0"+formatNumber(cmn_share_price.toFixed(2))+"</td>";
								CapTabl_html += "<td  colspan=\"2\" align=\"center\" bgcolor=" + colors[colour] + ">$" + formatNumber(cmn_share_usd.toFixed(2)) + "</td>";
							} else {
								CapTabl_html += "<td  colspan=\"3\" align=\"center\" bgcolor=" + colors[colour] + ">Price per Share</td>";
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + ">" + g_currency + "\xa0" + formatNumber(cmn_share_price.toFixed(2)) + "</td>";
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + ">$" + formatNumber(cmn_share_usd.toFixed(2)) + "</td>";
							}
							colour++;
						}
						//		if(a_com_SeresNM_Dt.length%2 == 0){colour  = 0;}else{colour  = 1;}

						//===================== .  (15-07-2020) ===========================
						for (var k = 0; k < a_bridge_orig_conv_dt_list.length; k++) {
							if (colour > 1) {
								colour = 0
							}
							if (_nullValidation(o_bridge_snm_dt_ctime_ppsinr[a_bridge_orig_conv_dt_list[k]])) {
								o_bridge_snm_dt_ctime_ppsinr[a_bridge_orig_conv_dt_list[k]] = 0;
							}
							if (_nullValidation(o_bridge_snm_dt_ctime_ppsusd[a_bridge_orig_conv_dt_list[k]])) {
								o_bridge_snm_dt_ctime_ppsusd[a_bridge_orig_conv_dt_list[k]] = 0;
							}
							var cmn_share_price = parseFloat(o_bridge_snm_dt_ctime_ppsinr[a_bridge_orig_conv_dt_list[k]]);
							var cmn_share_usd = parseFloat(o_bridge_snm_dt_ctime_ppsusd[a_bridge_orig_conv_dt_list[k]]);

							if (g_currency.toString() == "USD") {
								CapTabl_html += "<td  colspan=\"3\" align=\"center\" bgcolor=" + colors[colour] + ">Price per Share</td>";
								//					CapTabl_html += "<td  align=\"center\" bgcolor="+colors[colour]+">"+g_currency+"\xa0"+formatNumber(cmn_share_price.toFixed(2))+"</td>";
								CapTabl_html += "<td  colspan=\"3\" align=\"center\" bgcolor=" + colors[colour] + ">$" + formatNumber(cmn_share_usd.toFixed(2)) + "</td>";
							} else {
								CapTabl_html += "<td  colspan=\"4\" align=\"center\" bgcolor=" + colors[colour] + ">Price per Share</td>";
								CapTabl_html += "<td  colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + ">" + g_currency + "\xa0" + formatNumber(cmn_share_price.toFixed(2)) + "</td>";
								CapTabl_html += "<td  colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + ">$" + formatNumber(cmn_share_usd.toFixed(2)) + "</td>";
							}
							colour++;

						}
						//==============================  (15-07-2020) ============================		


						//	if(a_bridge_SeresNM_Dt_list.length%2 == 0){colour  = 0;}else{colour  = 1;}


						for (var k = 0; k < a_vdebt_shrs_list.length; k++) {
							if (colour > 1) {
								colour = 0
							}
							if (_nullValidation(o_vdebt_shrs_ppsinr[a_vdebt_shrs_list[k]])) {
								o_vdebt_shrs_ppsinr[a_vdebt_shrs_list[k]] = 0;
							}
							if (_nullValidation(o_vdebt_shrs_ppsusd[a_vdebt_shrs_list[k]])) {
								o_vdebt_shrs_ppsusd[a_vdebt_shrs_list[k]] = 0;
							}
							var cmn_share_price = parseFloat(o_vdebt_shrs_ppsinr[a_vdebt_shrs_list[k]]);
							var cmn_share_usd = parseFloat(o_vdebt_shrs_ppsusd[a_vdebt_shrs_list[k]]);

							if (g_currency.toString() == "USD") {
								CapTabl_html += "<td  colspan=\"3\" align=\"center\" bgcolor=" + colors[colour] + ">Price per Share</td>";
								//					CapTabl_html += "<td  align=\"center\" bgcolor="+colors[colour]+">"+g_currency+"\xa0"+formatNumber(cmn_share_price.toFixed(2))+"</td>";
								CapTabl_html += "<td  colspan=\"2\" align=\"center\" bgcolor=" + colors[colour] + ">$" + formatNumber(cmn_share_usd.toFixed(2)) + "</td>";
							} else {
								CapTabl_html += "<td  colspan=\"3\" align=\"center\" bgcolor=" + colors[colour] + ">Price per Share</td>";
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + ">" + g_currency + "\xa0" + formatNumber(cmn_share_price.toFixed(2)) + "</td>";
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + ">$" + formatNumber(cmn_share_usd.toFixed(2)) + "</td>";
							}
							colour++;

						}
						CapTabl_html += "<td  align=\"center\" colspan=\"6\">\xa0</td>";
						CapTabl_html += "</tr>";



						var colour = 0;


						//	   	 
						//=======ENDS-----------PRICE per SHARE and VALUES showing=========================//




						//	  //=======START-----------EXCHANGE Rates showing=========================//
						var colour = 0;
						CapTabl_html += "<tr>";
						CapTabl_html += "<td colspan=\"2\" class=\"sticky-col first-col\" width=\"15%\">\xa0</td>";
						//		   	CapTabl_html +="<td class=\"sticky-col second-col\">\xa0</td>";


						for (var k = 0; k < a_pri_SeresNM_Dt_list.length; k++) {
							if (colour > 1) {
								colour = 0
							}
							if (_nullValidation(o_pre_snm_dt_ctime_fx[a_pri_SeresNM_Dt_list[k]])) {
								o_pre_snm_dt_ctime_fx[a_pri_SeresNM_Dt_list[k]] = 0;
							}
							CapTabl_html += "<td   bgcolor=" + colors[colour] + " align=\"left\" colspan=\"5\"><p style=\"text-align:left;\">Fx Rate<span style=\"float:right;\">" + g_currency + "\xa0" + o_pre_snm_dt_ctime_fx[a_pri_SeresNM_Dt_list[k]] + "</span></td>";
							colour++;
						}

						if (a_pri_SeresNM_Dt_list.length % 2 == 0) {
							colour = 0;
						} else {
							colour = 1;
						}
						for (var k = 0; k < a_com_SeresNM_Dt.length; k++) {
							if (colour > 1) {
								colour = 0
							}
							if (_nullValidation(o_cmn_snm_dt_ctime_fx[a_com_SeresNM_Dt[k]])) {
								o_cmn_snm_dt_ctime_fx[a_com_SeresNM_Dt[k]] = 0;
							}
							CapTabl_html += "<td   bgcolor=" + colors[colour] + " align=\"left\" colspan=\"5\"><p style=\"text-align:left;\">Fx Rate<span style=\"float:right;\">" + g_currency + "\xa0" + o_cmn_snm_dt_ctime_fx[a_com_SeresNM_Dt[k]] + "</span></td>";
							colour++;
						}

						//===================== .  (15-07-2020) ===========================

						for (var k = 0; k < a_bridge_orig_conv_dt_list.length; k++) {
							if (colour > 1) {
								colour = 0
							}
							if (_nullValidation(o_bridge_snm_dt_ctime_fx[a_bridge_orig_conv_dt_list[k]])) {
								o_bridge_snm_dt_ctime_fx[a_bridge_orig_conv_dt_list[k]] = 0;
							}
							CapTabl_html += "<td   bgcolor=" + colors[colour] + " align=\"left\" colspan=\"6\"><p style=\"text-align:left;\">Fx Rate<span style=\"float:right;\">" + g_currency + "\xa0" + o_bridge_snm_dt_ctime_fx[a_bridge_orig_conv_dt_list[k]] + "</span></td>";
							colour++;
						}
						// =====================  (15-07-2020) =================================		  

						for (var k = 0; k < a_vdebt_shrs_list.length; k++) {
							if (colour > 1) {
								colour = 0
							}
							if (_nullValidation(o_vdebt_shrs_fx[a_vdebt_shrs_list[k]])) {
								o_vdebt_shrs_fx[a_vdebt_shrs_list[k]] = 0;
							}
							CapTabl_html += "<td   bgcolor=" + colors[colour] + " align=\"left\" colspan=\"5\"><p style=\"text-align:left;\">Fx Rate<span style=\"float:right;\">" + g_currency + "\xa0" + o_vdebt_shrs_fx[a_vdebt_shrs_list[k]] + "</span></td>";
							colour++;
						}


						CapTabl_html += "<td  align=\"center\" colspan=\"6\"></td>";
						CapTabl_html += "</tr>";

						//	   	
						//	  //=======END-----------EXCHANGE Rates showing=========================// 	




						//	   	//=======Start-----------Series Names with Dates showing======================//
						//	
						var colour = 0;
						//					 var i_category_increment;
						CapTabl_html += "<tr>";
						CapTabl_html += "<td class=\"sticky-col first-col\" colspan=\"2\" width=\"15%\"></td>";
						//		   	CapTabl_html +="<td class=\"sticky-col second-col\">\xa0</td>";


						for (var k = 0; k < a_pri_SeresNM_Dt_list.length; k++) {
							if (colour > 1) {
								colour = 0
							}
							var str = a_pri_SeresNM_Dt_list[k];
							var first = str.split('^')[0]; // +'\xa0'+templist[k];
							f_id = str.split('^')[1];
							var secondVAl = str.split('^')[2];
							var rectype = o_pre_snm_dt_ctime_type[a_pri_SeresNM_Dt_list[k]];


							//uncommented 4-sept
							var temstring = " ";
							//	log.debug('@@@@@@'+o_cmn_snm_dt_ctime_tempstr[a_pri_SeresNM_Dt_list[k]]);

							if (rectype == 'ft') {
								if (!_nullValidation(o_cmn_snm_dt_ctime_tempstr['FT' + '^' + a_pri_SeresNM_Dt_list[k].split('^')[1] + '^' + a_pri_SeresNM_Dt_list[k].split('^')[2]])) {
									if (o_cmn_snm_dt_ctime_tempstr['FT' + '^' + a_pri_SeresNM_Dt_list[k].split('^')[1] + '^' + a_pri_SeresNM_Dt_list[k].split('^')[2]] != 'x') {
										temstring = "[" + o_cmn_snm_dt_ctime_tempstr['FT' + '^' + a_pri_SeresNM_Dt_list[k].split('^')[1] + '^' + a_pri_SeresNM_Dt_list[k].split('^')[2]] + "]";
										//							log.debug('termstring**'+temstring);
									} else {
										temstring = '';
									}
								}
								//					log.debug('rectype**'+temstring);


								var tooltip_string = '<html> <style> .tooltip {   position: relative;   display: inline-block;   border-bottom: 1px dotted green; }  .tooltip .tooltiptext {   visibility: ;   width: 150px;   background-color: #fdcb6e;   color: #fff;   text-align: center;   border-radius: 6px;     position: absolute;   z-index: 1;   bottom: 125%;       opacity: 0;   transition: opacity 0.3s; }  .tooltip .tooltiptext::after {   content: "";   position: absolute;   top: 100%;    border-width: 5px;   border-style: solid;   border-color: #555 transparent transparent transparent; }  .tooltip:hover .tooltiptext {   visibility: visible;   opacity: 1; } </style> <body style="text-align:center;">  <div class="tooltip" style="margin-left:0px;">' + first + '<span class="tooltiptext"><a href="https://5095851.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=9&id=' + f_id + '" target="_blank">View FinalTerms</span> </div>  </body> </html>';
								if (temstring) {
									CapTabl_html += "<td colspan=\"5\"  bgcolor=" + colors[colour] + "><font color=\"#6F1E51\"><b><span style=\"text-align:left; float:left;\">" + tooltip_string + "</span>\xa0" + temstring + "<span style=\"float:right;\">" + secondVAl + "</span></b></font></td>";
								} else {
									CapTabl_html += "<td colspan=\"5\"  bgcolor=" + colors[colour] + "><font color=\"#6F1E51\"><b><span style=\"text-align:left; float:left;\">" + tooltip_string + "</span><span style=\"float:right;\">" + secondVAl + "</span></b></font></td>";
								}

								log.debug( 'rectype--' + rectype + '^' + f_id);


							}

							if (rectype == 'st') {
								if (!_nullValidation(o_cmn_snm_dt_ctime_tempstr['ST' + '^' + a_pri_SeresNM_Dt_list[k].split('^')[1] + '^' + a_pri_SeresNM_Dt_list[k].split('^')[2]]) || !_nullValidation(o_cmn_snm_dt_ctime_tempstr['FT' + '^' + a_pri_SeresNM_Dt_list[k].split('^')[1] + '^' + a_pri_SeresNM_Dt_list[k].split('^')[2]])) {
									if (o_cmn_snm_dt_ctime_tempstr['ST' + '^' + a_pri_SeresNM_Dt_list[k].split('^')[1] + '^' + a_pri_SeresNM_Dt_list[k].split('^')[2]] != "x") {
										temstring = "[" + o_cmn_snm_dt_ctime_tempstr['ST' + '^' + a_pri_SeresNM_Dt_list[k].split('^')[1] + '^' + a_pri_SeresNM_Dt_list[k].split('^')[2]] + "]";
										//							log.debug('termstring**'+temstring);
									} //left: 50%;
									else {
										temstring = '';
									}

								} else {
									temstring = '';
								}

								var tooltip_string = '<html> <style> .tooltip {   position: relative;   display: inline-block;   border-bottom: 1px dotted green; }  .tooltip .tooltiptext {   visibility: ;   width: 150px;   background-color: #fdcb6e;   color: #fff;   text-align: center;   border-radius: 6px;    position: absolute;   z-index: 1;   bottom: 125%;      opacity: 0;   transition: opacity 0.3s; }  .tooltip .tooltiptext::after {   content: "";   position: absolute;   top: 100%;     border-width: 5px;   border-style: solid;   border-color: #555 transparent transparent transparent; }  .tooltip:hover .tooltiptext {   visibility: visible;   opacity: 1; } </style> <body style="text-align:center;">  <div class="tooltip" style="margin-left:0px;">' + first + '<span class="tooltiptext"><a href="https://5095851.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=8&id=' + f_id + '" target="_blank">View Series Without Term Sheet </span> </div>  </body> </html>';
								if (temstring) {
									CapTabl_html += "<td colspan=\"5\"   bgcolor=" + colors[colour] + "><font color=\"#6F1E51\"><b><span style=\"text-align:left; float:left;\">" + tooltip_string + "</span>\xa0" + temstring + "<span style=\"float:right;\">" + secondVAl + "</span></b></font></td>";
								} else {
									CapTabl_html += "<td colspan=\"5\"   bgcolor=" + colors[colour] + "><font color=\"#6F1E51\"><b><span style=\"text-align:left; float:left;\">" + tooltip_string + "</span><span style=\"float:right;\">" + secondVAl + "</span></b></font></td>";
								}
								//					log.debug('rectype--'+rectype+'^'+f_id);

							}


							colour++;

						}

						if (a_pri_SeresNM_Dt_list.length % 2 == 0) {
							colour = 0;
						} else {
							colour = 1;
						}
						for (var k = 0; k < a_com_SeresNM_Dt.length; k++) {
							if (colour > 1) {
								colour = 0
							}
							var str = a_com_SeresNM_Dt[k];
							var first = str.split('^')[0];
							f_id = str.split('^')[1];
							var secondVAl = str.split('^')[2];
							var rectype = o_cmn_snm_dt_ctime_type[a_com_SeresNM_Dt[k]];
							if (rectype == 'ft') {
								var tooltip_string = '<html> <style> .tooltip {   position: relative;   display: inline-block;   border-bottom: 1px dotted green; }  .tooltip .tooltiptext {   visibility: ;   width: 150px;   background-color: #fdcb6e;   color: #fff;   text-align: center;   border-radius: 6px;   padding: 5px 0;   position: absolute;   z-index: 1;   bottom: 125%;   left: 50%;   margin-left: -60px;   opacity: 0;   transition: opacity 0.3s; }  .tooltip .tooltiptext::after {   content: "";   position: absolute;   top: 100%;   left: 50%;   margin-left: -5px;   border-width: 5px;   border-style: solid;   border-color: #555 transparent transparent transparent; }  .tooltip:hover .tooltiptext {   visibility: visible;   opacity: 1; } </style> <body style="text-align:center;">  <div class="tooltip" style="margin-left:0px;">' + first + '<span class="tooltiptext"><a href="https://5095851.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=9&id=' + f_id + '" target="_blank">View FinalTerms</span> </div>  </body> </html>';
								CapTabl_html += "<td colspan=\"5\"   bgcolor=" + colors[colour] + "><font color=\"#6F1E51\"><b><span style=\"text-align:left; float:left;\">" + tooltip_string + "</span><span style=\"float:right;\">" + secondVAl + "</span></b></font></td>";
							} else if (rectype == 'st') {
								var tooltip_string = '<html> <style> .tooltip {   position: relative;   display: inline-block;   border-bottom: 1px dotted green; }  .tooltip .tooltiptext {   visibility: ;   width: 150px;   background-color: #fdcb6e;   color: #fff;   text-align: center;   border-radius: 6px;   padding: 5px 0;   position: absolute;   z-index: 1;   bottom: 125%;   left: 50%;   margin-left: -60px;   opacity: 0;   transition: opacity 0.3s; }  .tooltip .tooltiptext::after {   content: "";   position: absolute;   top: 100%;   left: 50%;   margin-left: -5px;   border-width: 5px;   border-style: solid;   border-color: #555 transparent transparent transparent; }  .tooltip:hover .tooltiptext {   visibility: visible;   opacity: 1; } </style> <body style="text-align:center;">  <div class="tooltip" style="margin-left:0px;">' + first + '<span class="tooltiptext"><a href="https://5095851.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=8&id=' + f_id + '" target="_blank">View Series Without Term Sheet</span> </div>  </body> </html>';
								CapTabl_html += "<td colspan=\"5\"   bgcolor=" + colors[colour] + "><font color=\"#6F1E51\"><b><span style=\"text-align:left; float:left;\">" + tooltip_string + "</span><span style=\"float:right;\">" + secondVAl + "</span></b></font></td>";
							}
							colour++;
						}

						for (var k = 0; k < a_bridge_orig_conv_dt_list.length; k++) {
							if (colour > 1) {
								colour = 0
							}
							var str = a_bridge_orig_conv_dt_list[k];
							var g_series_name = str.split('^')[0];
							log.debug( 'g_series_name', g_series_name);
							f_id = str.split('^')[1];
							var secondVAl = str.split('^')[2];
							log.debug( 'secondVAl_series', secondVAl);
							var converted_Series_nm = str.split('^')[4];
							log.debug( 'converted_Series_nm_series', converted_Series_nm);
							var g_converted_dt = str.split('^')[5];
							log.debug( 'g_converted_dt_series', g_converted_dt);

							var g_converted_chkbox = str.split('^')[6];
							log.debug( 'g_converted_chkbox_series', g_converted_chkbox);

							if ((g_converted_chkbox == 'T') && (g_converted_dt != 'n')) {

								if (nlapiStringToDate(g_converted_dt).getTime() > nlapiStringToDate(filter_todt).getTime()) {
									var tooltip_string = '<html> <style> .tooltip {   position: relative;   display: inline-block;   border-bottom: 1px dotted green; }  .tooltip .tooltiptext {   visibility: ;   width: 150px;   background-color: #fdcb6e;   color: #fff;   text-align: center;   border-radius: 6px;   padding: 5px 0;   position: absolute;   z-index: 1;   bottom: 125%;   left: 50%;   margin-left: -60px;   opacity: 0;   transition: opacity 0.3s; }  .tooltip .tooltiptext::after {   content: "";   position: absolute;   top: 100%;   left: 50%;   margin-left: -5px;   border-width: 5px;   border-style: solid;   border-color: #555 transparent transparent transparent; }  .tooltip:hover .tooltiptext {   visibility: visible;   opacity: 1; } </style> <body style="text-align:center;">  <div class="tooltip" style="margin-left:0px;">' + g_series_name + '<span class="tooltiptext"><a href="https://5095851.app.netsuite.com/app/common/custom/custrecordentry.nl?id=' + f_id + '&rectype=24&whence=" target="_blank">View Bridge Promissory Notes</span> </div>  </body> </html>';

									CapTabl_html += "<td colspan=\"5\"   bgcolor=" + colors[colour] + "><font color=\"#6F1E51\"><b><span style=\"text-align:left; float:left;\">" + tooltip_string + "</span><span style=\"float:right;\">" + secondVAl + "</span></b></font></td>";

									// g_converted_dt = secondVAl ;
									//converted_Series_nm = g_series_name ;

								} else {
									var tooltip_string = '<html> <style> .tooltip {   position: relative;   display: inline-block;   border-bottom: 1px dotted green; }  .tooltip .tooltiptext {   visibility: ;   width: 150px;   background-color: #fdcb6e;   color: #fff;   text-align: center;   border-radius: 6px;   padding: 5px 0;   position: absolute;   z-index: 1;   bottom: 125%;   left: 50%;   margin-left: -60px;   opacity: 0;   transition: opacity 0.3s; }  .tooltip .tooltiptext::after {   content: "";   position: absolute;   top: 100%;   left: 50%;   margin-left: -5px;   border-width: 5px;   border-style: solid;   border-color: #555 transparent transparent transparent; }  .tooltip:hover .tooltiptext {   visibility: visible;   opacity: 1; } </style> <body style="text-align:center;">  <div class="tooltip" style="margin-left:0px;">' + converted_Series_nm + '<span class="tooltiptext"><a href="https://5095851.app.netsuite.com/app/common/custom/custrecordentry.nl?id=' + f_id + '&rectype=24&whence=" target="_blank">View Bridge Promissory Notes</span> </div>  </body> </html>';

									CapTabl_html += "<td colspan=\"6\"   bgcolor=" + colors[colour] + "><font color=\"#6F1E51\"><b><span style=\"text-align:left; float:left;\">" + tooltip_string + "</span><span style=\"float:right;\">" + secondVAl + "</span></b></font></td>";


								}

							} else {
								log.debug( 'series_original:')

								var tooltip_string = '<html> <style> .tooltip {   position: relative;   display: inline-block;   border-bottom: 1px dotted green; }  .tooltip .tooltiptext {   visibility: ;   width: 150px;   background-color: #fdcb6e;   color: #fff;   text-align: center;   border-radius: 6px;   padding: 5px 0;   position: absolute;   z-index: 1;   bottom: 125%;   left: 50%;   margin-left: -60px;   opacity: 0;   transition: opacity 0.3s; }  .tooltip .tooltiptext::after {   content: "";   position: absolute;   top: 100%;   left: 50%;   margin-left: -5px;   border-width: 5px;   border-style: solid;   border-color: #555 transparent transparent transparent; }  .tooltip:hover .tooltiptext {   visibility: visible;   opacity: 1; } </style> <body style="text-align:center;">  <div class="tooltip" style="margin-left:0px;">' + g_series_name + '<span class="tooltiptext"><a href="https://5095851.app.netsuite.com/app/common/custom/custrecordentry.nl?id=' + f_id + '&rectype=24&whence=" target="_blank">View Bridge Promissory Notes</span> </div>  </body> </html>';
								CapTabl_html += "<td colspan=\"6\"   bgcolor=" + colors[colour] + "><font color=\"#6F1E51\"><b><span style=\"text-align:left; float:left;\">" + tooltip_string + "</span><span style=\"float:right;\">" + secondVAl + "</span></b></font></td>";

							}


							colour++;
						}


						for (var k = 0; k < a_vdebt_shrs_list.length; k++) {
							if (colour > 1) {
								colour = 0
							}
							var str = a_vdebt_shrs_list[k];
							var first = str.split('^')[0];
							f_id = str.split('^')[1];
							var secondVAl = str.split('^')[2];

							var tooltip_string = '<html> <style> .tooltip {   position: relative;   display: inline-block;   border-bottom: 1px dotted green; }  .tooltip .tooltiptext {   visibility: ;   width: 150px;   background-color: #fdcb6e;   color: #fff;   text-align: center;   border-radius: 6px;   padding: 5px 0;   position: absolute;   z-index: 1;   bottom: 125%;   left: 50%;   margin-left: -60px;   opacity: 0;   transition: opacity 0.3s; }  .tooltip .tooltiptext::after {   content: "";   position: absolute;   top: 100%;   left: 50%;   margin-left: -5px;   border-width: 5px;   border-style: solid;   border-color: #555 transparent transparent transparent; }  .tooltip:hover .tooltiptext {   visibility: visible;   opacity: 1; } </style> <body style="text-align:center;">  <div class="tooltip" style="margin-left:0px;">' + first + '<span class="tooltiptext"><a href="https://5095851.app.netsuite.com/app/common/custom/custrecordentry.nl?id=' + f_id + '&rectype=13&whence=" target="_blank">View Venture Debt(partly paid)</span> </div>  </body> </html>';
							CapTabl_html += "<td colspan=\"5\"   bgcolor=" + colors[colour] + "><font color=\"#6F1E51\"><b><span style=\"text-align:left; float:left;\">" + tooltip_string + "</span><span style=\"float:right;\">" + secondVAl + "</span></b></font></td>";
							colour++;
						}

						CapTabl_html += "<td  align=\"center\" colspan=\"6\"></td>";
						CapTabl_html += "</tr>";

						//	
						//	
						//	//=======ENDS-----------Series Names with Dates showing======================//




						//	//=======STARTS-----------Shares..cost..cost..Static Columns Heading======================//
						//	
						var colour = 0;

						CapTabl_html += "<tr>";
						CapTabl_html += "<td class=\"sticky-col first-col\" colspan=\"2\"></td>";
						//		   	CapTabl_html +="<td class=\"sticky-col second-col\">\xa0</td>";

						for (var k = 0; k < without_BRidge_tbl_series_cnt; k++) {
							if (colour > 1) {
								colour = 0
							}
							CapTabl_html += "<td  colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + ">Shares</td>";
							CapTabl_html += "<td   colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + ">New Shares</td>";
							CapTabl_html += "<td   colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + ">Total Number of Shares</td>";

							if (g_currency.toString() != "USD") {
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + ">Cost</td>";
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + ">Cost\xa0($)</td>";
							} else {
								CapTabl_html += "<td  colspan=\"2\" align=\"center\" bgcolor=" + colors[colour] + ">Cost\xa0($)</td>";
							}
							colour++;
						}
						//================== . (17-07-2020)================
						for (var k = 0; k < a_bridge_orig_conv_dt_list.length; k++) {
							if (colour > 1) {
								colour = 0
							}
							CapTabl_html += "<td   colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + ">Original Shares</td>";
							CapTabl_html += "<td   colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + ">Converted Shares</td>";
							CapTabl_html += "<td   colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + ">New  Shares</td>";
							CapTabl_html += "<td   colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + ">Total Number of Shares</td>";

							if (g_currency.toString() != "USD") {
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + ">Cost</td>";
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + ">Cost\xa0($)</td>";
							} else {
								CapTabl_html += "<td  colspan=\"2\" align=\"center\" bgcolor=" + colors[colour] + ">Cost\xa0($)</td>";
							}
							colour++;
						}
						//============================(17-07-2020)=====================================		
						for (var k = 0; k < venturedebt_partly_lrngth; k++) {
							if (colour > 1) {
								colour = 0
							}
							CapTabl_html += "<td   colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + ">Shares</td>";
							CapTabl_html += "<td   colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + ">New Shares</td>";
							CapTabl_html += "<td  colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + ">Total Number of Shares</td>";

							if (g_currency.toString() != "USD") {
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + ">Cost</td>";
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + ">Cost\xa0($)</td>";
							} else {
								CapTabl_html += "<td  colspan=\"2\" align=\"center\" bgcolor=" + colors[colour] + ">Cost\xa0($)</td>";
							}
							colour++;
						}

						CapTabl_html += "<td  align=\"center\">Warrants</td>";
						CapTabl_html += "<td  align=\"center\">Options</td>";
						CapTabl_html += "<td  align=\"center\">Total Shares</td>";

						if (g_currency.toString() != "USD") {
							CapTabl_html += "<td  align=\"center\">Cost in " + g_currency + "</td>";
							CapTabl_html += "<td  align=\"center\">Cost in USD</td>";
						} else {
							CapTabl_html += "<td  colspan=\"2\" align=\"center\">Cost in USD</td>";
						}

						CapTabl_html += "<td  align=\"center\">Percent Owned</td>";
						CapTabl_html += "</tr>";
						CapTabl_html += "</thead>";

						//=======ENDS-----------Shares..cost..cost..Static Columns Heading======================//



						//=====   START    =======    INVESTORs--Values ----Body Level TABLE---------===============//


						CapTabl_html += "<tbody>"; // style=\"display:block; overflow:scroll; height:200px; width:100%;\">";  
						var f_totalshares = 0; //for mega total shares
						var f_total_inv = 0; //for mega total amnt
						var f_total_usd = 0; //for mega total usd
						var ffID;
						var a_category_proof = [];
						var a_Categorytotal = [];


						for (var k = 0; k < a_investers_list.length; k++) {
							var i_total_shares_value = 0; //for row total shares
							var i_total_new_shares_value = 0; //for row total new shares

							var f_total_native_amnt = 0; //for row total amnt
							var f_total_native_usd = 0; //for row total usd

							var Category_chk = String(a_investers_list[k].split('^')[3]);


							if (a_category_proof.indexOf(Category_chk) == -1) //=== Category  values Except Last CAtegory
							{
								var categor_texty = a_investers_list[k].split('^')[3];
								categor_texty = categor_texty.split('-')[1];
								if (_nullValidation(categor_texty)) {
									categor_texty = "";
								}

								if (k > 0) //====Category total------------except last category total
								{

									var f_CAtegory_row_grand_Total_SHAREs = 0;
									var f_share_affecting_new_share = 0;

									var f_CAtegory_row_grand_Total_INR = 0;
									var f_CAtegory_row_grand_Total_USD = 0;

									var category = a_investers_list[k - 1].split('^')[2];
									var categoryTEXT = a_investers_list[k - 1].split('^')[3];
									//							category = category.split('-')[1];
									if (_nullValidation(category)) {
										category = "";
									}
									CapTabl_html += "<tr>";
									CapTabl_html += "<td colspan=\"2\" class=\"sticky-col first-col\" text-align='right' align='right' style=\"max-width:100%; white-space:nowrap;\"><b>Total</b></td>";

									if (g_currency.toString() != "USD") {

										for (var r = 0; r < a_pri_SeresNM_Dt_list.length; r++) {
											if (category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category] || category_native_total[a_pri_SeresNM_Dt_list[r] + '^' + category] || category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category] || category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category] || category_total_number_ShareTotal[a_pri_SeresNM_Dt_list[r] + '^' + category]) {
												if (_nullValidation(category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
													category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;
												}
												if (_nullValidation(category_native_total[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
													category_native_total[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;
												}
												if (_nullValidation(category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
													category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;

												}
												//==============. 
												if (_nullValidation(category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
													category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;
												}
												//============END NEW shares============
												 //==============Start Total Number of shares .  07042022=============== 
												if (_nullValidation(category_total_number_ShareTotal[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
													category_total_number_ShareTotal[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;
												}
												//============END Total number of shares============


												CapTabl_html += "<td  align=\"center\"><b>" + formatNumber(category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category]) + "</b></td>";
												CapTabl_html += "<td  align=\"center\"><b>" + formatNumber(category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category]) + "</b></td>";
												CapTabl_html += "<td align=\"center\"><b> " + formatNumber(category_total_number_ShareTotal[a_pri_SeresNM_Dt_list[r] + '^' + category]) + "</b></td>"; //Total shares
											   
												CapTabl_html += "<td align=\"center\"><b>" + g_currency + "\xa0" + formatNumber(category_native_total[a_pri_SeresNM_Dt_list[r] + '^' + category].toFixed(2)) + "</b></td>";
											   
											   CapTabl_html += "<td align=\"center\"><b>$\xa0" + formatNumber(category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category].toFixed(2)) + "</b></td>";

												f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category] + category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category];
												log.debug( 'f_CAtegory_row_grand_Total_SHAREs', f_CAtegory_row_grand_Total_SHAREs);

												f_CAtegory_row_grand_Total_INR = f_CAtegory_row_grand_Total_INR + category_native_total[a_pri_SeresNM_Dt_list[r] + '^' + category];
												f_CAtegory_row_grand_Total_USD = f_CAtegory_row_grand_Total_USD + category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category];
											} else {
												CapTabl_html += "<td></td>";
												 CapTabl_html += "<td></td>"; //new shares
												  CapTabl_html += "<td></td>"; //Total shares

												CapTabl_html += "<td></td>";
												CapTabl_html += "<td></td>";
											}

										}


										for (var r = 0; r < a_com_SeresNM_Dt.length; r++) {
											if (comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category] || comn_category_native_total[a_com_SeresNM_Dt[r] + '^' + category] || comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category] || category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category]) {
												if (_nullValidation(comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category])) {
													comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category] = 0;
												}

												//====. 20012021======================================		
												if (_nullValidation(category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category])) {
													category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category] = 0;
												}
												//===========EnD 20012021============================================	
												
												//==== SWOT Total number of shares . 06042022======================================		
												if (_nullValidation(category_series_total_num_new_shares[a_com_SeresNM_Dt[r] + '^' + category])) {
													category_series_total_num_new_shares[a_com_SeresNM_Dt[r] + '^' + category] = 0;
												}
												//===========EnD SWOT Total number of shares 06042022============================================	
												
												
												if (_nullValidation(comn_category_native_total[a_com_SeresNM_Dt[r] + '^' + category])) {
													comn_category_native_total[a_com_SeresNM_Dt[r] + '^' + category] = 0;
												}
												if (_nullValidation(comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category])) {
													comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category] = 0;
												}
												CapTabl_html += "<td  align=\"center\"><b>" + formatNumber(comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category]) + "</b></td>";
												CapTabl_html += "<td>" + formatNumber(category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category]) + "</td>"; // new shares . 20012021
												CapTabl_html += "<td>" + formatNumber(category_series_total_num_new_shares[a_com_SeresNM_Dt[r] + '^' + category]) + "</td>"; // Total number of  shares . 06042022
																										
												//CapTabl_html += "<td align=\"center\"><b></b></td>"; //Total shares
												CapTabl_html += "<td align=\"center\"><b>" + g_currency + "\xa0" + formatNumber(comn_category_native_total[a_com_SeresNM_Dt[r] + '^' + category].toFixed(2)) + "</b></td>";
												CapTabl_html += "<td align=\"center\"><b>$\xa0" + formatNumber(comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category].toFixed(2)) + "</b></td>";

												f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category] + category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category];
												f_CAtegory_row_grand_Total_INR = f_CAtegory_row_grand_Total_INR + comn_category_native_total[a_com_SeresNM_Dt[r] + '^' + category];
												f_CAtegory_row_grand_Total_USD = f_CAtegory_row_grand_Total_USD + comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category];
											} else {
												CapTabl_html += "<td></td>";
												CapTabl_html += "<td></td>"; // new shares
												 CapTabl_html += "<td></td>"; //Total shares

												CapTabl_html += "<td></td>";
												CapTabl_html += "<td></td>";
											}

										}

										for (var r = 0; r < a_bridge_orig_conv_dt_list.length; r++) {
											if (category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category] || category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category] || category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category] || category_bridge_native_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) {
												var str = a_bridge_orig_conv_dt_list[r];
												var gk_series_name = str.split('^')[0];
												log.debug( 'gk_series_name', gk_series_name);
												f_id = str.split('^')[1];
												var g_secondVAl = str.split('^')[2];
												log.debug( 'g_secondVAl', g_secondVAl);
												var g_converted_Series_nm = str.split('^')[4];
												log.debug( 'g_converted_Series_nm', g_converted_Series_nm);
												var gk_converted_dt = str.split('^')[5];
												log.debug( 'g_converted_Series_nm', g_converted_Series_nm);
												var gk_converted_chkbox = str.split('^')[6];
												log.debug( 'gk_converted_chkbox', gk_converted_chkbox);

												if (_nullValidation(category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category])) {
													category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category] = 0;
												}
												if (_nullValidation(category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category])) {
													category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category] = 0;
												}
												if (_nullValidation(category_bridge_native_total[a_bridge_orig_conv_dt_list[r] + '^' + category])) {
													category_bridge_native_total[a_bridge_orig_conv_dt_list[r] + '^' + category] = 0;
												}
												if (_nullValidation(category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category])) {
													category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category] = 0;
												}

												if (_nullValidation(category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category])) //. Kumar 13012021
												{
													category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category] = 0;
												}

												//======= Start Total Number of shares . 04042022
												 if (_nullValidation(i_bridge_total_num_of_shares[a_bridge_snm_dt_ctime[r] + '^' + category])) //. Kumar 04042022
												{
													i_bridge_total_num_of_shares[a_bridge_snm_dt_ctime[r] + '^' + category] = 0;
												}
												//=============END 04042022=============
												if (gk_converted_chkbox == 'T' && (gk_converted_dt != 'n')) {
													log.debug( 'enter');

													if (nlapiStringToDate(gk_converted_dt).getTime() > nlapiStringToDate(filter_todt).getTime()) {
														log.debug( 'enter1');

														CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) + "</b></td>";
														CapTabl_html += "<td align=\"center\"><b> " + 0 + " </b></td>";

													} else {
														CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) + "</b></td>";

														CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) + "</b></td>";
													}
												} else {
													log.debug( 'enter2');

													CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) + "</b></td>";
													CapTabl_html += "<td align=\"center\"><b>" + 0 + "</b></td>";

												}
												CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category]) + "</b></td>"; // new shares . Kumar 13012021
												CapTabl_html += "<td><b>" + formatNumber(i_bridge_total_num_of_shares[a_bridge_snm_dt_ctime[r] + '^' + category]) + "</b></td>"; //Total shares

												CapTabl_html += "<td align=\"center\"><b>" + g_currency + "\xa0" + formatNumber(category_bridge_native_total[a_bridge_orig_conv_dt_list[r] + '^' + category].toFixed(2)) + "</b></td>";
												CapTabl_html += "<td align=\"center\"><b>$\xa0" + formatNumber(category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category].toFixed(2)) + "</b></td>";

												if (gk_converted_chkbox == 'T' && (gk_converted_dt != 'n')) {
													if (nlapiStringToDate(gk_converted_dt).getTime() > nlapiStringToDate(filter_todt).getTime()) {
														f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + 0;

													} else {
														f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category] + category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category];

													}
												} else {
													f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + 0;

												}


												f_CAtegory_row_grand_Total_INR = f_CAtegory_row_grand_Total_INR + category_bridge_native_total[a_bridge_orig_conv_dt_list[r] + '^' + category];
												f_CAtegory_row_grand_Total_USD = f_CAtegory_row_grand_Total_USD + category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category];

											} else {
												CapTabl_html += "<td></td>";
												CapTabl_html += "<td></td>";
												CapTabl_html += "<td></td>"; //new shares
												 CapTabl_html += "<td></td>"; //Total shares

												CapTabl_html += "<td></td>";
												CapTabl_html += "<td></td>";
											}

										}


										for (var r = 0; r < a_vdebt_shrs_list.length; r++) {
											if (category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category] || category_vdebt_native_total[a_vdebt_shrs_list[r] + '^' + category] || category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category]) {


												log.debug( 'CAtegory-666wiseTOTAL', a_vdebt_shrs_list[r] + '^' + category);
												if (_nullValidation(category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category])) {
													category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category] = 0;
												}
												if (_nullValidation(category_vdebt_native_total[a_vdebt_shrs_list[r] + '^' + category])) {
													category_vdebt_native_total[a_vdebt_shrs_list[r] + '^' + category] = 0;
												}
												if (_nullValidation(category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category])) {
													category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category] = 0;
												}
												CapTabl_html += "<td colspan=\"2\" align=\"center\"><b>" + formatNumber(category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category]) + "</b></td>";
												CapTabl_html += "<td align=\"center\"><b>" + g_currency + "\xa0" + formatNumber(category_vdebt_native_total[a_vdebt_shrs_list[r] + '^' + category].toFixed(2)) + "</b></td>";
												 CapTabl_html += "<td>mnop_venture</td>"; //Total shares
											   
											   CapTabl_html += "<td align=\"center\"><b>$\xa0" + formatNumber(category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category].toFixed(2)) + "</b></td>";

												f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category];
												f_CAtegory_row_grand_Total_INR = f_CAtegory_row_grand_Total_INR + category_vdebt_native_total[a_vdebt_shrs_list[r] + '^' + category];
												f_CAtegory_row_grand_Total_USD = f_CAtegory_row_grand_Total_USD + category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category];


											} else {
												CapTabl_html += "<td colspan=\"2\"></td>";
												CapTabl_html += "<td></td>";
												CapTabl_html += "<td></td>"; //Total shares

												CapTabl_html += "<td></td>";
											}

										}


									} // ENDS if currency NOT USD for except last category total
									else {
										for (var r = 0; r < a_pri_SeresNM_Dt_list.length; r++) {
											if (category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category] || category_native_total[a_pri_SeresNM_Dt_list[r] + '^' + category] || category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category] || category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category]) {
												if (_nullValidation(category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
													category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;
												}
												if (_nullValidation(category_native_total[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
													category_native_total[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;
												}
												if (_nullValidation(category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
													category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;
												}
												if (_nullValidation(category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
													category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;
												}
												CapTabl_html += "<td colspan=\"1\" align=\"center\"><b>" + formatNumber(category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category]) + "</b></td>";
												CapTabl_html += "<td   colspan=\"1\" align=\"center\"><b>" + formatNumber(category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category]) + "</b></td>";
												 CapTabl_html += "<td></td>"; //Total shares

												//CapTabl_html += "<td align=\"center\"><b>"+g_currency+"\xa0"+category_native_total[a_pri_SeresNM_Dt_list[r]+'^'+category ].toFixed(2)+"</b></td>";
												CapTabl_html += "<td colspan=\"2\" align=\"center\"><b>$\xa0" + formatNumber(category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category].toFixed(2)) + "</b></td>";

												f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category] + category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category];
												f_CAtegory_row_grand_Total_USD = f_CAtegory_row_grand_Total_USD + category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category];

											} else {
												CapTabl_html += "<td colspan=\"1\"></td>";
												CapTabl_html += "<td colspan=\"1\"></td>";
												 CapTabl_html += "<td></td>"; //Total shares

												CapTabl_html += "<td colspan=\"2\"></td>";
												//							CapTabl_html += "<td></td>";
											}

										}


										for (var r = 0; r < a_com_SeresNM_Dt.length; r++) {
											if (comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category] || comn_category_native_total[a_com_SeresNM_Dt[r] + '^' + category] || comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category] || category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category]) {
												if (_nullValidation(comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category])) {
													comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category] = 0;
												}

												//====. 20012021======================================		
												if (_nullValidation(category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category])) {
													category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category] = 0;
												}
												//===========EnD 20012021============================================	
												//==== SWOT Total number of shares . 06042022======================================		
												if (_nullValidation(category_series_total_num_new_shares[a_com_SeresNM_Dt[r] + '^' + category])) {
													category_series_total_num_new_shares[a_com_SeresNM_Dt[r] + '^' + category] = 0;
												}
												//===========EnD SWOT Total number of shares 06042022============================================	
												
												
											   if (_nullValidation(comn_category_native_total[a_com_SeresNM_Dt[r] + '^' + category])) {
													comn_category_native_total[a_com_SeresNM_Dt[r] + '^' + category] = 0;
												}
												if (_nullValidation(comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category])) {
													comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category] = 0;
												}
												CapTabl_html += "<td colspan=\"1\" align=\"center\"><b>" + formatNumber(comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category]) + "</b></td>";
												CapTabl_html += "<td colspan=\"1\" align=\"center\">" + formatNumber(category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category]) + "</td>"; // new shares . 20012021
												 //CapTabl_html += "<td></td>"; //Total shares
												 CapTabl_html += "<td colspan=\"1\" align=\"center\">" + formatNumber(category_series_total_num_new_shares[a_com_SeresNM_Dt[r] + '^' + category]) + "</td>"; // Total number of  shares . 06042022
												  
												//							CapTabl_html += "<td align=\"center\"><b>"+g_currency+"\xa0"+comn_category_native_total[a_com_SeresNM_Dt[r]+'^'+category ].toFixed(2)+"</b></td>";
												CapTabl_html += "<td colspan=\"2\" align=\"center\"><b>$\xa0" + formatNumber(comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category].toFixed(2)) + "</b></td>";


												f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category] + category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category];
												f_CAtegory_row_grand_Total_USD = f_CAtegory_row_grand_Total_USD + comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category];
												log.debug( 'f_CAtegory_row_grand_Total_SHAREs%%%', f_CAtegory_row_grand_Total_SHAREs);

											} else {
												CapTabl_html += "<td colspan=\"1\"></td>";
												CapTabl_html += "<td  colspan=\"1\"></td>"; //new shares
												 CapTabl_html += "<td></td>"; //Total shares

												CapTabl_html += "<td colspan=\"2\"></td>";
											}

										}


										for (var r = 0; r < a_bridge_orig_conv_dt_list.length; r++) {
											if (category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category] || category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category] || category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category] || category_bridge_native_total[a_bridge_orig_conv_dt_list[r] + '^' + category] || category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category]) {
												var str = a_bridge_orig_conv_dt_list[r];
												var gk_series_name = str.split('^')[0];
												log.debug( 'gk_series_name1:', gk_series_name);
												f_id = str.split('^')[1];
												var g_secondVAl = str.split('^')[2];
												log.debug( 'g_secondVAl1:', g_secondVAl);
												var g_converted_Series_nm = str.split('^')[4];
												log.debug( 'g_converted_Series_nm1:', g_converted_Series_nm);
												var gk_converted_dt = str.split('^')[5];
												log.debug( 'gk_converted_dt1:', gk_converted_dt);
												var gk_converted_chkbox = str.split('^')[6];
												log.debug( 'gk_converted_chkbox1:', gk_converted_chkbox);

												if (_nullValidation(category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category])) {
													category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category] = 0;
												}
												if (_nullValidation(category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category])) {
													category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category] = 0;
												}
												if (_nullValidation(category_bridge_native_total[a_bridge_orig_conv_dt_list[r] + '^' + category])) {
													category_bridge_native_total[a_bridge_orig_conv_dt_list[r] + '^' + category] = 0;
												}
												if (_nullValidation(category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category])) {
													category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category] = 0;
												}
												if (_nullValidation(category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category])) {
													category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category] = 0;
												}

												if ((gk_converted_chkbox == 'T') && (gk_converted_dt != 'n')) {
													log.debug( 'checkbox:');

													if (nlapiStringToDate(gk_converted_dt).getTime() > nlapiStringToDate(filter_todt).getTime()) {
														log.debug( 'checkbox&todate:');

														CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) + "</b></td>";
														CapTabl_html += "<td align=\"center\"><b> " + 0 + " </b></td>";

													} else {

														CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) + "</b></td>";

														CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) + "</b></td>";
													}
												} else {
													log.debug( 'closedt:');

													CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) + "</b></td>";
													CapTabl_html += "<td align=\"center\"><b>" + 0 + "</b></td>";

												}
												//			CapTabl_html += "<td align=\"center\"><b>"+g_currency+"\xa0"+category_bridge_native_total[a_bridge_snm_dt_ctime[r]+'^'+category ].toFixed(2)+"</b></td>";
												CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category]) + "</b></td>"; //new shares
												 CapTabl_html += "<td></td>"; //Total shares

												CapTabl_html += "<td align=\"center\" colspan=\"2\"><b>$\xa0" + formatNumber(category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category].toFixed(2)) + "</b></td>";
												if (gk_converted_chkbox == 'T' && (gk_converted_dt != 'n')) {
													if (nlapiStringToDate(gk_converted_dt).getTime() > nlapiStringToDate(filter_todt).getTime()) {
														f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + 0;

													} else {
														f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category];

													}
												} else {
													f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + 0;

												}

												//f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r]+'^'+category ];
												f_CAtegory_row_grand_Total_USD = f_CAtegory_row_grand_Total_USD + category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category];

											} else {
												CapTabl_html += "<td></td>";
												CapTabl_html += "<td></td>";
												CapTabl_html += "<td ></td>"; //new shares
												 CapTabl_html += "<td></td>"; //Total shares

												CapTabl_html += "<td colspan=\"2\"></td>";
												//							CapTabl_html += "<td></td>";
											}

										}


										for (var r = 0; r < a_vdebt_shrs_list.length; r++) {
											if (category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category] || category_vdebt_native_total[a_vdebt_shrs_list[r] + '^' + category] || category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category]) {
												if (_nullValidation(category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category])) {
													category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category] = 0;
												}
												if (_nullValidation(category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category])) {
													category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category] = 0;
												}
												CapTabl_html += "<td colspan=\"2\" align=\"center\"><b>" + formatNumber(category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category]) + "</b></td>";
												 CapTabl_html += "<td></td>"; //Total shares
											   
											   CapTabl_html += "<td colspan=\"2\" align=\"center\"><b>$\xa0" + formatNumber(category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category].toFixed(2)) + "</b></td>";

												f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category];
												f_CAtegory_row_grand_Total_USD = f_CAtegory_row_grand_Total_USD + category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category];

											} else {
												CapTabl_html += "<td colspan=\"2\"></td>";
											

												CapTabl_html += "<td colspan=\"2\"></td>";
												//						CapTabl_html += "<td></td>";
											}

										}

									} // END ELSE  --currency  USD for except last category total 	


									//=======  CAtegory Totals for warrants and ESOP at LINe 1* ===============//
									if (o_warrants_category_outstand[category]) //
									{
										if (_nullValidation(o_warrants_category_outstand[category])) {
											o_warrants_category_outstand[category] = 0;
										}

										CapTabl_html += "<td  align=\"center\"><b>" + formatNumber(o_warrants_category_outstand[category]) + "</b></td>";

										f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + o_warrants_category_outstand[category];

									} else {
										CapTabl_html += "<td></td>";
									}


									if (o_option_category_outstand[category]) //
									{
										if (_nullValidation(o_option_category_outstand[category])) {
											o_option_category_outstand[category] = 0;
										}

										CapTabl_html += "<td  align=\"center\"><b>" + formatNumber(o_option_category_outstand[category]) + "</b></td>";
										f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + o_option_category_outstand[category];
									} else {
										CapTabl_html += "<td></td>";
									}

									if (g_currency.toString() != "USD") {
										CapTabl_html += "<td align=\"center\"><b>" + formatNumber(f_CAtegory_row_grand_Total_SHAREs) + "</b></td>";
										CapTabl_html += "<td align=\"center\"><b>" + g_currency + formatNumber(f_CAtegory_row_grand_Total_INR.toFixed(2)) + "</b></td>";
										CapTabl_html += "<td align=\"center\"><b>$" + " " + formatNumber(f_CAtegory_row_grand_Total_USD.toFixed(2)) + "</b></td>";
										var category_percent_owned = f_CAtegory_row_grand_Total_SHAREs * 100 / f_total_shares;
										if (category_percent_owned > 0 && category_percent_owned <= 100) {
											CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_percent_owned.toFixed(2)) + "%</b></td>";
										} else {
											CapTabl_html += "<td><b></td>";
										}
									} else {
										CapTabl_html += "<td align=\"center\"><b>" + formatNumber(f_CAtegory_row_grand_Total_SHAREs) + "</b></td>";
										CapTabl_html += "<td colspan=\"2\" align=\"center\"><b>$" + " " + formatNumber(f_CAtegory_row_grand_Total_USD.toFixed(2)) + "</b></td>";

										var category_percent_owned = f_CAtegory_row_grand_Total_SHAREs * 100 / f_total_shares;
										if (category_percent_owned > 0 && category_percent_owned <= 100) {
											CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_percent_owned.toFixed(2)) + "%</b></td>";
										} else {
											CapTabl_html += "<td align=\"center\"><b></td>";
										}

									}


									CapTabl_html += "<tr>";
									a_Categorytotal.push(Category_chk);

								} // ENDs category total ------------except last category total	

								//-------------CAtegory===Name---Showing------------------//			
								CapTabl_html += "<tr>";
								CapTabl_html += "<td colspan=\"2\" class=\"sticky-col first-col\" text-align='right' align='left' style=\"max-width:100%; white-space:nowrap;\"><b>" + categor_texty + "</b></td>";
								CapTabl_html += "<td colspan=" + cnt + "></td>"
								CapTabl_html += "<tr>";
								//-------------CAtegory===Name---Showing------------------//

								a_category_proof.push(Category_chk);

							} // ENDs If category total ------------except last category tota


							var i_invester_id = a_investers_list[k].split('^')[0];
							CapTabl_html += "<tr>";
							CapTabl_html += "<td colspan=\"2\" class=\"sticky-col first-col\" align='right' style=\"max-width:100%; white-space:nowrap;\"><a style=\"text-decoration: none;\" href=\"https://5095851.app.netsuite.com/app/common/entity/partner.nl?id=" + a_investers_list[k].split('^')[0] + "\"><font color=\"yellow\">" + a_investers_list[k].split('^')[1] + "</a></font></b></td>";
							var colour = 0;
							log.debug( 'o_number_shares', JSON.stringify(o_number_shares));
							for (var j = 0; j < a_pri_SeresNM_Dt_list.length; j++) {

								if (o_number_shares[a_investers_list[k].split('^')[0] + '^' + a_pri_SeresNM_Dt_list[j]] || o_investmnt_amnt[a_investers_list[k].split('^')[0] + '^' + a_pri_SeresNM_Dt_list[j]] || o_investmnt_amnt_usd[a_investers_list[k].split('^')[0] + '^' + a_pri_SeresNM_Dt_list[j]]) {
									if (colour > 1) {
										colour = 0
									}
									var numberof_shares = o_number_shares[a_investers_list[k].split('^')[0] + '^' + a_pri_SeresNM_Dt_list[j]];
									log.debug( 'numberof_shares test', numberof_shares);
									var numberof_new_shares = o_number_shares_NEW[a_investers_list[k].split('^')[0] + '^' + a_pri_SeresNM_Dt_list[j]];

									var total_num_of_shares = i_total_number_shares[a_investers_list[k].split('^')[0] + '^' + a_pri_SeresNM_Dt_list[j]];



									var amnt_invested = o_investmnt_amnt[a_investers_list[k].split('^')[0] + '^' + a_pri_SeresNM_Dt_list[j]];
									var amnt_invested_usd = o_investmnt_amnt_usd[a_investers_list[k].split('^')[0] + '^' + a_pri_SeresNM_Dt_list[j]];
									var Currency_Value = o_investmnt_amnt_currency[a_investers_list[k].split('^')[0] + '^' + a_pri_SeresNM_Dt_list[j]];
									Currency_Value = Number(Currency_Value);

									if (_nullValidation(numberof_shares)) {
										numberof_shares = 0
									} else {
										numberof_shares = parseInt(numberof_shares)
										if (i_total_shares_value == 0) {
											i_total_shares_value = numberof_shares;
										} else {
											i_total_shares_value = i_total_shares_value + numberof_shares;
										}

									}
									//=============START row Total new shares=====================
									if (_nullValidation(numberof_new_shares)) {
										numberof_new_shares = 0
									} else {
										numberof_new_shares = parseInt(numberof_new_shares)
										if (i_total_shares_value == 0) {
											i_total_shares_value = numberof_new_shares;
										} else {
											i_total_shares_value = i_total_shares_value + numberof_new_shares;
										}

									}
									//============= END row Total new shares=====================
									 
								

									if (_nullValidation(amnt_invested)) {
										amnt_invested = 0
									} else {
										amnt_invested = parseFloat(amnt_invested)
										if (f_total_native_amnt == 0) {
											f_total_native_amnt = amnt_invested;
										} else {
											f_total_native_amnt = f_total_native_amnt + amnt_invested;
										}
									}

									if (_nullValidation(amnt_invested_usd)) {
										amnt_invested_usd = 0
									} else {
										amnt_invested_usd = parseFloat(amnt_invested_usd)
										if (f_total_native_usd == 0) {
											f_total_native_usd = amnt_invested_usd;
										} else {
											f_total_native_usd = f_total_native_usd + amnt_invested_usd;
										}

									}


									if (_nullValidation(numberof_shares)) // == "undefined" || numberof_shares == undefined)
									{
										numberof_shares = 0
									}
									if (_nullValidation(numberof_new_shares)) // == "undefined" || numberof_shares == undefined)
									{
										numberof_new_shares = 0
									}
									if (_nullValidation(total_num_of_shares)) // == "undefined" || numberof_shares == undefined)
									{
										total_num_of_shares = 0
									}

									CapTabl_html += "<td   align='center' bgcolor=" + colors[colour] + ">" + formatNumber(numberof_shares) + "</td>";
									CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "> " + formatNumber(numberof_new_shares) + "</td>";

								   CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "> " + formatNumber(total_num_of_shares) + "</td>"; // Total Number of shares 31032022



									if (_nullValidation(amnt_invested)) // == "undefined" || amnt_invested == undefined)
									{
										amnt_invested = 0;
									}

									if (_nullValidation(amnt_invested_usd)) // == "undefined" || amnt_invested_usd == undefined)
									{
										amnt_invested_usd = 0;
									}


									if (g_currency.toString() != "USD") {
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + ">" + g_currency + "\xa0" + formatNumber(amnt_invested.toFixed(2)) + "</td>";
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + ">$\xa0" + formatNumber(amnt_invested_usd.toFixed(2)) + "</td>";
									} else {

										CapTabl_html += "<td colspan=\"2\" align='center' bgcolor=" + colors[colour] + ">$\xa0" + formatNumber(amnt_invested_usd.toFixed(2)) + "</td>";
									}



									colour++;
								} else {
									if (colour > 1) {
										colour = 0
									}
									if (g_currency.toString() != "USD") {
										CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>";
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + "></td>";//new shares
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + "></td>"; // Total Number of shares 31032022
										   CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "> </td>"; 
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + "></td>";
									} else {
										CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>";
										CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>";
										  CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>"; // Total Number of shares 31032022
										CapTabl_html += "<td colspan=\"2\" align='center' bgcolor=" + colors[colour] + "></td>";
									}
									colour++;
								}
							}



							if (a_pri_SeresNM_Dt_list.length % 2 == 0) {
								colour = 0;
							} else {
								colour = 1;
							}
							
							//===========Termsheet===========
							for (var j = 0; j < a_com_SeresNM_Dt.length; j++) {


								{
									if (o_number_shares[a_investers_list[k].split('^')[0] + '^' + a_com_SeresNM_Dt[j]] || o_investmnt_amnt[a_investers_list[k].split('^')[0] + '^' + a_com_SeresNM_Dt[j]] || o_investmnt_amnt_usd[a_investers_list[k].split('^')[0] + '^' + a_com_SeresNM_Dt[j]]) {
										if (colour > 1) {
											colour = 0
										}

										var numberof_shares = o_number_shares[a_investers_list[k].split('^')[0] + '^' + a_com_SeresNM_Dt[j]];
										var numberof_shares_New = o_number_shares_NEW[a_investers_list[k].split('^')[0] + '^' + a_com_SeresNM_Dt[j]];
										var total_numberof_shares_New = i_total_number_shares[a_investers_list[k].split('^')[0] + '^' + a_com_SeresNM_Dt[j]];

										var amnt_invested = o_investmnt_amnt[a_investers_list[k].split('^')[0] + '^' + a_com_SeresNM_Dt[j]];
										var amnt_invested_usd = o_investmnt_amnt_usd[a_investers_list[k].split('^')[0] + '^' + a_com_SeresNM_Dt[j]];


										if (_nullValidation(numberof_shares)) {
											numberof_shares = 0
										} else {
											numberof_shares = parseInt(numberof_shares)
											if (i_total_shares_value == 0) {
												i_total_shares_value = numberof_shares;
											} else {
												i_total_shares_value = i_total_shares_value + numberof_shares;
											}

										}

										//=============. 24012021 START row Total new shares=====================
										if (_nullValidation(numberof_shares_New)) {
											numberof_shares_New = 0
										} else {
											numberof_shares_New = parseInt(numberof_shares_New)
											if (i_total_shares_value == 0) {
												i_total_shares_value = numberof_shares_New;
											} else {
												i_total_shares_value = i_total_shares_value + numberof_shares_New;
											}
											log.debug( 'i_total_new_shares_value123', i_total_shares_value);
										}
										//============= . 24012021 END row Total new shares=====================

										if (_nullValidation(amnt_invested)) {
											amnt_invested = 0
										} else {
											amnt_invested = parseFloat(amnt_invested)
											if (f_total_native_amnt == 0) {
												f_total_native_amnt = amnt_invested;
											} else {
												f_total_native_amnt = f_total_native_amnt + amnt_invested;
											}
										}

										if (_nullValidation(amnt_invested_usd)) {
											amnt_invested_usd = 0
										} else {
											amnt_invested_usd = parseFloat(amnt_invested_usd)
											if (f_total_native_usd == 0) {
												f_total_native_usd = amnt_invested_usd;
											} else {
												f_total_native_usd = f_total_native_usd + amnt_invested_usd;
											}

										}



										if (_nullValidation(numberof_shares)) // == "undefined" && numberof_shares == undefined)
										{
											numberof_shares = 0;
										}
										//CapTabl_html += "<td colspan=\"2\" align='center' bgcolor="+colors[colour]+">"+formatNumber(numberof_shares)+"</td>";
										if (_nullValidation(numberof_shares_New)) // == "undefined" && numberof_shares == undefined)
										{
											numberof_shares_New = 0;
										}
										if (_nullValidation(total_numberof_shares_New)) // == "undefined" && numberof_shares == undefined)
										{
											total_numberof_shares_New = 0;
										}
										CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + ">" + formatNumber(numberof_shares) + "</td>";
										CapTabl_html += "<td   align='center' bgcolor=" + colors[colour] + ">" + formatNumber(numberof_shares_New) + "</td>"; // new shares .
										 CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + ">" + formatNumber(total_numberof_shares_New) + " </td>"; // Total Number of shares 31032022



										if (_nullValidation(amnt_invested)) // == "undefined" && amnt_invested == undefined)
										{
											amnt_invested = 0.00;
										}


										if (_nullValidation(amnt_invested_usd)) //  == "undefined" && amnt_invested_usd == undefined)
										{
											amnt_invested_usd = 0.00;
										}


										if (g_currency.toString() != "USD") {
											CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + ">" + g_currency + "\xa0" + formatNumber(amnt_invested.toFixed(2)) + "</td>";
											CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + ">$\xa0" + formatNumber(amnt_invested_usd.toFixed(2)) + "</td>";
										} else {
											CapTabl_html += "<td align='center' colspan=\"2\" bgcolor=" + colors[colour] + ">$\xa0" + formatNumber(amnt_invested_usd.toFixed(2)) + "</td>";
										}

										//CapTabl_html += "<td align='center'>0.00</td>";
										colour++;
									} else {
										if (colour > 1) {
											colour = 0
										}
										if (g_currency.toString() != "USD") {
											CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>";
											CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>"; //new shares
											 CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>"; // Total Number of shares 31032022
											CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + "></td>";
											CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + "></td>";
										} else {
											CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + "></td>";
											CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + "> </td>"; //new shares
											 CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>"; // Total Number of shares 31032022
											CapTabl_html += "<td colspan=\"2\" align='center' bgcolor=" + colors[colour] + "></td>";
										}

										colour++;
									}
								}
							}

							f_totalshares = f_totalshares + i_total_shares_value;
							f_total_inv = f_total_inv + f_total_native_amnt;
							f_total_usd = f_total_usd + f_total_native_usd;



							for (var j = 0; j < a_bridge_orig_conv_dt_list.length; j++) {

								if (o_number_shares[a_investers_list[k].split('^')[0] + '^' + a_bridge_orig_conv_dt_list[j]] || o_investmnt_amnt[a_investers_list[k].split('^')[0] + '^' + a_bridge_orig_conv_dt_list[j]] || o_investmnt_amnt_usd[a_investers_list[k].split('^')[0] + '^' + a_bridge_orig_conv_dt_list[j]]) {
									var str = a_bridge_orig_conv_dt_list[j];
									var gk_series_name = str.split('^')[0];
									log.debug( 'gk_series_name7:', gk_series_name);
									f_id = str.split('^')[1];
									var g_secondVAl = str.split('^')[2];
									log.debug( 'g_secondVAl7:', g_secondVAl);
									var g_converted_Series_nm = str.split('^')[4];
									log.debug( 'g_converted_Series_nm7:', g_converted_Series_nm);
									var gk_converted_dt = str.split('^')[5];
									log.debug( 'gk_converted_dt7:', gk_converted_dt);
									var gk_converted_chkbox = str.split('^')[6];
									log.debug( 'gk_converted_chkbox7:', gk_converted_chkbox);


									if (colour > 1) {
										colour = 0
									}

									var numberof_shares_original = o_original_number_shares[a_investers_list[k].split('^')[0] + '^' + a_bridge_orig_conv_dt_list[j]];
									var numberof_shares = o_number_shares[a_investers_list[k].split('^')[0] + '^' + a_bridge_orig_conv_dt_list[j]];
									var numberof_sharesNEW = o_number_shares_NEW[a_investers_list[k].split('^')[0] + '^' + a_bridge_SeresNM_Dt_list[j]]; //. 15012021

									var amnt_invested = o_investmnt_amnt[a_investers_list[k].split('^')[0] + '^' + a_bridge_orig_conv_dt_list[j]];
									var amnt_invested_usd = o_investmnt_amnt_usd[a_investers_list[k].split('^')[0] + '^' + a_bridge_orig_conv_dt_list[j]];

									if (_nullValidation(numberof_shares)) {
										numberof_shares = 0
									} //====Showing Row-wise Total==============//
									else {
										if ((gk_converted_chkbox == 'T') && (gk_converted_dt != 'n')) {
											if (nlapiStringToDate(gk_converted_dt).getTime() > nlapiStringToDate(filter_todt).getTime()) {
												numberof_shares = 0;
												i_total_shares_value = i_total_shares_value + numberof_shares;

											} else {
												numberof_shares = parseInt(numberof_shares)
												if (i_total_shares_value == 0) {
													i_total_shares_value = numberof_shares;
												} else {
													i_total_shares_value = i_total_shares_value + numberof_shares;
												}

											}

										} else {
											numberof_shares = 0;
											i_total_shares_value = i_total_shares_value + numberof_shares;
										}



									}

									//============= START row Total new shares=====================
									if (_nullValidation(numberof_sharesNEW)) {
										numberof_sharesNEW = 0
									} else {
										numberof_sharesNEW = parseInt(numberof_sharesNEW)
										if (i_total_shares_value == 0) {
											i_total_shares_value = numberof_sharesNEW;
										} else {
											i_total_shares_value = i_total_shares_value + numberof_sharesNEW;
										}

									}
									//=============  END row Total new shares=====================

									if (_nullValidation(amnt_invested)) {
										amnt_invested = 0
									} else {
										amnt_invested = parseFloat(amnt_invested)
										if (f_total_native_amnt == 0) {
											f_total_native_amnt = amnt_invested;
										} else {
											f_total_native_amnt = f_total_native_amnt + amnt_invested;
										}
									}

									if (_nullValidation(amnt_invested_usd)) {
										amnt_invested_usd = 0
									} else {
										amnt_invested_usd = parseFloat(amnt_invested_usd)
										if (f_total_native_usd == 0) {
											f_total_native_usd = amnt_invested_usd;
										} else {
											f_total_native_usd = f_total_native_usd + amnt_invested_usd;
										}

									}



									if (_nullValidation(numberof_shares_original)) // == "undefined" && numberof_shares == undefined)
									{
										numberof_shares_original = 0;
									}

									if (_nullValidation(numberof_shares)) // == "undefined" && numberof_shares == undefined)
									{
										numberof_shares = 0;
									}
									if (_nullValidation(numberof_sharesNEW)) // == "undefined" && numberof_shares == undefined)
									{
										numberof_sharesNEW = 0;
									}

									if ((gk_converted_chkbox == 'T') && (gk_converted_dt != 'n')) 
									{
										log.debug( 'checkbox:');

										if (nlapiStringToDate(gk_converted_dt).getTime() > nlapiStringToDate(filter_todt).getTime()) {
											CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + ">" + formatNumber(numberof_shares_original) + "</td>";
											CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + ">" + 0 + "</td>";

										} else {
											CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + ">" + formatNumber(numberof_shares_original) + "</td>";

											CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + ">" + formatNumber(numberof_shares) + "</td>";
											// CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + ">" + formatNumber(numberof_sharesNEW) + "</td>"; //new shares

										}


									} else {
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + ">" + formatNumber(numberof_shares_original) + "</td>";

										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + ">" + 0 + "</td>";

									}

								CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + ">" + formatNumber(numberof_sharesNEW) + "</td>"; //new shares
								 CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>"; // Total Number of shares 31032022

									if (_nullValidation(amnt_invested)) // == "undefined" && amnt_invested == undefined)
									{
										amnt_invested = 0.00;
									}


									if (_nullValidation(amnt_invested_usd)) //  == "undefined" && amnt_invested_usd == undefined)
									{
										amnt_invested_usd = 0.00;
									}


									if (g_currency.toString() != "USD") {
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + ">" + g_currency + "\xa0" + formatNumber(amnt_invested.toFixed(2)) + "</td>";
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + "> $\xa0" + formatNumber(amnt_invested_usd.toFixed(2)) + "</td>";
									} else {
										CapTabl_html += "<td align='center' colspan=\"2\" bgcolor=" + colors[colour] + "> $\xa0" + formatNumber(amnt_invested_usd.toFixed(2)) + "</td>";
									}

									colour++;
								} else {
									if (colour > 1) {
										colour = 0
									}
									if (g_currency.toString() != "USD") {
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + "></td>";
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + "></td>";
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + "></td>";
										 CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>"; // Total Number of shares 31032022
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + "></td>";
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + "></td>";

									} else {
										CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>";
										CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>";
										CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>";
										 CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>"; // Total Number of shares 31032022
										CapTabl_html += "<td colspan=\"2\" align='center' bgcolor=" + colors[colour] + "></td>";
									}

									colour++;
								}

							}

							f_totalshares = f_totalshares + i_total_shares_value;
							f_total_inv = f_total_inv + f_total_native_amnt;
							f_total_usd = f_total_usd + f_total_native_usd;



							for (var j = 0; j < a_vdebt_shrs_list.length; j++) {

								if (o_vdebt_number_shares[a_investers_list[k].split('^')[0] + '^' + a_vdebt_shrs_list[j]] || o_vdebt_investmnt_amnt[a_investers_list[k].split('^')[0] + '^' + a_vdebt_shrs_list[j]] || o_vdebt_investmnt_amnt_usd[a_investers_list[k].split('^')[0] + '^' + a_vdebt_shrs_list[j]]) {
									if (colour > 1) {
										colour = 0
									}
									var numberof_shares = o_vdebt_number_shares[a_investers_list[k].split('^')[0] + '^' + a_vdebt_shrs_list[j]];
									var amnt_invested = o_vdebt_investmnt_amnt[a_investers_list[k].split('^')[0] + '^' + a_vdebt_shrs_list[j]];
									var amnt_invested_usd = o_vdebt_investmnt_amnt_usd[a_investers_list[k].split('^')[0] + '^' + a_vdebt_shrs_list[j]];

									if (_nullValidation(numberof_shares)) {
										numberof_shares = 0
									} //====Showing Row-wise Total==============//
									else {
										numberof_shares = parseInt(numberof_shares)
										if (i_total_shares_value == 0) {
											i_total_shares_value = numberof_shares;
										} else {
											i_total_shares_value = i_total_shares_value + numberof_shares;
										}

									}

									if (_nullValidation(amnt_invested)) {
										amnt_invested = 0
									} else {
										amnt_invested = parseFloat(amnt_invested)
										if (f_total_native_amnt == 0) {
											f_total_native_amnt = amnt_invested;
										} else {
											f_total_native_amnt = f_total_native_amnt + amnt_invested;
										}
									}

									if (_nullValidation(amnt_invested_usd)) {
										amnt_invested_usd = 0
									} else {
										amnt_invested_usd = parseFloat(amnt_invested_usd)
										if (f_total_native_usd == 0) {
											f_total_native_usd = amnt_invested_usd;
										} else {
											f_total_native_usd = f_total_native_usd + amnt_invested_usd;
										}
									}



									if (_nullValidation(numberof_shares)) // == "undefined" && numberof_shares == undefined)
									{
										numberof_shares = 0;
									}
									CapTabl_html += "<td colspan=\"2\" align='center' bgcolor=" + colors[colour] + ">" + formatNumber(numberof_shares) + "</td>";
									 CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>"; // Total Number of shares 31032022



									if (_nullValidation(amnt_invested)) // == "undefined" && amnt_invested == undefined)
									{
										amnt_invested = 0.00;
									}


									if (_nullValidation(amnt_invested_usd)) //  == "undefined" && amnt_invested_usd == undefined)
									{
										amnt_invested_usd = 0.00;
									}


									if (g_currency.toString() != "USD") {
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + ">" + g_currency + "\xa0" + formatNumber(amnt_invested.toFixed(2)) + "</td>";
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + ">$\xa0" + formatNumber(amnt_invested_usd.toFixed(2)) + "</td>";
									} else {
										CapTabl_html += "<td align='center' colspan=\"2\" bgcolor=" + colors[colour] + ">$\xa0" + formatNumber(amnt_invested_usd.toFixed(2)) + "</td>";
									}

									//CapTabl_html += "<td align='center'>0.00</td>";
									colour++;
								} else {
									if (colour > 1) {
										colour = 0
									}
									if (g_currency.toString() != "USD") {
										CapTabl_html += "<td colspan=\"2\" align='center' bgcolor=" + colors[colour] + "></td>";
										//CapTabl_html += "<td align='center'></td>";
										 CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>"; // Total Number of shares 31032022
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + "></td>";
										CapTabl_html += "<td align='center' bgcolor=" + colors[colour] + "></td>";
									} else {
										CapTabl_html += "<td colspan=\"2\" align='center' bgcolor=" + colors[colour] + "></td>";
										 CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "> </td>"; // Total Number of shares 31032022
										CapTabl_html += "<td colspan=\"2\" align='center' bgcolor=" + colors[colour] + "></td>";
									}

									colour++;
								}

							}

							f_totalshares = f_totalshares + i_total_shares_value;
							f_total_inv = f_total_inv + f_total_native_amnt;
							f_total_usd = f_total_usd + f_total_native_usd;



							if (_nullValidation(venture_warrants_outstand[a_investers_list[k].split('^')[0]])) // && typeof venture_warrants_outstand[a_investers_list[k].split('^')[0]] !==  "undefined")
							{
								venture_warrants_outstand[a_investers_list[k].split('^')[0]] = 0;
							} else {
								f_totalshares = f_totalshares + Number(venture_warrants_outstand[a_investers_list[k].split('^')[0]]);
								i_total_shares_value = i_total_shares_value + Number(venture_warrants_outstand[a_investers_list[k].split('^')[0]]);

							}
							CapTabl_html += "<td  align=\"center\">" + formatNumber(venture_warrants_outstand[a_investers_list[k].split('^')[0]]) + "</td>";


							// Add the options
							var i_index_ivester_in_otp = a_optionPool_list.indexOf(i_invester_id);
							log.debug( 'CHK_i_index_ivester_in_otp', i_index_ivester_in_otp);
							var f_opt_shares = 0;
							if (i_index_ivester_in_otp >= 0) {
								f_opt_shares = object_investor_total[i_invester_id];
								a_optionPool_list.splice(i_index_ivester_in_otp, 1);
								a_optionPool_shrs_issued.splice(i_index_ivester_in_otp, 1);
								a_optionPool_Investors.splice(i_index_ivester_in_otp, 1);
							}
							f_options_share_total = Number(f_options_share_total) + Number(f_opt_shares);
							f_totalshares = parseFloat(f_totalshares) + parseFloat(f_opt_shares);
							i_total_shares_value = parseFloat(i_total_shares_value) + parseFloat(f_opt_shares);

							//				CapTabl_html += "<td  align=\"center\">"+f_opt_shares+"</td>";

							if (_nullValidation(object_investor_total[a_investers_list[k].split('^')[0]])) // == undefined || o_option_investor_outstand[a_investers_list[k].split('^')[0]]  == "undefined")
							{
								object_investor_total[a_investers_list[k].split('^')[0]] = 0;
							}
							//				else
							{
								CapTabl_html += "<td  align=\"center\">" + formatNumber(object_investor_total[a_investers_list[k].split('^')[0]]) + "</td>";
							}


							var f_percent_owned = (parseFloat(i_total_shares_value) / parseFloat(f_total_shares)) * 100;

							if (_nullValidation(i_total_shares_value)) // == "undefined" || i_total_shares_value == undefined)
							{
								i_total_shares_value = 0;
							}
							CapTabl_html += "<td  align=\"center\">" + formatNumber(i_total_shares_value) + "</td>";


							if (g_currency.toString() != "USD") {
								if (_nullValidation(f_total_native_amnt)) {
									f_total_native_amnt = 0.00;
								}
								CapTabl_html += "<td  align=\"center\">" + g_currency + "\xa0" + formatNumber(f_total_native_amnt.toFixed(2)) + "</td>";

								if (_nullValidation(f_total_native_usd)) {
									f_total_native_usd = 0.00;
								}
								CapTabl_html += "<td  align=\"center\">$\xa0" + formatNumber(f_total_native_usd.toFixed(2)) + "</td>";
							} else {
								if (_nullValidation(f_total_native_usd)) {
									f_total_native_usd = 0.00;
								}
								CapTabl_html += "<td  colspan=\"2\" align=\"center\">$\xa0" + formatNumber(f_total_native_usd.toFixed(2)) + "</td>";
							}


							if (_nullValidation(f_percent_owned)) {
								f_percent_owned = 0.00;
							}
							CapTabl_html += "<td  align=\"center\" style=\"max-width:100%; white-space: nowrap;\">" + formatNumber(parseFloat(f_percent_owned).toFixed(2)) + " %</td>";
							CapTabl_html += "</tr>";
// =================below ESop Total Lat Line==================================
							if (k + 1 == a_investers_list.length) //for Last Line category total
							{
								var f_CAtegory_row_grand_Total_SHAREs = 0;
								var f_CAtegory_row_grand_Total_INR = 0;
								var f_CAtegory_row_grand_Total_USD = 0;

								var category = a_investers_list[k].split('^')[2];
								var categoryTEXT = a_investers_list[k].split('^')[3];
								//							category = category.split('-')[1];
								if (_nullValidation(category)) {
									category = "";
								}
								CapTabl_html += "<tr>";
								CapTabl_html += "<td colspan=\"2\" class=\"sticky-col first-col\" text-align='right' align='right' style=\"max-width:100%; white-space:nowrap;\"><b>Total</b></td>";

								if (g_currency.toString() != "USD") {
									for (var r = 0; r < a_pri_SeresNM_Dt_list.length; r++) {
										if (category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category] || category_native_total[a_pri_SeresNM_Dt_list[r] + '^' + category] || category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category] || category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category]) {
											if (_nullValidation(category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
												category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;
											}
											if (_nullValidation(category_native_total[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
												category_native_total[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;
											}
											if (_nullValidation(category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
												category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;
											}


											//=================Added By New Shares Ganesh Reddy 24012021 =================================
											if (_nullValidation(category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
												category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;
											}
											CapTabl_html += "<td  align=\"center\"><b>" + formatNumber(category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category]) + "</b></td>";
											CapTabl_html += "<td  align=\"center\">" + formatNumber(category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category]) + "</td>"; //new shares
											CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "> </td>"; // Total Number of shares 31032022

											CapTabl_html += "<td align=\"center\"><b>" + g_currency + "\xa0" + formatNumber(category_native_total[a_pri_SeresNM_Dt_list[r] + '^' + category].toFixed(2)) + "</b></td>";
											CapTabl_html += "<td align=\"center\"><b>$\xa0" + formatNumber(category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category].toFixed(2)) + "</b></td>";


											f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category] + category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category];
											f_CAtegory_row_grand_Total_INR = f_CAtegory_row_grand_Total_INR + category_native_total[a_pri_SeresNM_Dt_list[r] + '^' + category];
											f_CAtegory_row_grand_Total_USD = f_CAtegory_row_grand_Total_USD + category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category];


										} else {
											CapTabl_html += "<td></td>";
											CapTabl_html += "<td></td>"; //new shares
											CapTabl_html += "<td> </td>"; // Total Number of shares 31032022

											CapTabl_html += "<td></td>";
											CapTabl_html += "<td></td>";
										}

									}


									for (var r = 0; r < a_com_SeresNM_Dt.length; r++) {
										if (comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category] || comn_category_native_total[a_com_SeresNM_Dt[r] + '^' + category] || comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category] || category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category]) {
											if (_nullValidation(comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category])) {
												comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category] = 0;
											}
											if (_nullValidation(comn_category_native_total[a_com_SeresNM_Dt[r] + '^' + category])) {
												comn_category_native_total[a_com_SeresNM_Dt[r] + '^' + category] = 0;
											}
											if (_nullValidation(comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category])) {
												comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category] = 0;
											}
											//=================Added By New Shares Ganesh Reddy 24012021 =================================
											if (_nullValidation(category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category])) {
												category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category] = 0;
											}

											CapTabl_html += "<td  align=\"center\"><b>" + formatNumber(comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category]) + "</b></td>";
											CapTabl_html += "<td  align=\"center\">" + formatNumber(category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category]) + "</td>"; //new shares
										   CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "> </td>"; // Total Number of shares 31032022

											CapTabl_html += "<td align=\"center\"><b>" + g_currency + "\xa0" + formatNumber(comn_category_native_total[a_com_SeresNM_Dt[r] + '^' + category].toFixed(2)) + "</b></td>";
											CapTabl_html += "<td align=\"center\"><b>$\xa0" + formatNumber(comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category].toFixed(2)) + "</b></td>";

											f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category] + category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category];
											f_CAtegory_row_grand_Total_INR = f_CAtegory_row_grand_Total_INR + comn_category_native_total[a_com_SeresNM_Dt[r] + '^' + category];
											f_CAtegory_row_grand_Total_USD = f_CAtegory_row_grand_Total_USD + comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category];

										} else {
											CapTabl_html += "<td></td>";
											CapTabl_html += "<td></td>"; //new shares
											CapTabl_html += "<td></td>"; // Total Number of shares 31032022

											CapTabl_html += "<td></td>";
											CapTabl_html += "<td></td>";
										}

									}

									for (var r = 0; r < a_bridge_orig_conv_dt_list.length; r++) {
										if (category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category] || category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category] || category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category] || category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category]) {
											var str = a_bridge_orig_conv_dt_list[r];
											var gk_series_name = str.split('^')[0];
											log.debug( 'gk_series_name2', gk_series_name);
											f_id = str.split('^')[1];
											var g_secondVAl = str.split('^')[2];
											log.debug( 'g_secondVAl2', g_secondVAl);
											var g_converted_Series_nm = str.split('^')[4];
											log.debug( 'g_converted_Series_nm2', g_converted_Series_nm);
											var gk_converted_dt = str.split('^')[5];
											log.debug( 'gk_converted_dt2', gk_converted_dt);
											var gk_converted_chkbox = str.split('^')[6];
											log.debug( 'gk_converted_chkbox2', gk_converted_chkbox);

											if (_nullValidation(category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category])) {
												category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category] = 0;
											}
											if (_nullValidation(category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category])) {
												category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category] = 0;
											}
											if (_nullValidation(category_bridge_native_total[a_bridge_orig_conv_dt_list[r] + '^' + category])) {
												category_bridge_native_total[a_bridge_orig_conv_dt_list[r] + '^' + category] = 0;
											}
											if (_nullValidation(category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category])) {
												category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category] = 0;
											}
											//=================Added By New Shares Ganesh Reddy 24012021 =================================
											if (_nullValidation(category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category])) {
												category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category] = 0;
											}

											if ((gk_converted_chkbox == 'T') && (gk_converted_dt != 'n')) {
												log.debug( 'enter3');

												if (nlapiStringToDate(gk_converted_dt).getTime() > nlapiStringToDate(filter_todt).getTime()) {
													log.debug( 'checkbox&todate2');

													CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) + "</b></td>";
													CapTabl_html += "<td align=\"center\"><b>" + 0 + "</b></td>";

												} else {
													CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) + "</b></td>";
													CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) + "</b></td>";

												}

											} else {
												log.debug( 'original2');

												CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) + "</b></td>";
												CapTabl_html += "<td align=\"center\"><b>" + 0 + "</b></td>";

											}

											CapTabl_html += "<td  align=\"center\">" + formatNumber(category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category]) + "</td>"; //new shares
										   CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "> </td>"; // Total Number of shares 31032022

											CapTabl_html += "<td align=\"center\"><b>" + g_currency + "\xa0" + formatNumber(category_bridge_native_total[a_bridge_orig_conv_dt_list[r] + '^' + category].toFixed(2)) + "</b></td>";
											CapTabl_html += "<td align=\"center\"><b>wxyz $\xa0" + formatNumber(category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category].toFixed(2)) + "</b></td>";
											if ((gk_converted_chkbox == 'T') && (gk_converted_dt != 'n')) {
												if (nlapiStringToDate(gk_converted_dt).getTime() > nlapiStringToDate(filter_todt).getTime()) {
													f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + 0;

												} else {
													f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category] + category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category];

												}
											} else {
												f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + 0;

											}


											f_CAtegory_row_grand_Total_INR = f_CAtegory_row_grand_Total_INR + category_bridge_native_total[a_bridge_orig_conv_dt_list[r] + '^' + category];
											f_CAtegory_row_grand_Total_USD = f_CAtegory_row_grand_Total_USD + category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category];


										} else {
											CapTabl_html += "<td></td>";
											CapTabl_html += "<td></td>"; //new share
											CapTabl_html += "<td> </td>"; // Total Number of shares 31032022

											CapTabl_html += "<td></td>";
											CapTabl_html += "<td></td>";
											CapTabl_html += "<td></td>";
										}

									}




									for (var r = 0; r < a_vdebt_shrs_list.length; r++) {
										if (category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category] || category_vdebt_native_total[a_vdebt_shrs_list[r] + '^' + category] || category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category]) {

											log.debug( 'CAtegory-wiseTOTAL', category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category]);
											if (_nullValidation(category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category])) {
												category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category] = 0;
											}
											if (_nullValidation(category_vdebt_native_total[a_vdebt_shrs_list[r] + '^' + category])) {
												category_vdebt_native_total[a_vdebt_shrs_list[r] + '^' + category] = 0;
											}
											if (_nullValidation(category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category])) {
												category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category] = 0;
											}
											CapTabl_html += "<td colspan=\"2\" align=\"center\"><b>" + formatNumber(category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category]) + "</b></td>";
											CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "></td>"; // Total Number of shares 31032022

											CapTabl_html += "<td align=\"center\"><b>" + g_currency + "\xa0" + formatNumber(category_vdebt_native_total[a_vdebt_shrs_list[r] + '^' + category].toFixed(2)) + "</b></td>";
											CapTabl_html += "<td align=\"center\"><b>$\xa0" + formatNumber(category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category].toFixed(2)) + "</b></td>";

											f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category];
											f_CAtegory_row_grand_Total_INR = f_CAtegory_row_grand_Total_INR + category_vdebt_native_total[a_vdebt_shrs_list[r] + '^' + category];
											f_CAtegory_row_grand_Total_USD = f_CAtegory_row_grand_Total_USD + category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category];


										} else {
											CapTabl_html += "<td colspan=\"2\"></td>";
											CapTabl_html += "<td> </td>"; // Total Number of shares 31032022

											CapTabl_html += "<td></td>";
											CapTabl_html += "<td></td>";
										}

									}




								} // ENDs IF for "USD" --Last Category Calculation
								else {
									for (var r = 0; r < a_pri_SeresNM_Dt_list.length; r++) {
										if (category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category] || category_native_total[a_pri_SeresNM_Dt_list[r] + '^' + category] || category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category] || category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category]) {
											if (_nullValidation(category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
												category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;
											}
											if (_nullValidation(category_native_total[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
												category_native_total[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;
											}
											if (_nullValidation(category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
												category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;
											}

											//=================Added By New Shares Ganesh Reddy 24012021 =================================
											if (_nullValidation(category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category])) {
												category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category] = 0;
											}
											CapTabl_html += "<td  align=\"center\"><b>" + formatNumber(category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category]) + "</b></td>";
											CapTabl_html += "<td  align=\"center\">" + formatNumber(category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category]) + "</td>"; //new shares
											CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "> </td>"; // Total Number of shares 31032022

											//								CapTabl_html += "<td align=\"center\"><b>"+g_currency+"\xa0"+category_native_total[a_pri_SeresNM_Dt_list[r]+'^'+category+'^'+categoryTEXT].toFixed(2)+"</b></td>";
											CapTabl_html += "<td colspan=\"2\" align=\"center\"><b>$\xa0" + formatNumber(category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category].toFixed(2)) + "</b></td>";


											f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + category_pricecpershr_total[a_pri_SeresNM_Dt_list[r] + '^' + category] + category_pricecpershr_term_total_new_shares[a_pri_SeresNM_Dt_list[r] + '^' + category];
											f_CAtegory_row_grand_Total_USD = f_CAtegory_row_grand_Total_USD + category_usd_total[a_pri_SeresNM_Dt_list[r] + '^' + category];

										} else {
											CapTabl_html += "<td></td>";
											CapTabl_html += "<td></td>"; //New Shares
										   CapTabl_html += "<td> </td>"; // Total Number of shares 31032022

											CapTabl_html += "<td colspan=\"2\"></td>";
											//								CapTabl_html += "<td></td>";
										}

									}


									for (var r = 0; r < a_com_SeresNM_Dt.length; r++) {
										if (comn_category_native_total[a_com_SeresNM_Dt[r] + '^' + category] || comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category] || category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category]) {
											if (_nullValidation(comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category])) {
												comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category] = 0;
											}
											if (_nullValidation(comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category])) {
												comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category] = 0;
											}

											//=================Added New Shares =================================
											if (_nullValidation(category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category])) {
												category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category] = 0;
											}
											CapTabl_html += "<td align=\"center\"><b>" + formatNumber(comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category]) + "</b></td>";
											CapTabl_html += "<td align=\"center\">" + formatNumber(category_pricecpershr_series_total_new_shares[a_com_SeresNM_Dt[r] + '^' + category]) + "</td>"; //new shares
											CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "> </td>"; // Total Number of shares 31032022

											CapTabl_html += "<td colspan=\"2\" align=\"center\"><b>$\xa0" + formatNumber(comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category].toFixed(2)) + "</b></td>";

											f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + comn_category_pricecpershr_total[a_com_SeresNM_Dt[r] + '^' + category];
											f_CAtegory_row_grand_Total_USD = f_CAtegory_row_grand_Total_USD + comn_category_usd_total[a_com_SeresNM_Dt[r] + '^' + category];

										} else {
											CapTabl_html += "<td></td>";
											CapTabl_html += "<td></td>"; //new shares
											CapTabl_html += "<td> </td>"; // Total Number of shares 31032022

											CapTabl_html += "<td colspan=\"2\"></td>";
											//								CapTabl_html += "<td></td>";
										}
										//								
									}

									for (var r = 0; r < a_bridge_orig_conv_dt_list.length; r++) {
										if (category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category] || category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category] || category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category] || category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category]) {
											var str = a_bridge_orig_conv_dt_list[r];
											var gk_series_name = str.split('^')[0];
											log.debug( 'gk_series_name3', gk_series_name);
											f_id = str.split('^')[1];
											var g_secondVAl = str.split('^')[2];
											log.debug( 'g_secondVAl3:', g_secondVAl);
											var g_converted_Series_nm = str.split('^')[4];
											log.debug( 'g_converted_Series_nm3:', g_converted_Series_nm);
											var gk_converted_dt = str.split('^')[5];
											log.debug( 'gk_converted_dt3:', gk_converted_dt);
											var gk_converted_chkbox = str.split('^')[6];
											log.debug( 'gk_converted_chkbox3', gk_converted_chkbox);


											if (_nullValidation(category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category])) {
												category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category] = 0;
											}
											if (_nullValidation(category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category])) {
												category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category] = 0;
											}

											if (_nullValidation(category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category])) {
												category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category] = 0;
											}

											//=================Added New Shares =================================
											if (_nullValidation(category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category])) {
												category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category] = 0;
											}
											if ((gk_converted_chkbox == 'T') && (gk_converted_dt != 'n')) {
												log.debug( 'enter4');

												if (nlapiStringToDate(gk_converted_dt).getTime() > nlapiStringToDate(filter_todt).getTime()) {
													log.debug( 'checkbox$todate4:');

													CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) + "</b></td>";
													CapTabl_html += "<td align=\"center\"><b>" + 0 + "</b></td>";

												} else {

													CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) + "</b></td>";

													CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) + "</b></td>";
												}
											} else {
												log.debug( 'original4::::');

												CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_pricecpershr_original_total[a_bridge_orig_conv_dt_list[r] + '^' + category]) + "</b></td>";
												CapTabl_html += "<td align=\"center\"><b>" + 0 + "</b></td>";

											}

											CapTabl_html += "<td align=\"center\">" + formatNumber(category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category]) + "</td>"; //new shares
											CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "> </td>"; // Total Number of shares 31032022

											CapTabl_html += "<td align=\"center\" colspan=\"2\"><b> $\xa0" + formatNumber(category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category].toFixed(2)) + "</b></td>";
											if ((gk_converted_chkbox == 'T') && (gk_converted_dt != 'n')) {
												if (nlapiStringToDate(gk_converted_dt).getTime() > nlapiStringToDate(filter_todt).getTime()) {
													f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + 0;

												} else {
													f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + category_pricecpershr_bridge_total[a_bridge_orig_conv_dt_list[r] + '^' + category] + category_pricecpershr_bridge_total_new_shares[a_bridge_snm_dt_ctime[r] + '^' + category];

												}
											} else {
												f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + 0;

											}

											f_CAtegory_row_grand_Total_USD = f_CAtegory_row_grand_Total_USD + category_bridge_usd_total[a_bridge_orig_conv_dt_list[r] + '^' + category];

										} else {
											CapTabl_html += "<td></td>";
											CapTabl_html += "<td></td>";
											CapTabl_html += "<td> </td>"; // Total Number of shares 31032022

											CapTabl_html += "<td></td>";
											CapTabl_html += "<td colspan=\"2\"></td>";
										}

									}

									for (var r = 0; r < a_vdebt_shrs_list.length; r++) {
										if (category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category] || category_vdebt_native_total[a_vdebt_shrs_list[r] + '^' + category] || category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category]) {


											log.debug( 'CAtegory-wiseTOTAL', category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category]);
											if (_nullValidation(category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category])) {
												category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category] = 0;
											}

											if (_nullValidation(category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category])) {
												category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category] = 0;
											}
											CapTabl_html += "<td colspan=\"2\" align=\"center\"><b>" + formatNumber(category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category]) + "</b></td>";
											CapTabl_html += "<td  align='center' bgcolor=" + colors[colour] + "> </td>"; // Total Number of shares 31032022
										   
										   CapTabl_html += "<td colspan=\"2\" align=\"center\"><b>$\xa0" + formatNumber(category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category].toFixed(2)) + "</b></td>";

											tegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + category_vdebt_pricecpershr_total[a_vdebt_shrs_list[r] + '^' + category];
											f_CAtegory_row_grand_Total_USD = f_CAtegory_row_grand_Total_USD + category_vdebt_usd_total[a_vdebt_shrs_list[r] + '^' + category];
										} else {
											CapTabl_html += "<td colspan=\"2\"></td>";
											 CapTabl_html += "<td> </td>"; // Total Number of shares 31032022

											CapTabl_html += "<td colspan=\"2\"></td>";
										}

									}


								} // ENDs ELSE for "INR" -----Last Category Calculation

								//CAtegory Totals for warrants and ESOP//
								if (o_warrants_category_outstand[category]) //
								{
									if (_nullValidation(o_warrants_category_outstand[category])) {
										o_warrants_category_outstand[category] = 0;
									}

									CapTabl_html += "<td  align=\"center\"><b>" + formatNumber(o_warrants_category_outstand[category]) + "</b></td>";
									f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + o_warrants_category_outstand[category];

								} else {
									CapTabl_html += "<td></td>";
									//						CapTabl_html += "<td></td>";
								}


								if (o_option_category_outstand[category]) //
								{
									if (_nullValidation(o_option_category_outstand[category])) {
										o_option_category_outstand[category] = 0;
									}

									CapTabl_html += "<td  align=\"center\"><b>" + formatNumber(o_option_category_outstand[category]) + "</b></td>";

									f_CAtegory_row_grand_Total_SHAREs = f_CAtegory_row_grand_Total_SHAREs + o_option_category_outstand[category];

								} else {
									CapTabl_html += "<td></td>";
								}


								if (g_currency.toString() != "USD") {
									CapTabl_html += "<td align=\"center\"><b>" + formatNumber(f_CAtegory_row_grand_Total_SHAREs) + "</b></td>";
									CapTabl_html += "<td align=\"center\"><b>" + g_currency + formatNumber(f_CAtegory_row_grand_Total_INR.toFixed(2)) + "</b></td>";
									CapTabl_html += "<td align=\"center\"><b>$ " + formatNumber(f_CAtegory_row_grand_Total_USD.toFixed(2)) + "</b></td>";

									var category_percent_owned = f_CAtegory_row_grand_Total_SHAREs * 100 / f_total_shares;
									if (category_percent_owned > 0 && category_percent_owned <= 100) {
										CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_percent_owned.toFixed(2)) + "%</b></td>";
									} else {
										CapTabl_html += "<td><b></td>";
									}


								} else {
									CapTabl_html += "<td align=\"center\"><b>" + formatNumber(f_CAtegory_row_grand_Total_SHAREs) + "</b></td>";
									CapTabl_html += "<td colspan=\"2\" align=\"center\"><b>$" + "" + formatNumber(f_CAtegory_row_grand_Total_USD.toFixed(2)) + "</b></td>";
									//						
									var category_percent_owned = f_CAtegory_row_grand_Total_SHAREs * 100 / f_total_shares;
									if (category_percent_owned > 0 && category_percent_owned <= 100) {
										CapTabl_html += "<td align=\"center\"><b>" + formatNumber(category_percent_owned.toFixed(2)) + "%</b></td>";
									} else {
										CapTabl_html += "<td align=\"center\"><b></td>";
									}

								}

								CapTabl_html += "<tr>";
								a_Categorytotal.push(Category_chk);
							} // end of category total at Last line	       
							//======END Below ESOP Total last line=================				                

						} // End for loop invester list	

						//=====ENDS=======--Values ----Body Level TABLE=====================================//




						var totals_of_grand_total_shares = 0;
						var totals_of_grand_total_INR = 0;
						var totals_of_grand_total_USD = 0;




						//=====STARTS=======TOTAL Values ----at Bottom ofthe TABLE=====================================//

						CapTabl_html += "<tr>";
						CapTabl_html += "<td colspan=\"2\" class=\"sticky-col first-col\" align=\"right\" text-align=\"right\" width=\"15%\"><b>Grand Total</b></td>";

						var colour = 0;
						for (var k = 0; k < a_pre_snm_dt_ctime.length; k++) {
							if (colour > 1) {
								colour = 0
							}

							if (_nullValidation(o_pre_snm_dt_ctime_shr[a_pre_snm_dt_ctime[k]])) // == "undefined" || o_pre_snm_dt_ctime_shr[a_pre_snm_dt_ctime[k]] == undefined)
							{
								o_pre_snm_dt_ctime_shr[a_pre_snm_dt_ctime[k]] = 0;
							}


							//=========New Shares ========================		
							if (_nullValidation(o_pre_snm_dt_ctime_shr_newShares[a_pre_snm_dt_ctime[k]])) // == "undefined" || o_cmn_snm_dt_ctime_shr[a_cmn_snm_dt_ctime[k]] == undefined)
							{
								o_pre_snm_dt_ctime_shr_newShares[a_pre_snm_dt_ctime[k]] = 0;
							}
							//=========End New Shares=========
							
							if (_nullValidation(o_pre_snm_total_num_newShares[a_pre_snm_dt_ctime[k]])) // == "undefined" || o_cmn_snm_dt_ctime_shr[a_cmn_snm_dt_ctime[k]] == undefined)
							{
								o_pre_snm_total_num_newShares[a_pre_snm_dt_ctime[k]] = 0;
							}
							//=========End Total Number of shares=========
							
							
							CapTabl_html += "<td  colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + "><b>" + formatNumber(o_pre_snm_dt_ctime_shr[a_pre_snm_dt_ctime[k]]) +"</b></td>";
							CapTabl_html += "<td  colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + "><b>" + formatNumber(o_pre_snm_dt_ctime_shr_newShares[a_pre_snm_dt_ctime[k]]) +"</b></td>";
							CapTabl_html += "<td  colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + "><b>" + formatNumber(o_pre_snm_total_num_newShares[a_pre_snm_dt_ctime[k]]) + "</b></td>"; // Total Number of shares 31032022
						   
						   log.debug( 'termsharesgrand', o_pre_snm_dt_ctime_shr_newShares[a_pre_snm_dt_ctime[k]]);

							totals_of_grand_total_shares = totals_of_grand_total_shares + o_pre_snm_dt_ctime_shr[a_pre_snm_dt_ctime[k]] + o_pre_snm_dt_ctime_shr_newShares[a_pre_snm_dt_ctime[k]];



							if (g_currency.toString() != "USD") {
								if (_nullValidation(o_pre_snm_dt_ctime_inr[a_pre_snm_dt_ctime[k]])) // == "undefined" || o_pre_snm_dt_ctime_inr[a_pre_snm_dt_ctime[k]] == undefined)
								{
									o_pre_snm_dt_ctime_inr[a_pre_snm_dt_ctime[k]] = 0.00;
								}
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + "><b>" + g_currency + "\xa0" + formatNumber(o_pre_snm_dt_ctime_inr[a_pre_snm_dt_ctime[k]].toFixed(2)) +"</b></td>";
								totals_of_grand_total_INR = totals_of_grand_total_INR + o_pre_snm_dt_ctime_inr[a_pre_snm_dt_ctime[k]];

								if (_nullValidation(o_pre_snm_dt_ctime_usd[a_pre_snm_dt_ctime[k]])) // == "undefined" || o_pre_snm_dt_ctime_usd[a_pre_snm_dt_ctime[k]] == undefined)
								{
									o_pre_snm_dt_ctime_usd[a_pre_snm_dt_ctime[k]] = 0.00;
								}
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + "><b>$\xa0" + formatNumber(o_pre_snm_dt_ctime_usd[a_pre_snm_dt_ctime[k]].toFixed(2)) +"</b></td>";
								totals_of_grand_total_USD = totals_of_grand_total_USD + o_pre_snm_dt_ctime_usd[a_pre_snm_dt_ctime[k]];
								log.debug( 'f_CAtegory_row_grand_Total_USD_1',totals_of_grand_total_USD);
						 
							} else {

								if (_nullValidation(o_pre_snm_dt_ctime_usd[a_pre_snm_dt_ctime[k]])) // == "undefined" || o_pre_snm_dt_ctime_usd[a_pre_snm_dt_ctime[k]] == undefined)
								{
									o_pre_snm_dt_ctime_usd[a_pre_snm_dt_ctime[k]] = 0.00;
								}
								CapTabl_html += "<td  colspan=\"2\" align=\"center\" bgcolor=" + colors[colour] + "><b>$\xa0" + formatNumber(o_pre_snm_dt_ctime_usd[a_pre_snm_dt_ctime[k]].toFixed(2)) +" </b></td>";
								totals_of_grand_total_USD = totals_of_grand_total_USD + o_pre_snm_dt_ctime_usd[a_pre_snm_dt_ctime[k]];
								log.debug( 'f_CAtegory_row_grand_Total_USD_else1',totals_of_grand_total_USD);
						 
							}

							colour++;

						}


						if (a_pri_SeresNM_Dt_list.length % 2 == 0) {
							colour = 0;
						} else {
							colour = 1;
						}


						for (var k = 0; k < a_cmn_snm_dt_ctime.length; k++) {
							if (colour > 1) {
								colour = 0
							}

							if (_nullValidation(o_cmn_snm_dt_ctime_shr[a_cmn_snm_dt_ctime[k]])) // == "undefined" || o_cmn_snm_dt_ctime_shr[a_cmn_snm_dt_ctime[k]] == undefined)
							{
								o_cmn_snm_dt_ctime_shr[a_cmn_snm_dt_ctime[k]] = 0;
							}
							if (_nullValidation(o_cmn_snm_dt_ctime_shr_newShare[a_cmn_snm_dt_ctime[k]])) // == "undefined" || o_cmn_snm_dt_ctime_shr[a_cmn_snm_dt_ctime[k]] == undefined)
							{
								o_cmn_snm_dt_ctime_shr_newShare[a_cmn_snm_dt_ctime[k]] = 0;
							}
							CapTabl_html += "<td  colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + "><b>" + formatNumber(o_cmn_snm_dt_ctime_shr[a_cmn_snm_dt_ctime[k]]) +"</b></td>";
							CapTabl_html += "<td  colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + ">" + formatNumber(o_cmn_snm_dt_ctime_shr_newShare[a_cmn_snm_dt_ctime[k]]) +"</td>"; //New Shares
							CapTabl_html += "<td  colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + "><b></b></td>"; // Total Number of shares 31032022
						   
							totals_of_grand_total_shares = totals_of_grand_total_shares + o_cmn_snm_dt_ctime_shr[a_cmn_snm_dt_ctime[k]] + o_cmn_snm_dt_ctime_shr_newShare[a_cmn_snm_dt_ctime[k]];

							if (g_currency.toString() != "USD") {
								if (_nullValidation(o_cmn_snm_dt_ctime_inr[a_cmn_snm_dt_ctime[k]])) // == "undefined" || o_cmn_snm_dt_ctime_inr[a_cmn_snm_dt_ctime[k]] == undefined)
								{
									o_cmn_snm_dt_ctime_inr[a_cmn_snm_dt_ctime[k]] = 0.00;
								}
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + "><b>" + g_currency + "\xa0" + formatNumber(o_cmn_snm_dt_ctime_inr[a_cmn_snm_dt_ctime[k]]) +"</b></td>";
								totals_of_grand_total_INR = totals_of_grand_total_INR + o_cmn_snm_dt_ctime_inr[a_cmn_snm_dt_ctime[k]];


								if (_nullValidation(o_cmn_snm_dt_ctime_usd[a_cmn_snm_dt_ctime[k]])) // == "undefined" || o_cmn_snm_dt_ctime_usd[a_cmn_snm_dt_ctime[k]] == undefined)
								{
									o_cmn_snm_dt_ctime_usd[a_cmn_snm_dt_ctime[k]] = 0.00;
								}
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + "><b>$\xa0" + formatNumber(o_cmn_snm_dt_ctime_usd[a_cmn_snm_dt_ctime[k]].toFixed(2)) + "</b></td>";
								totals_of_grand_total_USD = totals_of_grand_total_USD + o_cmn_snm_dt_ctime_usd[a_cmn_snm_dt_ctime[k]];
								log.debug( 'f_CAtegory_row_grand_Total_USD_2',totals_of_grand_total_USD);
						 
							} else {
								if (_nullValidation(o_cmn_snm_dt_ctime_usd[a_cmn_snm_dt_ctime[k]])) // == "undefined" || o_cmn_snm_dt_ctime_usd[a_cmn_snm_dt_ctime[k]] == undefined)
								{
									o_cmn_snm_dt_ctime_usd[a_cmn_snm_dt_ctime[k]] = 0.00;
								}
								CapTabl_html += "<td  colspan=\"2\" align=\"center\" bgcolor=" + colors[colour] + "><b>$\xa0" + formatNumber(o_cmn_snm_dt_ctime_usd[a_cmn_snm_dt_ctime[k]].toFixed(2)) + "</b></td>";
								totals_of_grand_total_USD = totals_of_grand_total_USD + o_cmn_snm_dt_ctime_usd[a_cmn_snm_dt_ctime[k]];
								log.debug( 'f_CAtegory_row_grand_Total_USD_else2',totals_of_grand_total_USD);
						 
							}
							colour++;

						}


							log.debug('a_bridge_snm_dt_ctime',JSON.stringify(a_bridge_snm_dt_ctime));
							log.debug('a_bridge_orig_conv_dt_list',JSON.stringify(a_bridge_orig_conv_dt_list));
						for (var k = 0; k < a_bridge_orig_conv_dt_list.length; k++) {
							if (colour > 1) {
								colour = 0
							}
							
						   log.debug('additional_key ***', additional_key);
							var str = a_bridge_orig_conv_dt_list[k];
							log.debug('str ***', str);							
							var gk_series_name = str.split('^')[0];
							log.debug( 'gk_series_name5', gk_series_name);
							f_id = str.split('^')[1];
							var g_secondVAl = str.split('^')[2];
							log.debug( 'g_secondVAl5', g_secondVAl);
							//----------------------------------
							var ind3 = str.split('^')[3];
							log.debug( 'ind3', ind3);
							
							var strNew = gk_series_name+'^'+f_id+'^'+g_secondVAl+'^'+ind3;
							log.debug('strNew ***', strNew);
							var actual_key = additional_key[strNew];
							log.debug('Acutal Key ***', actual_key);
							//----------------------------------
							
							
							var g_converted_Series_nm = str.split('^')[4];
							log.debug( 'g_converted_Series_nm5:', g_converted_Series_nm);
							var gk_converted_dt = str.split('^')[5];
							log.debug( 'gk_converted_dt5:', gk_converted_dt);
							var gk_converted_chkbox = str.split('^')[6];
							log.debug( 'gk_converted_chkbox5:', gk_converted_chkbox);

							if (_nullValidation(o_bridge_snm_dt_ctime_original_shr[a_bridge_orig_conv_dt_list[k]])) // == "undefined" || o_cmn_snm_dt_ctime_shr[a_cmn_snm_dt_ctime[k]] == undefined)
							{
								o_bridge_snm_dt_ctime_original_shr[a_bridge_orig_conv_dt_list[k]] = 0;
							}


							if (_nullValidation(o_bridge_snm_dt_ctime_shr[a_bridge_snm_dt_ctime[k]])) // == "undefined" || o_cmn_snm_dt_ctime_shr[a_cmn_snm_dt_ctime[k]] == undefined)
							{
								o_bridge_snm_dt_ctime_shr[a_bridge_snm_dt_ctime[k]] = 0;
							}

							if (_nullValidation(o_bridge_new_shares[a_bridge_snm_dt_ctime[k]])) // == "undefined" || o_cmn_snm_dt_ctime_shr[a_cmn_snm_dt_ctime[k]] == undefined)
							{
								o_bridge_new_shares[a_bridge_snm_dt_ctime[k]] = 0;
							}
			  if (_nullValidation(o_bridge_snm_dt_ctime_shr[a_bridge_snm_dt_ctime[k]+'^'+actual_key])) // == "undefined" || o_cmn_snm_dt_ctime_shr[a_cmn_snm_dt_ctime[k]] == undefined)
				{
					o_bridge_snm_dt_ctime_shr[a_bridge_snm_dt_ctime[k]+'^'+actual_key] = 0;
				}
			 
		  if(_logValidation(o_bridge_snm_dt_ctime_usd[a_bridge_snm_dt_ctime[k]+'^'+actual_key]))
		  {
			 var bridge_ctime_usd = o_bridge_snm_dt_ctime_usd[a_bridge_snm_dt_ctime[k]+'^'+actual_key].toFixed(2)
		  }
		  
		  if(_logValidation(o_bridge_snm_dt_ctime_inr[a_bridge_snm_dt_ctime[k]+'^'+actual_key]))
		  {
			 var bridge_ctime_inr = o_bridge_snm_dt_ctime_inr[a_bridge_snm_dt_ctime[k]+'^'+actual_key].toFixed(2)
		  }
							if ((gk_converted_chkbox == 'T') && (gk_converted_dt != 'n')) 
							{
								log.debug( 'enter5:');

								if (nlapiStringToDate(gk_converted_dt).getTime() > nlapiStringToDate(filter_todt).getTime()) {

									log.debug( 'checkbox$todate6:');

									CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + "><b>" + formatNumber(o_bridge_snm_dt_ctime_original_shr[a_bridge_orig_conv_dt_list[k]+'^'+actual_key]) +"</b></td>";
									CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + "><b>" + 0 +"</b></td>";
									CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + ">" + formatNumber(o_bridge_new_shares[a_bridge_snm_dt_ctime[k]]) + "<b></b></td>";
									CapTabl_html += "<td  colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + "><b></b></td>"; // Total Number of shares 31032022
						   
								} else {
									CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + "><b>" + formatNumber(o_bridge_snm_dt_ctime_original_shr[a_bridge_orig_conv_dt_list[k]+'^'+actual_key]) +"</b></td>";

									CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + "><b>" + formatNumber(o_bridge_snm_dt_ctime_shr[a_bridge_snm_dt_ctime[k]+'^'+actual_key]) +"</b></td>";
									CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + ">" + formatNumber(o_bridge_new_shares[a_bridge_snm_dt_ctime[k]]) +"<b></b></td>";
									CapTabl_html += "<td  colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + "><b></b></td>"; // Total Number of shares 31032022
						   
								}

							} else {
								log.debug( 'original6:'+ k);
								var temp = a_bridge_orig_conv_dt_list[k].toString().split('^');
								temp.splice(4)
								log.debug( 'One****Splice ', temp);
								
								a_bridge_orig_conv_dt_list[k] = temp.toString().replaceAll(',', '^');
								log.debug( 'Two*** actual string', a_bridge_orig_conv_dt_list[k]);
                                log.debug('Log 4522', a_bridge_orig_conv_dt_list[k]+'   ^   '+actual_key)
                                log.debug('Log 4523', o_bridge_snm_dt_ctime_original_shr)
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + "><b>" + formatNumber(o_bridge_snm_dt_ctime_original_shr[a_bridge_orig_conv_dt_list[k]+'^'+actual_key]) +"</b></td>";
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + "><b>" + formatNumber(o_bridge_snm_dt_ctime_shr[a_bridge_snm_dt_ctime[k]+'^'+actual_key]) +"</b></td>";
								   
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + ">" + formatNumber(o_bridge_new_shares[a_bridge_snm_dt_ctime[k]]) +"<b></b></td>";
								CapTabl_html += "<td  colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + "><b></b></td>"; // Total Number of shares 31032022
						   
							}
							if ((gk_converted_chkbox == 'T') && (gk_converted_dt != 'n')) {
								if (nlapiStringToDate(gk_converted_dt).getTime() > nlapiStringToDate(filter_todt).getTime()) {
									totals_of_grand_total_shares = totals_of_grand_total_shares + 0;

								} else {
									totals_of_grand_total_shares = totals_of_grand_total_shares + o_bridge_snm_dt_ctime_shr[a_bridge_snm_dt_ctime[k]+'^'+actual_key] + o_bridge_new_shares[a_bridge_snm_dt_ctime[k]];

								}
							} else {
								totals_of_grand_total_shares = totals_of_grand_total_shares + 0;

							}



							if (g_currency.toString() != "USD") {
								if (_nullValidation(o_bridge_snm_dt_ctime_inr[a_bridge_snm_dt_ctime[k]])) // == "undefined" || o_cmn_snm_dt_ctime_inr[a_cmn_snm_dt_ctime[k]] == undefined)
								{
									o_bridge_snm_dt_ctime_inr[a_bridge_snm_dt_ctime[k]] = 0.00;
								}
							  CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + "><b>" + g_currency + "\xa0" + formatNumber(bridge_ctime_inr) +"</b></td>";
								totals_of_grand_total_INR = totals_of_grand_total_INR + o_bridge_snm_dt_ctime_inr[a_bridge_snm_dt_ctime[k]+'^'+actual_key];


								if (_nullValidation(o_bridge_snm_dt_ctime_usd[a_bridge_snm_dt_ctime[k]])) // == "undefined" || o_cmn_snm_dt_ctime_usd[a_cmn_snm_dt_ctime[k]] == undefined)
								{
									o_bridge_snm_dt_ctime_usd[a_bridge_snm_dt_ctime[k]] = 0.00;
								}
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + "><b>$\xa0" + formatNumber(bridge_ctime_usd) +"</b></td>";
								totals_of_grand_total_USD = totals_of_grand_total_USD + o_bridge_snm_dt_ctime_usd[a_bridge_snm_dt_ctime[k]+'^'+actual_key];
								log.debug( 'f_CAtegory_row_grand_Total_USD_3',totals_of_grand_total_USD);
						 
							} else {
								if (_nullValidation(o_bridge_snm_dt_ctime_usd[a_bridge_snm_dt_ctime[k]])) // == "undefined" || o_cmn_snm_dt_ctime_usd[a_cmn_snm_dt_ctime[k]] == undefined)
								{
									o_bridge_snm_dt_ctime_usd[a_bridge_snm_dt_ctime[k]] = 0.00;
								}
								CapTabl_html += "<td  colspan=\"2\" align=\"center\" bgcolor=" + colors[colour] + "><b>$\xa0" + formatNumber(bridge_ctime_usd) +"</b></td>";
								totals_of_grand_total_USD = totals_of_grand_total_USD + o_bridge_snm_dt_ctime_usd[a_bridge_snm_dt_ctime[k]+'^'+actual_key];
								log.debug( 'f_CAtegory_row_grand_Total_USD_else3',totals_of_grand_total_USD);
						 
							}
							colour++;

						}

							log.debug('o_bridge_snm_dt_ctime_shr    4576',JSON.stringify(o_bridge_snm_dt_ctime_shr));
							log.debug('a_bridge_snm_dt_ctime',JSON.stringify(a_bridge_snm_dt_ctime));


						// Grand total venture debt partly paid
						for (var k = 0; k < a_vdebt_shrs_list.length; k++) {
							if (colour > 1) {
								colour = 0
							}
							if (_nullValidation(o_vdebt_partlypaid_shr[a_vdebt_shrs_list[k]])) // == "undefined" || o_cmn_snm_dt_ctime_shr[a_cmn_snm_dt_ctime[k]] == undefined)
							{
								o_vdebt_partlypaid_shr[a_vdebt_shrs_list[k]] = 0;
							}
							CapTabl_html += "<td  colspan=\"2\" align=\"center\" bgcolor=" + colors[colour] + "><b>" + formatNumber(o_vdebt_partlypaid_shr[a_vdebt_shrs_list[k]]) +"</b></td>";
							totals_of_grand_total_shares = totals_of_grand_total_shares + o_vdebt_partlypaid_shr[a_vdebt_shrs_list[k]];
							 CapTabl_html += "<td  colspan=\"1\" align=\"center\" bgcolor=" + colors[colour] + "><b></b></td>"; // Total Number of shares 31032022
						   
							if (g_currency.toString() != "USD") {
								if (_nullValidation(o_vdebt_partlypaid_inr[a_vdebt_shrs_list[k]])) // == "undefined" || o_cmn_snm_dt_ctime_inr[a_cmn_snm_dt_ctime[k]] == undefined)
								{
									o_vdebt_partlypaid_inr[a_vdebt_shrs_list[k]] = 0.00;
								}
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + "><b>" + g_currency + "\xa0" + formatNumber(o_vdebt_partlypaid_inr[a_vdebt_shrs_list[k]].toFixed(2)) +"</b></td>";
								totals_of_grand_total_INR = totals_of_grand_total_INR + o_vdebt_partlypaid_inr[a_vdebt_shrs_list[k]];


								if (_nullValidation(o_vdebt_partlypaid_usd[a_vdebt_shrs_list[k]])) // == "undefined" || o_cmn_snm_dt_ctime_usd[a_cmn_snm_dt_ctime[k]] == undefined)
								{
									o_vdebt_partlypaid_usd[a_vdebt_shrs_list[k]] = 0.00;
								}
								CapTabl_html += "<td  align=\"center\" bgcolor=" + colors[colour] + "><b>$\xa0" + formatNumber(o_vdebt_partlypaid_usd[a_vdebt_shrs_list[k]].toFixed(2)) +"</b></td>";
								totals_of_grand_total_USD = totals_of_grand_total_USD + o_vdebt_partlypaid_usd[a_vdebt_shrs_list[k]];
								log.debug( 'f_CAtegory_row_grand_Total_USD_4',totals_of_grand_total_USD);
						 
							} else {
								if (_nullValidation(o_vdebt_partlypaid_usd[a_vdebt_shrs_list[k]])) // == "undefined" || o_cmn_snm_dt_ctime_usd[a_cmn_snm_dt_ctime[k]] == undefined)
								{
									o_vdebt_partlypaid_usd[a_vdebt_shrs_list[k]] = 0.00;
								}
								CapTabl_html += "<td  colspan=\"2\" align=\"center\" bgcolor=" + colors[colour] + "><b>$\xa0" + formatNumber(o_vdebt_partlypaid_usd[a_vdebt_shrs_list[k]].toFixed(2)) +"</b></td>";
								totals_of_grand_total_USD = totals_of_grand_total_USD + o_vdebt_partlypaid_usd[a_vdebt_shrs_list[k]];
								log.debug( 'f_CAtegory_row_grand_Total_USD_else4',totals_of_grand_total_USD);
						 
							}
							colour++;

						}

						//===START======Grand Totals of ESOP and Venture DEbt=====//

						if (_nullValidation(i_Total_outstanding_shrs)) // == "undefined" || i_Total_outstanding_shrs == undefined)
						{
							i_Total_outstanding_shrs = 0;
						}
						CapTabl_html += "<td  align=\"center\"><b>" + formatNumber(i_Total_outstanding_shrs) +"</b></td>";
						totals_of_grand_total_shares = totals_of_grand_total_shares + i_Total_outstanding_shrs;


						if (_nullValidation(i_ESOP_outstanding_shrs)) // == "undefined" || f_options_share_total == undefined)  //f_options_share_total
						{
							f_options_share_total = 0;
							i_ESOP_outstanding_shrs = 0;
						}
						CapTabl_html += "<td  align=\"center\"><b>" + formatNumber(i_ESOP_outstanding_shrs) +"</b></td>";
						totals_of_grand_total_shares = totals_of_grand_total_shares + i_ESOP_outstanding_shrs;

						//==END======Grand Totals of ESOP and Venture DEbt=====//			




						//===========Totals of grand totals::::: START=====		

						if (_nullValidation(totals_of_grand_total_shares)) {
							totals_of_grand_total_shares = 0;
						}
						CapTabl_html += "<td  align=\"center\"><b>" + formatNumber(Number(totals_of_grand_total_shares)) +"</b></td>";


						if (g_currency.toString() != "USD") {
							if (_nullValidation(totals_of_grand_total_INR)) // == "undefined" || f_total_inv == undefined)
							{
								totals_of_grand_total_INR = 0.00;
							}
							CapTabl_html += "<td  align=\"center\"><b>" + g_currency + "\xa0" + formatNumber(totals_of_grand_total_INR.toFixed(2)) +"</b></td>";


							if (_nullValidation(totals_of_grand_total_USD)) // == "undefined" || f_total_usd == undefined || f_total_usd == "NaN")
							{
								totals_of_grand_total_USD = 0.00;
							}
							CapTabl_html += "<td  align=\"center\"><b>  $\xa0" + formatNumber(totals_of_grand_total_USD.toFixed(2)) +"</b></td>";

						} else {
							if (_nullValidation(totals_of_grand_total_USD)) // == "undefined" || f_total_usd == undefined || f_total_usd == "NaN")
							{
								totals_of_grand_total_USD = 0.00;
							}
							CapTabl_html += "<td colspan=\"2\" align=\"center\"><b>  $\xa0" + formatNumber(totals_of_grand_total_USD.toFixed(2)) + "</b></td>";

						}
						 log.debug( 'f_CAtegory_row_grand_Total_USD_23',totals_of_grand_total_USD);
							
						CapTabl_html += "<td  align=\"center\"><b>100%</b></td>";
						CapTabl_html += "</tr>";



						//=====ENDS=======TOTAL Values ----at Bottom of the TABLE=====================================//

						//=======Empty Rows ==== Added Start==========//  	
						var new_tbl_count = tbl_series_cnt * 4;
						CapTabl_html += "<tr>";
						CapTabl_html += "<td  colspan=\"2\" class=\"sticky-col first-col\" align=\"center\" border-bottom=\"0\">\xa0</td>";

						CapTabl_html += "<td  align=\"center\" border-bottom=\"0\" colspan=" + new_tbl_count + 3 + ">\xa0</td>";
						CapTabl_html += "</tr>";

						CapTabl_html += "<tr>";
						CapTabl_html += "<td  colspan=\"2\" class=\"sticky-col first-col\" align=\"center\" border-bottom=\"0\">\xa0</td>";

						CapTabl_html += "<td  align=\"center\" border-bottom=\"0\" colspan=" + new_tbl_count + 3 + ">\xa0</td>";
						CapTabl_html += "</tr>";
						//=======Empty Rows ==== Ends Here==========//    	

						//===================Start Calcuate the Post-Money for each series.========================//
						CapTabl_html += "<tr>";
						CapTabl_html += "<td colspan=\"2\" class=\"sticky-col first-col\" width=\"15%\"><b>Post-Money Capitalization</b></td>";

						for (var k = 0; k < a_pre_snm_dt_ctime.length; k++) {
							var f_total_series_shares = o_pre_snm_dt_ctime_shr[a_pre_snm_dt_ctime[k]];
							var f_last_pref_series_amt = o_pre_snm_dt_ctime_inr[a_pre_snm_dt_ctime[k]];
							var f_last_pref_series_usd = o_pre_snm_dt_ctime_usd[a_pre_snm_dt_ctime[k]];
							var f_last_prefe_usd = o_pre_snm_dt_ctime_ppsusd[a_pre_snm_dt_ctime[k]];
							var f_last_prefe_share_price = o_pre_snm_dt_ctime_ppsinr[a_pre_snm_dt_ctime[k]];

							var Native_PostMoney = o_Postmoney_native[a_pre_snm_dt_ctime[k].split('^')[0] + '^' + a_pre_snm_dt_ctime[k].split('^')[1]];
							var USD_PostMoney = o_Postmoney_usd[a_pre_snm_dt_ctime[k].split('^')[0] + '^' + a_pre_snm_dt_ctime[k].split('^')[1]];


							if (_nullValidation(Native_PostMoney)) {
								Native_PostMoney = 0;
							}

							if (_nullValidation(USD_PostMoney)) {
								USD_PostMoney = 0;
							}

							Native_PostMoney = Math.round(Number(Native_PostMoney));
							USD_PostMoney = Math.round(Number(USD_PostMoney));


							log.debug( '@#$&*(Native_Postmoney', Native_PostMoney);

							CapTabl_html += "<td  colspan=\"3\" align=\"center\"><b></b></td>";
							if (g_currency.toString() != "USD") {
								CapTabl_html += "<td  align=\"center\"><b>" + g_currency + "\xa0" + formatNumber(Number(Native_PostMoney).toFixed(2)) + "</b></td>";
								CapTabl_html += "<td  align=\"center\"><b>$\xa0" + formatNumber(Number(USD_PostMoney).toFixed(2)) + "</b></td>";
							} else {
								CapTabl_html += "<td  colspan=\"2\" align=\"center\"><b>$\xa0" + formatNumber(Number(USD_PostMoney).toFixed(2)) + "</b></td>";
							}
						}

						for (var k = 0; k < a_cmn_snm_dt_ctime.length; k++) {
							var f_total_series_shares = o_cmn_snm_dt_ctime_shr[a_cmn_snm_dt_ctime[k]];
							var f_last_pref_series_amt = o_cmn_snm_dt_ctime_inr[a_cmn_snm_dt_ctime[k]];
							var f_last_pref_series_usd = o_cmn_snm_dt_ctime_usd[a_cmn_snm_dt_ctime[k]];
							var f_last_prefe_usd = o_cmn_snm_dt_ctime_ppsusd[a_cmn_snm_dt_ctime[k]];
							var f_last_prefe_share_price = o_cmn_snm_dt_ctime_ppsinr[a_cmn_snm_dt_ctime[k]];


							var Native_Postmoney = o_Postmoney_native[a_cmn_snm_dt_ctime[k].split('^')[0] + '^' + a_cmn_snm_dt_ctime[k].split('^')[1]];
							var USD_PostMoney = o_Postmoney_usd[a_cmn_snm_dt_ctime[k].split('^')[0] + '^' + a_cmn_snm_dt_ctime[k].split('^')[1]];

							if (_nullValidation(Native_Postmoney)) {
								Native_Postmoney = 0;
							}

							if (_nullValidation(USD_PostMoney)) {
								USD_PostMoney = 0;

							}

							Native_Postmoney = Math.round(Number(Native_Postmoney));
							USD_PostMoney = Math.round(Number(USD_PostMoney));

							CapTabl_html += "<td   colspan=\"3\" align=\"center\"><b></b></td>";
							if (g_currency.toString() != "USD") {
								CapTabl_html += "<td  align=\"center\"><b>" + g_currency + "\xa0" + "\xa0" + formatNumber(Number(Native_Postmoney).toFixed(2)) + "</b></td>";
								CapTabl_html += "<td  align=\"center\"><b>$\xa0" + formatNumber(Number(USD_PostMoney).toFixed(2)) + "</b></td>";
							} else {
								CapTabl_html += "<td  colspan=\"2\" align=\"center\"><b>$\xa0" + formatNumber(Number(USD_PostMoney).toFixed(2)) + "</b></td>";
							}

						}

						log.debug('a_bridge_orig_conv_dt_list***', a_bridge_orig_conv_dt_list);
						log.debug('o_br_Postmoney_native***', o_br_Postmoney_native);
						log.debug('a_bridge_orig_conv_dt_list[k]***', a_bridge_orig_conv_dt_list[0]);
						log.debug('o_br_Postmoney_usd***', o_br_Postmoney_usd);
						log.debug('actual_key***', actual_key)
						//=========Actual key append was missing here==============
						
						if (g_currency.toString() != "USD") {
							if (a_bridge_orig_conv_dt_list) {
								for (var k = 0; k < a_bridge_orig_conv_dt_list.length; k++) {
									var Native_PostMoney = o_br_Postmoney_native[a_bridge_orig_conv_dt_list[k]+'^'+actual_key];
									var USD_PostMoney = o_br_Postmoney_usd[a_bridge_orig_conv_dt_list[k]+'^'+actual_key];

									if (_nullValidation(Native_PostMoney)) {
										Native_PostMoney = 0;
									}

									if (_nullValidation(USD_PostMoney)) {
										USD_PostMoney = 0;
									}
									log.debug('Native_PostMoney***', Native_PostMoney);
									log.debug('USD_PostMoney***', USD_PostMoney);
									Native_PostMoney = Math.round(Number(Native_PostMoney));
									USD_PostMoney = Math.round(Number(USD_PostMoney));

									CapTabl_html += "<td  colspan=\"4\" align=\"center\"></td>";
									CapTabl_html += "<td align=\"center\"><b>" + g_currency + "\xa0" + formatNumber(Number(Native_PostMoney).toFixed(2)) + "</b></td>";
									
									CapTabl_html += "<td  align=\"center\"><b>$\xa0" + formatNumber(Number(USD_PostMoney).toFixed(2)) + "</b></td>";
								}

							}

						} else {
							if (a_bridge_orig_conv_dt_list) {
								for (var k = 0; k < a_bridge_orig_conv_dt_list.length; k++) {
									var USD_PostMoney = o_br_Postmoney_usd[a_bridge_orig_conv_dt_list[k]];
									if (_nullValidation(USD_PostMoney)) {
										USD_PostMoney = 0;
									}
									CapTabl_html += "<td  colspan=\"4\" align=\"center\"></td>";
									
									CapTabl_html += "<td colspan=\"2\" align=\"center\"><b>$\xa0" + formatNumber(Number(USD_PostMoney).toFixed(2)) + "</b</td>";
								}

							}
						}

						if (a_search_venture_partly) {
							for (var k = 0; k < a_search_venture_partly.length; k++) {
								if (g_currency.toString() != "USD") {
									CapTabl_html += "<td  colspan=\"3\" align=\"center\"></td>";
									CapTabl_html += "<td align=\"center\"><b></b></td>";
									CapTabl_html += "<td align=\"center\"><b></b></td>";
								} else {
									CapTabl_html += "<td  colspan=\"3\" align=\"center\"></td>";
									CapTabl_html += "<td  colspan=\"2\" align=\"center\"></td>";
								}

							}

						}


						CapTabl_html += "<td  align=\"center\"></td>";
						CapTabl_html += "<td  align=\"center\"></td>";
						CapTabl_html += "<td  align=\"center\"><b></b></td>";
						CapTabl_html += "<td  colspan=\"2\" align=\"center\"><b></b></td>";
						CapTabl_html += "<td  align=\"center\"></td>";
						CapTabl_html += "</tr>";


						//================================End Calcuate the Post-Money for each series.========================//

						CapTabl_html += "<tr>";
						CapTabl_html += "<td colspan=\"2\" class=\"sticky-col first-col\" width=\"15%\"><b>Pre-Money Capitalization</b></td>";

						for (var k = 0; k < a_pre_snm_dt_ctime.length; k++) {

							var f_total_series_shares = o_pre_snm_dt_ctime_shr[a_pre_snm_dt_ctime[k]];
							var f_last_pref_series_amt = o_pre_snm_dt_ctime_inr[a_pre_snm_dt_ctime[k]];
							var f_last_pref_series_usd = o_pre_snm_dt_ctime_usd[a_pre_snm_dt_ctime[k]];
							var f_last_prefe_usd = o_pre_snm_dt_ctime_ppsusd[a_pre_snm_dt_ctime[k]];
							var f_last_prefe_share_price = o_pre_snm_dt_ctime_ppsinr[a_pre_snm_dt_ctime[k]];


							var Native_PreMoney = o_Premoney_native[a_pre_snm_dt_ctime[k].split('^')[0] + '^' + a_pre_snm_dt_ctime[k].split('^')[1]];
							var USD_PreMoney = o_Premoney_usd[a_pre_snm_dt_ctime[k].split('^')[0] + '^' + a_pre_snm_dt_ctime[k].split('^')[1]];


							if (_nullValidation(Native_PreMoney)) {
								Native_PreMoney = 0;
							}
							if (_nullValidation(USD_PreMoney)) {
								USD_PreMoney = 0;
							}

							Native_PreMoney = Math.round(Number(Native_PreMoney));
							USD_PreMoney = Math.round(Number(USD_PreMoney));


							CapTabl_html += "<td   colspan=\"3\" align=\"center\"><b></b></td>";
							if (g_currency.toString() != "USD") {
								CapTabl_html += "<td  align=\"center\"><b>" + g_currency + "\xa0" + formatNumber(Number(Native_PreMoney).toFixed(2)) + "</b></td>";
								CapTabl_html += "<td  align=\"center\"><b>$\xa0" + formatNumber(Number(USD_PreMoney).toFixed(2)) + "</b></td>";
							} else {
								CapTabl_html += "<td  colspan=\"2\" align=\"center\"><b>$\xa0" + formatNumber(Number(USD_PreMoney).toFixed(2)) + "</b></td>";
							}


						}
						for (var k = 0; k < a_cmn_snm_dt_ctime.length; k++) {

							var f_total_series_shares = o_cmn_snm_dt_ctime_shr[a_cmn_snm_dt_ctime[k]];
							var f_last_pref_series_amt = o_cmn_snm_dt_ctime_inr[a_cmn_snm_dt_ctime[k]];
							var f_last_pref_series_usd = o_cmn_snm_dt_ctime_usd[a_cmn_snm_dt_ctime[k]];
							var f_last_prefe_usd = o_cmn_snm_dt_ctime_ppsusd[a_cmn_snm_dt_ctime[k]];
							var f_last_prefe_share_price = o_cmn_snm_dt_ctime_ppsinr[a_cmn_snm_dt_ctime[k]];



							var Native_PreMoney = o_Premoney_native[a_cmn_snm_dt_ctime[k].split('^')[0] + '^' + a_cmn_snm_dt_ctime[k].split('^')[1]];
							var USD_PreMoney = o_Premoney_usd[a_cmn_snm_dt_ctime[k].split('^')[0] + '^' + a_cmn_snm_dt_ctime[k].split('^')[1]];

							if (_nullValidation(Native_PreMoney)) {
								Native_PreMoney = 0;
							}

							if (_nullValidation(USD_PreMoney)) {
								USD_PreMoney = 0.00;
							}


							Native_PreMoney = Math.round(Number(Native_PreMoney));
							USD_PreMoney = Math.round(Number(USD_PreMoney));


							CapTabl_html += "<td   colspan=\"3\" align=\"center\"><b></b></td>";
							if (g_currency.toString() != "USD") {
								CapTabl_html += "<td  align=\"center\"><b>" + g_currency + "\xa0" + formatNumber(Number(Native_PreMoney).toFixed(2)) + "</b></td>";
								CapTabl_html += "<td  align=\"center\"><b>$\xa0" + formatNumber(Number(USD_PreMoney).toFixed(2)) + "</b></td>";
							} else {
								CapTabl_html += "<td  colspan=\"2\" align=\"center\"><b>$\xa0" + formatNumber(Number(USD_PreMoney).toFixed(2)) + "</b></td>";
							}

						}

						if (a_bridge_orig_conv_dt_list) {
							for (var k = 0; k < a_bridge_orig_conv_dt_list.length; k++) {


								var Native_PreMoney = o_br_Premoney_native[a_bridge_orig_conv_dt_list[k]+'^'+actual_key];
								var USD_PreMoney = o_br_Premoney_usd[a_bridge_orig_conv_dt_list[k]+'^'+actual_key];


								if (_nullValidation(Native_PreMoney)) {
									Native_PreMoney = 0;
								}

								if (_nullValidation(USD_PreMoney)) {
									USD_PreMoney = 0;
								}


								Native_PreMoney = Math.round(Number(Native_PreMoney));
								USD_PreMoney = Math.round(Number(USD_PreMoney));


								if (g_currency.toString() != "USD") {
									CapTabl_html += "<td  colspan=\"4\" align=\"center\"></td>";
									CapTabl_html += "<td align=\"center\"><b> " + g_currency + "\xa0" + formatNumber(Number(Native_PreMoney).toFixed(2)) + "</b></td>";
									 CapTabl_html += "<td align=\"center\"><b> $\xa0" + formatNumber(Number(USD_PreMoney).toFixed(2)) + "</b></td>";
								} else {
									CapTabl_html += "<td  colspan=\"3\" align=\"center\"></td>";
								   
									CapTabl_html += "<td colspan=\"2\" align=\"center\"><b> $\xa0" + formatNumber(Number(USD_PreMoney).toFixed(2)) + "</b></td>";
								}

							}

						}


						if (a_search_venture_partly) {
							for (var k = 0; k < a_search_venture_partly.length; k++) {
								if (g_currency.toString() != "USD") {
									CapTabl_html += "<td  colspan=\"3\" align=\"center\"></td>";
									CapTabl_html += "<td align=\"center\"><b></b></td>";
									CapTabl_html += "<td align=\"center\"><b></b></td>";
								} else {
									CapTabl_html += "<td  colspan=\"2\" align=\"center\"></td>";
									CapTabl_html += "<td  colspan=\"2\" align=\"center\"></td>";
								}

							}

						}


						CapTabl_html += "<td  align=\"center\"></td>";
						CapTabl_html += "<td  align=\"center\"></td>";
						CapTabl_html += "<td  align=\"center\"></td>";
						CapTabl_html += "<td  colspan=\"2\" align=\"center\"></td>";
						CapTabl_html += "<td  align=\"center\"></td>";
						CapTabl_html += "</tr>";



						CapTabl_html += "</tbody>";
						CapTabl_html += "</table></div></div></table>";
						CapTabl_html += "</html>";
					} else {
						var CapTabl_html = '';
						CapTabl_html += '<html>';
						CapTabl_html += '<body>';
						CapTabl_html += "<style>.uir-outside-fields-table {width:100%;}</style><table width=\"100%\" bgcolor=\"#D3D3D3\" border=\"1\" cellspacing=\"0\" cellpadding=\"3\" style=\" border-collapse:collapse; margin-top:30px; border:1px solid white; padding-bottom:10px;\">";
						CapTabl_html += "<html>";
						CapTabl_html += "<table  width=\"100%\" bgcolor=\"#D3D3D3\" border=\"1\" cellspacing=\"10\" cellpadding=\"5\" style=\" font-size:14px; border-collapse:collapse; margin-top:10px; border:1px solid white; padding-bottom:10px;\">";
						CapTabl_html += "<tr><td align='center'>";
						CapTabl_html += "No Data found for the Selected Investee to generate the Captable Report";
						CapTabl_html += "</tr></td>";
						CapTabl_html += "</table>";
						CapTabl_html += "</html>";
					}


				} else if (log_Valid(Investee) && !log_Valid(filter_todt)) {
					var CapTabl_html = '';
					CapTabl_html += '<html>';
					CapTabl_html += '<body>';
					CapTabl_html += "<style>.uir-outside-fields-table {width:100%;}</style><table width=\"100%\" bgcolor=\"#D3D3D3\" border=\"1\" cellspacing=\"0\" cellpadding=\"3\" style=\" border-collapse:collapse; margin-top:30px; border:1px solid white; padding-bottom:10px;\">";
					CapTabl_html += "<html>";
					CapTabl_html += "<table  width=\"100%\" bgcolor=\"#D3D3D3\" border=\"1\" cellspacing=\"10\" cellpadding=\"5\" style=\" font-size:14px; border-collapse:collapse; margin-top:10px; border:1px solid white; padding-bottom:10px;\">";
					CapTabl_html += "<tr><td align='center'>";
					CapTabl_html += "Please Select Date to generate the Cap Table Report ";
					CapTabl_html += "</tr></td>";
					CapTabl_html += "</table>";
					CapTabl_html += "</html>";
				} else {
					var CapTabl_html = '';
					CapTabl_html += '<html>';
					CapTabl_html += '<body>';
					CapTabl_html += "<style>.uir-outside-fields-table {width:100%;}</style><table width=\"100%\" bgcolor=\"#D3D3D3\" border=\"1\" cellspacing=\"0\" cellpadding=\"3\" style=\" border-collapse:collapse; margin-top:30px; border:1px solid white; padding-bottom:10px;\">";
					CapTabl_html += "<html>";
					CapTabl_html += "<table  width=\"100%\" bgcolor=\"#D3D3D3\" border=\"1\" cellspacing=\"10\" cellpadding=\"5\" style=\" font-size:14px; border-collapse:collapse; margin-top:10px; border:1px solid white; padding-bottom:10px;\">";
					CapTabl_html += "<tr><td align='center'>";
					CapTabl_html += "Please Select Investee and Date to generate the Cap Table Report ";
					CapTabl_html += "</tr></td>";
					CapTabl_html += "</table>";
					CapTabl_html += "</html>";
				}

				inlineHTML = form_captable.addField({id:'custpage_misreport_inline', type:'inlinehtml', label:"."});
				inlineHTML.defaultValue = CapTabl_html;
				//inlineHTML.setLayoutType('outsidebelow', 'startcol');
				inlineHTML.updateLayoutType({layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW});
				form_captable.addSubmitButton({label:'Submit'});

				//var Homepage_url ='https://5095851-sb1.app.netsuite.com/app/center/card.nl?sc=-29&whence=' //Sandbox
				var Homepage_url = "https://5095851.app.netsuite.com/app/center/card.nl?sc=-29&whence="; //Production
				var Homepage_path = "window.open('" + Homepage_url + "','_self')";
				form_captable.addButton({id:'custpage_goback',label: 'Go Home',functionName: Homepage_path});
				if ((filter_todt) && (filter_investee)) {

					let Export_URL = url.resolveScript({scriptId: 'customscript_sut_excel_exprt_captble_new',deploymentId: 'customdeploy_sut_excel_exprt_captble_new',returnExternalUrl: false});
					Export_URL = Export_URL + "&custscript_frm_investee=" + filter_investee + "&custscript_todt=" + filter_todt;
					
					var Export_excel_path = "window.open('" + Export_URL + "')";
					form_captable.addButton({id: 'custpage_generate_excel',label: 'Export Excel',functionName: Export_excel_path});

				}
				context.response.writePage(form_captable);
			}



		}//if (context.request.method == 'GET')
		 else {
			 log.debug('Inside Post   12958')
			 var scriptcontext = context.request
			 var parameters = scriptcontext.parameters;
			 var filter_investee = parameters.custscript_frm_investee;

			 var frmdt = parameters.custpage_captable_frmdt;
			 var todt = parameters.custpage_captable_todt;
			 var investee = parameters.custpage_captable_slct_investee;
			 var simplified_chkbox = parameters.custpage_simplified_captable;
			 log.debug('check Parameters  12974','filter_investee= '+filter_investee+' ||  '+'frmdt= '+frmdt+' ||  '+'todt= '+todt+' ||  '+'investee= '+investee+' ||  '+'simplified_chkbox= '+ simplified_chkbox);


			 var params = {};
			 if (investee) {
				 params['custscript_frm_investee'] = investee;
			 }
			 if (frmdt) {
				 params['custscript_frmdt'] = frmdt;
			 }
			 if (investee) {
				 params['custscript_todt'] = todt;
			 }
			 params['custscript_simplifiedcheckbox'] = simplified_chkbox;
			 log.debug('params  12988', JSON.stringify(params))
			 //	response.sendRedirect('SUITELET','customscript_acc_pro_tswise_captable','customdeploy_acc_pro_tswise_captable',false,params);
			 //response.sendRedirect('SUITELET', 'customscript_acc_pro_tswise_captable', 'customdeploy_acc_pro_tswise_captable', false, params);
			 context.response.sendRedirect({
				 type: https.RedirectType.SUITELET,
				 identifier: 'customscript_acc_pro_tswise_captable_new',
				 id: 'customdeploy_acc_pro_tswise_captable_new',
				 parameters:params
			 });

		 } //End POST Method
	 } // End Suitelet
	 // END SUITELET ====================================================
	 function changeIframeSize(obj) {
		 obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
		 obj.style.width = obj.contentWindow.document.body.scrollWidth + 'px';

	 }


	 function getCompanyCurrentDateTime() {
		 var currentDateTime = new Date();
		 //var companyTimeZone = nlapiLoadConfiguration('companyinformation').getFieldText('timezone');
		 var companyTimeZone = config.load({
			 type: config.Type.COMPANY_INFORMATION
		 }).getText({name: 'timezone'});



		 var timeZoneOffSet = (companyTimeZone.indexOf('(GMT)') == 0) ? 0 : new Number(companyTimeZone.substr(4, 6).replace(/\+|:00/gi, '').replace(/:30/gi, '.5'));
		 var UTC = currentDateTime.getTime() + (currentDateTime.getTimezoneOffset() * 60000);
		 var companyDateTime = UTC + (timeZoneOffSet * 60 * 60 * 1000);

		 return new Date(companyDateTime);
	 }



	 function get_IndianDateTime() {
		 var utc = adate.getTime() + (adate.getTimezoneOffset() * 60000); //Get Time with time zone offset
		 var offset = '5.5'; //INDIA TIME ZONE
		 var d = new Date(utc + (3600000 * offset)); //convert date to India time zone
		 d.toLocaleString(); //Convert local time.
	 }

	 function log_Valid(value) {

		 if (value != null && value != undefined && value != '' && value != 'undefined' && value != 'null' && value.toString() != 'NaN') {
			 return true;
		 } else {
			 return false;
		 }
	 }


	 function _logValidation(value) {
		 if (value != null && value != undefined && value != '' && value != 'undefined' && value != 'null' && value.toString() != 'NaN') {
			 return true;
		 } else {
			 return false;
		 }

	 }
	 //		array_categry_list.sort(sortNumberArray_count)


	 function Common_Array_sort(a, b) {
		 var a = a.split("^")[3];
		 var b = b.split("^")[3];

		 a = Number(a);
		 b = Number(b);

		 return b - a;
	 }
	 function preferred_Array_sort(a, b) {
		 var a = a.split("^")[3];
		 var b = b.split("^")[3];

		 a = Number(a);
		 b = Number(b);

		 return b - a;
	 }

	 function sortNumberArray_count(a, b) {
		 var a = a.split("^")[0];
		 var b = b.split("^")[0];

		 a = Number(a.split('-')[0]);
		 b = Number(b.split('-')[0]);

		 return a - b;
	 }
	 function sortNumberArray(a, b) {
		 var a = a.split("^")[3];
		 var b = b.split("^")[3];
		 a = Number(a.split('-')[0]);
		 b = Number(b.split('-')[0]);

		 return a - b;
	 }
	 function getMoreRecords(transactionSearchObj) {
		 try {
			 var startPos = 0;
			 var endPos = 1000;
			 var allRecords = new Array();
			 while (true) {
				 var resultSet = transactionSearchObj.run();
				 try {
					 var currList = resultSet.getRange({
						 start: startPos,
						 end: endPos
					 });
				 }
				 catch (ex) {
					 break;
				 }
				 if (currList == null || currList.length <= 0)
					 break;
				 if (allRecords == null) {
					 allRecords = currList;
				 } else {
					 allRecords = allRecords.concat(currList);
				 }
				 if (currList.length < 1000) {
					 break;
				 }
				 startPos += 1000;
				 endPos += 1000;
			 }
			 return allRecords;
		 } catch (ERROR) {
			 log.error("ERROR IN getMoreRecords() FUNCTION", ERROR)
		 }



	 }



	 function formatNumber(num) {
		 
		 if (_logValidation(formatNumber) && num != undefined) {
			 return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
		 }
	 }


	 function _nullValidation(val) {
		 if (val == null || val == undefined || val == '' || val.toString() == "undefined" || val.toString() == "NaN" || val.toString() == "null") {
			 return true;
		 } else {
			 return false;
		 }
	 }
	 return {
		 onRequest: accel_captable_test_pro
	 }
 })