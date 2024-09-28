const subscriptionService = require('../services/subscriptionService');

class SubscriptionController {
  async getSubscriptions(req, res) {
    try {
      const subscriptions = await subscriptionService.getAllSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }


  async createSubscription(req, res) {
    try {
      const subscription = await subscriptionService.createSubscription(req.body);
      res.status(201).json(subscription);
    } catch (error) {
      if (error?.original?.code === "ER_DUP_ENTRY" ) {
        // Handle duplicate entry error
        return res.status(409).json({ message: error.message });
      }
  
      res.status(500).json({ message: 'An unexpected error occurred.' });
    }
  }

  async updateSubscription(req, res) {
    try {
      const { id } = req.params;
      const subscription = await subscriptionService.updateSubscription(parseInt(id), req.body);
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteSubscription(req, res) {
    try {
      const { id } = req.params;
      await subscriptionService.deleteSubscription(parseInt(id));
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new SubscriptionController();
