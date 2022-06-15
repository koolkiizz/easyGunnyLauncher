const loadingGif = require('./assets/images/loadingGif');

const empty = function (mixed_var) {
    var undef, key, i, len;
    var emptyValues = [undef, null, false, 0, '', '0'];

    for (i = 0, len = emptyValues.length; i < len; i++) {
        if (mixed_var === emptyValues[i]) {
            return true;
        }
    }

    if (typeof mixed_var === 'object') {
        for (key in mixed_var) {
            // TODO: should we check for own properties only?
            //if (mixed_var.hasOwnProperty(key)) {
            return false;
            //}
        }
        return true;
    }

    return false;
}

const post = function(url, data, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.response);
        }
    }
    xhttp.open('POST', url, true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.responseType = "json";
    var token = localStorage.getItem('token');
    if (token) {
        xhttp.setRequestHeader('Authorization', 'Bearer '+token);
    }
    if (!empty(data)) {
        const params = new URLSearchParams(data).toString();
        xhttp.send(params);
    } else {
        xhttp.send();
    }
}
const showLoading = function (element) {
    if (typeof element == 'undefined') {
        element = document.body;
    }
    var loadingElement = document.createElement('div');
    loadingElement.classList.add('loading');
    var imageLoading = new Image(289, 268);
    imageLoading.src = loadingGif;
    loadingElement.appendChild(imageLoading);
    element.appendChild(loadingElement);
}
const hideLoading = function (element) {
    if (typeof element == 'undefined') {
        element = document.body;
    }
    element.querySelector(".loading").remove();
}
module.exports = {post, showLoading, hideLoading, empty};
