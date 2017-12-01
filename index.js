// donate-bitcoin Copyright (GPL) 2016  Nathan Robinson

var address = "15SsAZAwCJocpe27S3ALGkhriYb7bQoxYt"; // The bitcoin address to receive donations. Change to yours
var popup = false; // Set to true if you want a popup to pay bitcoin
var currencyCode = "USD"; // Change to your default currency. Choose from https://blockchain.info/ticker?cors=true
var qrcode = true; // Set to false to disable qrcode
var link = true; // Set to false to disable generating hyperlink
var organization = "Mario Kozjak"; // Change to your organization name
var mbits = false; // Set to false to display bitcoin traditionally
var defaultAmountToDonate = 10; // Default amount to donate
var defaultCurrency = 'USD'; // Default currency to fallback
var showDefaultCurrencyDisclaimer = true; // If the requested cuurency is not available show a warning

var params = {};

if (location.search) {
    var parts = location.search.substring(1).split('&');

    for (var i = 0; i < parts.length; i++) {
        var nv = parts[i].split('=');
        if (!nv[0]) continue;
        params[nv[0]] = nv[1] || true;
    }
}

function turnName(data)
{
  var ignoreHyphen = false;
  var returnstring = "";
  for (i = 0; i < data.length; i++)
  {
    if (data[i] != "-" )
    {
      returnstring = returnstring + data[i];
    }

    if (data[i] == "-" && data[i+1] == "-")
    {
      returnstring = returnstring + "-";
      ignoreHyphen = true
    }

    if (data[i] == "-" && ignoreHyphen == false)
    {
      returnstring = returnstring + " ";
      ignoreHyphen = false;
    }
  }
  return returnstring
}

if (params.address){address = params.address;}
if (params.popup == "true"){popup = true};
if (params.popup == "false"){popup = false};
if (params.currency){currencyCode = params.currency.toUpperCase();}
if (params.qrcode == "true"){qrcode = true};
if (params.qrcode == "false"){qrcode = false};
if (params.link == "true"){link = true};
if (params.link == "false"){link = false};
if (params.name){organization = turnName(params.name);}

if (params.mbits == "true"){mbits = true};
if (params.mbits == "false"){mbits = false};


function getBitcoinPrice(currencyExchangeResponse) {
    try {
        return currencyExchangeResponse[currencyCode]['buy'];
    } catch (err) {
        handlePricingError(currencyExchangeResponse);
        return currencyExchangeResponse[currencyCode]['buy'];
    }
}

function drawCurrencyButton() {
  document.getElementById("donationbutton").src = 'https://img.shields.io/badge/donate-' + currencyCode + '-blue.svg';
}

function drawDonationElements(url, donateDisplayMessage) {
    drawCurrencyButton();

    if (qrcode == true) {
        document.getElementById("qrcodePlaceHolder").innerHTML = "";
        $('#qrcodePlaceHolder').qrcode(url);
    }

    if (link == true) {
        document.getElementById("donatetext").innerHTML = "<br><a href='" + url + "'>" + donateDisplayMessage + "</a>";
    }
}

function donate() {
  $.getJSON("https://blockchain.info/ticker?cors=true", function(currencyExchangeResponse) {
      var fiatDonationAmount = getFiatDonationAmount();
      var bitcoinPrice = getBitcoinPrice(currencyExchangeResponse);
      var bitcoinAmountToDonate = computeBitcoinAmount(fiatDonationAmount, bitcoinPrice);
      var donationElements = composeDonationElements(bitcoinAmountToDonate, fiatDonationAmount);
      drawDonationElements(donationElements.url, donationElements.message);
  });
}

function handlePricingError(currencyExchangeResponse) {
  if (showDefaultCurrencyDisclaimer){
    var disclaimer = `Could not find the requested currency, will be using ${defaultCurrency} instead`;
    alert(disclaimer);
  }
    currencyCode = defaultCurrency.toUpperCase();
}

function computeBitcoinAmount(fiatDonationAmount, bitcoin_price) {
    var bitcoinAmountToDonate = (fiatDonationAmount / bitcoin_price).toFixed(8);
    return bitcoinAmountToDonate;
}

function noValidInput(fiatUserInput) {
    return isNaN(fiatUserInput) == true;
}

function validAmountRequestedInUrl() {
    return isNaN(params.amount) == false;
}

function getFiatDonationAmount() {
    // if user sets an amount, we will use it
    var fiatUserInput = parseFloat(document.getElementById("donatebox").value);

    if (fiatUserInput == 0) {
        alert("Minimum donation should be above zero. =)");
        return defaultAmountToDonate;
    }

    if (noValidInput(fiatUserInput) && !validAmountRequestedInUrl()) {
        return defaultAmountToDonate;
    } else if (noValidInput(fiatUserInput) && validAmountRequestedInUrl()) {
        return params.amount;
    }

    return fiatUserInput;
}

function composeDonationElements(bitcoinAmountToDonate, fiatDonationAmount) {
    var url = "bitcoin:" + address + "?amount=" + bitcoinAmountToDonate;
    var fiatAmountToDonateMessage = " (" + fiatDonationAmount + " " + currencyCode + ") " + "to " + address;
    var donateDisplayMessage = " Send " + bitcoinAmountToDonate.toString() + " Bitcoin" + fiatAmountToDonateMessage;
    if (mbits == true) {
        var mbitprice = (bitcoinAmountToDonate * 1000).toFixed(2);
        var donateDisplayMessage = " Send " + mbitprice.toString() + " mBits" + fiatAmountToDonateMessage;
    }
    return {
        url: url,
        message: donateDisplayMessage
    };
}

$(document).keyup(function (e) {
    if ($(".input1:focus") && (e.keyCode === 13)) {
       donate();
    }
 });

$(function() {
    // Get page title
    var pageTitle = $("title").text();

    // Change page title on blur
    $(window).blur(function() {
        $("title").text("donate.kozjak.io");
    });

   	// Change page title back on focus
	$(window).focus(function() {
	  $("title").text(pageTitle);
	});
});
