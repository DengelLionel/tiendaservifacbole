const axios = require('axios');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const order = JSON.parse(event.body);

  // Lee las propiedades del carrito
  const receiptType = order.note_attributes.find(attr => attr.name === 'receipt_type')?.value;
  const companyName = order.note_attributes.find(attr => attr.name === 'attributes[company_name]')?.value;
  const ruc = order.note_attributes.find(attr => attr.name === 'attributes[ruc]')?.value;

  // Prepara las etiquetas
  let tags = order.tags;
  if (receiptType === 'factura') {
    tags += ', Factura';
  } else if (receiptType === 'boleta') {
    tags += ', Boleta';
  }

  try {
    // Actualiza las etiquetas del pedido
    await axios.put(`https://${process.env.SHOPIFY_API_KEY}:${process.env.SHOPIFY_API_PASSWORD}@${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2024-04/orders/${order.id}.json`, {
      order: {
        id: order.id,
        tags: tags
      }
    });

    return {
      statusCode: 200,
      body: 'Webhook received',
    };
  } catch (error) {
    console.error('Error updating order tags:', error);
    return {
      statusCode: 500,
      body: 'Error processing webhook',
    };
  }
};
