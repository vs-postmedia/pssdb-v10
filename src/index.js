import CloudTablesApi from 'cloudtables-api';
// import'jquery-ui/ui/widgets/autocomplete';
import agenciesList from './data/agencies.js';

// CSS
import normalize from'./css/normalize.css';
import postmedia from'./css/postmedia.css';
import colours from'./css/colors.css';
import fonts from'./css/fonts.css';
import css from'./css/main.css';
import cloudtable from'./css/cloudtable.css';
import autocomplete from'./css/jquery-ui-autocomplete.css';

// FONTS
import'./fonts/Shift-Bold.otf';
import'./fonts/Shift-BoldItalic.otf';
import'./fonts/BentonSansCond-Regular.otf';
import'./fonts/BentonSansCond-RegItalic.otf';
import'./fonts/BentonSansCond-Bold.otf';
import'./fonts/BentonSansCond-BoldItalic.otf';



// VARS
const appId ='app';
const tableId ='cloudtable';
const clientId ='vsun-pssdb-v10';
const cloudTableIp ='138.197.196.21';
const apiKey = '5KhDjJ3plIVSSDRhgm5520Da'; // read-only
let cloudTableId ='61d61386-26fa-11ed-b07d-2b528d595799'; // 93k-row full data

// JS
const init = async () => {
    // create dynamic list of options for agency select tag
    createAgencyComboBox();

    // create combobox filter for agencies
    setupAgencyCombobox('#combobox');

    // load the unfiltered cloudtable
    loadCloudTable('');
};

function comboboxChangeHandler(e) {
    // reset container dom element
    $('.cloudtables')[0].textContent ='';

    // reload the table with selected agency filtered
    const filterValue = e.target.value ==='all'? null : e.target.value;

    console.log(filterValue)
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
            id:'dp-9', // find this in the data page your cloudtables dataset
            value: agency
        }
    ];

    // if the filter has been selected, filter for those options, otherwise show everything (null)
    let conditions = agency ? conditionsArray : null;

    // grab the ct api instance
    let api = new CloudTablesApi(apiKey, {
        clientName:'pssdb_v10',          // Client's name - optional
        domain: cloudTableIp,       // Your CloudTables host
        ssl: false,                 // Disable https
        conditions: conditions      // Use this to filter table
    });

    // let script_tag = await api.dataset('61d61386-26fa-11ed-b07d-2b528d595799').scriptTagAsync();

    // build the script tag for the table
    let token = await api.token();
    let script = document.createElement('script');
    script.src = `http://${cloudTableIp}/io/loader/${cloudTableId}/table/d`;
    script.setAttribute('data-token', token);
    script.setAttribute('data-insert', tableId);
    script.setAttribute('data-clientId', clientId);

    // insert the script tag to load the table
    let app = document.getElementById(appId).appendChild(script);
}

function setupAgencyCombobox(combobox, defaultText) {
    // change handler
    $(combobox).change(comboboxChangeHandler);

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
                console.log($('#combobox'))
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