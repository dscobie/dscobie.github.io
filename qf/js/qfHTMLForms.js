document.addEventListener('alpine:init', () => {
            Alpine.data('qfHTMLForms', () => ({
                formHiddenTemplate: '<input type="hidden" id="[[name2]]" value="[[value]]">',
                formTextTemplate: '<div class="col-sm-[[size]]"><label for="[[name]]" class="form-label">[[label]]</label><input type="[[type]]" class="form-control" id="[[name2]]" value="[[value]]" placeholder="[[placeholder]]"></div>',
                formTextTemplateOld: '<div class="col-sm-[[size]]"><label for="[[name]]" class="form-label">[[label]]</label><input type="[[type]]" class="form-control" id="[[name2]]" value="[[value]]" placeholder="[[placeholder]]"></div>',
                formDateTemplate: '<div class="col-sm-[[size]]"><label for="[[name]]" class="form-label">[[label]]</label><input type="[[type]]" class="form-control" id="[[name2]]" value="[[value]]" placeholder="[[placeholder]]"></div>',
                formTextAreaTemplate: '<div class="col-sm-[[size]]"><label for="[[name]]" class="form-label">[[label]]</label><textarea class="form-control" id="[[name2]]" placeholder="[[placeholder]]">[[value]]</textarea></div>',
                formEmptyTemplate: '<div class="col-sm-[[size]]"></div>',
                formSelectTemplate: '<div class="col-sm-[[size]]"><label for="[[name]]" class="form-label">[[label]]</label><select class="form-select" id="[[name2]]"><option disabled value="">Choose One...</option>[[options]]</select></div>',
                formRadioTemplate: '<div class="form-check"><input class="form-check-input" type="[[type]]" name="[[name]]" id="[[namevalue]]" [[checked]]><label class="form-check-label" for="[[namevalue2]]">[[value]]</label></div>',
                formSwitchTemplate: '<div class="form-check form-switch col-sm-[[size]]"><input class="form-check-input" type="checkbox" role="switch" id="[[name]]" [[checked]]><label class="form-check-label" for="[[name2]]">[[label]]</label></div>',        
     
                buildTextField(inField, inValue='') {
                    var newField = '';
        
                    if (inField.type == 'date') {
                        newField = this.formDateTemplate;
                        if (inValue == '')
                            newField = newField.replace('[[value]]', new Date().toISOString().slice(0, 10));
                        else
                            newField = newField.replace('[[value]]', inValue);
        
                    } else {
                        newField = this.formTextTemplate;
                    }
                    newField = newField.replace('[[type]]', inField.type);
                    newField = newField.replace('[[size]]', inField.columns);
                    newField = newField.replace('[[name]]', inField.name);
                    newField = newField.replace('[[name2]]', inField.name);
                    newField = newField.replace('[[value]]', inValue);
                    if (inField.label)
                        newField = newField.replace('[[label]]', inField.label);
                    else
                        newField = newField.replace('[[label]]', '');
                    if (inField.placeholder)
                        newField = newField.replace('[[placeholder]]', inField.placeholder);
                    else
                        newField = newField.replace('[[placeholder]]', '');
                    return newField;
                },
                buildHiddenField(inName, inValue = '') {
                    var newField = this.formHiddenTemplate;
        
                    newField = newField.replace('[[name]]', inName);
                    newField = newField.replace('[[name2]]', inName);
                    newField = newField.replace('[[value]]', inValue);
                    return newField;
                },
                buildTextAreaField(inField, inValue = '') {
                    var newField = this.formTextAreaTemplate;
                    // newField = newField.replace('[[type]]', inField.type);
                    if (inField.label)
                        newField = newField.replace('[[label]]', inField.label);
                    else
                        newField = newField.replace('[[label]]', '');
                    newField = newField.replace('[[size]]', inField.columns);
                    newField = newField.replace('[[name]]', inField.name);
                    newField = newField.replace('[[name2]]', inField.name);
                    newField = newField.replace('[[value]]', inValue);
                    if (inField.placeholder)
                        newField = newField.replace('[[placeholder]]', inField.placeholder);
                    else
                        newField = newField.replace('[[placeholder]]', '');
                    return newField;
                },
                buildSwitchField(inField, inValue = '') {
                    var newField = this.formSwitchTemplate;
                    if (inField.label)
                        newField = newField.replace('[[label]]', inField.label);
                    else
                        newField = newField.replace('[[label]]', '');
                    newField = newField.replace('[[size]]', inField.columns);
                    newField = newField.replace('[[name]]', inField.name);
                    newField = newField.replace('[[name2]]', inField[2]);
                    if (inField.placeholder)
                        newField = newField.replace('[[placeholder]]', inField.placeholder);
                    else
                        newField = newField.replace('[[placeholder]]', '');
                    return newField;
                },
                buildEmptyField(inField) {
                    var newField = this.formEmptyTemplate;
                    return newField;
                },
                buildSelectField(inField, inValue = '') {
                    var newField = this.formSelectTemplate;
                    if (inField.label)
                        newField = newField.replace('[[label]]', inField.label);
                    else
                        newField = newField.replace('[[label]]', '');
                    newField = newField.replace('[[size]]', inField.columns);
                    newField = newField.replace('[[name]]', inField.name);
                    newField = newField.replace('[[name2]]', inField.name);
                    var optionsList = '';
                    for (var j = 0; j < inField.options.length; j++) {
                        if (inField.options[j] === inValue) {
                            optionsList += '<option selected>';
                        } else {
                            optionsList += '<option>';    
                        }
                        optionsList += inField.options[j] + '</option>';
                    }
                    newField = newField.replace('[[options]]', optionsList);
        
                    return newField;
                },
                buildRadioField(inField, inValue = '') {
                    var radioPre = '<div class="col-md-[[size]]"><label for="[[name2]]" class="form-label">[[label]]</label>';
                    var radioPost = '</div>'
                    var newField = radioPre;
        
                    var radiosList = '';
                    for (var j = 0; j < inField.options.length; j++) {
                        var namevalue = inField.name + inField.options[j];
                        radiosList += this.formRadioTemplate;
                        radiosList = radiosList.replace('[[type]]', inField.type);
                        radiosList = radiosList.replace('[[value]]', inField.options[j]);
                        radiosList = radiosList.replace('[[name]]', inField.name);
                        radiosList = radiosList.replace('[[namevalue]]', namevalue);                
                        radiosList = radiosList.replace('[[namevalue2]]', namevalue);   
                        if (inField.options[j] === inValue) {
                            radiosList = radiosList.replace('[[checked]]', 'checked');
                        } else {
                            radiosList = radiosList.replace('[[checked]]', '');
                        }
                    }
                    newField += radiosList
                    newField += radioPost;
                    newField = newField.replace('[[name2]]', inField.name);
                    newField = newField.replace('[[size]]', inField.columns);
                    newField = newField.replace('[[label]]', inField.label);
                    return newField;
                    },

                    buildFieldHTML(formJSONItem, inValue = '') {
                        // Alpine.store('qfState').logCounter();
                        var newField = '';
                        var fieldType = formJSONItem['type'];
                        if (fieldType == 'text' || fieldType == 'email' || fieldType == 'password' || fieldType == 'file'  || fieldType == 'date' || fieldType == 'array') {
                            newField = this.buildTextField(formJSONItem, inValue);
                        }
                        if (fieldType == 'textarea') {
                            newField = this.buildTextAreaField(formJSONItem, inValue);
                        }
                        if (fieldType == 'empty') {
                            newField = this.buildEmptyField(formJSONItem, inValue);
                        }
                        if (fieldType == 'select') {
                            newField = this.buildSelectField(formJSONItem, inValue);
                        }
                        if (fieldType == 'switch') {
                            newField = this.buildSwitchField(formJSONItem, inValue);
                        }
                        if (fieldType == 'radio' || fieldType == 'checkbox') {
                            newField = this.buildRadioField(formJSONItem, inValue);
                        }
                        return newField;
                    },
                    getFormHTMLFromJSON(formJSON, unique, inData) {
                        var formPre = '<form id="' + unique + '" class="row g-3">';
                        var formPost = '</form>';
                        var formHTML = '';
                        formHTML += formPre;
                        var fieldValue = undefined;
                        var formJSONItem = {};
                        for (var j = 0; j < formJSON.length; j++) {
                            fieldValue = undefined;
                            formJSONItem = formJSON[j];
            
                            var newField = '';
                            var fieldType = formJSONItem.type;
            
                            if (inData != undefined) {
                                fieldValue = inData[formJSONItem.name];
                            }
                            newField = this.buildFieldHTML(formJSONItem, fieldValue);
                            formHTML += newField;
            
                            formJSONItem = {};
                        }
            
                        formHTML += formPost;
            
                        return formHTML;
                    },
                        
                init() {
                    console.log('qfHTMLForms loaded...');
                },
            }))
})
