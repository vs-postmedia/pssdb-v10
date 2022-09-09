import CloudTablesApi from 'cloudtables-api';
import Combobox from './Components/Combobox/Combobox.js';
import agenciesList from './data/agencies.js';

// CSS
import normalize from './css/normalize.css';
import postmedia from './css/postmedia.css';
import colours from './css/colors.css';
import fonts from './css/fonts.css';
import css from './css/main.css';
import cloudtable from'./css/cloudtable.css';

// FONTS
import'./fonts/Shift-Bold.otf';
import'./fonts/Shift-BoldItalic.otf';
import'./fonts/BentonSansCond-Regular.otf';
import'./fonts/BentonSansCond-RegItalic.otf';
import'./fonts/BentonSansCond-Bold.otf';

// VARS
const appId = 'app';
const agencyId = 'dp-1'; // find the ID for the agency column in the data page of your cloudtables dataset
const tableId = 'cloudtable';
const clientId = 'pssdb-v10';
const cloudTableDomain = 'vs-postmedia.cloudtables.me';
const apiKey = 'kcZqiHL7MiUCi1waLZYN1vkz'; // read-only
const cloudTableId = '71636f86-2e5e-11ed-9765-8b941efc3b53'; 

// JS
const init = async () => {
    // create dynamic list of options for agency select tag
    createAgencyComboBox();

    // create combobox filter for agencies
    Combobox('#combobox');
    $('#combobox').change(comboboxChangeHandler);

    // load the unfiltered cloudtable
    loadCloudTable('');
};

function comboboxChangeHandler(e) {
    // reset container dom element
    $('.cloudtables')[0].textContent = '';

    // reload the table with selected agency filtered
    const filterValue = e.target.value === 'All agencies' ? null : e.target.value;

    // reload table
    loadCloudTable(filterValue);
}

function createAgencyComboBox() {
    let agenciesString = '';
    agenciesList.forEach(d => {
        agenciesString += `<option value='${d}'>${d}</option>`;
    });
    
    $('#combobox').append(agenciesString);
}

async function loadCloudTable(agency) {
    let conditionsArray = [
        {
            id: agencyId, 
            value: agency
        }
    ];

    // if the filter has been selected, filter for those options, otherwise show everything (null)
    let conditions = agency ? conditionsArray : null;

    // grab the ct api instance
    let api = new CloudTablesApi(apiKey, {
        clientName: clientId,     // Client's name - optional
        domain: cloudTableDomain,       // Your CloudTables host
        // secure: false,              // Disallow (true), or allow (false) self-signed certificates   
        // ssl: false,               // Disable https
        conditions: conditions      // Use this to filter table
    });


    // get a cloudtables api token
    let token = await api.token();
    // build the script tag for the table
    let script = document.createElement('script');
    script.src = `https://${cloudTableDomain}/io/loader/${cloudTableId}/table/d`;
    script.setAttribute('data-token', token);
    script.setAttribute('data-insert', tableId);
    script.setAttribute('data-clientId', clientId);

    // insert the script tag to load the table
    let app = document.getElementById(appId).appendChild(script);
}

// KICK *SHT OFF!!!
init();