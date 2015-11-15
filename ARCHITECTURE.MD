Every 30 minutes (configurable) the server connects with the NetPlanning websites and downloads the entire user planning.
The downloaded planning is then compared to the local stored one and the following scenario can happen:
- Remote planning is the same of the local one: processing stops here. Timer is reset, for new update to occur in 30 minutes.
- Remote planning is different from the local one: changes are collected and stored in a separate table for changes only. 
Local data is updated accordingly. A push notifications is issued to all the registed clients.

The client application also has the option to trigger a new download of the planning. An update button will issue an update invokation
to the server that will in turn immediately reset its timer and download the planning.

Following are the endpoints exposed by the server.
GET /items: list the planning for the calling user, as it was returned by the latest download from the NetPlanning website. 
A timestamp is also returned to inform the end user of when the last check occurred.
GET /changes: list the 

/login
