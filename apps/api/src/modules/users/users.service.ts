import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { User, type UserDocument } from "@agriscan/database";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async create(data: {
    email: string;
    fullName: string;
    password: string;
  }): Promise<UserDocument> {
    const doc = new this.userModel({
      email: data.email.toLowerCase(),
      fullName: data.fullName,
      password: data.password,
      role: "USER",
    });
    return doc.save();
  }
}
