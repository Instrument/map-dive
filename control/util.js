function relaunchTo( app ) {
  var url = 'http://localhost:81/change.php?query=relaunch-'+app+'&name='+app;
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.send(null);
}
