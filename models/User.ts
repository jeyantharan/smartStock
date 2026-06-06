import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  title: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder {
  _id?: mongoose.Types.ObjectId;
  id: string;
  date: string;
  items: IOrderItem[];
  total: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  shippingAddress: IAddress;
  paymentMethod: string;
}

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  avatarPublicId?: string;
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  addresses: IAddress[];
  orders: IOrder[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    title: { type: String, required: true },
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: "United States" },
    phone: { type: String, required: true },
  },
  { _id: true }
);

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    id: { type: String, required: true },
    date: { type: String, required: true },
    items: [OrderItemSchema],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    shippingAddress: AddressSchema,
    paymentMethod: { type: String, required: true },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    phone: { type: String, default: "" },
    avatar: { type: String },
    avatarPublicId: { type: String },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    addresses: { type: [AddressSchema], default: [] },
    orders: { type: [OrderSchema], default: [] },
  },
  { timestamps: true }
);

UserSchema.pre("save", function () {
  if (!this.role) {
    this.role = "user";
  }
});

// In dev, re-register so schema changes are picked up after hot reload
if (process.env.NODE_ENV !== "production" && mongoose.models.User) {
  mongoose.deleteModel("User");
}

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;

export function serializeUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role ?? "user",
    phone: user.phone ?? "",
    avatar: user.avatar ?? "",
    emailVerified: user.emailVerified === true,
    addresses: user.addresses.map((addr) => ({
      id: addr._id?.toString() ?? "",
      title: addr.title,
      fullName: addr.fullName,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      phone: addr.phone,
    })),
    orders: user.orders.map((order) => ({
      id: order.id,
      date: order.date,
      items: order.items,
      total: order.total,
      status: order.status,
      shippingAddress: {
        id: order.shippingAddress._id?.toString() ?? "",
        title: order.shippingAddress.title,
        fullName: order.shippingAddress.fullName,
        addressLine1: order.shippingAddress.addressLine1,
        addressLine2: order.shippingAddress.addressLine2,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zipCode: order.shippingAddress.zipCode,
        country: order.shippingAddress.country,
        phone: order.shippingAddress.phone,
      },
      paymentMethod: order.paymentMethod,
    })),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
