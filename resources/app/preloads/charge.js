const {ipcRenderer} = require('electron');
const config = require('../const');
const {post, showLoading, hideLoading} = require('../helper');

var cardType, cardAmount, cardPass, cardSeri;

//initialize
cardType = 'viettel';
window.addEventListener('DOMContentLoaded', () => {
    var navLinks = document.getElementsByClassName('nav-link');
    for (var i = 0; i < navLinks.length; i++) {
        var navLink = navLinks[i];
        navLink.addEventListener('click', function (e) {
            e.preventDefault();
            for (var j = 0; j < navLinks.length; j++) {
                navLinks[j].classList.remove('active');
            }
            this.classList.add('active');
            var type = this.dataset.target;
            var cardBodys = document.getElementsByClassName('card-body');
            for (var j = 0; j < cardBodys.length; j++) {
                var cardBody = cardBodys[j];
                cardBody.classList.add('d-none');
            }
            var thisCardBody = document.getElementById(type);
            if (thisCardBody != null) {
                thisCardBody.classList.remove('d-none');
            }
        });
    }
    var cardImages = document.getElementsByClassName('cardImage');
    for (var i = 0; i < cardImages.length; i++) {
        var cardImage = cardImages[i];
        cardImage.addEventListener('click', function (e) {
            for (var j = 0; j < cardImages.length; j++) {
                cardImages[j].classList.remove('active');
            }
            this.classList.add('active');
            cardType = this.dataset.target;
        });
    }
    var amountSelect = document.getElementById("amount");
    var resultCoin = document.getElementById("resultCoin");
    amountSelect.addEventListener('change', function (e) {
        var value = this.value;
        resultCoin.innerText = (value * 0.25).toString();
        cardAmount = value;
    });
    var passcardEl = document.getElementById("passcard");
    passcardEl.addEventListener('change', function (e) {
        cardPass = this.value;
    });
    var seriEl = document.getElementById("seri");
    seriEl.addEventListener('change', function (e) {
        cardSeri = this.value;
    });
    var submitter = document.getElementById("submitter");
    submitter.addEventListener('click', function (e) {
        if (!cardType || !cardAmount || !cardPass || !cardSeri) {
            ipcRenderer.send('messagebox', [
                'Cảnh báo',
                'Vui lòng nhập đầy đủ thông tin!'
            ]);
            return;
        }
        post(config.host + '/api/cardCharge', {
            serial: cardSeri,
            pin: cardPass,
            card_type: cardType,
            card_amount: cardAmount
        }, cardChargeCallback)
    })
});

var cardChargeCallback = function (response) {
    if (response.success) {
        ipcRenderer.send('messagebox', [
            'Thông báo',
            response.message
        ]);
    } else {
        ipcRenderer.send('messagebox', [
            'Cảnh báo',
            response.message
        ]);
    }
}
