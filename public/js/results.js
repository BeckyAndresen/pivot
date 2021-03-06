'use strict';

//create a file-specific context via a function
(function(Piv, ElectionId) {

// snapshot versions (corresponds to ResultSnapshotController.php)
var VERSION_TEST = 1;
var VERSION_ADD_RESULTS = 2;
var VERSION_ADD_DEBUG = 3;
var VERSION_ADD_ERROR_INFO = 4;
var VERSION_ADD_ELECTOR_INFO = 5;

// should be latest version:
var SNAPSHOT_FORMAT_VERSION = VERSION_ADD_ELECTOR_INFO;
    
// script-level variables
var View = Piv.view
var ResultsList = Piv.html(View.workspace, "ol", "", {"class": "itemlist incrementsCounter"});

// actions (do stuff)
View.setHeader("Results", ElectionId)
View.statusbar.innerHTML = ""
Piv.electionsMenu(View.sidenav, ElectionId)

Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

// Piv.http.get(["/api/elections/" + ElectionId + "/result"], showElectionResults, showErrorMessage)
Piv.http.get(["/api/elections/" + ElectionId + "/result_snapshots"], getLastResultSnapshot, showErrorMessage)
// Piv.http.get(["/api/elections/" + ElectionId + "/result_snapshots"])
// Piv.http.post(["/api/elections/" + ElectionId + "/result_snapshots"])
// Piv.http.get(["/api/elections/" + ElectionId + "/result"])

// function definitions
function displayCandidate(parent, description) {
  // var candidateLiAtts = {"class": "w100 border-bottom-2 overflow-visible hover-1 drag-drop-1", "data-id": id}
  var candidateLiAtts = {"class": "w100 border-bottom-1 overflow-visible"}
  var box = Piv.html(parent, "li", "", candidateLiAtts);
  Piv.div(box, "", "text1square orderdisplay");
  Piv.div(box, "", "text3 w75", description)
  // Piv.div(box, "", "text1 w75", description);
}
function getLastResultSnapshot(snapshots) {
  if (snapshots.length < 1) {
    showErrorMessage()
    return
  }
  Piv.http.get(["/api/elections/" + ElectionId + "/result_snapshots/" + snapshots[snapshots.length - 1].id], showElectionResults, showErrorMessage)
}
function showElectionResults(results) {
  console.log(results)
  var version = parseInt(results.format_version) // TODO: determine why this is a string in some deployments
  var supported = [VERSION_ADD_RESULTS, VERSION_ADD_DEBUG, VERSION_ADD_ERROR_INFO, VERSION_ADD_ELECTOR_INFO]
  if (supported.indexOf(version) >= 0) {
    if ('error' in results.result_blob && results.result_blob['error'] != null) {
      Piv.div(View.workspace, "", "100 text3", results.result_blob['error'])
      return
    }

    var candidateOrder = results.result_blob.order
    for (var key in candidateOrder) {
      displayCandidate(ResultsList, candidateOrder[key].name)
    }
  }
  else {
    Piv.div(View.workspace, "", "100 text3", "Snapshot with version "+version+" not accessible.  Please take another snapshot.")
  }
}
function showErrorMessage(error) {
  Piv.div(View.workspace, "", "w100 text3", "Results for this election are not currently available.")
  if (!error) return
  Piv.div(View.workspace, "", "100 text3", error.response.data.message)
}

// close the self-executing function and feed the piv library to it
})(piv, election)
