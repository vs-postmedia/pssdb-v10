import CloudTablesApi from 'cloudtables-api';
// import Combobox from './Components/Combobox/Combobox.js';
import agenciesList from './data/agencies.js';

// CSS
import normalize from './css/normalize.css';
import postmedia from './css/postmedia.css';
import colours from './css/colors.css';
import fonts from './css/fonts.css';
import css from './css/main.css';
import cloudtable from'./css/cloudtable.css';
import autocomplete from './css/jquery-ui-autocomplete.css';

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
    setupAgencyCombobox('#combobox');

    // assign change handler
    $('#combobox').change(comboboxChangeHandler);

    // Combobox('#combobox', comboboxChangeHandler, 'Pick an agency...');
    // $('#combobox').change(comboboxChangeHandler);

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

function setupAgencyCombobox(combobox, defaultText) {
    // combobox setup
    $(function() {
        $.widget('custom.combobox', {
          _create: function() {
            this.wrapper = $('<span>')
              .addClass('custom-combobox')
              .insertAfter( this.element );
     
            this.element.hide();
            this._createAutocomplete();
            this._createShowAllButton();
          },
     
          _createAutocomplete: function() {
            var selected = this.element.children(':selected'),
              value = selected.val() ? selected.text() :'';
     
            this.input = $('<input>')
              .appendTo( this.wrapper )
              .val( value )
              .attr('title','')
              .addClass('custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left')
              .autocomplete({
                delay: 0,
                minLength: 0,
                source: this._source.bind( this )
              })
              .tooltip({
                classes: {
                 'ui-tooltip':'ui-state-highlight'
                }
              });
     
            this._on( this.input, {
              autocompleteselect: function( event, ui ) {
                ui.item.option.selected = true;
                this._trigger('select', event, {
                  item: ui.item.option
                });
                // trigger change event
                $('#combobox').trigger('change');
              },
     
              autocompletechange:'_removeIfInvalid'
            });
          },
     
          _createShowAllButton: function() {
            var input = this.input,
              wasOpen = false;
     
            $('<a>')
              .attr('tabIndex', -1 )
              .attr('title','Show All Items')
              .tooltip()
              .appendTo( this.wrapper )
              .button({
                icons: {
                  primary:'ui-icon-triangle-1-s'
                },
                text: false
              })
              .removeClass('ui-corner-all')
              .addClass('custom-combobox-toggle ui-corner-right')
              .on('mousedown', function() {
                wasOpen = input.autocomplete('widget').is(':visible');
              })
              .on('click', function() {
                input.trigger('focus');
     
                // Close if already visible
                if ( wasOpen ) {
                  return;
                }
     
                // Pass empty string as value to search for, displaying all results
                input.autocomplete('search','');
              });
          },
     
          _source: function( request, response ) {
            var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term),'i');
            response( this.element.children('option').map(function() {
              var text = $( this ).text();
              if ( this.value && ( !request.term || matcher.test(text) ) )
                return {
                  label: text,
                  value: text,
                  option: this
                };
            }) );
          },
     
          _removeIfInvalid: function( event, ui ) {
            // Selected an item, nothing to do
            if ( ui.item ) {
              return;
            }
     
            // Search for a match (case-insensitive)
            var value = this.input.val(),
              valueLowerCase = value.toLowerCase(),
              valid = false;
            this.element.children('option').each(function() {
              if ( $( this ).text().toLowerCase() === valueLowerCase ) {
                this.selected = valid = true;
                return false;
              }
            });
     
            // Found a match, nothing to do
            if ( valid ) {
              return;
            }
     
            // Remove invalid value
            this.input
              .val('')
              .attr('title','No matches')
              .tooltip('open');
            this.element.val('');
            this._delay(function() {
              this.input.tooltip('close').attr('title','');
            }, 2500 );
            this.input.autocomplete('instance').term ='';
          },
     
          _destroy: function() {
            this.wrapper.remove();
            this.element.show();
          }
        });
     
        // execute function
        $(combobox).combobox();
    });
}

init();