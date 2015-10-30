function populate_dropdown( contact_names ) {
    document.getElementById('contact_placeholder').innerHTML = 'Choose a contact...';
    
    for ( var i = 0; i < contact_names.length; i++ ) {
        var option_tag = document.createElement('option');
        
        option_tag.setAttribute('id',    contact_names[i]);
        option_tag.setAttribute('value', contact_names[i]);

        option_tag.innerHTML = contact_names[i];

        document.getElementById('contacts').appendChild(option_tag);
    }
}

function load_conversation( all_conversations, event ) {
    console.log( all_conversations[event.target.value] );
}

function initialize_populate_ui( all_conversations ) {
    populate_dropdown( Object.keys(all_conversations) );

    document.getElementById('contacts').addEventListener('change', function(e){ load_conversation( all_conversations, e) }, false);
}