const { getModel: getProductModel } = require('../models/Product');
const Notification = require('../models/Notification');
const Cart = require('../models/Cart');

/**
 * Simulates real-time price changes for travel products.
 * Every X minutes, it randomly fluctuates prices and notifies users 
 * who have these items in their cart if the price drops.
 */
const startPriceSimulation = () => {
  console.log('📈 Price Simulation Service Started...');
  
  setInterval(async () => {
    try {
      const Product = getProductModel();
      // Find a random product
      const count = await Product.countDocuments();
      if (count === 0) return;
      
      const random = Math.floor(Math.random() * count);
      const product = await Product.findOne().skip(random);
      
      if (!product) return;

      // Store original price if not already set
      if (!product.originalPrice) {
        product.originalPrice = product.price;
      }

      // Fluctuate price by -5% to +5%
      const changePercent = (Math.random() * 10 - 5) / 100; // -0.05 to +0.05
      const oldPrice = product.price;
      const newPrice = Math.round(oldPrice * (1 + changePercent) / 100) * 100; // Round to nearest 100

      if (newPrice !== oldPrice) {
        product.price = newPrice;
        await product.save();
        
        console.log(`💰 Price Change: ${product.title} (${oldPrice} -> ${newPrice})`);

        // If price dropped more than 3%, notify users who have it in cart
        if (newPrice < oldPrice * 0.97) {
          await notifyUsersOfPriceDrop(product, oldPrice, newPrice);
        }
      }
    } catch (error) {
      console.error('Error in price simulation:', error);
    }
  }, 120000); // Every 2 minutes
};

const notifyUsersOfPriceDrop = async (product, oldPrice, newPrice) => {
  try {
    // Find users who have this product in their cart
    const carts = await Cart.find({ productId: product._id });
    const userIds = [...new Set(carts.map(c => c.userId.toString()))];

    for (const userId of userIds) {
      const dropAmount = oldPrice - newPrice;
      await Notification.create({
        userId,
        title: '🔥 최저가 찬스!',
        message: `담아두신 [${product.title}]의 가격이 ${dropAmount.toLocaleString()}원 하락했습니다! 지금 확인해보세요.`,
        type: 'promo',
        timestamp: new Date()
      });
      console.log(`🔔 Notified user ${userId} about price drop for ${product.title}`);
    }
  } catch (error) {
    console.error('Error sending price drop notifications:', error);
  }
};

module.exports = { startPriceSimulation };
