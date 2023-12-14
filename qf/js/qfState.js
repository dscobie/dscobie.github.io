document.addEventListener('alpine:init', () => {
    Alpine.data('qfState', () => ({
        formFields: ['type', 'columns', 'name', 'label', 'placeholder', 'options'],

        projectTemplate: { id: 0, currentTableID: -1, meta: { name: '', description: '', nextTableID: 0 }, tables: [], enumerators: [] },
        formTemplate: { id: 0, meta: { name: '', description: '', nextFieldID: 0, nextDataID: 0, gridFields: '', useLabelsForCardView: true }, formJSON: [], formHTML: 'Form will be shown here.', data: [], template: '' },
        fieldTemplate: { id: 0, type: '', columns: 0, name: '', label: '', placeholder: '', options: '', required: 'no' },

        editFieldJSON: [{ 'name': 'name', 'type': 'text', 'columns': '12', 'options': [''], 'placeholder': '', 'required': 'no', 'label': 'name' }, { 'type': 'select', 'columns': '6', 'name': 'type', 'label': 'type', 'placeholder': '', 'options': ['text', 'date', 'select', 'radio', 'textarea', 'switch', 'array', 'empty'] }, { 'type': 'select', 'columns': '6', 'name': 'columns', 'label': 'columns', 'placeholder': '', 'options': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] }, { 'name': 'options', 'type': 'array', 'columns': '12', 'options': '', 'placeholder': '', 'required': 'y', 'label': 'options' }, { 'name': 'placeholder', 'type': 'text', 'columns': '12', 'options': '', 'placeholder': 'use for select or radio fields', 'required': '', 'label': 'placeholder' }, { 'name': 'required', 'type': 'select', 'columns': '12', 'options': ['yes', ' no'], 'placeholder': '', 'required': 'y', 'label': 'required' }],
        editProjectCreateJSON: [{ 'name': 'projectname', 'type': 'text', 'columns': '6', 'options': [''], 'placeholder': '', 'required': 'yes', 'label': 'project name' }, { 'name': 'projectdesc', 'type': 'text', 'columns': '6', 'options': [''], 'placeholder': '', 'required': 'yes', 'label': 'project desc' }, { 'name': 'tablename', 'type': 'text', 'columns': '6', 'options': [''], 'placeholder': '', 'required': 'yes', 'label': 'form name' }, { 'name': 'tabledesc', 'type': 'text', 'columns': '6', 'options': [''], 'placeholder': '', 'required': 'yes', 'label': 'form desc' }],
        editProjectTableCreateJSON: [{ 'name': 'tablename', 'type': 'text', 'columns': '6', 'options': [''], 'placeholder': '', 'required': 'yes', 'label': 'form name' }, { 'name': 'tabledesc', 'type': 'text', 'columns': '6', 'options': [''], 'placeholder': '', 'required': 'yes', 'label': 'form desc' }],

        qfState: {
            interface: { currentSection: 'home' },
            projectCurrent: -1,
            tableCurrent: -1,
            projects: [],
            systemTemplates: [],
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

            var tableField = this.parseField(newField);
            tableField.id = this.getCurrentTableNextID();

            return tableField;
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
                        formJSONItem[this.formFields[i]] = inField[this.formFields[i]].trim();
                    }
                }
            }
            formJSONItem.name = formJSONItem.name.replace(' ', '');
            return formJSONItem;
        },
        getHTMLFromFieldValue(inName, inType) {
            var retValue = '';
            if (inType == 'text' || inType == 'date' || inType == 'textarea') {
                retValue = document.getElementById(inName).value;
            }
            if (inType == 'radio') {
                console.log(inName);
                var item = document.getElementsByName(inName);
                console.log(inName + ' has ' + item.length + ' elements.');

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
        getItemCardView(inData, inIndex) {
            var fieldTemplate = '<div class=&quot;col-md-{{size}}&quot;>{{data}}</div>';

            var retValue = '';
            Object.keys(inData).forEach(function (key) {
                if (key != 'qfid') {
                    var addField = fieldTemplate;
                    addField = addField.replace('{{data}}', inData[key]);
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
            retValue = this.qfState.projects[this.qfState.projectCurrent].tables[0].meta.gridFields;
            Object.keys(inData).forEach(function (key) {
                var searchKey = '{{' + key + '}}';
                retValue = retValue.replace(searchKey, inData[key]);
            })
        }
            if (retValue === '') retValue = 'Show Record ' + inIndex;
            return retValue;
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
            // this.saveState();

            //                    this.addNavSectionActive(this.qfState.interface.currentSection);
        },

        // BEGIN GETTERS
        // Various "getters" for the interface, projects, and tables

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
        getCurrentProjectTable() {
            if (this.isProjectSelected())
                return this.getCurrentProject().tables[this.getCurrentProjectTableID()];
            else
                return [];
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