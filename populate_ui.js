var TWENTY_FOUR_HOURS_IN_MS = 86400000;

function populate_dropdown( contact_names ) {
    document.getElementById('contact_placeholder').innerHTML = 'Choose a contact...';
    
    for ( var i = 0; i < contact_names.length; i++ ) {
        var option_tag = document.createElement('option');
        
        option_tag.setAttribute( 'id',    contact_names[i] );
        option_tag.setAttribute( 'value', contact_names[i] );

        option_tag.innerHTML = contact_names[i];

        document.getElementById('contacts').appendChild(option_tag);
    }
}

function new_conversation( all_conversations, event ) {
    document.getElementById('phone_content').innerHTML = '';
    
    load_conversation( all_conversations, event.target.value );
}

function load_conversation( all_conversations, contact_name ) {
    var messages = all_conversations[contact_name].messages;
    
    for ( var i = 0; i < messages.length; i++ ) {
        var message_class_type = 'message_from_you';
        var div_tag            = document.createElement('div');
        
        if ( messages[i].type == 1 ) {
            message_class_type = 'message_to_you';
        }
        
        div_tag.setAttribute( 'class', 'messages ' + message_class_type );
        div_tag.setAttribute( 'title', messages[i].timestamp.toString() );

        div_tag.innerHTML = messages[i].message;
        
        if ( day_passed( i, messages ) ) {
            var date_div_tag = document.createElement('div');

            date_div_tag.setAttribute( 'class', 'message_timestamp' );

            date_div_tag.innerHTML = messages[i].timestamp.toLocaleDateString();

            document.getElementById('phone_content').appendChild(date_div_tag);
        }
        
        document.getElementById('phone_content').appendChild(div_tag);
    }
    
    populate_messages();
}

function day_passed( i, messages ) {
    if ( i == 0 ) {
        return true;
    }
    
    if ( messages[i].timestamp.getTime() - messages[i-1].timestamp.getTime() > TWENTY_FOUR_HOURS_IN_MS ) {
        return true;
    }
    
    return false;
}

function populate_messages() {
    document.getElementById('phone_content').scrollTop = document.getElementById('phone_content').scrollHeight;
}

function initializePopulateUi( all_conversations ) {
    populate_dropdown( Object.keys(all_conversations) );

    document.getElementById('contacts').addEventListener('change', function(e){ new_conversation( all_conversations, e) }, false);
}