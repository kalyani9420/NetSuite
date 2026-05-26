/**
* @NApiVersion 2.1
* @NScriptType Suitelet
*/
define(['N/currentRecord', 'N/ui/serverWidget', 'N/url', 'N/https', 'N/task', 'N/search'],
    /**
 * @param{currentRecord} currentRecord
 */

    (currentRecord, serverWidget, url, http, task, search) => {

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */

        function onRequest(scriptContext) {
            if (scriptContext.request.method === 'GET') {
                // const customerName = scriptContext.request.parameters.custpage_customer_name;
                // let form = serverWidget.createForm({
                //     title: 'Sales Order'
                // });
                // scriptContext.response.writePage(form);
            }
            else if (scriptContext.request.method === 'POST'){
                
            }
        }
        return {
            onRequest: onRequest,

        };
    });