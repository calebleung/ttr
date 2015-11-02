function restart() {
    location.reload();
}

function init() {
    //restart();

    document.getElementById('phone_content').innerHTML = document.getElementById('placeholder').innerHTML;
    
    document.getElementById('phone_control_restart').addEventListener('click', restart, false);
    document.getElementById('messages_to_top').addEventListener('click', moveConversation, false);
    document.getElementById('messages_to_bottom').addEventListener('click', moveConversation, false);
    document.getElementById('files').addEventListener('change', initializeSmsLoad, false);
}

init();