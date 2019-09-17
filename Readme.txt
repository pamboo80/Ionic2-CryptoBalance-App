New Clone:

0.  Delete your old project if any
1.  git clone https://pamboo80@bitbucket.org/pamboo80/cryptobalance.git
2.  ionic serve -l (System will ask for node_modules. Press Yes)
3.  ionic cordova plugin remove phonegap-plugin-push
4.  ionic cordova plugin add phonegap-plugin-push@2.0.0
5.  ionic cordova platform add android
6.  Copy google-services.json from the root folder to \platforms\android
7.  ionic cordova build android

If already Platform folder exists

1.  ionic cordova build android


