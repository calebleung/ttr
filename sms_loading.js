function get_sms_files( files ) {
    var smsFiles = [];

    for ( var i = 0; i < files.length; i++ ) {
        if ( files[i].name.indexOf('- Text -') > 0 && files[i].type.indexOf('html') > 0 ) {
            smsFiles.push( files[i] );
        }
    }

    document.getElementById('loader_info').innerHTML = 'Conversations loaded. Use the dropdown to select a contact.';

    return smsFiles;
}

function parse_all_sms_data( smsFiles ) {
    var smsFilenameMetadata = [];

    var smsCount           = 0;
    var fileReaderCounter  = 1;

    var allConversations = {};

    for ( var i = 0; i < smsFiles.length; i++ ) {
        var fileReader = new FileReader();

        smsFilenameMetadata.push( get_metadata_from_filename( smsFiles[i].name ) );

        fileReader.onloadend = function(event) {
            if ( event.target.readyState == FileReader.DONE ) {
                var isOngoingConversation = false;

                var participants = [];
                var messages     = [];
                var times        = [];

                var smsData = sms_as_html( event.target.result );

                var smsFilenameAuthor    = smsFilenameMetadata[0].name;
                //smsFilenameTimestamp = smsFilenameMetadata[0].timestamp;

                smsFilenameMetadata.shift();

                participants = get_participants( smsData );
                messages     = get_messages( smsData );
                times        = get_times( smsData );

                isOngoingConversation = existing_participant( smsFilenameAuthor, participants, allConversations );

                if ( isOngoingConversation ) {
                    allConversations[smsFilenameAuthor] = add_messages_to_conversation( allConversations[smsFilenameAuthor], participants, messages, times );
                }
                else {
                    allConversations[smsFilenameAuthor] = create_conversation( participants, messages, times );
                }

                if ( fileReaderCounter < smsCount ) {
                    fileReaderCounter++;
                }
                else {
                    initialize_populate_ui(allConversations);
                }
            }
        }

        smsCount = smsFilenameMetadata.length;

        var sms = fileReader.readAsText( smsFiles[i] );
    }
}

function existing_participant( author, participants, allConversations ) {
    // Check if there is an existing key. 
    // If not, check if the existing participant has the same phone numbefr.

    var possibleParticipant = Object.keys(allConversations).indexOf(author);

    if ( possibleParticipant == -1 ) {
        return false;
    }
    else {
        for ( var i = 0; i < participants.length; i++ ) {
            if ( participants[i].phone == allConversations[author].phone ) {
                return true;
            }
        }
    }

    return true;
}

function sms_as_html( htmlContent ) {
    var htmlDocument = document.createElement('html');

    htmlDocument.innerHTML = htmlContent;

    return htmlDocument;
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