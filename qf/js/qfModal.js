document.addEventListener('alpine:init', () => {
    Alpine.data('qfModal', () => ({
        modalData: { title: '', dataObject: 'default', dataRecord: { index: -1, data: [] }, Form: { formJSON: [], formHTML: '' } },

        // process the form in the modal, return a data object with the results
        getModalFormData() {
            var formDataRow = {};

            // go thru each field is in the modal form and add it to the data object to be returned
            theForm = this.modalData.Form.formJSON;
            for (var j = 0; j < theForm.length; j++) {
                if (theForm[j].type === 'relation') {
                    var inValueSelected = this.getHTMLFromFieldValue(theForm[j].name, theForm[j].type);
                    formDataRow[theForm[j].name] = this.getModalFormRelationData(theForm[j], inValueSelected);
                } else {
                    formDataRow[theForm[j].name] = this.getHTMLFromFieldValue(theForm[j].name, theForm[j].type);
                }
            }
            return formDataRow;
        },

        getModalFormRelationData(inField, inSelectedValue) {
            // get the data for the relation table
            var dataList = this.getCurrentProject().tables[parseInt(inField.relation.table)].data;
            var selectedList = [];

            for (var j = 0; j < dataList.length; j++) {
                // console.log(dataList[j].qfid + ' does it equal ' + parseInt(inSelectedValue));
                if (dataList[j].qfid === parseInt(inSelectedValue)) {
                    selectedList.push(dataList[j]);
                }
            }

            return selectedList;
        },

        // modal form is used to edit a current table field, 
        // or to add/edit a data record to a table.
        // the modal resolveFunction is used to determine which code to call when the modal form is submitted
        getModalFormSave() {
            var resolveFunction = this.modalData.resolveFunction;
            eval(resolveFunction + '()');
            this.saveState();
        },
        modalSaveDataRecord() {
            // get the data record from the modal form as an object
            var modalRecord = this.getModalFormData();

            // is this a new record (index = -1) or are they editing an existing record
            if (this.modalData.dataRecord.index == -1) {
                if (this.modalData.dataObject == 'default') {
                    modalRecord.qfid = this.getCurrentProject().tables[this.getCurrentProjectTableID()].meta.nextDataID;

                    this.getCurrentProject().tables[this.getCurrentProjectTableID()].meta.nextDataID++;
                    this.getCurrentProject().tables[this.getCurrentProjectTableID()].data.push(modalRecord);
                }
            } else {
                this.getCurrentProject().tables[this.getCurrentProjectTableID()].data[this.modalData.dataRecord.index] = modalRecord;
            }

            // reset the modal form HTML
            this.modalData.Form.formHTML = '';
        },
        isJson(str) {
            try {
                const obj = JSON.parse(str);
                return obj;
                // return obj && typeof obj === 'object' && !Array.isArray(obj);
            } catch (err) {
                return false;
            }
        },
        modalBuildDataSetFromUpload(inJSON, inData) {
            var newRows = [];

            // build new data rows, one row at a time
            var newRows = [];
            for (let i = 0; i < inData.length; i++) {
                var newRow = {};
                for (let j = 0; j < inJSON.length; j++) {
                    newRow[inJSON[j].name] = inData[i][inJSON[j].name];
                }
                newRows.push(newRow);
            }
            return newRows;
        },
        processJSONUpload(inJSON, inType) {
            // build an array with the keys from the uploaded JSON file
            var keys = [];
            for (var key in inJSON[0]) {
                keys.push(key);
            }

            // should we replace the entire table structure and data with the JSON file?
            if (inType == 'structuredata') {
                // build new table structure, one field at a time
                var newFields = [];
                for (let i = 0; i < keys.length; i++) {
                    var newField = { ...this.fieldTemplate };
                    newField.id = i;
                    newField.label = keys[i];
                    newField.name = keys[i];
                    newField.columns = "12";
                    newField.type = 'text';

                    newFields.push(newField);
                };

                var newDataset = this.modalBuildDataSetFromUpload(newFields, inJSON);

                this.setCurrentProjectTableData([]);
                this.setCurrentProjectTableJSON([]);
                
                // overwrite current structure with new field structure
                this.setCurrentProjectTableJSON(newFields);
                // overwrite the current data in the table
                this.setCurrentProjectTableData(newDataset);

                // generate the new form HTML preview with the new field
                var tableHTML = this.getFormHTMLFromJSON(newFields, 'preview');
                // update the working form HTML and JSON fields with the new data
                this.setCurrentProjectTableFormHTML(tableHTML);
            }

            // should we replace the table data with data from the JSON file?
            if (inType == 'data') {
                // loop thru each field in the existing table structure 
                // and build a new data record for each record in the JSON file

                var newDataset = this.modalBuildDataSetFromUpload(this.getCurrentProjectTableJSON(), inJSON);

                // overwrite the current data in the table
                this.setCurrentProjectTableData([]);
                this.setCurrentProjectTableData(newDataset);
            }

            // should we append the table data with data from the JSON file?
            if (inType == 'append') {
                var newDataset = this.modalBuildDataSetFromUpload(this.getCurrentProjectTableJSON(), inJSON);

                var currentData = this.getCurrentProjectTableData();

                for (i = 0; i < newDataset.length; i++) {
                    currentData.push(newDataset[i]);
                }
            }
        },
        async modalUploadFile() {
            // get the data record from the modal form as an object
            var modalRecord = this.getModalFormData();

            var actionToTake = modalRecord['Whatshouldbedone'];

            // check if the paste JSON box was used for upload,
            // if not, we will check if a file was uploaded in the files area
            var jsonResult = this.isJson(modalRecord['orpastefilebelow']);

            // check if a file has been selected for upload, this overwrites and 
            // copy/paste in the form
            var files = modalRecord['file']
            if (files.value.length > 0) {
                var file = files.files[0];
                var fileText = await file.text();
                jsonResult = JSON.parse(fileText);
            }

            if (jsonResult) {
                // ok, we have some JSON to process
                var processType = 'structuredata' // structuredata, data, append
                if (actionToTake == 'Replace data') processType = 'data';
                if (actionToTake == 'Append data') processType = 'append';

                this.processJSONUpload(jsonResult, processType);
                this.saveState();

            } else {
                console.log('No good JSON found to process.  Nothing was done.');
            }

            // reset the modal form HTML
            this.modalData.Form.formHTML = '';
        },
        modalFormSaveFieldEdit() {
            // get the field properties from the modal form as an object
            var formData = this.getModalFormData();

            // for the field, the label can have spaces but the name of the field should have any spaces removed
            formData.label = String(formData.label);
            formData.name = formData.label.replace(' ', '');

            // update the current table field with the edits captured
            var currentTable = this.getCurrentProjectTable();
            var prevName = currentTable.formJSON[this.modalData.dataRecord.index].label;

            // if the name of the field has changed, need to update any data already entered for the form
            if (prevName != formData.label) {
                var formDataJSON = this.getCurrentProjectTable().data;

                // change the name of the field in the JSON data
                var newData = JSON.parse(JSON.stringify(formDataJSON).split('"' + prevName + '":').join('"' + formData.name + '":'));

                // set the data to the new, changed field name data
                this.getCurrentProjectTable().data = newData;
            }

            // set the form definition to the updated data
            currentTable.formJSON[this.modalData.dataRecord.index] = formData;

            // rebuild the working form with the new table structure
            currentTable.formHTML = this.getFormHTMLFromJSON(currentTable.formJSON, 'editfield');

            this.saveState();
        },
        async modalFormCreateProjectForm() {
            // get the field properties from the modal form as an object
            var formData = this.getModalFormData();

            var currProject = this.getCurrentProject();

            var newForm = JSON.parse(JSON.stringify(this.formTemplate));
            newForm.id = currProject.meta.nextTableID;
            newForm.meta.name = formData.tablename;
            newForm.meta.description = formData.tabledesc;
            newForm.data = [];
            newForm.formJSON = [];

            currProject.tables.push(newForm);

            currProject.meta.nextTableID++;

            var lastTable = this.getCurrentProject().tables.length - 1
            this.projectSwitchTable(lastTable);

                        // check if the paste JSON box was used for upload,
            // if not, we will check if a file was uploaded in the files area
            var jsonResult = this.isJson(formData['orpastefilebelow']);

            // check if a file has been selected for upload, this overwrites and 
            // copy/paste in the form
            var files = formData['file']
            if (files.value.length > 0) {
                var file = files.files[0];
                var fileText = await file.text();
                jsonResult = JSON.parse(fileText);
            }

            if (jsonResult) {
                // ok, we have some JSON to process
                var processType = 'structuredata' // structuredata, data, append
                
                this.processJSONUpload(jsonResult, processType);
                this.saveState();
            } 

            // reset the modal form HTML
            this.modalData.Form.formHTML = '';
            this.switchSection('projects');

            this.saveState();
        },
        modalFormCreateProject() {
            // get the field properties from the modal form as an object
            var formData = this.getModalFormData();

            var nextProjectID = 0;
            if (this.qfState.projects.length > 0) {
                nextProjectID = this.qfState.projects[this.qfState.projects.length - 1].id;
                nextProjectID++;
            }

            var newProject = JSON.parse(JSON.stringify(this.projectTemplate));
            newProject.id = nextProjectID;
            newProject.meta.name = formData.projectname;
            newProject.meta.description = formData.projectdesc
            newProject.meta.nextTableID = 1;
            newProject.currentTableID = 0;

            var newForm = JSON.parse(JSON.stringify(this.formTemplate));
            newForm.id = 0;
            newForm.meta.name = formData.tablename;
            newForm.meta.description = formData.tabledesc;
            newForm.data = [];
            newForm.formJSON = [];

            newProject.tables.push(newForm);

            this.qfState.projects.push(newProject);
            this.qfState.projectCurrent = newProject.id;

            // reset the modal form HTML
            this.modalData.Form.formHTML = '';

            this.saveState();
            this.switchSection('projects');
        },
        showModal(inTitle, inJSON, inResolveFunction, inIndex = -1, inData = undefined) {
            this.modalData.title = inTitle;
            this.modalData.resolveFunction = inResolveFunction;
            this.modalData.modalObject = 'default';
            if (inData == undefined) {
                this.modalData.dataRecord.index = -1;
                this.modalData.dataRecord.data = {};
            } else {
                this.modalData.dataRecord.index = inIndex;
                this.modalData.dataRecord.data = inData;
            }
            this.modalData.Form.formJSON = inJSON;
            this.modalData.Form.formHTML = this.getFormHTMLFromJSON(inJSON, 'modalFormData', inData);

            var myModal = new bootstrap.Modal(document.getElementById('dataModal'));
            myModal.show();
        },

        init() {
            console.log('qfModal loaded...');
        },
    }))
})