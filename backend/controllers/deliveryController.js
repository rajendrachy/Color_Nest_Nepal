const Warehouse = require('../models/Warehouse');
const { DEFAULT_DELIVERY_CHARGE } = require('../config/constants');

exports.calculateDeliveryCharge = async (req, res) => {
  try {
    const { province, district } = req.query;
    
    // Find nearest warehouse or specific zone charge
    const warehouses = await Warehouse.find({
      'deliveryZones.province': province
    });

    if (warehouses.length > 0) {
      let minCharge = Infinity;
      warehouses.forEach(w => {
        const zone = w.deliveryZones.find(z => z.province === province && z.districts.includes(district));
        if (zone && zone.deliveryCharge < minCharge) {
          minCharge = zone.deliveryCharge;
        }
      });

      if (minCharge !== Infinity) {
        return res.json({ charge: minCharge });
      }
    }

    res.json({ charge: DEFAULT_DELIVERY_CHARGE });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
