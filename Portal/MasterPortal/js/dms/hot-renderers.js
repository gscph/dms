

function customDropdownRenderer(instance, td, row, col, prop, value, cellProperties) {
    if (value) {

        for (var index = 0; index < optionsList.length; index++) {
            if (value.Id == optionsList[index].id) {
                value.Id == optionsList[index].id;
                value.Name = optionsList[index].text;
            }
        }

        td.innerHTML = value.Name;
        return td;
    }

    Handsontable.TextCell.renderer.apply(this, arguments);
}


function lookupRenderer(optionsList, instance, td, row, col, prop, value, cellProperties) { 
  
    var rowValue = instance.getDataAtRowProp(row, prop);

    if (rowValue != null && (typeof rowValue !== 'undefined') && rowValue != "" && (typeof optionsList !== 'undefined')) {     
        for (var index = 0; index < optionsList.length; index++) {
            if (rowValue == optionsList[index].id) {           
                value = {
                    Id: optionsList[index].id,
                    Name: optionsList[index].text
                };            
            }
        }
        td.style.textAlign = "center";
        if (typeof value.Name !== 'undefined') {
            td.innerHTML = value.Name;
        }      
        return td;
    }
   
    td.style.textAlign = "center";
    td.innerHTML = '';
    return td;    
}

function checkboxRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.style.textAlign = "center";
    Handsontable.renderers.CheckboxRenderer.apply(this, arguments);
}


function dateRenderer(instance, td, row, col, prop, value, cellProperties) {
    isCellReadOnly(cellProperties.readOnly, td);
    td.style.textAlign = "center";
    if (value === null || (typeof value === 'undefined')) {
        return;
    }  

    td.innerHTML = moment(value).format('L');
    return td;
}

function stringRenderer(instance, td, row, col, prop, value, cellProperties) {
    isCellReadOnly(cellProperties.readOnly, td);
    td.style.textAlign = "center";
    if (value === null || (typeof value === 'undefined')) {
        return;
    }
    td.innerHTML = value;
    return td;
}


function multiPropertyRenderer(instance, td, row, col, prop, value, cellProperties) {
    isCellReadOnly(cellProperties.readOnly, td);
    td.style.textAlign = "center";   
    if (value === null || (typeof value === 'undefined')) {
        return;
    }

    td.innerHTML = value.Name;
    return td;
}

function boolRenderer(instance, td, row, col, prop, value, cellProperties) {
    isCellReadOnly(cellProperties.readOnly, td);
    td.style.textAlign = "center";

    if (value === null || (typeof value == 'undefined')) {
        return;
    }

    td.innerHTML = value === true ? 'Yes' : 'No';
    return td;
}

function isCellReadOnly(isReadOnly, td) {
    if (isReadOnly == true) {
        td.classList.add("readonly");
    }
}

