type DeviceModel = {
  _id?: string;
  name?: string;
  modelId?: {
    _id?: string;
    name?: string;
    pricePerDay?: number;
    isForSale?: boolean;
    isForRent?: boolean;
  };
  code?: string;
  priceBuy?: number;
  priceSell?: number;
  priceRental?: number;
  note?: string;
  status?: string;
};

export default DeviceModel;
