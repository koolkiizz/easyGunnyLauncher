const {ipcRenderer} = require('electron');
const config = require('../const');
const {post, showLoading, hideLoading, empty} = require('../helper');

window.addEventListener('DOMContentLoaded', () => {
    updateCoin();
    getServerList();
    var cointAmountElement = document.getElementById("coinAmount");
    cointAmountElement.addEventListener('input', function () {
        var xu = this.value;
        var exchangeXuTextElement = document.getElementById("exchangeXuText");
        exchangeXuTextElement.innerText = xu.toString();
    });
    var button = document.getElementById("submitter");
    button.addEventListener('click', function (e) {
        var serverSelectElement = document.getElementById("serverSelect");
        var playerSelectElement = document.getElementById("playerSelect");
        if (empty(serverSelectElement.value) || empty(playerSelectElement.value)) {
            ipcRenderer.send('messagebox', [
                'Cảnh báo',
                'Vui lòng chọn máy chủ và nhân vật muốn chuyển xu!'
            ]);
            return;
        }
        var coinAmount = cointAmountElement.value;
        if (!coinAmount) {
            ipcRenderer.send('messagebox', [
                'Cảnh báo',
                'Vui lòng nhập số coin muốn chuyển'
            ]);
            return;
        }
        if (coinAmount < 1000 || coinAmount > 1000000) {
            ipcRenderer.send('messagebox', [
                'Cảnh báo',
                'Số coin chuyển phải nằm trong khoảng 1.000 -> 1.000.000 coin'
            ]);
            return;
        }
        coinAmount = parseInt(coinAmount);
        submit(serverSelectElement.value, playerSelectElement.value, coinAmount);
    });
});
var getServerList = function () {
    showLoading();
    post(config.host + '/api/serverlist', {}, getServerListCallback);
}
var getServerListCallback = function (response) {
    hideLoading();
    if (response.success) {
        var list = response.data;
        var serverSelectElement = document.getElementById("serverSelect");
        for (var i = 0; i < list.length; i++) {
            var option = document.createElement('option');
            option.value = list[i].ServerID;
            option.innerText = list[i].ServerName;
            if (i == 0) {
                option.selected = true;
            }
            serverSelectElement.appendChild(option);
        }
        getPlayerList();
        return;
    }
    ipcRenderer.send('messagebox', [
        'Cảnh báo',
        response.message
    ]);
}
var getPlayerList = function () {
    showLoading();
    post(config.host + '/api/playerlist', {}, getPlayerListCallback);
}
var getPlayerListCallback = function (response) {
    hideLoading();
    if (response.success) {
        var list = response.data;
        var playerSelectElement = document.getElementById("playerSelect");
        if (typeof list != "undefined") {
            for (var i = 0; i < list.length; i++) {
                var option = document.createElement('option');
                option.value = list[i].UserID;
                option.innerText = list[i].NickName;
                if (i == 0) {
                    option.selected = true;
                }
                playerSelectElement.appendChild(option);
            }
        } else {
            var option = document.createElement('option');
            option.value = 0;
            option.innerText = 'Bạn chưa tạo nhân vật!';
            option.selected = true;
            playerSelectElement.appendChild(option);
        }
        return;
    }
    ipcRenderer.send('messagebox', [
        'Cảnh báo',
        response.message
    ]);
}
var submit = function (server_id, player_id, coin_amount) {
    showLoading();
    post(config.host + '/api/convertCoin', {server_id: server_id, player_id: player_id, coin: coin_amount}, submitCallback);
}
var submitCallback = function (response) {
    hideLoading();
    if (response.success) {
        ipcRenderer.send('messagebox', [
            'Thông báo',
            response.message
        ]);
        var cointAmountElement = document.getElementById("coinAmount");
        cointAmountElement.value = '';
        var exchangeXuTextElement = document.getElementById("exchangeXuText");
        exchangeXuTextElement.innerText = 0;
        updateCoin(response.data.coin);
        return;
    }
    ipcRenderer.send('messagebox', [
        'Cảnh báo',
        response.message
    ]);
}
var updateCoin = function (newCoin = 0) {
    var currentCoinTextElement = document.getElementById("currentCoinText");
    var userInfoStr = localStorage.getItem('userInfo');
    var userInfo = JSON.parse(userInfoStr);
    var coin = parseInt(userInfo['Money']);
    if (!empty(newCoin)) {
        coin = newCoin;
        userInfo['Money'] = coin;
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
    currentCoinTextElement.innerText = coin;
}
