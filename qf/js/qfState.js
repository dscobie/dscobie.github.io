document.addEventListener('alpine:init', () => {
    Alpine.data('qfState', () => ({
        formFields: ['type', 'columns', 'name', 'label', 'placeholder', 'required', 'options', 'relation', 'description'],
        fieldTypes: ['text', 'number', 'date', 'textarea', 'file', 'url', 'select', 'radio', 'switch', 'array', 'empty', 'relation'],
        projectTemplate: { id: 0, currentTableID: -1, meta: { name: '', description: '', nextTableID: 0 }, tables: [], enumerators: [] },
        formTemplate: { id: 0, meta: { name: '', description: '', nextFieldID: 0, nextDataID: 0, gridFields: '', useLabelsForCardView: true }, formJSON: [], formHTML: 'Form will be shown here.', data: [], template: '' },
        fieldTemplate: { id: 0, type: '', columns: 0, name: '', label: '', placeholder: '', options: '', required: 'no', relation: {} },

        editFieldJSON: [{ 'name': 'label', 'type': 'text', 'columns': '12', 'options': [''], 'placeholder': '', 'required': 'no', 'label': 'name' }, { 'name': 'description', 'type': 'text', 'columns': '12', 'options': [''], 'placeholder': '', 'required': 'no', 'label': 'description' }, { 'type': 'select', 'columns': '6', 'name': 'type', 'label': 'type', 'placeholder': '', 'options': ['text', 'date', 'select', 'radio', 'textarea', 'switch', 'array', 'empty'] }, { 'type': 'select', 'columns': '6', 'name': 'columns', 'label': 'columns', 'placeholder': '', 'options': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] }, { 'name': 'options', 'type': 'array', 'columns': '12', 'options': '', 'placeholder': '', 'required': 'y', 'label': 'options' }, { 'name': 'placeholder', 'type': 'text', 'columns': '6', 'options': '', 'placeholder': 'use for select or radio fields', 'required': '', 'label': 'placeholder' }, { 'name': 'required', 'type': 'select', 'columns': '6', 'options': ['yes', 'no'], 'placeholder': '', 'required': 'yes', 'label': 'required' }],
        editProjectCreateJSON: [{ 'name': 'projectname', 'type': 'text', 'columns': '6', 'options': [''], 'placeholder': '', 'required': 'yes', 'label': 'project name' }, { 'name': 'projectdesc', 'type': 'text', 'columns': '6', 'options': [''], 'placeholder': '', 'required': 'yes', 'label': 'project desc' }, { 'name': 'tablename', 'type': 'text', 'columns': '6', 'options': [''], 'placeholder': '', 'required': 'yes', 'label': 'form name' }, { 'name': 'tabledesc', 'type': 'text', 'columns': '6', 'options': [''], 'placeholder': '', 'required': 'yes', 'label': 'form desc' }],
        editProjectTableCreateJSON: [{ 'name': 'tablename', 'type': 'text', 'columns': '6', 'options': [''], 'placeholder': '', 'required': 'yes', 'label': 'form name' }, { 'name': 'tabledesc', 'type': 'text', 'columns': '6', 'options': [''], 'placeholder': '', 'required': 'yes', 'label': 'form desc' }, { 'name': 'file', 'type': 'file', 'columns': '12', 'options': [''], 'placeholder': '', 'required': 'yes', 'label': 'start with existing JSON file' },  { 'type': 'textarea', 'columns': '12', 'name': 'orpastefilebelow', 'label': 'or paste JSON file below', 'placeholder': '', 'required': 'no', 'options': ['' ], 'relation': {}, 'description': '', 'id': 3  }],
        editFileUploadJSON: [{ 'type': 'select', 'columns': '12', 'name': 'DataType', 'label': 'Data Type', 'placeholder': '', 'required': 'no', 'options': ['JSON','CSV' ], 'relation': {}, 'description': '', 'id': 0  },  { 'type': 'select', 'columns': '12', 'name': 'Whatshouldbedone', 'label': 'What should be done?', 'placeholder': '', 'required': 'no', 'options': ['Replace structure and data','Replace data','Append data' ], 'relation': {}, 'description': '', 'id': 1  },  { 'type': 'file', 'columns': '12', 'name': 'file', 'label': 'File', 'placeholder': '', 'required': 'no', 'options': ['' ], 'relation': {}, 'description': '', 'id': 2  },  { 'type': 'textarea', 'columns': '12', 'name': 'orpastefilebelow', 'label': 'or paste file below', 'placeholder': '', 'required': 'no', 'options': ['' ], 'relation': {}, 'description': '', 'id': 3  }],

        qfState: {
            interface: { currentSection: 'home', currentViewRecord: 0, currentDataListPage: 0, dataListShow: 25 },
            projectCurrent: -1,
            s: -1,
            projects: [],
            systemTemplates: [],

            linkTableSelected: "",
            fieldType: 'text',

            workingForm: { id: 0, meta: { name: '', description: '', nextFieldID: 1, nextDataID: 1, gridFields: '', useLabelsForCardView: true }, formJSON: [], formHTML: 'Form will be shown here.', data: [] },
            modalData: { title: '', dataObject: 'default', dataRecord: { index: -1, data: [] }, Form: { formJSON: [], formHTML: '' } }
        },

        tableAddField() {
            // parse new field that user is trying to create
            var newField = this.addField();

            // add the field to the current table
            var tableJSON = this.getCurrentProjectTableFormJSON();

            tableJSON.push(newField);

            // generate the new form HTML preview with the new field
            var tableHTML = this.getFormHTMLFromJSON(tableJSON, 'preview');

            // add field to any existing data records
            this.addFieldToFormData(newField.name);

            // update the working form HTML and JSON fields with the new data
            this.setCurrentProjectTableFormHTML(tableHTML);

            this.saveState();

            // reset the form on the page for the user
            var addForm = document.getElementById('addField');
            addForm.reset();

            // this.showNavTab('nav-design-preview-tab');
        },

        setCurrentProjectTableFormHTML(inHTML) {
            var currentTable = this.getCurrentProjectTable();
            currentTable.formHTML = inHTML;
        },

        // addField takes the user input from a form and creates a new data record
        // in the current projects open table
        addField() {
            var newField = { ...this.fieldTemplate };
            var addForm = document.getElementById('addField').elements;

            newField.type = addForm.type.value;
            newField.columns = addForm.columns.value;
            newField.label = addForm.name.value;
            newField.name = addForm.name.value.replace(' ', '');;
            newField.placeholder = '';
            newField.options = addForm.options.value;
            newField.required = 'no';

            if (newField.type === 'relation') {
                var relationLink = {};
                relationLink.table = addForm.linktable.value;
                relationLink.field = addForm.linktablefield.value;
                relationLink.type = addForm.linktype.value;

                relationLink.data = [];
                newField.relation = relationLink;
            }

            var tableField = this.parseField(newField);
            tableField.id = this.getCurrentTableNextID();

            return tableField;
        },
        downloadCurrentProjectDataJSON() {
            var downloadTableName = this.getCurrentProjectTableName().replace(' ','_') + '.json';
            
            this.downloadJSONFile(this.getCurrentProjectTableData(), downloadTableName)
        },
        downloadJSONFile(data, filename){
            // Creating a blob object from non-blob data using the Blob constructor
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            // Create a new anchor element
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || 'download';
            a.click();
            a.remove();
        },
        getCSVFromJSON(inJSON) {
            const items = inJSON;
            const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
            const header = Object.keys(items[0])
            const csv = [
              header.join(','), // header row first
              ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
            ].join('\r\n')
            console.log(csv);
        },
        getCurrentTableNextID() {
            var currentTable = this.getCurrentProjectTable();

            var nextID = currentTable.meta.nextFieldID;
            currentTable.meta.nextFieldID++;

            return nextID;
        },
        parseField(inField) {
            var formJSONItem = {};

            for (var i = 0; i < this.formFields.length; i++) {

                // check if it's the options field...if so split options into array
                if (this.formFields[i] === 'options') {
                    formJSONItem[this.formFields[i]] = [];
                    if (inField.options != undefined) {
                        formJSONItem[this.formFields[i]] = inField.options.trim().split(',');
                        for (j = 0; j < formJSONItem[this.formFields[i]].length; j++) {
                            formJSONItem[this.formFields[i]][j] = formJSONItem[this.formFields[i]][j].trim();
                        }
                    }
                } else {
                    // if the field is not defined, set it to empty in the JSON
                    if (inField[this.formFields[i]] === undefined) {
                        formJSONItem[this.formFields[i]] = '';
                    } else {
                        formJSONItem[this.formFields[i]] = inField[this.formFields[i]];
                        if (this.formFields[i] != 'relation')
                            formJSONItem[this.formFields[i]] = inField[this.formFields[i]].trim();
                    }
                }
            }
            formJSONItem.name = formJSONItem.name.replace(' ', '');

            return formJSONItem;
        },
        getHTMLFromFieldValue(inName, inType) {
            var retValue = '';
            if (inType == 'text' || inType == 'date' || inType == 'textarea' || inType == 'number' || inType == 'url') {
                retValue = document.getElementById(inName).value;
            }
            if (inType == 'file') {
                retValue = document.getElementById(inName);
            }
            if (inType == 'radio') {
                var item = document.getElementsByName(inName);
            }
            if (inType == 'select') {
                var item = document.getElementById(inName);
                retValue = item.options[item.selectedIndex].text;
            }
            if (inType == 'array') {
                var item = document.getElementById(inName);
                retValue = item.value.trim().split(',')
                for (j = 0; j < retValue.length; j++) {
                    retValue[j] = retValue[j].trim();
                }
            }
            if (inType == 'relation') {
                var item = document.getElementById(inName);
                retValue = item.options[item.selectedIndex].value;
            }
            return retValue;
        },
        saveCurrentForm() {
            var newObject = { ...this.projectTemplate };
            newObject.meta.name = document.getElementById('saveTitle').value;
            newObject.meta.description = document.getElementById('saveDesc').value;
            newObject.meta.currentTable = 0;

            this.qfState.workingForm.meta.name = document.getElementById('saveTitle').value;
            this.qfState.workingForm.meta.description = document.getElementById('saveDesc').value;

            newObject.tables.push({ ...this.qfState.workingForm });

            var saveType = document.getElementById('saveType');
            var objectType = saveType.options[saveType.selectedIndex].text;

            if (objectType == 'project') {
                newObject.id = this.qfState.projects.length;
                this.qfState.projects.push(newObject);
                this.qfState.projectCurrent = newObject.id;

            }
            if (objectType == 'data widget') {
                this.qfState.systemTemplates.push(newObject);
            }
            this.saveState();

            const toastLiveExample = document.getElementById('liveToast');
            const toast = new bootstrap.Toast(toastLiveExample);
            toast.show();

        },
        deleteFormField(inIndex) {
            var thisTable = this.qfState.projects[this.qfState.projectCurrent].tables[this.getCurrentProjectTableID()];
            var thisField = thisTable.formJSON[inIndex];
            var thisFieldName = thisField.name;
            var answer = confirm('Do you wish to delete ' + thisField.label + '?');
            if (answer) {
                this.deleteFieldFromFormDefinition(inIndex);
                this.deleteFieldFromFormData(thisFieldName);
                this.rebuildFormHTML();
                this.saveState();
            }
        },
        rebuildFormHTML() {
            var thisTable = this.qfState.projects[this.qfState.projectCurrent].tables[this.getCurrentProjectTableID()];
            var thisTableDef = thisTable.formJSON;

            var newHTML = this.getFormHTMLFromJSON(thisTableDef, 'formpreview');
            thisTable.formHTML = newHTML;
        },
        deleteFieldFromFormDefinition(inIndex) {
            var thisTableDef = this.qfState.projects[this.qfState.projectCurrent].tables[this.getCurrentProjectTableID()].formJSON;

            thisTableDef.splice(inIndex, 1);
        },
        addFieldToFormData(inName) {
            var thisTableData = this.qfState.projects[this.qfState.projectCurrent].tables[this.getCurrentProjectTableID()].data;
            thisTableData.forEach(item => { item[inName] = ''; });
        },
        deleteFieldFromFormData(inName) {
            var thisTableData = this.qfState.projects[this.qfState.projectCurrent].tables[this.getCurrentProjectTableID()].data;
            thisTableData.forEach(item => { delete item[inName]; });
        },
        deleteDataRecord(inIndex) {
            var thisTable = this.qfState.projects[this.qfState.projectCurrent].tables[this.getCurrentProjectTableID()].data;
            var answer = confirm('Delete ' + thisTable[inIndex].title + '?');
            if (answer) {
                thisTable = thisTable.splice(inIndex, 1);
                this.saveState();
            }
        },
        switchProject(inProject) {

            if (this.isProjectSelected()) {
                var project = this.getCurrentProject();
                project.currentTableID = -1;
            }

            this.qfState.projectCurrent = inProject;
            this.saveState();

            if (inProject == -1)
                this.switchSection('home');
            else
                this.switchSection('projects');
        },
        projectSwitchTable(inTable) {
            var table = this.getCurrentProjectTable(inTable);
            var project = this.getCurrentProject();
            project.currentTableID = inTable;

            this.qfState.linkTableSelected = "";
            this.qfState.interface.currentViewRecord = 1;
            this.qfState.interface.currentDataListPage = 1;

            // this.getCSVFromJSON(this.getCurrentProjectTableData());
            // this.downloadJSONFile(this.getCurrentProjectTableData(), "dmsdownload.json")

            this.saveState();
        },
        switchSection(inSection) {
            this.qfState.interface.currentSection = inSection;
            this.saveState();
        },
        showNavTab(inTab) {
            var triggerEl = document.getElementById(inTab);
            var tabTrigger = new bootstrap.Tab(triggerEl);
            tabTrigger.show();
        },
        addNavSectionActive(section) {
            var navItem = document.getElementById('nav-link-' + section);
            navItem.classList.add('active');
        },
        removeNavSectionActive(section) {
            var navItem = document.getElementById('nav-link-' + section);
            navItem.classList.remove('active');
        },
        clearEverything() {
            this.qfState.projectCurrent = -1;
            this.qfState.projects = [];

            this.saveState();

            window.localStorage.setItem('currQFState', null);

            this.showNavTab('nav-design-design-tab');
        },
        saveState() {
            window.localStorage.setItem('currQFState', JSON.stringify(this.qfState));
        },
        setLocalStorageJSON(inVariable, inData) {
            window.localStorage.setItem(inVariable, JSON.stringify(inData));
        },
        saveProjectMetaInfo() {
            var editForm = document.getElementById('projectmetaform').elements;
            var currProject = this.getCurrentProject();
            currProject.meta.name = editForm.projectname.value;
            currProject.meta.description = editForm.projectdesc.value;

            this.saveState();
        },
        saveFormMetaInfo() {
            var editForm = document.getElementById('formmetaform').elements;
            var currTable = this.getCurrentProjectTable();
            currTable.meta.name = editForm.formname.value;
            currTable.meta.description = editForm.formdesc.value;
            currTable.meta.gridFields = editForm.formgridfields.value;

            this.saveState();
        },
        getFilledTemplateFromData(inData, inTemplate) {
            var retValue = this.getCardTemplateFromJSON(inTemplate);
            Object.keys(inData).forEach(function (key) {
                var searchKey = '{{' + key + '}}';
                retValue = retValue.replace(searchKey, inData[key]);
            })
            return retValue;
        },
        getCardTemplateFromJSON(formJSON) {
            var fieldTemplate = '<div class=&quot;col-md-{{size}}&quot;>{{data}}</div>'
            var fieldValue = '';
            var fieldColumns = 0;
            var result = '';

            for (var j = 0; j < formJSON.length; j++) {
                formJSONItem = formJSON[j];

                fieldValue = '{{' + formJSONItem.name + '}}';
                fieldColumns = formJSONItem.columns;

                var newField = fieldTemplate;
                newField = newField.replace('{{size}}', fieldColumns);
                newField = newField.replace('{{data}}', fieldValue);

                result += newField;
            }
            result = '<div class=&quot;row text-left mb-3&quot;>' + result + '</div>';
            return result;
        },
        showItem(inItem) {
            var templateDetail = document.querySelector('#dataTemplateDetail');
            var templateList = document.querySelector('#dataTemplateList');
            if (inItem === -1) {
                templateList.style.display = '';
                templateDetail.style.display = 'none';
            } else {
                templateList.style.display = 'none';
                templateDetail.style.display = '';

                var templateList = document.querySelector('#dataTemplateDetail');
                templateList.hide;

                var showTemplate = this.qfState.projects[this.qfState.projectCurrent].tables[this.getCurrentProjectTableID()].formJSON;

                var showData = this.qfState.projects[this.qfState.projectCurrent].tables[this.getCurrentProjectTableID()].data[inItem];
                var result = this.getFilledTemplateFromData(showData, showTemplate);

                var cardDetail = document.querySelector('#cardDetail');
                cardDetail.innerHTML = result;
            }

            // var template = document.querySelector('#dataTemplateDetail').innerHTML;
            // var clone = template;
            // clone = clone.replace('{{data}}', result);

            return '';
        },
        getItemCardView(inIndex) {
            var fieldTemplate = '<div class="col-sm-{{size}}"><span style="color:#ccc; font-size:smaller;">{{label}}</span><br/>{{data}}</div>';
        
            var fieldValue = '';
            var fieldColumns = 0;
            var result = '';

            if (this.getCurrentProjectTableID() != -1) {
                var dataList = this.getCurrentProjectTableData();
                var dataRow = dataList[inIndex];
                
                var formJSON = this.getCurrentProjectTableFormJSON();

                for (var j = 0; j < formJSON.length; j++) {
                    var formJSONItem = formJSON[j];

                    // don't show the system generated ID field on the card
                    if (formJSONItem.name != 'qfid') {
                        fieldColumns = formJSONItem.columns;

                        // if it's a relation field, you need to lookup the value in the relation data definition
                        if (formJSONItem.type != 'relation') {
                            fieldValue = dataRow[formJSONItem.name];
                        } else {
                            var fieldName = this.getCurrentProject().tables[parseInt(formJSONItem.relation.table)].formJSON[formJSONItem.relation.field].name;
                            fieldValue = dataRow[formJSONItem.name][0][fieldName];
                        }

                        var newField = fieldTemplate;
                        newField = newField.replace('{{label}}', formJSONItem.label.toUpperCase());
                        newField = newField.replace('{{size}}', fieldColumns);
                        newField = newField.replace('{{data}}', fieldValue);

                        result += newField;
                    }
                }
                result = '<div class="row text-left g-3 mb-3">' + result + '</div>';
            }
            return result;
        },
        getItemCardViewOld(inData, inIndex) {
            var fieldTemplate = '<div class="col-md-{{size}}">{{data}}</div>';

            var retValue = '';
            Object.keys(inData).forEach(function (key) {
                if (key != 'qfid' && key != 'relation') {
                    var addField = fieldTemplate;
                    addField = addField.replace('{{data}}', inData[key]);
                    addField = addField.replace('{{size}}', '12');
                    addField = addField.replace('{{index}}', inIndex);
                    retValue += addField;
                }
                if (key == 'relation') {
                    var relationData = inData.relation;
                    var relationText = 'No data selected.'
                    console.log(relationData);
                    if (relationData.length > 0) {

                    }
                    var addField = fieldTemplate;
                    addField = addField.replace('{{data}}', relationText);
                    addField = addField.replace('{{size}}', '12');
                    addField = addField.replace('{{index}}', inIndex);
                    retValue += addField;

                }
            })
            if (retValue === '')
                retValue = 'Show Record ' + inIndex;
            else {
                //retValue = '<div class=&quot;container text-center&quot;><div class=&quot;row&quot;>' + retValue + '</div></div>'
                var nothing = 1;
            }
            return retValue;
        },
        getGoodDisplayName(inData, inIndex) {
            var retValue = '';
            if (this.isProjectTableSelected()) {
                retValue = this.getCurrentProjectTable().meta.gridFields;

                Object.keys(inData).forEach(function (key) {
                    var searchKey = '{{' + key + '}}';
                    retValue = retValue.replace(searchKey, inData[key]);
                })
            }
            if (retValue === '') retValue = 'Show Record ' + inIndex;
            return retValue;
        },
        updateCurrentDataListPage(inVal) {
            if (inVal == -1) {
                if (this.qfState.interface.currentDataListPage > 1) {
                    this.qfState.interface.currentDataListPage--;
                }
            }
            if (inVal == 1) {
                if (this.qfState.interface.currentDataListPage < this.getDataListPageCount()) {
                    this.qfState.interface.currentDataListPage++;
                }
            }
        },
        updateViewRecord(inVal) {
            if (inVal == -1) {
                if (this.qfState.interface.currentViewRecord > 1) {
                    this.qfState.interface.currentViewRecord--;
                }
            }
            if (inVal == 1) {
                if (this.qfState.interface.currentViewRecord < this.getCurrentProjectTableData().length) {
                    this.qfState.interface.currentViewRecord++;
                }
            }
        },
        init() {
            // when starting the site, check to see if there is a previous instance in localstorage.
            // if there is, load the users previous state into the browser.
            if (JSON.parse(window.localStorage.getItem('currQFState')) != null) {
                this.qfState = JSON.parse(window.localStorage.getItem('currQFState'));
            }

            console.log('qfState initialized with ' + this.qfState.projects.length + ' project(s) loaded.');

            // this.qfState.projectCurrent = 0;
            // var cProject = this.getCurrentProject();

            // cProject.currentTableID = 0;

            this.qfState.interface.currentDataListPage = 1;
            this.saveState();

            //this.addNavSectionActive(this.qfState.interface.currentSection);
        },

        // BEGIN GETTERS
        // Various "getters" for the interface, projects, and tables

        getDataListPageCount() {
            var count = Math.ceil(this.getCurrentProjectTableData().length / this.qfState.interface.dataListShow);
            return count;
        },
        isProjectTableSelected() {
            var retValue = true;
            if (this.getCurrentProjectID() == -1) { retValue = false };
            if (this.getCurrentProjectTableID() == -1) { retValue = false };
            return retValue;
        },
        isProjectSelected() {
            var retValue = true;
            if (this.getCurrentProjectID() == -1) {
                retValue = false
            };
            return retValue;
        },
        getInterfaceSection() {
            return this.qfState.interface.currentSection;
        },
        getProjects() {
            return this.qfState.projects;
        },
        getCurrentProjectID() {
            return this.qfState.projectCurrent;
        },
        getCurrentProject() {
            if (this.qfState.currentProject == -1) {
                return null;
            } else {
                return this.qfState.projects[this.getCurrentProjectID()];
            }
        },
        getCurrentProjectName() {
            if (this.isProjectSelected())
                return this.getCurrentProject().meta.name;
            else
                return '';
        },
        getCurrentProjectDescription() {
            if (this.isProjectSelected())
                return this.getCurrentProject().meta.description;
            else
                return '';
        },
        getCurrentProjectTableID() {
            if (this.isProjectSelected())
                return this.getCurrentProject().currentTableID;
            else
                return -1;
        },
        getCurrentProjectTables() {
            if (this.isProjectSelected())
                return this.getCurrentProject().tables;
            else
                return [];
        },
        getCurrentProjectTablesNotSelected() {
            if (this.isProjectSelected())
                return this.getCurrentProject().tables.filter((table) => table.id != this.getCurrentProjectTableID());
            else
                return [];
        },
        getCurrentLinkTableFields() {
            if (this.qfState.linkTableSelected) {
                return this.getCurrentProject().tables[this.qfState.linkTableSelected].formJSON;
            } else {
                return [];
            }
        },
        getCurrentProjectTable() {
            if (this.isProjectSelected())
                return this.getCurrentProject().tables[this.getCurrentProjectTableID()];
            else
                return [];
        },
        setCurrentProjectTableData(inData) {
            if (this.isProjectTableSelected())
                this.getCurrentProjectTable().data = inData;
            else
                return false;
        },
        getCurrentProjectTableData() {
            if (this.isProjectTableSelected())
                return this.getCurrentProjectTable().data;
            else
                return [];
        },
        getCurrentProjectTableName() {
            if (this.isProjectTableSelected())
                return this.getCurrentProjectTable().meta.name;
            else
                return '';
        },
        getCurrentProjectTableDesc() {
            if (this.isProjectTableSelected())
                return this.getCurrentProjectTable().meta.description;
            else
                return '';
        },
        getCurrentProjectTableGridFields() {
            if (this.isProjectTableSelected())
                return this.getCurrentProjectTable().meta.gridfields;
            else
                return '';
        },
        getCurrentProjectTableFormJSON() {
            return this.getCurrentProjectTable().formJSON;
        },
        getCurrentProjectTableFormHTML() {
            return this.getCurrentProjectTable().formHTML;
        },
        getCurrentProjectTableDataItem(inID) {
            return this.getCurrentProjectTable().data[inID];
        },
        getCurrentProjectTableJSON() {
            var table = this.getCurrentProjectTable();
            return table.formJSON;
        },
        setCurrentProjectTableJSON(inJSON) {
            var table = this.getCurrentProjectTable();
            table.formJSON = inJSON;
        },
        getProjectTotalDataCounts(index) {
            var count = this.qfState.projects[index].tables.length
            var result = '[ ';
            if (count == 1) {
                result += count + ' TABLE';
            } else {
                result += count + ' TABLES';
            }
            var rowCount = 0;
            this.qfState.projects[index].tables.forEach((
                table) => rowCount += table.data.length);

            result += ', ' + rowCount + ' ROWS';
            result += ' ]';
            return result;

        },
        // END GETTERS

    }))
})