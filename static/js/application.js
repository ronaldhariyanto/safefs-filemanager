'use strict';

var auth;
var userName;
var container   = '_public';
var file        = document.getElementById("file-upload");

var app = {
  name: "BabbySAFEapi",
  id: "test",
  version: "1.0",
  vendor: "testingan.apps",
}

var permissions = {
  '_public': [
    'Read',
    'Insert',
    'Update',
    'Delete',
    'ManagePermissions'
  ],
  '_publicNames': [
    'Read',
    'Insert',
    'Update',
    'Delete',
    'ManagePermissions'
  ]
};

var owncontainer = {
  own_container: true
};

//Finds and adds EventListener on buttons
$(document).ready(function() {
  $('#authorise-btn').click(function() {
    authorise();
  });
  $('#file-upload-btn').click(function() {
    uploadfile();
  });
  $('#btn-file-upload-show').click(function() {
    console.log('coba klik');
    viewFiles();
  });
  $('.btn-delete').click(function () {
    deleteFile();
  });
})

//initialises and authorises with the network
function authorise() {
  // Initialise applications
  window.safeApp.initialise(app).then(appToken => {
    window.safeApp.authorise(appToken, permissions, owncontainer).then(auth => {
      // Connect app to the network
      window.safeApp.connectAuthorised(appToken, auth).then(authorisedAppToken => {
        window.auth = authorisedAppToken;
        inputName();
        $('.authorise-form').hide();
        $('.authorise-content').show();
        $('#welcome-text').html('<strong>Welcome '+ userName +'</strong>, To your SAFE-FS Web Dashboard for SAFE Public Files');
      })
    })
  }, err => {
    $('#authorise-status').html('Not Authorised');
    console.error('Error from webapp: ', err);
  });
}

//checks network and token status
function istokenvalid() {
  window.safeApp.isRegistered(auth).then(registered => {
    if (registered == true) {
       $('#authorise-status').html('Already Authorised');
    } else {
      $('#authorise-status').html('Not Authorised');
    }
  });
}

//frees safe instance from memory
function freetoken() {
  window.safeApp.free(auth);
  auth = null;
  appToken = null;
  $('#authorise-status').html('Authorised Was Removed');
  location.reload();
}

//input name
function inputName() {
  var inputName = document.getElementById('authorise-name').value;
  userName = inputName;
  window.safeCrypto.sha3Hash(auth, userName).then(hash => {
    window.safeMutableData.newPublic(auth, hash, 15001).then(mdHandle => {
      window.safeMutableData.newMutation(auth).then(mutationHandle => {
        window.safeMutableData.newEntries(auth).then(entriesHandle => {
          var time = Date.now().toString();
          window.safeMutableDataEntries.insert(entriesHandle, time, inputName).then(_ => {
            console.log('New entry inserted ' + time, inputName);
          })
        })
      })
    })
  });
}

//upload files into network
function uploadfile() {
    var reader = new FileReader();
    var content = null;

    reader.readAsArrayBuffer(new Blob([file.files[0]]));

    reader.onload = function(event) {
        var arrayBuffer = reader.result;
        content = new Uint8Array(arrayBuffer);
        return content;
    };

    window.safeApp.getContainer(auth, container).then(mdHandle => {
        window.safeMutableData.newMutation(auth).then(mutationHandle => {
            window.safeMutableDataMutation.insert(mutationHandle, file.files[0].name, content).then(_ => {
                window.safeMutableData.applyEntriesMutation(mdHandle, mutationHandle).then(_ => {
                    console.log('New entry was inserted in the MutableData and committed to the network');
                    $('#file-upload-show').empty();
                    viewFiles();
                })
            })
        }, err => {
            console.error(err);
        })
    });
}

function deleteFile() {
    window.safeApp.getContainer(auth, container).then(mdHandle => {
        window.safeMutableData.newMutation(auth).then(mutationHandle => {
            window.safeMutableData.get(mdHandle, filepath.value).then(value => {
                window.safeMutableDataMutation.remove(mutationHandle, filepath.value, value.version + 1);
                window.safeMutableData.applyEntriesMutation(mdHandle, mutationHandle).then(_ => {
                    console.log('Entry was removed from the MutableData and committed to the network');
                })
            }, err => {
                console.error(err);
            })
        })
    }, err => {
        console.error(err);
    });
}

window.safeMutableData.newMutation(auth)
  .then((h) => mutationHandle = h)
  .then(_ => window.safeMutableData.get(mdHandle, 'key1'))
  .then((value) => window.safeMutableDataMutation.remove(mutationHandle, 'key1', value.version + 1))
  .then(_ => window.safeMutableData.applyEntriesMutation(mdHandle, mutationHandle))
  .then(_ => console.log('Entry was removed from the MutableData and committed to the network'));


function uintToString(uintArray) {
    return new TextDecoder("utf-8").decode(uintArray);
}

function viewFiles() {
  console.log('nyampe');
    var inc = 0;
    window.safeApp.getContainer(auth, container).then(mdHandle => {
        window.safeMutableData.getEntries(mdHandle).then(entriesHandle => {
            window.safeMutableDataEntries.forEach(entriesHandle, (key, value) => {
                key = new Uint8Array(Object.values(key));
                var htmlContent = "";

                var xkey = (new TextDecoder("utf-8")).decode(key).split('.').pop();
                var format = (JSON.stringify(xkey)).split(/[ .:;?!~,`"&|()<>{}\[\]\r\n/\\]+/);

                switch (format[1]) {
                    //Text Format
                    case "txt":
                    case "html":
                    case "htm":
                    case "css":
                    case "js":
                    case "json":
                    case "md":
                    case "odt":
                    case "rtf":
                    case "csv":
                        htmlContent = "<textarea class='tarControl'>" + (uintToString(value.buf)) + "</textarea>";
                        break;

                    //Image Format
                    case "jpg":
                    case "jpeg":
                    case "png":
                    case "gif":
                    case "tiff":
                    case "tif":
                    case "ico":
                    case "webp":
                    case "svg":
                    case "bmp":
                        htmlContent = "<img class='img-fluid img-thumbnail imgControl' src='data:image/"  + (uintToString(key)).split('.').pop() + ";base64," + arrayBufferToBase64(value.buf) + "'/>";
                        break;

                    //Audio Format
                    case "mp3":
                    case "oga":
                    case "wav":
                        htmlContent = "<audio controls src='data:audio/" + (uintToString(key)).split('.').pop() + ";base64," +  arrayBufferToBase64(value.buf) + "' type='audio/" + (uintToString(key)).split('.').pop() + "'></audio>";
                        break;

                    //Video Format
                    case "mp4":
                    case "ogv":
                    case "ogg":
                    case "webm":
                        htmlContent = "<video class='video-js' controls> <source src='data:video/" + (uintToString(key)).split('.').pop() + ";base64," +  arrayBufferToBase64(value.buf) + "' type='video/" + (uintToString(key)).split('.').pop() + "'></video>";
                        break;

                    default:
                        htmlContent = "Content not found!";
                        break;
                }
                inc++;

                var fileNo = '<div class="file-no">' + inc + '</div>';
                var fileName = '<div class="file-name">' + (uintToString(key)) + '</div>';
                var fileAction = '<div class="file-action"><button id="delete-'+inc+'" class="btn btn-warning btn-delete">x</button></div>';

                $('#file-upload-show').append('<div class="col-md-4">' + fileNo + '<div class="file-content">' + htmlContent + '</div>' + fileName + fileAction +'</div>');
            })
        })
    }, err => {
        console.err(err);
    });
}

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var inc = 0; inc < len; inc++){
        binary += String.fromCharCode(bytes[inc]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64){
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for(var inc = 0; inc < len; inc++){
        bytes[inc] = binary_string.charCodeAt[inc];
    }
    return bytes.buffer;
}
