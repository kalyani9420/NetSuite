/**
 *@NApiVersion 2.x
 *@NScriptType Portlet
 */

// This sample creates a portlet that includes a simple form with a text field and a submit button
define(['N/ui/serverWidget', 'N/record' , 'N/redirect'], function (serverWidget, record , redirect) {
    function render(params) {
        var portlet = params.portlet;
        portlet.title = 'Customer';


        var field1 = portlet.addField({
            id: 'custpage_customer_name',
            type: serverWidget.FieldType.TEXT,
            label: 'Customer Name'
        });

        field1.layoutType = serverWidget.FieldLayoutType.NORMAL;
        field1.updateBreakType({
            breakType: serverWidget.FieldBreakType.STARTCOL
        });
        field1.isMandatory = true;



        var field2 = portlet.addField({
            id: 'custpage_customer_phone',
            type: serverWidget.FieldType.TEXT,
            label: 'Phone'
        });
        field2.isMandatory = true;




        var select1 = portlet.addField({
            id: 'custpage_customer_status',
            type: serverWidget.FieldType.SELECT,
            label: 'Customer Status',

        });
        select1.addSelectOption({
            value: '3',
            text: ''
        });
        select1.addSelectOption({
            value: '0',
            text: 'CUSTOMER-Lost Customer'
        });
        select1.addSelectOption({
            value: '1',
            text: 'CUSTOMER-Closed Won'
        });
        select1.addSelectOption({
            value: '2',
            text: 'CUSTOMER-Renewal'
        });

        select1.defaultValue = '1'
        select1.isMandatory = true;
        select1.updateBreakType({
            breakType: serverWidget.FieldBreakType.STARTCOL
        });


        var select2 = portlet.addField({
            id: 'custpage_customer_subsidary',
            type: serverWidget.FieldType.SELECT,
            label: 'Customer Subsidiary',
            source: 'subsidiary'

        });


        params.portlet.setSubmitButton({
			url: 'http://httpbin.org/post',
			label: 'Submit',
			target: '_top'
});

    }

    return {
        render: render
    };
});