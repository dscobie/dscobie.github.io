document.addEventListener('alpine:init', () => {
            Alpine.data('qfModal', () => ({
                modalData: { title: '', dataObject: 'default', dataRecord: {index: -1, data: []}, Form: { formJSON: [], formHTML: ''}},

                // process the form in the modal, return a data object with the results
                getModalFormData() {
                    var formDataRow = {};
        
                    // go thru each field is in the modal form and add it to the data object to be returned
                    theForm = this.modalData.Form.formJSON;
                    for (var j = 0; j < theForm.length; j++) {
                        formDataRow[theForm[j].name] = this.getHTMLFromFieldValue(theForm[j].name, theForm[j].type);
                    }
                    return formDataRow;            
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
        
                            // Alpine.store('qfState').tableAddRecord(modalRecord);

                            this.getCurrentProject().tables[this.getCurrentProjectTableID()].meta.nextDataID++;
                            this.getCurrentProject().tables[this.getCurrentProjectTableID()].data.push(modalRecord);
                        }
                    } else {
                        // Alpine.store('qfState').tableEditRecord(modalRecord);
                        this.getCurrentProject().tables[this.getCurrentProjectTableID()].data[this.qfState.modalData.dataRecord.index] = modalRecord;
                    }

                    // reset the modal form HTML
                    this.modalData.Form.formHTML = '';
                },
                modalFormSaveFieldEdit() {
                    // get the field properties from the modal form as an object
                    var formData = this.getModalFormData();

                    // for the field, the label can have spaces but the name of the field should have any spaces removed
                    formData.label = formData.name;
                    formData.name = formData.name.replace(' ', '');
                    
                    // something like this should replace the below two lines:
                    // Alpine.store('qfState').tableEditField(formData);

                    // update the current table field with the edits captured
                    var currentTable = this.getCurrentProjectTable();
                    currentTable.formJSON[this.modalData.dataRecord.index] = formData;

                    // rebuild the working form with the new table structure
                    currentTable.formHTML = this.getFormHTMLFromJSON(currentTable.formJSON,'editfield');

                    this.saveState();
                },
                modalFormCreateProjectForm() {
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

                    // reset the modal form HTML
                    this.modalData.Form.formHTML = '';

                    this.saveState();
                    this.switchSection('projects');
                },
                modalFormCreateProject() {
                    // get the field properties from the modal form as an object
                    var formData = this.getModalFormData();
                    
                    var nextProjectID = 0;
                    if (this.qfState.projects.length > 0) {
                        nextProjectID = this.qfState.projects[this.qfState.projects.length-1].id;
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
                    this.modalData.Form.formHTML = this.getFormHTMLFromJSON(inJSON, '', inData);

                    var myModal = new bootstrap.Modal(document.getElementById('dataModal'));
                    myModal.show();
                },
        
                init() {
                    console.log('qfModal loaded...');
                },
            }))
})