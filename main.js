$(document).ready(function(){
	window.Mercadopago.setPublishableKey("TEST-15ec510a-9dfb-44bf-acce-3148375e9da7");
	window.Mercadopago.getIdentificationTypes();
	addEvent(document.querySelector('#cardNumber'), 'keyup', guessingPaymentMethod);
	addEvent(document.querySelector('#cardNumber'), 'change', guessingPaymentMethod);

	doSubmit = false;
	addEvent(document.querySelector('#pay'), 'submit', doPay);
});

function getBin() {
	const cardnumber = document.getElementById("cardNumber");
	return cardnumber.value.substring(0,6);
	};

function addEvent(to, type, fn){ 
	if(document.addEventListener){
		to.addEventListener(type, fn, false);
	} else if(document.attachEvent){
		to.attachEvent('on'+type, fn);
	} else {
		to['on'+type] = fn;
	} 
};

function sdkResponseHandler(status, response) {
	if (status != 200 && status != 201) {
		alert("Verifique os dados informados");
	}else{
		var form = document.querySelector('#pay');
		var card = document.createElement('input');
		card.setAttribute('name', 'token');
		card.setAttribute('type', 'hidden');
		card.setAttribute('value', response.id);
		form.appendChild(card);
    doSubmit=true;
    form.submit();
	}
};

function doPay(event){
	event.preventDefault();
	if(!doSubmit){
		var $form = document.querySelector('#pay');

		window.Mercadopago.createToken($form, sdkResponseHandler);

		return false;
	}
};

function setPaymentMethodInfo(status, response) {
	if (status == 200) {
		const paymentMethodElement = document.querySelector('input[name=paymentMethodId]');

		if (paymentMethodElement) {
			paymentMethodElement.value = response[0].id;
		} else {
			const input = document.createElement('input');
			input.setAttribute('name', 'paymentMethodId');
			input.setAttribute('type', 'hidden');
			input.setAttribute('value', response[0].id); 

			form.appendChild(input);
		}
	} else {
		alert(`Erro no metodo de pagamento: ${response}`); 
	}
	};

	function guessingPaymentMethod(event) {
		var bin = getBin();

		if (event.type == "keyup") {
			if (bin.length >= 6) {
				window.Mercadopago.getPaymentMethod({
					"bin": bin
				}, setPaymentMethodInfo);
			}
		} else {
			setTimeout(function() {
				if (bin.length >= 6) {
					window.Mercadopago.getPaymentMethod({
						"bin": bin
					}, setPaymentMethodInfo);
				}
			}, 100);
		}
		};

