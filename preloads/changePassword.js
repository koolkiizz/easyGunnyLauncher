const {ipcRenderer} = require('electron');
const config = require('../const');
const {post, showLoading, hideLoading, empty} = require('../helper');

window.addEventListener('DOMContentLoaded', () => {
    var submitter = document.getElementById("submitter");
    submitter.addEventListener('click', function () {
        var oldPassword = document.getElementById("oldPassword");
        var newPassword = document.getElementById("newPassword");
        var renewPassword = document.getElementById("renewPassword");
        if (empty(oldPassword.value) || empty(newPassword.value) || empty(renewPassword.value)) {
            ipcRenderer.send('messagebox', [
                'Cảnh báo',
                'Vui lòng nhập đầy đủ thông tin!'
            ]);
            return;
        }
        showLoading();
        post(config.host + '/api/changePassword', {
            current_password: oldPassword.value,
            new_password: newPassword.value,
            re_new_password: renewPassword.value,
        }, changePasswordCallback);
    });
});

var changePasswordCallback = function (response) {
    hideLoading();
    if (response.success) {
        var oldPassword = document.getElementById("oldPassword");
        var newPassword = document.getElementById("newPassword");
        var renewPassword = document.getElementById("renewPassword");
        oldPassword.value = '';
        newPassword.value = '';
        renewPassword.value = '';
        ipcRenderer.send('messagebox', [
            'Thông báo',
            response.message
        ]);
        return;
    }
    ipcRenderer.send('messagebox', [
        'Cảnh báo',
        response.message
    ]);
}
