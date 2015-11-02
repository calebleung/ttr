var TWENTY_FOUR_HOURS_IN_MS = 86400000;

function populateDropdown( contactNames ) {
    document.getElementById('contact_placeholder').innerHTML = 'Choose a contact...';
    
    for ( var i = 0; i < contactNames.length; i++ ) {
        var optionTag = document.createElement('option');
        
        optionTag.setAttribute( 'id',    contactNames[i] );
        optionTag.setAttribute( 'value', contactNames[i] );

        optionTag.innerHTML = contactNames[i];

        document.getElementById('contacts').appendChild(optionTag);
    }
}

function newConversation( allConversations, event ) {    
    if ( event.target.value == 'Choose a contact...' ) {
        return false;
    }

    document.getElementById('phone_content').innerHTML = '';
    
    loadConversation( allConversations, event.target.value );
}

function loadConversation( allConversations, contactName ) {
    var messages = allConversations[contactName].messages;
    
    for ( var i = 0; i < messages.length; i++ ) {
        var messageClassType = 'message_from_you';
        var divTag           = document.createElement('div');
        
        if ( messages[i].type == 1 ) {
            messageClassType = 'message_to_you';
        }
        
        divTag.setAttribute( 'class', 'messages ' + messageClassType );
        divTag.setAttribute( 'title', messages[i].timestamp.toString() );

        divTag.innerHTML = messages[i].message;
        
        if ( dayPassed( i, messages ) ) {
            var dateDivTag = document.createElement('div');

            dateDivTag.setAttribute( 'class', 'message_timestamp' );

            dateDivTag.innerHTML = messages[i].timestamp.toLocaleDateString();

            document.getElementById('phone_content').appendChild(dateDivTag);
        }
        
        document.getElementById('phone_content').appendChild(divTag);
    }
    
    populateMessages();
}

function dayPassed( i, messages ) {
    if ( i == 0 ) {
        return true;
    }
    
    if ( messages[i].timestamp.getTime() - messages[i-1].timestamp.getTime() > TWENTY_FOUR_HOURS_IN_MS ) {
        return true;
    }
    
    return false;
}

function populateMessages() {
    document.getElementById('phone_content').scrollTop = document.getElementById('phone_content').scrollHeight;
}

function moveConversation( event ) {
    if ( document.getElementById('phone_content').getElementsByTagName('div')[0].id == 'phone_intro' ) {
        document.getElementById('loader_info').innerHTML = 'Select a conversation before attempting to navigate it.'
        
        return false;
    }
    
    if ( event.target.id.indexOf('top') > -1 ) {
        document.getElementById('phone_content').scrollTop = 0;
    }
    else {
        document.getElementById('phone_content').scrollTop = document.getElementById('phone_content').scrollHeight;
    }
}

function initializePopulateUi( allConversations ) {
    populateDropdown( Object.keys(allConversations) );

    document.getElementById('contacts').addEventListener('change', function(e){ newConversation(allConversations, e) }, false);
}