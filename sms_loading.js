function getSmsFiles( files ) {
    var smsFiles = [];

    for ( var i = 0; i < files.length; i++ ) {
        if ( files[i].name.indexOf('- Text -') > 0 && files[i].type.indexOf('html') > 0 ) {
            smsFiles.push(files[i]);
        }
    }

    document.getElementById('loader_info').innerHTML = 'Conversations loaded. Use the dropdown to select a contact.<br />';

    return smsFiles;
}

function parseAllSmsData( smsFiles ) {
    var smsFilenameMetadata = [];

    var smsCount           = 0;
    var fileReaderCounter  = 1;

    var allConversations = {};

    smsFiles.forEach(function(smsFile) {
        var fileReader = new FileReader();

        smsFilenameMetadata.push(getMetadataFromFilename(smsFile.name));

        fileReader.onloadend = function(event) {
            if (event.target.readyState === FileReader.DONE) {
                var isOngoingConversation = false;

                var smsData = smsAsHtml(event.target.result);

                var smsFilenameAuthor = smsFilenameMetadata[0].name;

                smsFilenameMetadata.shift();

                var participants = getParticipants(smsData);
                var messages     = getMessages(smsData);
                var times        = getTimes(smsData);
                
                if (!participants.length) {
                    document.getElementById('loader_info').innerHTML += '<br />Could not load ' + smsFilenameMetadata[0].name;
                    fileReaderCounter++;
                    return;
                }
                
                console.log(participants);
                console.log(messages);
                console.log(times);

                isOngoingConversation = existingParticipant(smsFilenameAuthor, participants, allConversations);

                if (isOngoingConversation) {
                    allConversations[smsFilenameAuthor] = addMessagesToConversation(allConversations[smsFilenameAuthor], participants, messages, times);
                }
                else {
                    allConversations[smsFilenameAuthor] = createConversation(participants, messages, times);
                }
                
                console.log(allConversations[smsFilenameAuthor]);

                if (fileReaderCounter < smsCount) {
                    fileReaderCounter++;
                }
                else {
                    initializePopulateUi(allConversations);
                }
            }
        };

        smsCount = smsFilenameMetadata.length;

        var sms = fileReader.readAsText(smsFile);
    });
}

function existingParticipant( author, participants, allConversations ) {
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

function smsAsHtml( htmlContent ) {
    var htmlDocument = document.createElement('html');

    htmlDocument.innerHTML = htmlContent;

    return htmlDocument;
}

function getParticipants( htmlDocument ) {
    var participantsHtml = htmlDocument.getElementsByTagName('cite');
    
    if (!participantsHtml.length) {
        return false;
    }

    var participants = [];

    for ( var i = 0; i < participantsHtml.length; i++ ) {
        var phone = participantsHtml[i].getElementsByTagName('a')[0].href.substring(5);
        
        // Short codes don't have +'s
        if ( participantsHtml[i].getElementsByTagName('a')[0].href.indexOf('+') == -1 ) {
            phone = participantsHtml[i].getElementsByTagName('a')[0].href.substring(4);
        }

        participants.push( {'name': participantsHtml[i].textContent, 'phone': phone} );
    }
    
    return participants;
}

function getMessages( htmlDocument ) {
    var messagesHtml = htmlDocument.getElementsByTagName('q');

    var messages = [];

    for ( var i = 0; i < messagesHtml.length; i++ ) {
        messages.push( messagesHtml[i].innerHTML );
    }

    return messages;
}

function getTimes( htmlDocument ) {
    var timesHtml = htmlDocument.getElementsByClassName('dt');

    var times = [];

    for ( var i = 0; i < timesHtml.length; i++ ) {
        times.push( new Date(timesHtml[i].title) );
    }

    return times;
}

function addMessage( thisMessage, participant, message, time ) {

    if ( participant.name == 'Me' ) {
        thisMessage['type'] = 2;
    }
    else {
        thisMessage['type'] = 1;
    }

    thisMessage['message']   = message;
    thisMessage['timestamp'] = time;

    return thisMessage;
}

function addMessagesToConversation( existingConversation, participants, message, time ) {
    var conversation = existingConversation;

    for ( var i = 0; i < participants.length; i++ ) {
        var thisMessage = {};

        thisMessage = addMessage( thisMessage, participants[i], message[i], time[i] );

        conversation['messages'].push(thisMessage);
    }

    return conversation;
}

function createConversation( participants, message, time ) {
    var conversation = {};

    conversation['messages'] = [];

    for ( var i = 0; i < participants.length; i++ ) {
        var thisMessage = {};

        thisMessage = addMessage( thisMessage, participants[i], message[i], time[i] );

        if ( participants[i].name != 'Me' ) {
            conversation['phone'] = participants[i].phone;
        }

        conversation['messages'].push(thisMessage);
    }

    return conversation;
}

function getMetadataFromFilename( filename ) {
    var metadata = filename.split( ' - Text - ' );

    var contact   = metadata[0];
    var timestamp = metadata[1].split('.')[0];

    if ( metadata.length > 2 ) {
        // ' - Text - ' should only be in the filename once.
        return { 'name': -1, 'timestamp': -1 };
    }

    return { 'name': contact, 'timestamp': timestamp };
}

function initializeSmsLoad( event ) {
    var smsFiles = getSmsFiles( event.target.files );
    
    document.getElementById('contact_placeholder').innerHTML = 'Loading contacts...';
    
    parseAllSmsData( smsFiles );
}