import {binding, GeoPoint} from "baqend";

declare module "baqend" {

  interface baqend {
    Message : binding.EntityFactory<model.Message>;
    Cars : binding.EntityFactory<model.Cars>;
    Veg : binding.EntityFactory<model.Veg>;
    Basket : binding.EntityFactory<model.Basket>;
    Shops : binding.EntityFactory<model.Shops>;
    Address: binding.EntityFactory<model.Address>;
    Orders:binding.EntityFactory<model.Orders>;
    OrderItems:binding.EntityFactory<model.OrderItems>;
    VegStock:binding.EntityFactory<model.VegStock>;
  }

  namespace model {
    interface User extends binding.Entity {
      username: string;
      inactive: boolean;
      ChosenShop:string;
      Name:string;
      Phone:string;
      AddressId:string;
    }

    interface Device extends binding.Entity {
      deviceOs: string;
    }

    interface Role extends binding.Entity {
      name: string;
      users: Set<User>;
    }

    interface Message extends binding.Entity {
      name: string;
      text: string;
      face: string;
    }
    interface Cars extends binding.Entity {
      CarName: string;
      Color: string;
      Price:number;
    }
    interface Veg extends binding.Entity{
      Name:string;
      Price:number;
      Size:number;
      Photo:string;
    }
    interface Basket extends binding.Entity{
      UserID:string;
      VegId:string;
      VegPrice:number;
      VegQuantity:number;
      ShopId:string;
      Ordered:boolean;
    }
    interface Shops extends binding.Entity{
      Name:string;
      PlaceID:string;
      Description:string;
      Image:string;
      Location:GeoPoint;
      Address_1:string;
      Address_2:string;
      Address_3:string;
      Address_4:string;
      County:string;
      Postcode:string;
      Website:string;
      Email:string;
      Phone_1:string;
      Phone_2:string;
    }
    interface Address extends binding.Entity{
      Address_1:string;
      Address_2:string;
      Address_3:string;
      Address_4:string;
      County:string;
      Postcode:string;
      Country:string;
      UserId:string;
      /**
       * type = 1 is delivery and type = 2 is billing
       */
      Type:number;
    }
    interface Orders extends binding.Entity{
      Amount:number;
      DeliveryAddressId:string;
      BillingAddressId:string;
      UserID:string;
      CardToken:string;
    }
    interface OrderItems extends binding.Entity{
      OrderId:string;
      VegQty:number;
      VegPrice:number;
      VegId:string;
      ShopId:string;
    }
    interface VegStock extends binding.Entity{
      VegID:string;
      ShopID:string;
      Price:number;
      VegWeight:number;
      NumberInStock:number;
      WeightUnit:string;
    }
  }
}