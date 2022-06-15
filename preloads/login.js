const {ipcRenderer} = require('electron');
const config = require('../const');
const {post, showLoading, hideLoading} = require('../helper');
const loginBackgroundElements = require('../assets/images/loginBackgroundElements');
const loginNhanVat = require('../assets/images/loginNhanVat');
const topBackground = require('../assets/images/topBackground');
const backgroundLogo = require('../assets/images/backgroundLogo');
const loginFormCloseBtn = require('../assets/images/loginFormCloseBtn');
const loginFormMinimizeBtn = require('../assets/images/loginFormMinimizeBtn');
const loginFormBackground = require('../assets/images/loginFormBackground');
const buttonBackgroundActive = require('../assets/images/buttonBackgroundActive');
const formButtonBackground = require('../assets/images/formButtonBackground');
let fs = require('fs');
let path = require('path');
let recentAccountFile = __dirname + '/../assets/accounts.txt';

var canvas1, context1;
var canvas2, context2;
var canvas3, context3;
var canvas4, context4;
var canvas5, context5;
var canvas6, context6;

window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('token')) {
        ipcRenderer.send('switchToPlay');
        return;
    }
    /**
     * Draw images
     */
    var nhanvatImage = new Image(667, 556);
    canvas2 = document.getElementById('nhanvatCanvas');
    context2 = canvas2.getContext('2d');
    nhanvatImage.onload = function() {
        context2.drawImage(nhanvatImage, 0, 0, 667, 556);
    };
    nhanvatImage.src = loginNhanVat;

    var backgroundImage = new Image(886, 555);
    canvas1 = document.getElementById('backgroundCanvas');
    context1 = canvas1.getContext('2d');
    backgroundImage.onload = function() {
        context1.drawImage(backgroundImage, 0, 0, 886, 555);
    };
    backgroundImage.src = loginBackgroundElements;

    var logoBackgroundImage = new Image(510, 101);
    canvas3 = document.getElementById('logoBackgroundCanvas');
    context3 = canvas3.getContext('2d');
    logoBackgroundImage.onload = function() {
        context3.drawImage(logoBackgroundImage, 0, 0, 510, 101);
    };
    logoBackgroundImage.src = topBackground;

    var logoImage = new Image(299, 98);
    canvas4 = document.getElementById('logoCanvas');
    context4 = canvas4.getContext('2d');
    logoImage.onload = function() {
        context4.drawImage(logoImage, 0, 0, 299, 98);
    };
    logoImage.src = backgroundLogo;

    var closeBtnImage = new Image(19, 21);
    canvas5 = document.getElementById('closeBtnCanvas');
    context5 = canvas5.getContext('2d');
    closeBtnImage.onload = function() {
        context5.drawImage(closeBtnImage, 0, 0, 19, 21);
    };
    closeBtnImage.src = loginFormCloseBtn;

    var minimizeBtnImage = new Image(23, 7);
    canvas6 = document.getElementById('minimizeBtnCanvas');
    context6 = canvas6.getContext('2d');
    minimizeBtnImage.onload = function() {
        context6.drawImage(minimizeBtnImage, 0, 0, 23, 7);
    };
    minimizeBtnImage.src = loginFormMinimizeBtn;

    var formWrapper = document.getElementById('formWrapper');
    formWrapper.style.backgroundImage = 'url(' + loginFormBackground + ')';

    var frmButtons = document.getElementsByClassName('frmButton');
    for(var i = 0; i < frmButtons.length; i++) {
        var frmButton = frmButtons.item(i);
        frmButton.style.backgroundImage = 'url(' + formButtonBackground + ')';
        frmButton.addEventListener('mousedown', function (e) {
            e.target.classList.add('mousedown');
        });
        frmButton.addEventListener('mouseup', function (e) {
            e.target.classList.remove('mousedown');
        });
    }

    /**
     * Element Events
     */
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

    var loginButtonTab = document.getElementById("loginButtonTab");
    var registerButtonTab = document.getElementById("registerButtonTab");
    var buttonTabs = [loginButtonTab, registerButtonTab];
    var tabs = document.getElementsByClassName('tab');
    function toggleButtonTab(e) {
        buttonTabs.forEach(function (b) {
            b.classList.remove('active');
            b.style.backgroundImage = 'none';
        });
        var source = e.target;
        source.classList.add('active');
        source.style.backgroundImage = 'url(' + buttonBackgroundActive + ')';
        var target = source.dataset.target;
        var tab = document.getElementById(target);
        for (var i = 0; i < tabs.length; i++) {
            var t = tabs[i];
            t.style.display = 'none';
        }
        tab.style.display = 'block';
    }
    buttonTabs.forEach(function (b) {
        b.addEventListener("click", toggleButtonTab);
    });
    toggleButtonTab({target: loginButtonTab});

    var btnLogin = document.getElementById('btnLogin');
    btnLogin.addEventListener('click', login);
    var btnRegister = document.getElementById('btnRegister');
    btnRegister.addEventListener('click', register);

    if(fs.existsSync(recentAccountFile)) {
        let data = fs.readFileSync(recentAccountFile, 'utf8').split('\n');
        data.forEach((account, index) => {
            let [username, password, time] = account.split(',');
            if (username && password && time) {
                addToListRecentAccount(username, password, time);
            }
        });
    } else {
        if (fs.existsSync(path.dirname(recentAccountFile))) {
            fs.mkdir(path.dirname(recentAccountFile), '0777', function () {});
        }
        fs.writeFile(recentAccountFile, '', (err) => {
            if(err) {
                ipcRenderer.send('messagebox', [
                    'Cảnh báo',
                    err.message
                ]);
            }
        })
    }

    var contextmenuItems = document.getElementsByClassName("recentAccountContextMenuItem");
    for (var i = 0; i < contextmenuItems.length; i++) {
        var contextmenuItem = contextmenuItems[i];
        contextmenuItem.addEventListener('click', function (e) {
            e.stopPropagation();
            var target = e.target.dataset.target;
            contextMenuFunctions[target]();
        });
    }
})

var checkRecentAccount = function (username) {
    let data = fs.readFileSync(recentAccountFile, 'utf8').split('\n');
    let isDuplicated = false;
    data.forEach((account, index) => {
        let [fusername, fpassword, time] = account.split(',');
        if (fusername && fpassword && time) {
            if (username == fusername) {
                isDuplicated = true;
                return;
            }
        }
    });
    return isDuplicated;
}
var addToRecentAccount = function (username, password) {
    if (checkRecentAccount(username)) {
        return;
    }
    var date = new Date();
    var time = date.getFullYear()
        + '-'
        + date.getMonth().toString().padStart(2, '0')
        + '-'
        + date.getDay().toString().padStart(2, '0')
        + ' '
        + date.getHours().toString().padStart(2, '0')
        + ':'
        + date.getMinutes().toString().padStart(2, '0')
        + ':'
        + date.getSeconds().toString().padStart(2, '0');
    fs.appendFile(recentAccountFile, username + ',' + password + ',' + time + '\n', function () {});
    addToListRecentAccount(username, password, time);
}
var addToListRecentAccount = function (username, password, time) {
    var list = document.getElementById('recentAccountList');
    var row = document.createElement('tr');
    var col1 = document.createElement('td');
    col1.innerText = username;
    row.appendChild(col1);
    var col2 = document.createElement('td');
    col2.innerText = time;
    row.appendChild(col2);
    row.dataset['username'] = username;
    row.dataset['password'] = password;
    row.classList.add('recentAccount');
    list.appendChild(row);
}

var removeRecentAccount = function (username) {
    let data = fs.readFileSync(recentAccountFile, 'utf8').split('\n');
    let newData = [];
    data.forEach((account, index) => {
        let [fusername, fpassword, ftime] = account.split(',');
        if (fusername && fpassword && ftime) {
            if (fusername != username) {
                newData.push(account);
            }
        }
    });
    fs.writeFile(recentAccountFile, '', function () {});
    if (newData.length > 0) {
        newData.forEach((account, index) => {
            fs.appendFile(recentAccountFile, account + "\n", function () {});
        });
    }
    removeRecentAccountFromList(username);
}
var removeRecentAccountFromList = function (username) {
    var list = document.getElementById('recentAccountList');
    var childrenNodes = list.childNodes;
    childrenNodes.forEach(node => {
        if (node.localName == 'tr' && node.className == 'recentAccount') {
            if (node.dataset.username == username) {
                node.remove();
                return;
            }
        }
    })
}

function login() {
    var usernameInput = document.getElementById('lgusername');
    var passwordInput = document.getElementById('lgpassword');
    if (!usernameInput.value || !passwordInput.value) {
        ipcRenderer.send('messagebox', [
            'Cảnh báo',
            'Vui lòng nhập tài khoản và mật khẩu!'
        ]);
        return;
    }
    showLoading();
    post(config.host + '/api/login', {username: usernameInput.value, password: passwordInput.value}, loginCallback);
}
function loginCallback(response) {
    hideLoading();
    if (response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userInfo', JSON.stringify(response.data.userInfo));
        var usernameInput = document.getElementById('lgusername');
        var passwordInput = document.getElementById('lgpassword');
        addToRecentAccount(usernameInput.value, passwordInput.value);
        ipcRenderer.send('switchToPlay');
    } else {
        ipcRenderer.send('messagebox', [
            'Cảnh báo',
            response.message
        ]);
    }
}

function register() {
    var usernameInput = document.getElementById('rusername');
    var passwordInput = document.getElementById('rpassword');
    var passwordReInput = document.getElementById('rrpassword');
    var emailInput = document.getElementById('remail');
    if (!usernameInput.value || !passwordInput.value || !passwordReInput.value || !emailInput.value) {
        ipcRenderer.send('messagebox', [
            'Cảnh báo',
            'Vui lòng nhập đủ thông tin!'
        ]);
        return;
    }
    if (passwordInput.value != passwordReInput.value) {
        ipcRenderer.send('messagebox', [
            'Cảnh báo',
            'Xác nhận mật khẩu không đúng!'
        ]);
        return;
    }
    showLoading();
    post(config.host + '/api/register', {
        username: usernameInput.value,
        password: passwordInput.value,
        repassword: passwordReInput.value,
        email: emailInput.value
    }, registerCallback);
}
function registerCallback(response) {
    hideLoading();
    if (response.success) {
        ipcRenderer.send('messagebox', [
            'Thông báo',
            response.message
        ]);
        var usernameInput = document.getElementById('rusername');
        var passwordInput = document.getElementById('rpassword');
        var passwordReInput = document.getElementById('rrpassword');
        var emailInput = document.getElementById('remail');
        usernameInput.value = '';
        passwordInput.value = '';
        passwordReInput.value = '';
        emailInput.value = '';
    } else {
        ipcRenderer.send('messagebox', [
            'Cảnh báo',
            response.message
        ]);
    }
}

window.addEventListener('click', function (e) {
    var target = e.target;
    if (target.localName == 'td' && target.parentNode.className == 'recentAccount') {
        var usernameInput = document.getElementById('lgusername');
        var passwordInput = document.getElementById('lgpassword');
        usernameInput.value = target.parentNode.dataset.username;
        passwordInput.value = target.parentNode.dataset.password;
    }
})

window.addEventListener('mouseup', function (e) {
    var recentAccountContextMenu = document.getElementById('recentAccountContextMenu');
    if (e.button == 2) { //right click
        var target = e.target;
        if (target.localName == 'td' && target.parentNode.className == 'recentAccount') {
            recentAccountContextMenu.style.top = e.clientY + 'px';
            recentAccountContextMenu.style.left = e.clientX + 'px';
            recentAccountContextMenu.style.display = 'block';
            setCurrentAccountInContextMenu(target.parentNode.dataset.username);
            return;
        }
    }
    recentAccountContextMenu.style.display = 'none';
})
var currentAccountInContextMenu = '';
var setCurrentAccountInContextMenu = function (username) {
    currentAccountInContextMenu = username;
}
var contextMenuFunctions = {
    removeAccount: function () {
        removeRecentAccount(currentAccountInContextMenu);
    }
}
