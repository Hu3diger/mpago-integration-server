var express = require('express');
var mercadopago = require('mercadopago');

const app = express();
app.use(express.urlencoded());
app.use(express.json());
mercadopago.configurations.setAccessToken("TEST-8091854411019981-030215-33c868590b7024823c2acf4bc03bae61-261293516");

app.post('/api/process_payment', (req, res) => {
  // Save and posting the payment
    if(req.body){
      let valor = (Math.random() * (1000 - 1) + 1)
      var payment_data = {
        token: req.body.token,
        transaction_amount: Math.ceil(valor),
        description: req.body.description,
        installments: Number(req.body.installments),
        payment_method_id: req.body.paymentMethodId,
        payer: {
          email: req.body.email
        }
      };
      mercadopago.payment.save(payment_data).then(function (data) {
        let compra = data.response;
        let msgStatus = msgRetorno(compra.status_detail)
        if(compra.status == "approved"){
          res.status(200).send({
            status: "Aprovado",
            mensagemStatus: msgStatus,
            bandeiraCartao: compra.payment_method_id,
            qtdParcelas: compra.installments,
            valorParcela: compra.transaction_details.installment_amount,
            valorTotal: compra.currency_id + ": " + compra.transaction_details.total_paid_amount,
            valorDisponivelParaVendedor: compra.currency_id + ": " + compra.transaction_details.net_received_amount,
            taxasMercadoPago: compra.currency_id + ": " + compra.fee_details[0].amount
          });
        }else{
          res.status(200).send({
            status: "Rejeitado",
            motivoRejeicao: msgStatus,
            bandeiraCartao: compra.payment_method_id,
          })
        }
      }).catch(function (error) {
          console.log("FODASE" + error);
          res.send({erro: error})
      });
    } else {
      res.status(201).send({
        message: "Requisição não possui parâmetros para realizar a compra"
      })
    }
});
const PORT = 5000;

app.listen(PORT, () => {
	console.log(`server running on port ${PORT}`)
});


function msgRetorno(status){
  var mapa = new Map();

  mapa.set("accredited", "Pronto, seu pagamento foi aprovado! No resumo, você verá a cobrança do valor");
  mapa.set("cc_rejected_other_reason", "A administradora do cartão não processou seu pagamento");

  return mapa.get(status);
}