# Takeout Text Reader

## Description
View your text messages as a conversation to another person instead of individual files.

## Instructions
* You will need to create, download, and extract a [Google Takeout](https://www.google.com/settings/takeout) archive that includes **Voice** data.
* After downloading a copy of this repo or accessing through [github.io](https://calebleung.github.io/ttr/), select the files you wish to view as conversations. The script ignores non-text files.
* Use the dropdown at the top to select a contact and view the conversation.

## Misc.
* If you wish to import your texts onto an Android device, the *[Takeout to SMS Backup & Restore](https://github.com/calebleung/t2sbr)* project converts the same Voice data from Google Takeout into a format compatibile with [SMS Backup & Restore](https://play.google.com/store/apps/details?id=com.riteshsahu.SMSBackupRestore) (no affiliation).
* In a similar vein, the message 'type' of 1 or 2 to indicate whether the message was sent or received was derived from that format.

## Technical
```
var = allConversations {
    contact {                   // Contact name (could also be a phone number) based on filename
        phone,                  // Phone number
        messages [ 
                {
                    type,       // 1 for sent, 2 for receieved
                    message,    // Actual message
                    timestamp   // Date object
                },
            ]
        }
}
```

