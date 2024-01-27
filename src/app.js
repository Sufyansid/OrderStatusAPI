const express = require('express');
const { WebhookClient } = require('dialogflow-fulfillment');
const fetch = require('node-fetch');
const app = express();
const url = 'https://orderstatusapi-dot-organization-project-311520.uc.r.appspot.com/api/getOrderStatus';

app.use(express.json());

app.get('/', (req, res) => {
  res.send("Server Is Working......");
});

app.post('/webhook', async (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  async function handleWebHookIntent(agent) {
    const orderId = agent.parameters.order_id;
    const reqBody = { "orderId": orderId };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqBody)
      });

      const data = await response.json();
      const shipmentdate = data.shipmentDate;
      const error = data.error;

      const isoDate = new Date(shipmentdate);
      const options = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
      const newShipmentDate = isoDate.toLocaleDateString('en-US', options);
      if (shipmentdate) {
        agent.add(`Your order ${orderId} will be shipped on ${newShipmentDate}`);
      }
      else {
        agent.add(error);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      agent.add("An error occurred while fetching the shipment date.");
    }
  }

  let intentMap = new Map();
  intentMap.set('Tracking_Order', handleWebHookIntent);

  agent.handleRequest(intentMap);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
