Luminate Online Data Viewer
===========================

A desktop application for Windows and OS X providing realtime reporting for Luminate Online.

About
--------

The Luminate Online Data Viewer allows organizations to gain insight into the performance of 
their online marketing campaigns with up-to-the-minute reporting using 
[Luminate Online Web Services](http://open.convio.com/webservices/).

![Example Donations Report](screenshot-donation-report.png)

Download
--------

The Data Viewer is available for 32- and 64-bit Windows and OS X operating systems.

[Windows (32-bit)](https://github.com/convio/luminate-online-data-viewer/raw/master/download/win32.zip)  
[Windows (64-bit)](https://github.com/convio/luminate-online-data-viewer/raw/master/download/win64.zip)  
[OS X (32-bit)](https://github.com/convio/luminate-online-data-viewer/raw/master/download/osx32.zip)  
[OS X (64-bit)](https://github.com/convio/luminate-online-data-viewer/raw/master/download/osx64.zip)

Logging In
----------

Each time you use the app, you'll need to login to Luminate Online Web Services.

![Login Screen](screenshot-login.png)

To login, you'll need a few pieces of information:

* The Web Services URL for your organization. This should look something like `https://webservices.cluster2.convio.net/1.0/myorg`. You can find this URL in the Luminate Online administrative interface under Setup -> Site Options. Click the Open API Configuration tab and scroll down to the "Configure Luminate Online WebServices" section.
* The username and password for an API Administrator account. On the same Open API Configuration tab, click the "Edit server API configuration" link next to "Configure API to allow server access". Under "Manage API Administrative Accounts", use one of the existing accounts created for your organization or create a new one.

For added security, the IP address you login from must be whitelisted to use Luminate Online Web Services. On the Open API Configuration screen, you can manage the IP whitelist by clicking "Edit WebService configuration" next to "Configure Luminate Online WebServices".

Customize
---------

You can customize the app by forking the [Luminate Online Data Viewer repository on Github](https://github.com/convio/luminate-online-data-viewer).

The application is built using [NW.js](http://nwjs.io/), Angular, Bootstrap, and the [AdminLTE theme](https://github.com/almasaeed2010/AdminLTE).