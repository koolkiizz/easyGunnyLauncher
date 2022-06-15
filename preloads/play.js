const {ipcRenderer} = require('electron');
const config = require('../const');
const PlayPageTopbar = require('../assets/images/PlayPageTopbar');
const PlayPageBody = require("../assets/images/PlayPageBody");
const PlayPageCloseBtn = require('../assets/images/PlayPageCloseBtn');
const PlayPageMinimizeBtn = require('../assets/images/PlayPageMinimizeBtn');
const PlayPageBarIcon = require('../assets/images/PlayPageBarIcon');

const BaseWidth = 1022;
const BaseHeight = 700;
const topbarBaseHeight = 46;
const rulerbarBaseHeight = 30;

var canvas3, context3;
var canvas5, context5;
var canvas6, context6;
var topbar, rulerbar;
window.addEventListener('DOMContentLoaded', () => {
    /**
     * Draw images
     */
    document.body.style.backgroundImage = 'url(' + PlayPageBody + ')';
    topbar = document.getElementById("topbarWrapper");
    rulerbar = document.getElementById("rulerbar");

    var closeBtnImage = new Image(22, 23);
    canvas5 = document.getElementById('closeBtnCanvas');
    context5 = canvas5.getContext('2d');
    closeBtnImage.onload = function() {
        context5.drawImage(closeBtnImage, 0, 0, 22, 23);
    };
    closeBtnImage.src = PlayPageCloseBtn;

    var minimizeBtnImage = new Image(23, 7);
    canvas6 = document.getElementById('minimizeBtnCanvas');
    context6 = canvas6.getContext('2d');
    minimizeBtnImage.onload = function() {
        context6.drawImage(minimizeBtnImage, 0, 0, 26, 7);
    };
    minimizeBtnImage.src = PlayPageMinimizeBtn;

    var barBtnImage = new Image(30, 26);
    canvas3 = document.getElementById('barIconCanvas');
    context3 = canvas3.getContext('2d');
    barBtnImage.onload = function() {
        context3.drawImage(barBtnImage, 0, 0, 30, 26);
    };
    barBtnImage.src = PlayPageBarIcon;

    /**
     * Play Ajax call
     */
    var webview = document.getElementById("gameContent");
    webview.src = config.host + '/play2/' + localStorage.getItem('token');

    var closeBtnElement = document.getElementById("closeBtnWrapper");
    function closeApp(e) {
        e.preventDefault();
        ipcRenderer.send('close-me');
    }
    closeBtnElement.addEventListener("click", closeApp);
    var minimizeBtnElement = document.getElementById("minimizeBtnWrapper");
    function minimizeApp(e) {
        e.preventDefault();
        ipcRenderer.send('minimize-me');
    }
    minimizeBtnElement.addEventListener("click", minimizeApp);
    canvas3.addEventListener('mouseup', function () {
        toggleContextMenu();
    });

    var contextmenuItems = document.getElementsByClassName("contextMenuItem");
    for (var i = 0; i < contextmenuItems.length; i++) {
        var contextmenuItem = contextmenuItems[i];
        contextmenuItem.addEventListener('click', function (e) {
            e.stopPropagation();
            var target = e.target.dataset.target;
            functions[target]();
            hideContextMenu();
        });
    }
    document.addEventListener('mouseup', function (e) {
        if (e.target.id != 'contextmenu' && e.target.id != 'barIconCanvas') {
            hideContextMenu();
        }
    });
});

function toggleContextMenu() {
    var contextmenu = document.getElementById("contextmenu");
    contextmenu.classList.toggle('show');
}

function hideContextMenu() {
    var contextmenu = document.getElementById("contextmenu");
    contextmenu.classList.remove('show');
}

const functions = {
    reload: function () {
        location.reload();
    },
    multiple: 1,
    size: function () {
        var multiple = this.multiple;
        ipcRenderer.send('resize-me', [
            Math.round(BaseWidth*multiple), //destination width
            Math.round(BaseHeight*multiple), //destination height
            Math.round(BaseWidth*multiple), //minimum width
            Math.round(BaseHeight*multiple) //minimum height
        ]);
        topbar.style.height = (topbarBaseHeight*multiple) + 'px';
        rulerbar.style.height = (rulerbarBaseHeight*multiple) + 'px';
    },
    size100: function () {
        this.multiple = 1;
        this.size();
    },
    size125: function () {
        this.multiple = 1.25;
        this.size();
    },
    size150: function () {
        this.multiple = 1.5;
        this.size();
    },
    size175: function () {
        this.multiple = 1.75;
        this.size();
    },
    size200: function () {
        this.multiple = 2;
        this.size();
    },
    size225: function () {
        this.multiple = 2.25;
        this.size();
    },
    size250: function () {
        this.multiple = 2.5;
        this.size();
    },
    openCharge: function () {
        ipcRenderer.send('charge-open');
    },
    openExchange: function () {
        ipcRenderer.send('exchange-open');
    },
    openChangePassword: function () {
        ipcRenderer.send('change-password-open');
    },
    openChangeEmail: function () {
        ipcRenderer.send('messagebox', [
            'Thông báo',
            'Tính năng chưa hỗ trợ, vui lòng liên hệ quản trị viên!'
        ]);
    },
    resetStashPassword: function () {
        ipcRenderer.send('messagebox', [
            'Thông báo',
            'Tính năng chưa hỗ trợ, vui lòng liên hệ quản trị viên!'
        ]);
    },
    chargeHistory: function () {
        ipcRenderer.send('messagebox', [
            'Thông báo',
            'Tính năng chưa hỗ trợ, vui lòng liên hệ quản trị viên!'
        ]);
    },
    logout: function () {
        ipcRenderer.send('messagebox', [
            'Thông báo',
            'Tính năng chưa hỗ trợ, vui lòng liên hệ quản trị viên!'
        ]);
    }
}
