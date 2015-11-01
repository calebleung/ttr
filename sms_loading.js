function get_sms_files( files ) {
    var sms_files = [];

    for ( var i = 0; i < files.length; i++ ) {
        if ( files[i].name.indexOf('- Text -') > 0 && files[i].type.indexOf('html') > 0 ) {
            sms_files.push( files[i] );
        }
    }

    document.getElementById('loader_info').innerHTML = 'Conversations loaded. Use the dropdown to select a contact.';

    return sms_files;
}

function parse_all_sms_data( sms_files ) {
    var sms_filename_meta = [];

    var sms_count           = 0;
    var file_reader_counter = 1;

    var all_conversations = {};

    for ( var i = 0; i < sms_files.length; i++ ) {
        var file_reader = new FileReader();

        sms_filename_meta.push( get_metadata_from_filename( sms_files[i].name ) );

        file_reader.onloadend = function(event) {
            if ( event.target.readyState == FileReader.DONE ) {
                var is_ongoing_conversation = false;
                var participants            = [];

                var sms_data = sms_as_html( event.target.result );

                sms_filename_author    = sms_filename_meta[0].name;
                sms_filename_timestamp = sms_filename_meta[0].timestamp;

                sms_filename_meta.shift();

                participants = get_participants(sms_data);
                messages     = get_messages(sms_data);
                times        = get_times(sms_data);

                is_ongoing_conversation = existing_participant( sms_filename_author, participants, all_conversations );

                if ( is_ongoing_conversation ) {
                    all_conversations[sms_filename_author] = add_messages_to_conversation( all_conversations[sms_filename_author], participants, messages, times );
                }
                else {
                    all_conversations[sms_filename_author] = create_conversation( participants, messages, times );
                }

                if ( file_reader_counter < sms_count ) {
                    file_reader_counter++;
                }
                else {
                    initialize_populate_ui(all_conversations);
                }
            }
        }

        sms_count = sms_filename_meta.length;

        var sms = file_reader.readAsText( sms_files[i] );
    }
}

function existing_participant( author, participants, all_conversations ) {
    // Check if there is an existing key. 
    // If not, check if the existing participant has the same phone numbefr.

    var possible_participant = Object.keys(all_conversations).indexOf(author);

    if ( possible_participant == -1 ) {
        return false;
    }
    else {
        for ( var i = 0; i < participants.length; i++ ) {
            if ( participants[i].phone == all_conversations[author].phone ) {
                return true;
            }
        }
    }

    return true;
}

function sms_as_html( html_content ) {
    var html_document = document.createElement('html');

    html_document.innerHTML = html_content;

    return html_document;
}

function get_participants( html_document ) {
    var participants_raw = html_document.getElementsByTagName('cite');

    var participants = [];

    for ( var i = 0; i < participants_raw.length; i++ ) {
        var phone = participants_raw[i].getElementsByTagName('a')[0].href.substring(5);

        participants.push( {'name': participants_raw[i].textContent, 'phone': phone} );
    }

    return participants;
}

function get_messages( html_document ) {
    var messages_raw = html_document.getElementsByTagName('q');

    var messages = [];

    for ( var i = 0; i < messages_raw.length; i++ ) {
        messages.push( messages_raw[i].innerHTML );
    }

    return messages;
}

function get_times( html_document ) {
    var times_raw = html_document.getElementsByClassName('dt');

    var times = [];

    for ( var i = 0; i < times_raw.length; i++ ) {
        times.push( new Date(times_raw[i].title) );
    }

    return times;
}

/* format:

var = all_conversations
{
key:
    phonenum,
    messages:
        [
            {
                sent/received,
                message,
                timestamp
            },
        ]
}


*/
function add_message( this_message, participant, message, time ) {

    if ( participant.name == 'Me' ) {
        this_message['type'] = 2;
    }
    else {
        this_message['type'] = 1;
    }

    this_message['message']   = message;
    this_message['timestamp'] = time;

    return this_message;
}

function add_messages_to_conversation( existing_conversation, participants, message, time ) {
    var conversation = existing_conversation;

    for ( var i = 0; i < participants.length; i++ ) {
        var this_message = {};

        this_message = add_message( this_message, participants[i], message[i], time[i] );

        conversation['messages'].push( this_message );
    }

    return conversation;
}

function create_conversation( participants, message, time ) {
    var conversation = {};

    conversation['messages'] = [];

    for ( var i = 0; i < participants.length; i++ ) {
        var this_message = {};

        this_message = add_message( this_message, participants[i], message[i], time[i] );

        if ( participants[i].name != 'Me' ) {
            conversation['phone'] = participants[i].phone;
        }

        conversation['messages'].push( this_message );
    }

    return conversation;
}

function get_metadata_from_filename( filename ) {
    var metadata = filename.split( ' - Text - ' );

    var contact   = metadata[0];
    var timestamp = metadata[1].split('.')[0];

    if ( metadata.length > 2 ) {
        // ' - Text - ' should only be in the filename once.
        return { 'name': -1, 'timestamp': -1 };
    }

    return { 'name': contact, 'timestamp': timestamp };
}

function initialize_sms_load( event ) {
    var sms_files = get_sms_files( event.target.files );
    
    document.getElementById('contact_placeholder').innerHTML = 'Loading contacts...';
    
    parse_all_sms_data( sms_files );
}