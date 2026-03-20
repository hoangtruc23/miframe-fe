import CustomerModel from "@/app/Model/Customer";
import DeviceModel from "@/app/Model/Device";

type RentalScheduleModel = {
  _id: string;
  deviceIds: [DeviceModel];
  startRental: string;
  endRental: string;
  customerId: CustomerModel;
  status: string;
  total: number;
  note?: string;
};

export default RentalScheduleModel;
