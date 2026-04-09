// BEGIN SCRIPT DESCRIPTION BLOCK  ==================================
{
/*
	Script Name: ACC_SUT_Fiesaving_CCList.js 
	Author:  J Phani Kunar
	Company: Inspirria Cloudtech
	Date:  10-12-2018	
	Description:   


	Script Modification Log:

	-- Date --			-- Modified By --				--Requested By--				-- Description --


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

	

// BEGIN GLOBAL VARIABLE BLOCK  =====================================
{
	//  Initialize any Global Variables, in particular, debugging variables...

}
// END GLOBAL VARIABLE BLOCK  =======================================


// BEGIN SUITELET ==================================================


function accel_file_saving(request, response)
{
	if(request.getMethod()=='GET')	
	{
		        var linenum = request.getParameter('val'); 
                var cclist= request.getParameter('cclist');
                //alert('cclist get'+cclist)
			var form_c = nlapiCreateForm('File Uploading',false);
			form_c.addField('custpage_lbl','label','Please Attach only one file at a time').setLayoutType('startrow','startcol');
			form_c.addField('custpage_name_si1','file','Attach File').setLayoutType('startrow');
			var c = form_c.addField('custpage_name_linenum','text','File IDs');
			c.setDefaultValue(linenum);
			c.setDisplayType('hidden');
            var d = form_c.addField('custpage_cclist','text','cclist');
			d.setDefaultValue(cclist);
			d.setDisplayType('hidden');
		    //form_c.setScript('customscript_acc_cli_cc_updation');
			form_c.addSubmitButton('Upload...');
		    response.writePage(form_c);
	}
	else
	{
	      var file = request.getFile("custpage_name_si1");
	      var linenum = request.getParameter("custpage_name_linenum");
          var cclist = request.getParameter("custpage_cclist");
     // alert('cclist post'+cclist)
	      if(file)
	      {
	    	      file.setFolder(10); 
	 	      var id = nlapiSubmitFile(file);
	 	      var loadfile = nlapiLoadFile(id);
	 	      var URL = loadfile.getURL();
	 	      nlapiLogExecution('debug','First_URL'+URL);
	 	      var File_Name = loadfile.getName();
	 	      nlapiLogExecution('debug','File_Name'+File_Name);
	 	      URL = 'https://system.netsuite.com'+URL;
	 		  response.write('<html><head><title>File Uploaded</title></head><body><script language="JavaScript" type="text/javascript">parent.values_Set("'+File_Name+','+linenum+','+id+','+cclist+'");</script></body></html>');		
	 		//  response.write('<html><head><title>File Uploaded</title></head><body><script language="JavaScript" type="text/javascript">window.location.values_Set("'+File_Name+','+linenum+','+id+','+cclist+'");</script></body></html>');		

          }	  
	   	  
    }
}


// END SUITELET ====================================================



		
function log_Valid(value)
{
	 if(value!=null  && value!='' && value!=undefined  && value.toString()!='NaN')
	 {
		 return true;
	 }
	 else
	 {
		 return false;
	 }
}
